const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export function unitOffer(c,area){
 const rates=[...c.rates].sort((a,b)=>b.size-a.size);if(!Number.isFinite(area)||area<=0)return null;
 const largest=rates[0]?.size;if(!largest)return null;
 if(area<=largest){const r=[...rates].reverse().find(r=>r.size>=area-1e-6);return {size:r.size,parts:[{...r,qty:1}],combined:false};}
 const target=Math.ceil(area/50)*50;if(target>2000)return null;
 const dp=Array(target+1).fill(null);dp[0]=[];
 for(let total=1;total<=target;total++){for(const r of rates){if(!Number.isInteger(r.size)||r.size<25||r.size>total)continue;const prev=dp[total-r.size];if(!prev||prev.length>=10)continue;const candidate=[...prev,r].sort((a,b)=>b.size-a.size),old=dp[total];if(!old||candidate.length<old.length||(candidate.length===old.length&&candidate.map(r=>String(r.size).padStart(5,'0')).join('')>old.map(r=>String(r.size).padStart(5,'0')).join('')))dp[total]=candidate;}}
 if(!dp[target])return null;const parts=[];for(const r of dp[target]){const p=parts.find(p=>p.size===r.size);if(p)p.qty++;else parts.push({...r,qty:1});}return {size:target,parts,combined:true};
}
export function calculate(c,area,weeks,services={},now=new Date()){
 const offer=unitOffer(c,area);if(!offer)return {manual:true,reason:'A tailored quotation is needed for this size.',revision:c.revision};
 if(!Number.isInteger(weeks)||weeks<2||weeks>52)return {manual:true,reason:'Choose a duration from 2 to 52 weeks.',revision:c.revision};
 const rate=offer.parts.reduce((n,p)=>n+p.rate*p.qty,0),count=offer.parts.reduce((n,p)=>n+p.qty,0),p=c.promotion;
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),promo=p.enabled&&p.start&&p.end&&day>=p.start&&day<=p.end;
 const discountWeeks=promo?Math.min(weeks,p.cycles*4):0,weeklyRate=rate/4,discount=round(weeklyRate*discountWeeks*(promo?p.percent:0)/100),storage=round(weeklyRate*weeks-discount),lock=services.padlock?c.padlock*count:0;
 const moving=services.moving&&c.moving.enabled?c.moving.price:0,packing=services.packing&&c.packing.enabled?c.packing.price:0,subtotal=round(storage+lock+moving+packing),vat=round(subtotal*c.vat/100);
 const states=offer.parts.map(r=>{const fresh=r.updated&&Date.parse(r.updated)<=now.getTime()&&now-Date.parse(r.updated)<86400000;return r.available===null||!fresh?'confirm':r.available>=r.qty?'available':'unavailable';});
 return {manual:false,indicative:!c.published,size:offer.size,parts:offer.parts.map(r=>({size:r.size,qty:r.qty,weeklyRate:r.rate/4})),combined:offer.combined,unitCount:count,rate,weeklyRate,first:round(weeklyRate*(1-(promo?p.percent:0)/100)),weeks,storage,discount,lock,moving,packing,subtotal,vat,total:round(subtotal+vat),availability:states.includes('unavailable')?'unavailable':states.includes('confirm')?'confirm':'available',serviceReview:!!((services.moving&&!c.moving.enabled)||(services.packing&&!c.packing.enabled)),revision:c.revision,promoEnd:promo?p.end:null,promoWeeks:promo?p.cycles*4:0};
}
export function scoreLead(d,c){const w=c.scoring,reasons=[],points=[];const add=(n,s)=>{points.push(n);reasons.push(s)};
 if(['today','3days','7days'].includes(d.timing))add(w.urgent,'Storage needed within 7 days');else if(['14days','30days'].includes(d.timing))add(w.soon,'Storage needed within 30 days');else add(w.later,'Planning ahead');
 add(w.inventory,'Inventory completed');if(!d.quote.manual)add(w.quote,'Quotation viewed');if(d.action==='reserve')add(w.reserve,'Requested storage');if(d.action==='visit')add(w.visit,'Requested a visit');if(d.services.moving)add(w.moving,'Moving service requested');if(d.purpose==='business')add(w.business,'Business requirement');
 let score=Math.min(100,points.reduce((a,b)=>a+b,0));if(d.timing==='research'&& !['reserve','visit'].includes(d.action))score=Math.min(30,score);
 const immediate=['today','3days','7days'].includes(d.timing)||['reserve','visit'].includes(d.action)||d.services.moving||d.purpose==='business'||d.quote.manual||d.area>200;
 return {score,reasons,priority:immediate?'Contact promptly':score>=60?'Hot':score>=31?'Interested':'Nurture',nextAction:immediate?'Review request and contact on WhatsApp during staffed hours.':'Follow up near the selected move-in date; respect the customer’s preference.'};
}
export function validateConfig(c){
 const num=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
 if(typeof c.published!=='boolean'||!num(c.vat,0,25)||!num(c.padlock,0,10000)||!Array.isArray(c.rates)||!c.rates.length||c.rates.length>100)throw Error('Check VAT, padlock and rates.');
 const seen=new Set();for(const r of c.rates){if(!num(r.size,1,5000)||seen.has(r.size)||!num(r.rate,0,100000)||(r.available!==null&&(!Number.isInteger(r.available)||r.available<0||r.available>10000))||(r.updated&&!Number.isFinite(Date.parse(r.updated))))throw Error('Check sizes, prices and availability.');seen.add(r.size);}
 const p=c.promotion;if(!p||typeof p.enabled!=='boolean'||!num(p.percent,0,100)||!Number.isInteger(p.cycles)||p.cycles<1||p.cycles>26||(p.enabled&&(!/^\d{4}-\d{2}-\d{2}$/.test(p.start)||!/^\d{4}-\d{2}-\d{2}$/.test(p.end)||p.start>p.end)))throw Error('Check promotion dates and discount.');
 for(const key of ['moving','packing'])if(!c[key]||typeof c[key].enabled!=='boolean'||!num(c[key].price,0,100000))throw Error('Check service prices.');
 for(const v of Object.values(c.scoring||{}))if(!num(v,0,100))throw Error('Scoring weights must be 0–100.');
 if(!['urgent','soon','later','inventory','quote','reserve','visit','moving','business'].every(k=>num(c.scoring[k],0,100)))throw Error('Missing scoring weights.');
 if(c.whatsapp&&!/^\d{8,15}$/.test(c.whatsapp))throw Error('WhatsApp number needs country code and digits only.');
 for(const u of [c.maps,c.tour,...(c.photos||[])])if(u&&new URL(u).protocol!=='https:')throw Error('Use secure https links.');
 if(typeof c.location!=='string'||c.location.length>100||typeof c.access!=='string'||c.access.length>1000)throw Error('Check facility details.');return c;
}
