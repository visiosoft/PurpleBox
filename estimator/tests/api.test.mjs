import assert from 'node:assert/strict';import test from 'node:test';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';import worker from '../dist/server/index.js';import {CATALOG,packUnit} from '../public/engine.js';
function env(){
 const sql=new DatabaseSync(':memory:');
 sql.exec(fs.readFileSync(new URL('../drizzle/0000_eminent_doorman.sql',import.meta.url),'utf8'));
 return {ADMIN_EMAILS:'owner@example.com',DB:{prepare(s){
  const statement=sql.prepare(s);
  const bound=v=>({first:async()=>statement.get(...v),all:async()=>({results:statement.all(...v)}),run:async()=>({meta:{changes:Number(statement.run(...v).changes)}})});
  return {...bound([]),bind:(...v)=>bound(v)};
 }}};
}
const request=(path,data,staff=false,method='POST')=>new Request('https://example.com'+path,{method:data?method:'GET',headers:{...(staff?{'oai-authenticated-user-email':'owner@example.com'}:{}),...(data?{'content-type':'application/json','origin':'https://example.com'}:{})},body:data?JSON.stringify(data):undefined});
test('Auth, configuration, authoritative quote, durable request, idempotency, staff queue',async()=>{const e=env();assert.equal((await worker.fetch(request('/api/admin/leads'),e)).status,403);const publicConfig=await (await worker.fetch(request('/api/config'),e)).json();assert.equal(publicConfig.rates,undefined);let c=await (await worker.fetch(request('/api/admin/config',null,true),e)).json();c.published=true;c=await(await worker.fetch(request('/api/admin/config',c,true,'PUT'),e)).json();assert.equal(c.revision,1);const units=JSON.parse(fs.readFileSync(new URL('../public/units.json',import.meta.url),'utf8')),unit=units.find(u=>u.eligible&&u.area>45&&u.area<55);const payload={items:[{...CATALOG.find(i=>i.id==='box'),qty:2}],unit:unit.id,weeks:12,services:{padlock:true},options:{},timing:'7days',purpose:'home'};const result=await(await worker.fetch(request('/api/quote',payload),e)).json();assert.equal(result.quote.indicative,false);assert.equal(result.fit,true);const submission={...payload,id:crypto.randomUUID(),revision:1,name:'Test customer',phone:'+971500000000',consent:true,action:'reserve',quote:{total:1}};assert.equal((await worker.fetch(request('/api/request',submission),e)).status,201);assert.equal((await worker.fetch(request('/api/request',submission),e)).status,200);const rows=await(await worker.fetch(request('/api/admin/leads',null,true),e)).json();assert.equal(rows.length,1);assert.equal(rows[0].data.quote.total,result.quote.total);assert.notEqual(rows[0].data.quote.total,1);assert.equal((await worker.fetch(request('/api/request',{...submission,id:crypto.randomUUID(),revision:0}),e)).status,409);assert.equal((await worker.fetch(request('/api/quote',{...payload,items:[{...payload.items[0],w:-1}]}),e)).status,400);});
test('Quotes retain nesting inputs and reproduce the vertical fit',async()=>{
 const e=env(),units=JSON.parse(fs.readFileSync(new URL('../public/units.json',import.meta.url),'utf8'));
 const unit=units.filter(u=>u.eligible&&u.height===2.4).sort((a,b)=>a.sqm-b.sqm)[0];
 const chair={...CATALOG.find(i=>i.id==='chair'),qty:10,nesting:true,nestRise:.15};
 const payload={items:[chair],unit:unit.id,weeks:2,options:{stack:true},services:{}};
 const result=await(await worker.fetch(request('/api/quote',payload),e)).json();
 assert.equal(result.fit,true);assert.equal(result.items[0].nesting,true);assert.equal(result.items[0].nestRise,.15);
 const separate=await(await worker.fetch(request('/api/quote',{...payload,items:[{...chair,nesting:false}]}),e)).json();assert.equal(separate.fit,false);
});

test('Mixed packing, opt-outs and shared group coordinates survive server validation',async()=>{
 const e=env(),units=JSON.parse(fs.readFileSync(new URL('../public/units.json',import.meta.url),'utf8'));
 const unit=units.find(u=>u.eligible&&u.area>45&&u.area<55);
 const items=[{...CATALOG.find(i=>i.id==='chair'),qty:2},{...CATALOG.find(i=>i.id==='box'),qty:4,allowTurn:true,loadClass:'light'}];
 const local=packUnit(unit,items);assert.equal(local.placed.length,2);
 const payload={items,unit:unit.id,weeks:2,options:{stack:true},positions:local.placed.map(p=>({k:p.packKey,x:p.x,z:p.z,r:p.rot}))};
 const response=await worker.fetch(request('/api/quote',payload),e);assert.equal(response.status,200);const result=await response.json();assert.equal(result.fit,true);assert.equal(result.items[1].allowTurn,true);assert.equal(result.items[1].loadClass,'light');assert.equal(result.items[0].supportTop,undefined);
 const off=await(await worker.fetch(request('/api/quote',{...payload,positions:undefined,items:items.map(i=>({...i,allowTurn:false,supportTop:false,loadClass:'heavy'}))}),e)).json();assert.equal(off.items[0].supportTop,false);assert.equal(off.items[1].allowTurn,false);assert.equal(off.items[1].loadClass,'heavy');
});
