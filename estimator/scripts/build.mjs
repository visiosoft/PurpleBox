import fs from 'node:fs';import path from 'node:path';
const assets={};function scan(dir,prefix=''){for(const f of fs.readdirSync(dir)){const p=path.join(dir,f),key=prefix+'/'+f;if(fs.statSync(p).isDirectory())scan(p,key);else assets[key]={type:f.endsWith('.js')?'text/javascript; charset=utf-8':f.endsWith('.css')?'text/css; charset=utf-8':f.endsWith('.json')?'application/json':f.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8',body:fs.readFileSync(p,'utf8')};}}scan('public');
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
for(const f of ['worker.js','commerce.js','defaults.js'])fs.copyFileSync('server/'+f,'dist/server/'+(f==='worker.js'?'index.js':f));
fs.copyFileSync('public/engine.js','dist/server/engine.js');fs.writeFileSync('dist/server/assets.js','export default '+JSON.stringify(assets)+';\n');fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Worker and '+Object.keys(assets).length+' embedded web assets built.');
