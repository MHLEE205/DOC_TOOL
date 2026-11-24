/* v0.16.1 한 화면 시험 — 실제 Chrome (headless · puppeteer-core) 으로 폭을 잰다 (jsdom 은 폭 계산이 없음). 가짜 데이터만 · 네트워크 없음 (fetch = node 의 가짜 세계).
   Invoice 別 (PORTAL と同じ表 · 全員 · 99 줄) — 폭 1,920 / 1,905 (세로 막대 15 px) / 1,366 / 1,351 에서: 페이지 가로 넘침 0 · 표 ≤ 틀 · 줄 높이 ≤ 34 px · 1,920 은 접는 열 0 · 아래로 스크롤해도 열 머리 줄이 헤더 바로 아래.
   Chrome 또는 puppeteer-core 가 없으면 SKIP (PASS). 설치: cd tests && npm i --no-save puppeteer-core@23.11.1 · Chrome 경로 = 환경 변수 CHROME 또는 기본 위치.
   node width.js [html] [--shot 폴더] */
const fs=require('fs'), path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]&&!/^--/.test(process.argv[2])?process.argv[2]:path.join(__dirname,'../index.html');
const SHOT=(process.argv.indexOf('--shot')>0)?process.argv[process.argv.indexOf('--shot')+1]:'';
let pup=null; try{ pup=require('puppeteer-core'); }catch(e){}
const CH=[process.env.CHROME,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome'].filter(Boolean).find(p=>{ try{ return fs.existsSync(p); }catch(e){ return false; } });
if(!pup||!CH){ console.log('PASS width — SKIP ('+(!pup?'puppeteer-core 없음':'Chrome 없음')+')'); process.exit(0); }
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,500));} };

/* 가짜 세계 — 99 줄 · 긴 이름 (선사 · POL · 나라 · 부킹) · 베트남 DEP · 提案 */
function worldW(){
  const W=X.world(), T=W.T, D=n=>X.addDays(T,n)+'T00:00:00Z', b0=W.bookings[0], PT_PATH='古紙/-. AI 活用/PORTAL/clearance_status.json';
  W.carriers=[{crcf9_carrierid:X.g('5',1),crcf9_carrier:'SAMPLE OCEAN LINE CO., LTD. (LONG NAME)'},{crcf9_carrierid:X.g('5',2),crcf9_carrier:'TEST LINE'}];
  W.pols=[{crcf9_region_japanid:X.g('b',1),crcf9_pol:'SAMPLE PORT NAME, JAPAN'}];
  W.regions.push({cr49f_regionid:X.g('a',4),cr49f_region:'MALAYSIA TEST',cr49f_pod:'SAMPLE PORT MY'});
  const sh={};
  for(let n=0;n<95;n++){ const iv='NAA26'+String(10+(n%3)).padStart(2,'0')+'-'+String(20+n).padStart(2,'0');
    W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',100+n),cr49f_invoice_no:iv,cr49f_booking_no:'TESTBKG'+String(1000000000+n),cr49f_etd:D(-25+n),crcf9_bl_etd:n%4?D(-25+n):null,cr49f_eta:D(-10+n),cr49f_cy_cut:D(-28+n),
      _cr49f_region_id_value:X.g('a',1+(n%4)),_cr49f_carrier_id_value:X.g('5',1+(n%2))}));
    sh[iv]={dep:n%5?'未':'確認',furikomi:n%2?'未':'確認済',fd_date:'',fd_note:n%7?'':'メモ メモ メモ メモ メモ メモ メモ メモ'}; }
  W.bookings.forEach(b=>{ if(!b._cr49f_carrier_id_value) b._cr49f_carrier_id_value=X.g('5',1); });
  W.content[PT_PATH]=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:{},cotecna:{},shipping:sh},null,2);
  return W;
}

