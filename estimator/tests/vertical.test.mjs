import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,packUnit,recommend,makePacks,movePack,packedVolume} from '../public/engine.js';
const item=(id,qty=1,extra={})=>({...CATALOG.find(i=>i.id===id),qty,...extra});
const unit=(height=2.4)=>({id:'vertical',w:1,d:1,height,area:10.764,sqm:1,eligible:true,poly:[[0,0],[1,0],[1,1],[0,1]]});
test('Confirmed chairs nest by incremental height; ordinary chairs stay separate',()=>{
 const chairs=item('chair',10,{nesting:true,nestRise:.15});
 const r=packUnit(unit(),[chairs]);assert.equal(r.fit,true);assert.equal(r.placed.length,1);assert.ok(Math.abs(r.placed[0].ph-2.25)<1e-8);assert.equal(r.placed[0].layers.length,10);
 assert.equal(packUnit(unit(),[item('chair',10)]).fit,false);
 assert.equal(packUnit(unit(),[chairs],{stack:false}).fit,false);
 assert.ok(makePacks([chairs],true,1).every(p=>p.n===1&&p.ph<=1));
 assert.ok(packedVolume([chairs])<chairs.w*chairs.d*chairs.h*10);
 assert.equal(recommend([unit()],[chairs]).choices.length,1);
});
test('Different box sizes share supported columns; tall and wide loads are rejected',()=>{
 const r=packUnit(unit(),[item('largebox',2),item('box',2),item('smallbox',2)]);
 assert.equal(r.fit,true);assert.equal(r.placed.length,1);assert.ok(r.placed[0].ph<=2.4+1e-8);
 const layers=r.placed[0].layers;for(let n=1;n<layers.length;n++){assert.ok(layers[n].y>=layers[n-1].y+layers[n-1].h-1e-8);}
 const locker=packUnit(unit(1),[item('largebox',3)]);assert.equal(locker.fit,false);
});
test('Furniture opt-out is respected and complete groups move together',()=>{
 const bag=[item('dresser',1,{supportTop:true}),item('box',3)];
 const r=packUnit(unit(),bag);assert.equal(r.fit,true);assert.equal(r.placed.length,1);assert.ok(Math.abs(r.placed[0].ph-2.2)<1e-8);
 assert.equal(packUnit(unit(),[item('dresser',1,{supportTop:false}),item('box',3)]).placed.length,2);
 const moved=movePack(r,r.placed[0].packKey,.04,.04,false);assert.equal(moved.ok,true);assert.deepEqual(moved.result.placed[0].layers,r.placed[0].layers);
 assert.equal(packUnit(unit(),[item('officechair',5,{nesting:true})]).fit,false);
});
