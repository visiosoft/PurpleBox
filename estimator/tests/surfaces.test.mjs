import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,makePacks,packUnit,packedVolume,layerBodies,layerPosition,packingMetrics} from '../public/engine.js';
const item=(id,qty=1,extra={})=>({...CATALOG.find(i=>i.id===id),qty,...extra});
const overlap=(a,b)=>a.x<b.x+b.w-1e-6&&a.x+a.w>b.x+1e-6&&a.z<b.z+b.d-1e-6&&a.z+a.d>b.z+1e-6&&a.y<b.y+b.h-1e-6&&a.y+a.h>b.y+1e-6;
function validate(packs,height){for(const p of packs){assert.ok(p.ph<=height+1e-6);for(let n=p.baseCount;n<p.layers.length;n++){const l=p.layers[n],w=l.layerRot?l.d:l.w,d=l.layerRot?l.w:l.d;assert.ok(l.x>=-1e-6&&l.z>=-1e-6&&l.x+w<=p.w+1e-6&&l.z+d<=p.d+1e-6);const bodies=layerBodies(l);for(let k=0;k<n;k++)for(const a of bodies)for(const b of layerBodies(p.layers[k]))assert.ok(!overlap(a,b),'No intersection with another item or furniture body');}}}
test('Two ordinary chairs carry smaller boxes on their seats without nesting',()=>{
 const packs=makePacks([item('chair',2),item('smallbox',6)],true);
 assert.equal(packs.length,2);assert.ok(packs.every(p=>p.id==='chair'&&p.n===4));
 assert.ok(packs.every(p=>Math.abs(p.layers[1].y-.504)<1e-6));validate(packs,2.4);
 const off=makePacks([item('chair',2,{supportTop:false}),item('smallbox',6)],true);assert.equal(off.filter(p=>p.id==='chair').reduce((n,p)=>n+p.n,0),2);
});
test('Wide furniture supports side-by-side mixed items instead of one centered tower',()=>{
 const packs=makePacks([item('dresser',1,{w:1.5,d:.65}),item('box',4),item('suitcase',1)],true);
 assert.equal(packs.length,1);assert.ok(packs[0].layers.slice(1).some(p=>p.horizontal));
 assert.ok(new Set(packs[0].layers.slice(1).map(p=>p.x+','+p.z)).size>1);validate(packs,2.4);
});
test('Shelf interiors and sofa seats hold items at actual support heights',()=>{
 const shelf=makePacks([item('bookcase'),item('smallbox',8)],true);assert.equal(shelf.length,1);
 assert.ok(new Set(shelf[0].layers.slice(1).map(p=>p.y)).size>=3);validate(shelf,2.4);
 const sofa=makePacks([item('loveseat'),item('suitcase',2)],true);assert.equal(sofa.length,1);assert.ok(sofa[0].layers[1].y<sofa[0].h);validate(sofa,2.4);
 assert.ok(packedVolume([item('bookcase'),item('smallbox',8)])<.8*.35*1.8+8*.35*.3*.3);
});
test('Large boxes, heavy or fragile items never get forced onto chair seats',()=>{
 for(const contents of [item('largebox',2),item('box',2,{allowTurn:false}),item('smallbox',2,{loadClass:'heavy'}),item('smallbox',2,{loadClass:'fragile'})]){
  const packs=makePacks([item('chair',2),contents],true);assert.equal(packs.filter(p=>p.id==='chair').reduce((n,p)=>n+p.n,0),2);validate(packs,2.4);
 }
 const disabled=makePacks([item('chair',2),item('smallbox',6)],false);assert.equal(disabled.length,8);
});
test('Actual unit ceiling bounds mixed stacks and rotated groups retain local placement',()=>{
 const unit={id:'test',w:1,d:1,height:1,area:10,sqm:1,poly:[[0,0],[1,0],[1,1],[0,1]]};
 const result=packUnit(unit,[item('chair'),item('smallbox',2)]);validate(result.placed,1);assert.ok(result.placed.find(p=>p.id==='chair').n<=2);
 const p=makePacks([item('dresser',1,{w:1.5,d:.65}),item('smallbox',4)],true)[0];
 for(const rot of [false,true])for(const l of p.layers){const pos=layerPosition({...p,x:.1,z:.2,rot},l),w=pos.rot?l.d:l.w,d=pos.rot?l.w:l.d;assert.ok(pos.x>=.1-1e-6&&pos.z>=.2-1e-6&&pos.x+w<=.1+(rot?p.d:p.w)+1e-6&&pos.z+d<=.2+(rot?p.w:p.d)+1e-6);}
 assert.ok(packingMetrics(result).volume<=packingMetrics(result).capacity);
});

test('Turnable medium boxes fit chair seats on their side, preserving volume',()=>{
 const packs=makePacks([item('chair',2),item('box',4)],true);assert.equal(packs.length,2);
 for(const p of packs){assert.equal(p.n,3);for(const l of p.layers.slice(1)){assert.equal(l.tipped,true);assert.ok(Math.abs(l.w*l.d*l.h-.5*.4*.4)<1e-8);}}validate(packs,2.4);
});
