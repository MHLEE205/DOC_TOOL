/* 시험용 — index.html 에 고정한 acl_bench 엔진 (ACL_ENGINE 커밋 + sha256) 의 원문.
   CONTRACT_SEND 클론에서 git show (ACL_REPO=경로 · 기본 ../../CONTRACT_SEND) → 없으면 raw 주소에서 받음 (네트워크는 그때만). 받은 원문은 sha256 이 고정 값과 같아야 씀 */
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),os=require('os');
function pin(html){ const m=String(html).match(/const ACL_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})', ver:'([\d.]+)'\}/); if(!m) throw new Error('ACL_ENGINE 고정이 없음'); return {commit:m[1], sha256:m[2], ver:m[3]}; }
const cache={};
function bytes(html){
  const P=pin(html); if(cache[P.commit]) return cache[P.commit];
  const tmp=path.join(os.tmpdir(),'acl_engine_'+P.commit+'.html'); let b=null;
  if(fs.existsSync(tmp)) b=fs.readFileSync(tmp);
  if(!b){ try{ b=cp.execFileSync('git',['-C',process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND'),'show',P.commit+':acl_bench.html'],{maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){} }
  if(!b){ b=cp.execFileSync(process.execPath,['-e',"fetch(process.argv[1]).then(r=>r.arrayBuffer()).then(x=>process.stdout.write(Buffer.from(x)))",'https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/'+P.commit+'/acl_bench.html'],{maxBuffer:1<<26}); }
  const h=crypto.createHash('sha256').update(b).digest('hex'); if(h!==P.sha256) throw new Error('엔진 원문 sha256 이 고정 값과 다름 ('+P.commit.slice(0,7)+')');
  try{ fs.writeFileSync(tmp,b); }catch(e){}
  return cache[P.commit]=b;
}
function engine(html){ return new Function('module',bytes(html).toString('utf8').match(/<script id="acl-core">([\s\S]*?)<\/script>/)[1]+';return ACL;')(undefined); }
/* v0.10: 版の大小 (「0.10」 > 「0.9」 — 数字の + では 0.1 になる) */
const vnum=v=>String(v).split('.').map(Number).reduce((s,x)=>s*1000+(x||0),0);
/* v0.12: B/L Draft エンジン (BL_ENGINE — bl_bench.html の bl-core) — 同じく CONTRACT_SEND 클론 → raw · sha256 確認 */
function blPin(html){ const m=String(html).match(/const BL_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})', ver:'([\d.]+)'\}/); if(!m) throw new Error('BL_ENGINE 고정이 없음'); return {commit:m[1], sha256:m[2], ver:m[3]}; }
function blBytes(html){
  const P=blPin(html), key='bl_'+P.commit; if(cache[key]) return cache[key];
  const tmp=path.join(os.tmpdir(),'bl_engine_'+P.commit+'.html'); let b=null;
  if(fs.existsSync(tmp)) b=fs.readFileSync(tmp);
  if(!b){ try{ b=cp.execFileSync('git',['-C',process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND'),'show',P.commit+':bl_bench.html'],{maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){} }
  if(!b){ b=cp.execFileSync(process.execPath,['-e',"fetch(process.argv[1]).then(r=>r.arrayBuffer()).then(x=>process.stdout.write(Buffer.from(x)))",'https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/'+P.commit+'/bl_bench.html'],{maxBuffer:1<<26}); }
  const h=crypto.createHash('sha256').update(b).digest('hex'); if(h!==P.sha256) throw new Error('B/L 엔진 원문 sha256 이 고정 값과 다름 ('+P.commit.slice(0,7)+')');
  try{ fs.writeFileSync(tmp,b); }catch(e){}
  return cache[key]=b;
}
function blEngine(html){ const B=new Function('module',blBytes(html).toString('utf8').match(/<script id="bl-core">([\s\S]*?)<\/script>/)[1]+';return BL;')(undefined); B.useEngine(engine(html)); return B; }
module.exports={pin, bytes, engine, vnum, blPin, blBytes, blEngine};
