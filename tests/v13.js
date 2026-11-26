/* v0.13 시험 (지시서 D00 B/L 照合結果の保存 · 日本語化 Step 2 · 3 · 4) — 가짜 데이터만 · 네트워크 없음. node v13.js [html]
   1 규칙 — 저장 경로 doc_tool/bl/{IV}_{UTC}.json · 문지기 (bl/ 아래 = 정해진 이름만 · 하위 폴더 · 다른 이름 막음) · 「前回」 고르기
   2 화면 — 照合する → 저장 1 건 (새 파일만) · 저장 내용 (Invoice · 계약 · 파일 · 판 · 엔진 · 마스터 판 · 결과 · 사람 · 시각) · 결과 JSON 에 한글 0 · 판정 = 코드
   3 「前回の照合」 (가장 새 저장 1 건 · 읽기만) · 「前回の結果を表示」 · 4 직원 화면 (B/L Draft 탭 · 메일 下書き) 글자에 한글 0
   5 保存の入口 試験モード → doc_tool/bl/ 에 쓰지 않음 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), BF=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const HG=/[ᄀ-ᇿ㄰-㆏가-힯]/;
const WIP='古紙/-. 古紙書類/▲ 書類作成中', BLD='古紙/-. AI 活用/D-00/doc_tool/bl';
(async()=>{
console.log('1 규칙');
{ const p=DOC.blResultPath('naa2611-01',new Date('2026-11-23T09:30:05Z'));
  eq(p,'古紙/-. AI 活用/D-00/doc_tool/bl/NAA2611-01_20261123-093005.json','저장 경로 = doc_tool/bl/{IV}_{UTC}.json (ACL 과 같은 규칙)');
  const g=x=>{ try{ return DOC.guardOut(x); }catch(e){ return e.message; } };
  eq([g(p),/書き込み禁止/.test(g(BLD+'/sub/NAA2611-01_20261123-093005.json')),/書き込み禁止/.test(g(BLD+'/memo.json')),/書き込み禁止/.test(g(BLD+'/NAA2611-01_20261123.json')),g('古紙/-. AI 活用/D-00/doc_tool/acl/NAA2611-01_20261123-093005.json'),/書き込み禁止/.test(g('古紙/-. AI 活用/D-00/x.json'))],
     [true,true,true,true,true,true],'문지기 — bl/ 아래는 정해진 이름만 (하위 폴더 · 다른 이름 막음) · 다른 곳은 그대로');
  eq(DOC.latestAcl(['NAA2611-01_20261120-010000.json','NAA2611-01_20261123-093005.json','NBB2611-01_20261121-000000.json'])['NAA2611-01'].name,'NAA2611-01_20261123-093005.json','前回 = 가장 새 이름'); }

const DRAFT=await BF.mkPdf([BF.draftItems({consignee:['TO THE ORDER OF OTHER BANK']})]);
const Bk=(id,key)=>({id, kind:'基本', stage:'BL_DRAFT', pay:/^bl:lc:/.test(key)?'LC':'ALL', scope_type:'all', scope:'ALL', engine_key:key, title_ja:'B/L 基本 '+id, why_ja:'なぜ '+id, example:'', status:'有効', approved_by:'BOSS', approved_at:'2026-11-01'});
const ROWS=[Bk('CP-B56','bl:consignee'),Bk('CP-B67','bl:lc:consignee')];
function mk(){ const W=X.world(); W.itemBytes={}; const f=W.sp[WIP+'/NAA2611-01'].find(x=>x.name==='NAA2611-01_DRAFT.pdf'); W.itemBytes[f.id]=DRAFT;
  W.masters={checkpoint:ROWS, port_alias:[]}; W.metaId={'古紙/-. AI 活用/MASTER/master_checkpoint.json':'MCP','古紙/-. AI 活用/MASTER/master_port_alias.json':'MPA'};
  W.versions={MCP:[{id:'6.0', by:'boss@example.test', items:ROWS}], MPA:[{id:'2.0', by:'boss@example.test', items:[]}]}; return W; }
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const txt=(w,id)=>w.document.getElementById(id).textContent;
const openBl=async(w,iv)=>{ w.document.getElementById('dtQ').value=iv; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button[data-tab="bl"]'));
  w.document.querySelector('#dtIvTabs button[data-tab="bl"]').click(); await X.until(()=>!!w.document.getElementById('dtBlRun')); };

console.log('2 저장');
let saved=null;
{ const W=mk(), w=await X.page(W,{...INIT, html:HFILE}); await X.until(()=>w.eval('CPS.state')==='ok',20000);
  await openBl(w,'NAA2611-01'); await X.until(()=>/前回の照合: なし/.test(txt(w,'dtIvBody')),10000); ok(true,'前回 없음 → 「前回の照合: なし」');
  const w0=W.writes.length; w.document.getElementById('dtBlRun').click(); await X.until(()=>/照合しました|照合できません/.test(txt(w,'dtIvBody')),30000);
  ok(/照合しました \(相違\) · 保存しました/.test(txt(w,'dtIvBody')),'照合 → 「保存しました」',txt(w,'dtIvBody').slice(0,300));
  const ws=W.writes.slice(w0); ok(ws.length===1&&/doc_tool\/bl\/NAA2611-01_\d{8}-\d{6}\.json:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(decodeURIComponent(ws[0].url))&&ws[0].method==='PUT','쓰기 1 = doc_tool/bl/ 새 파일 (conflictBehavior=fail)',ws.map(x=>x.url));
  const body=ws[0]&&ws[0].body; const t=body&&typeof body.text==='function'?await body.text():String(body||''); saved=JSON.parse(t);
  eq([saved.kind,saved.invoice,saved.contract,saved.file,saved.edition,saved.verdict,saved.user,!!saved.at,/^書類ツール v0\.(?:1[3-9]|2\d|3[01])(\.\d+)?$/.test(saved.engine.doc_tool),/^v0\.[3-9] @[0-9a-f]{40}$/.test(saved.engine.bl_bench),/^v0\.(?:1[3-9]|2\d) @[0-9a-f]{40}$/.test(saved.engine.acl_bench),saved.masters.checkpoint,saved.masters.port_alias],
     ['B/L Draft 照合','NAA2611-01','LRS-2611AA1','NAA2611-01_DRAFT.pdf','1版目','相違','tester@example.test',true,true,true,true,'6.0','2.0'],'저장 내용 — Invoice · 계약 · 파일 · 판 · 판정 · 사람 · 시각 · 엔진 (書類ツール · bl_bench · ACL 커밋) · 마스터 판');
  const A=saved.result.A||[], B=saved.result.B||[];
  ok(A.length>10&&B.length>=7&&A.every(r=>['SAME','NOTATION','REF','UNKNOWN','DIFF','SI_BLANK'].indexOf(r.class)>=0)&&B.some(r=>r.item==='Consignee bank'&&/^DIFF/.test(r.result))&&A.some(r=>r.cp==='CP-B56'),'결과 전부 — A · B (판정 = 코드 · CP 번호)',{A:A.slice(0,3),B:B.slice(0,2)});
  ok(!HG.test(t),'저장한 결과 JSON 에 한글 0',(t.match(/.{0,30}[가-힯].{0,30}/)||[])[0]);
  /* 4 직원 화면 — B/L Draft 탭 · 메일 下書き 3 · ACL 탭 */
  const b1=txt(w,'dtIvBody'); w.document.getElementById('dtBlFix').click(); await X.until(()=>!!w.document.getElementById('dtMdBody'));
  const m1=w.document.getElementById('dtMdBody').value; w.document.getElementById('dtBlBuyerMail').click(); await X.until(()=>!!w.document.getElementById('dtMdSubj')&&/\[B\/L Draft for/.test(w.document.getElementById('dtMdSubj').value));
  const m2=w.document.getElementById('dtMdBody').value, ttl=[...w.document.querySelectorAll('#dtIvBody [title]')].map(x=>x.getAttribute('title')).join('\n');
  ok(!HG.test(b1)&&!HG.test(m1)&&!HG.test(m2)&&!HG.test(ttl),'B/L Draft 탭 글자 · 마우스 설명 (title) · 메일 下書き 에 한글 0',[(b1.match(/.{0,30}[가-힯].{0,30}/)||[])[0],(ttl.match(/.{0,30}[가-힯].{0,30}/)||[])[0]]);
  ok(/足りない語: /.test(ttl+b1)||/Consignee 銀行 \(46A\)/.test(b1),'이유 = 일본어 (Consignee 銀行 (46A) · 足りない語)',b1.slice(0,200));
  ok(/■ Consignee \(L\/C 46A の銀行\)/.test(m1),'정정 메일 = 코드에서 일본어 칸 이름 (Consignee bank → 「Consignee (L/C 46A の銀行)」)',m1.slice(0,300));
  w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click(); await X.until(()=>!!w.document.getElementById('dtAclMiss'));
  ok(!HG.test(txt(w,'dtIvBody')),'ACL 탭 글자에 한글 0',(txt(w,'dtIvBody').match(/.{0,30}[가-힯].{0,30}/)||[])[0]); }

