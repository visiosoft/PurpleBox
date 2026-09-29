import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.75,metalness:.03}));return mats.get(c);}
export function block(g,x,y,z,w,h,d,c,round=true){const geometry=round?new RoundedBoxGeometry(w,h,d,2,Math.min(.025,w/5,h/5,d/5)):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(geometry,mat(c));m.position.set(x+w/2,y+h/2,z+d/2);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cyl(g,x,y,z,r,h,c,rz=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat(c));m.position.set(x,y,z);m.rotation.z=rz;m.castShadow=true;g.add(m);return m;}
function beam(g,a,b,r,c){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dir=bv.clone().sub(av);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,dir.length(),10),mat(c));m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());m.castShadow=true;g.add(m);return m;}
export function label(text,color='#ffffff',size=1){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.font='600 43px system-ui';x.textAlign='center';x.fillStyle=color;x.fillText(text,256,61);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true}));s.scale.set(size,size*96/512,1);s.renderOrder=4;return s;}
export function itemModel(i){const g=new THREE.Group();if(i.horizontal&&i.originalDimensions){const inner=itemModel({...i,...i.originalDimensions,horizontal:false});inner.rotation.x=Math.PI/2;inner.position.y=i.h;g.add(inner);return g;}const w=i.w,h=i.h,d=i.d,c=i.color||'#b592d0',dark='#514558',cream='#f1ece7',wood='#c69d73';const b=(x,y,z,ww,hh,dd,col,round=true)=>block(g,x*w,y*h,z*d,ww*w,hh*h,dd*d,col,round);
 switch(i.kind){
 case 'packedbed':
  b(0,0,0,1,1,.58,'#eee8ef');b(.03,.025,.59,.94,.95,.12,wood);b(.04,.02,.73,.08,.94,.15,wood);b(.88,.02,.73,.08,.94,.15,wood);b(.15,.02,.74,.68,.12,.20,wood);b(.1,.27,.96,.80,.045,.03,'#b49bcc');b(.1,.73,.96,.80,.045,.03,'#b49bcc');break;
 case 'packedtable':
  if(i.shape==='round'){const top=cyl(g,w/2,h/2,d*.11,1,d*.22,c);top.rotation.x=Math.PI/2;top.scale.set(w/2,1,h/2);}else b(0,0,0,1,1,.22,c);for(let k=0;k<4;k++)b(.08+k*.22,.03,.25,.12,.72,.55,wood);b(.025,.18,.83,.95,.05,.04,'#b49bcc');b(.025,.65,.83,.95,.05,.04,'#b49bcc');break;
 case 'panel':b(0,0,0,1,1,1,c);b(.05,.04,.98,.90,.92,.015,'#e2d8e8');break;
 case 'roll':cyl(g,w/2,h/2,d/2,Math.min(w,d)/2,h,c);break;

 case 'sofa':b(.04,.02,.05,.92,.11,.9,dark);b(.02,.14,.02,.96,.35,.96,c);b(.02,.47,.02,.96,.53,.19,c);b(0,.42,.05,.12,.38,.95,c);b(.88,.42,.05,.12,.38,.95,c);{const seats=w>1.9?3:w>1.3?2:1;for(let k=0;k<seats;k++){b(.14+k*.72/seats,.49,.24,.70/seats,.13,.68,'#e0c9ee');b(.14+k*.72/seats,.63,.21,.70/seats,.30,.16,'#ceb1e3');}b(.17,.65,i.packedScene?.20:.48,.14,.20,.16,'#f0cf93');}break;
 case 'bed':b(.025,.02,.025,.95,.12,.95,wood);b(0,.14,0,1,.17,1,c);b(.015,.31,.04,.97,.22,.94,cream);b(0,.12,0,1,.88,.06,c);b(.03,.535,.34,.94,.025,.62,c);b(.04,.54,.11,.43,.10,.19,cream);if(w>1.2)b(.52,.54,.11,.43,.10,.19,cream);break;
 case 'mattress':b(0,0,0,1,1,1,cream);b(.035,.03,.98,.93,.94,.015,'#d9cddd');break;
 case 'chair':for(const x of [.08,.82])for(const z of [.1,.82])b(x,0,z,.09,.5,.08,wood);b(.02,.48,.03,.96,.08,.94,c);b(.06,.55,.04,.08,.45,.08,wood);b(.86,.55,.04,.08,.45,.08,wood);b(.06,.74,.02,.88,.23,.1,c);break;
 case 'officechair':cyl(g,w/2,h*.23,d/2,.035,h*.44,dark);for(let n=0;n<5;n++){const a=n*Math.PI*2/5;beam(g,[w/2,h*.04,d/2],[w/2+Math.cos(a)*w*.45,h*.04,d/2+Math.sin(a)*d*.45],.022,dark);}b(.10,.42,.13,.8,.1,.77,c);b(.12,.51,.07,.76,.46,.15,c);b(.03,.56,.3,.08,.04,.50,dark);b(.89,.56,.3,.08,.04,.50,dark);break;
 case 'table':if(i.shape==='round'){cyl(g,w/2,h*.955,d/2,w/2,h*.09,c);for(const x of [.22,.72])for(const z of [.22,.72])b(x,0,z,.06,.91,.06,dark);break;}
 case 'desk':for(const x of [.03,.91])for(const z of [.05,.89])b(x,0,z,.06,.91,.06,dark);b(0,.91,0,1,.09,1,c);if(i.kind==='desk')b(.68,.34,.12,.28,.51,.74,c);break;
 case 'wardrobe':b(0,0,0,1,1,.95,c);b(.02,.025,.95,.47,.95,.04,'#b6ccbd');b(.51,.025,.95,.47,.95,.04,'#c8d8cd');b(.44,.43,.99,.016,.18,.01,dark);b(.55,.43,.99,.016,.18,.01,dark);break;
 case 'dresser':b(0,0,0,1,1,.94,c);for(let k=0;k<3;k++){b(.035,.03+k*.32,.94,.93,.29,.045,c);b(.40,.16+k*.32,.985,.20,.027,.015,dark);}break;
 case 'shelf':case 'rack':{const metal=i.kind==='rack'?'#788092':wood;for(const x of [0,.96])for(const z of [0,.94])b(x,0,z,.04,1,.06,metal);for(let k=0;k<4;k++)b(0,.02+k*.30,0,1,.025,1,metal);if(i.kind==='shelf')b(0,0,0,1,1,.04,c);break;}
 case 'box':case 'archive':b(0,0,0,1,1,1,c);b(.46,.002,.99,.08,.99,.009,'#f1d8ad',false);b(.46,.994,0,.08,.005,1,'#f1d8ad',false);b(.12,.40,.995,.28,.22,.005,cream,false);if(i.kind==='archive')b(0,.91,0,1,.09,1,'#a68ac4');break;
 case 'fridge':b(0,0,0,1,1,.94,c);b(.01,.01,.94,.98,.68,.055,'#e1e6eb');b(.01,.705,.94,.98,.285,.055,'#e1e6eb');b(.08,.44,.995,.025,.20,.005,dark);b(.08,.75,.995,.025,.12,.005,dark);break;
 case 'washer':b(0,0,0,1,1,.94,c);b(.02,.80,.94,.96,.18,.06,cream);{const m=new THREE.Mesh(new THREE.CylinderGeometry(w*.30,w*.30,d*.04,32),mat('#8493a7'));m.rotation.x=Math.PI/2;m.position.set(w/2,h*.42,d*.96);g.add(m);const inner=new THREE.Mesh(new THREE.CylinderGeometry(w*.23,w*.23,d*.045,32),mat('#344859'));inner.rotation.x=Math.PI/2;inner.position.set(w/2,h*.42,d*.965);g.add(inner);}b(.68,.87,.99,.17,.04,.01,dark);break;
 case 'tv':b(.025,.02,0,.95,.94,.9,'#45424e');b(.05,.065,.90,.90,.85,.02,'#7593a1');b(.06,.075,.922,.88,.005,.01,'#abc9d0');break;
 case 'suitcase':b(.02,.06,.02,.96,.85,.96,c);for(const x of [.12,.80])b(x,0,.20,.09,.07,.15,dark);b(.3,.91,.4,.40,.05,.15,dark);b(.3,.95,.4,.07,.05,.15,dark);b(.63,.95,.4,.07,.05,.15,dark);for(let n=0;n<4;n++)b(.18+n*.19,.2,.98,.025,.57,.01,'#9676c1');break;
 case 'pallet':for(let k=0;k<5;k++)b(0,.05,k*.2,1,.06,.15,wood);for(const x of [.08,.8])b(x,0,0,.12,.05,1,dark);for(let y=0;y<2;y++)for(let x=0;x<3;x++)for(let z=0;z<2;z++){b(.025+x*.325,.12+y*.43,.02+z*.48,.31,.41,.46,'#c3a079');b(.165+x*.325,.53+y*.43,.02+z*.48,.035,.005,.46,'#efd4a6');}break;
 case 'bike':{const rr=Math.min(h*.32,w*.21),z=d/2;for(const x of [rr,w-rr]){const t=new THREE.Mesh(new THREE.TorusGeometry(rr,.025,8,32),mat('#4c4655'));t.position.set(x,rr,z);g.add(t);for(let k=0;k<8;k++){const a=k*Math.PI/4;beam(g,[x,rr,z],[x+Math.cos(a)*rr,rr+Math.sin(a)*rr,z],.004,'#b4b2bc');}}const a=[w*.23,h*.33,z],b1=[w*.52,h*.27,z],cc=[w*.4,h*.70,z],dd=[w*.73,h*.7,z],ee=[w*.8,h*.32,z];for(const [a1,b2] of [[a,b1],[a,cc],[b1,cc],[cc,dd],[dd,b1],[dd,ee]])beam(g,a1,b2,.023,c);b(.33,.71,.36,.16,.04,.28,dark);beam(g,[w*.73,h*.68,z],[w*.77,h*.97,z],.02,dark);beam(g,[w*.77,h*.97,.08],[w*.77,h*.97,d-.08],.02,dark);break;}
 default:b(0,0,0,1,1,1,c);b(.10,.30,.995,.80,.30,.005,'#d9c1ec');break;
 }
 return g;
}
export function disposeGroup(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite&&o.material){o.material.map?.dispose();o.material.dispose();}});g.clear();}