(async()=>{
  const W=worldW();
  const HTML=fs.readFileSync(HFILE,'utf8'); W.aclEngine=ENG.bytes(HTML); if(/const BL_ENGINE = /.test(HTML)) W.blEngine=ENG.blBytes(HTML);
  const STUB='<script>window.__btns=[];window.LEENAI={auth:{token:async t=>"TOK-"+t,status:{dataverse:"ok",graph:"ok"}},user:{email:"tester@example.test",name:"TEST USER"},SP:{DRIVE_ID:"DRV"},master:{get:async n=>JSON.parse(await window.__mg(n))},toast:function(){},addHeaderButton:function(){},_openMasterPanel:function(){},'+
    'init:function(o){ document.title="LEENAI "+o.sys+" "+o.name+" v"+o.version; setTimeout(function(){ var h=document.createElement("header"); h.className="ln-header"; h.style.cssText="position:sticky;top:0;z-index:50;padding:10px 20px;background:var(--surface)"; h.innerHTML="<span>LEENAI</span><div id=\\"ln-hdr-right\\"></div>"; document.body.prepend(h); document.getElementById("app").style.display=""; o.onReady(); },0); }};</script>';
  const h=HTML.replace(/<script src="https:\/\/mhlee205\.github\.io\/LEENAI_COMMON\/v1\/leenai-common\.js"><\/script>/,STUB).replace(/<link rel="stylesheet"[^>]*>/,'');
  const css=fs.readFileSync(path.join(__dirname,'theme_fx.css'),'utf8');   // 공통 테마 변수 (복사본)
  const page0=h.replace('</head>','<style>'+css+'</style></head>');
  const fakeFetch=X.fakeFetchOf(W);
  const br=await pup.launch({executablePath:CH, headless:true, args:['--no-sandbox','--disable-gpu','--hide-scrollbars=false']});
  try{
    const pg=await br.newPage(); await pg.setViewport({width:1920,height:1080});
    await pg.exposeFunction('__mg', n=>JSON.stringify(n==='staff'?W.staff:n==='doc_staff'?W.docStaff:[]));
    await pg.exposeFunction('__nf', async (url, method, headers, body)=>{ const r=await fakeFetch(url,{method,headers,body}); let text='', b64=false;
      if(typeof r.text==='function'){ text=await r.text(); } else { text=Buffer.from(await r.arrayBuffer()).toString('base64'); b64=true; } return {status:r.status, text, b64}; });
    await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('doc_tool_board_v7','iv'); localStorage.setItem('doc_tool_who','all'); localStorage.setItem('doc_tool_iv_mode_v16','portal'); }catch(e){}
      window.fetch=async(url,init)=>{ init=init||{}; let body=init.body; if(body&&typeof body!=='string'&&typeof body.text==='function') body=await body.text();
        const r=await window.__nf(String(url), String(init.method||'GET').toUpperCase(), init.headers||{}, body||null);
        const data=r.b64?Uint8Array.from(atob(r.text),c=>c.charCodeAt(0)):r.text; const st=r.status===204?200:r.status; return new Response(st===204?null:data,{status:st}); }; });
    await pg.setRequestInterception(true);
    pg.on('request',rq=>{ const u=rq.url(); if(u.indexOf('https://mhlee205.github.io/DOC_TOOL/')===0) return rq.respond({status:200,contentType:'text/html; charset=utf-8',body:page0}); if(/^data:/.test(u)) return rq.continue(); return rq.abort(); });   // 네트워크 0
    await pg.goto('https://mhlee205.github.io/DOC_TOOL/',{waitUntil:'domcontentloaded'});
    await pg.waitForFunction(()=>/読み込み完了|読み込み失敗/.test((document.getElementById('dtProg')||{}).textContent||''),{timeout:120000});
    await pg.waitForFunction(()=>document.querySelectorAll('#dtTable tbody tr').length>=90,{timeout:60000});
    const rows=await pg.$$eval('#dtTable tbody tr',t=>t.length); ok(rows>=95,'99 줄 근처 (가짜 세계)',rows);
    for(const [wd,ht] of [[1920,1080],[1905,1080],[1366,768],[1351,768]]){
      await pg.setViewport({width:wd,height:ht}); await new Promise(r=>setTimeout(r,300));
      const m=await pg.evaluate(()=>{ const t=document.getElementById('dtTable'), tb=t.querySelector('table'), d=document.documentElement, H=[...tb.querySelectorAll('tbody tr')].map(r=>r.getBoundingClientRect().height);
        const vis=[...tb.querySelectorAll('thead th')].filter(th=>getComputedStyle(th).display!=='none').map(th=>th.textContent);
        return {docOver:d.scrollWidth-d.clientWidth, tbl:tb.offsetWidth, box:t.clientWidth, rowMax:Math.max(...H), fold:['f-eta','f-cntr','f-bkg'].filter(c=>t.classList.contains(c)), cols:vis.length}; });
      ok(m.docOver<=0,wd+' px — 페이지 가로 넘침 0',m);
      ok(m.tbl<=m.box,wd+' px — 표 폭 ≤ 틀 폭',m);
      ok(m.rowMax<=34,wd+' px — 줄 높이 1 줄 (≤ 34 px)',m);
      if(wd>=1900) ok(m.fold.length===0&&m.cols===19,wd+' px — 접는 열 0 · 19 열 모두 보임',m);
      else console.log('  '+wd+' px — 접은 열: '+(m.fold.join(' · ')||'없음')+' · 보이는 열 '+m.cols+' · 표 '+m.tbl+' / 틀 '+m.box);
      if(SHOT) await pg.screenshot({path:path.join(SHOT,'width_'+wd+'.png')});
    }
    /* 열 머리 고정 — 아래로 스크롤 */
    await pg.setViewport({width:1920,height:1080}); await pg.evaluate(()=>window.scrollTo(0,1500)); await new Promise(r=>setTimeout(r,200));
    const st=await pg.evaluate(()=>{ const th=document.querySelector('#dtTable thead th'), hd=document.querySelector('.ln-header'); return {th:Math.round(th.getBoundingClientRect().top), hd:Math.round(hd.getBoundingClientRect().bottom), y:window.scrollY}; });
    ok(st.y>0&&Math.abs(st.th-st.hd)<=2,'아래로 스크롤해도 열 머리 줄 = 헤더 바로 아래 (sticky)',st);
    /* 備考 누르면 넓어짐 · 표 폭은 그대로 */
    const nt=await pg.evaluate(async()=>{ const t=document.querySelector('#dtTable table'), w0=t.offsetWidth, el=document.querySelector('.pt-note'); el.focus(); await new Promise(r=>setTimeout(r,50)); const r={w0, w1:t.offsetWidth, nw:el.getBoundingClientRect().width}; el.blur(); return r; });
    ok(nt.nw>=300&&nt.w1===nt.w0,'備考 칸 누르면 넓어짐 (표 폭 그대로)',nt);
    /* ETD 範囲 (v0.15 표) 로 가면 원래 폭 */
    await pg.click('#dtIvEtd'); await new Promise(r=>setTimeout(r,200));
    const mw=await pg.evaluate(()=>getComputedStyle(document.getElementById('dtMain')).maxWidth); ok(mw==='1240px','「ETD 範囲で見る」 = 원래 폭 (1240)',mw);
  } finally { await br.close(); }
  console.log((fail?'FAIL':'PASS')+' width — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL width 예외',e.stack); process.exitCode=1; });