console.log('3 前回の照合');
{ const W=mk(); W.sp[BLD]=[{id:'p1',name:'NAA2611-01_20261120-010000.json',file:{}},{id:'p2',name:'NAA2611-01_20261123-093005.json',file:{}},{id:'p3',name:'NBB2611-01_20261123-000000.json',file:{}}];
  W.content[BLD+'/NAA2611-01_20261123-093005.json']=JSON.stringify(Object.assign({},saved,{at:'2026-11-23T09:30:05.000Z'}));
  W.content[BLD+'/NAA2611-01_20261120-010000.json']=JSON.stringify(Object.assign({},saved,{at:'2026-11-20T01:00:00.000Z', verdict:'一致'}));
  const w=await X.page(W,{...INIT, html:HFILE}); await X.until(()=>w.eval('CPS.state')==='ok',20000); await openBl(w,'NAA2611-01');
  await X.until(()=>/前回の照合: 11\/23/.test(txt(w,'dtIvBody')),10000);
  ok(/前回の照合: 11\/23 18:30 · 相違 · /.test(txt(w,'dtIvBody'))&&!/UTC/.test(txt(w,'dtIvBody')),'「前回の照合」 = 가장 새 저장 (11/23 · 相違) · v0.17 (F4) 일본 시간 (09:30 UTC → 18:30)',txt(w,'dtIvBody').slice(0,300));
  const w0=W.writes.length; w.document.getElementById('dtBlPrevShow').click(); await X.until(()=>!!w.document.querySelector('#dtIvBody .av'),10000);
  ok(/前回の結果を表示しています/.test(txt(w,'dtIvBody'))&&/確認した項目/.test(txt(w,'dtIvBody'))&&!w.document.getElementById('dtBlBuyer'),'「前回の結果を表示」 → 결과 화면 (Draft 를 읽지 않아 バイヤー用 버튼 없음)');
  eq(W.writes.length-w0,0,'前回 보기 = 쓰기 0'); }

console.log('5 保存の入口 試験モード = bl/ 에 쓰지 않음');
{ const W=mk(), w=await X.page(W,{...INIT, html:HFILE, email:'boss@example.test', ls:{doc_tool_save_test:'1'}}); const S=()=>w.eval('SAVE');
  const file=(name,b)=>({name, arrayBuffer:async()=>{ const u=new Uint8Array(b); return u.buffer.slice(u.byteOffset,u.byteOffset+u.length); }});
  await w.saveDrop([file('NAA2611-01_DRAFT_new.pdf',await BF.mkPdf([BF.draftItems({onboard:'15 NOV 2026'})]))]); await X.until(()=>S().rows.length===1&&S().rows[0].res,20000);
  await w.saveDo(S().rows[0]); await X.until(()=>S().rows[0].res==='保存済',20000);
  ok(!W.writes.some(x=>/doc_tool\/bl\//.test(decodeURIComponent(x.url))),'試験モードの保存 → 照合 결과 저장 없음 (ACL 과 같음)',W.writes.map(x=>decodeURIComponent(x.url).slice(-60))); }

console.log('v13 pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL exception',e.stack); process.exitCode=1; });
