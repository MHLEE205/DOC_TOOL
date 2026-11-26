/* v0.21 시험 (지시서 THOR_15 Part ③ · 형님 F1 ~ F3) — 가짜 데이터 · 가짜 거래처 · 네트워크 없음 (AI 도 가짜) · 메일 보내기 0. node v21.js [html]
   ③-1 엔진 고정 (acl v0.18 · bl v0.5 · fd v0.1 = 같은 커밋 · sha256) · ③-2 FD 탭 (묶음별 · 試験 · 읽은 PDF · 원본 열기) · ③-3 TO BANK AI 자동 (키 없음 = 관리자에게 「AI 未実行（キーなし）」 ·
   키 있음 = 2 회 · 저장본 _fd_ai/{sha256}.json · 비용 기록 · 저장본 있으면 다시 안 부름) · ③-4 今日やること 배지 (회색) · ③-5 誤検知 기록 · 관리자 실적표 · ③-6 ACL · B/L · S/I 試験 줄 (같은 모양) · 쓰기 문지기 */
const fs=require('fs'),path=require('path'),nodeCrypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), {mkPdf}=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const WIP='古紙/-. 古紙書類/▲ 書類作成中', IV='NAA2611-01';
const ROW=(id,ek,stage)=>({id, kind:'追加', stage:stage||'FD', pay:'ALL', scope_type:'all', scope:'ALL', left:'', op:'', right:'', result:'相違', engine_key:ek, title_ja:'TEST '+id, why_ja:'TEST', example:'', reported_by:'TEST', status:'試験', trial:'', approved_by:'', approved_at:'', note:''});
const ROWS=[ROW('CP-A21','fd:iv:origin'),ROW('CP-A22','fd:iv:goods'),ROW('CP-A23','fd:iv:english'),ROW('CP-A63','fd:tb:count'),ROW('CP-A05','si:to_order','S/I')];
const ivPage=(o)=>{ o=o||{}; const L=['COMMERCIAL INVOICE','Seller Date 2026/11/05','SAMPLE EXPORT CO., LTD. Invoice No '+IV,'Shipped per SAMPLE VESSEL 001','From SAMPLE POL','To CAT LAI','L/C No. TESTLC001 DATED ON OCT 01, 2026',
  'TEST ITEM OCC 20 100 250 25,000.00','TOTAL 20 100 25,000.00'].concat(o.noOrigin?[]:['COUNTRY OF ORIGIN : JAPAN']); return L.map((t,i)=>({x:40,y:40+i*16,t})); };
async function mk(o){ o=o||{}; const W=X.world(); W.itemBytes={}; const add=(name,bytes)=>{ const f={id:'fd'+Object.keys(W.itemBytes).length, name, file:{}, size:bytes.length, lastModifiedDateTime:'2026-11-10T00:00:00Z', webUrl:'https://example.test/sp/'+encodeURIComponent(name)}; W.sp[WIP+'/'+IV].push(f); W.itemBytes[f.id]=bytes; return f; };
  add(IV+'_.pdf', await mkPdf([ivPage({noOrigin:o.noOrigin})]));
  if(o.tb){ W.tbBytes=await mkPdf([[{x:40,y:40,t:'SCAN 1'}],[{x:40,y:40,t:'SCAN 2'}]]); add(IV+'_TO BANK.pdf', W.tbBytes); }
  W.masters={checkpoint:ROWS, port_alias:[]}; W.metaId={'古紙/-. AI 活用/MASTER/master_checkpoint.json':'MCP','古紙/-. AI 活用/MASTER/master_port_alias.json':'MPA'};
  W.versions={MCP:[{id:'1.0', by:'boss@example.test', items:ROWS}], MPA:[{id:'1.0', by:'boss@example.test', items:[]}]};
  return W; }
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const openFd=async(w)=>{ w.document.getElementById('dtQ').value=IV; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button[data-tab="fd"]'),20000);
  await X.until(()=>w.eval('S.folders["'+IV+'"]&&S.folders["'+IV+'"].files')?true:false,20000);
  w.document.querySelector('#dtIvTabs button[data-tab="fd"]').click(); await X.until(()=>!!w.eval('S.fdRes["'+IV+'"]'),30000); };
const body=w=>w.document.getElementById('dtIvBody');

(async()=>{
console.log('③-1 엔진 고정');
{ const a=ENG.pin(HTML), b=ENG.blPin(HTML), f=ENG.fdPin(HTML);
  ok((a.commit===b.commit&&b.commit===f.commit&&a.ver==='0.21'&&b.ver==='0.6'&&f.ver==='0.3')||(a.ver==='0.22'&&b.ver==='0.7'&&f.ver==='0.3'),'acl v0.21 · bl v0.6 · fd v0.3 = 같은 커밋 (v0.24) · v0.27 = acl v0.22 · bl v0.7 (ACL 고정만)',[a,b,f]);
  const F=ENG.fdEngine(HTML); ok(F.VERSION==='0.3'&&typeof F.check==='function'&&F.CHECKS.length===44,'fd-core v0.3 (sha256 일치) · 항목 44',F.CHECKS.length);
  const A=ENG.engine(HTML); ok(typeof A.siCheck==='function'&&Object.keys(A.CP_CODE).length===16,'acl-core v0.18 · CP_CODE 16 · siCheck'); }

console.log('쓰기 문지기 (v0.21 이름)');
{ const okP=p=>{ try{ return DOC.guardOut(p)===true; }catch(e){ return false; } }, V=DOC.V21;
  eq([okP(V.FD_DIR+IV+'_20261125-010203_d2.json'), okP(V.FD_DIR+IV+'.json'), okP(V.LOG_DIR+'20261125/'+IV+'_CP-A21_20261125-010203.json'), okP(V.LOG_DIR+'x.json'),
      okP(V.COST_DIR+'20261125/'+IV+'_20261125-010203.json'), okP(V.FD_AI_DIR+'a'.repeat(64)+'.json'), okP(V.FD_AI_DIR+'other.json'), okP('古紙/-. AI 活用/D-00/ACL_bench/x.json')],
     [true,false,true,false,true,true,false,false],'fd/ · cp_trial_log/ · ai_cost/ · _fd_ai/{sha256} 만 · 다른 이름 · 다른 곳 = 막음'); }

console.log('③-2 FD 탭 · ③-5 誤検知 (직원 · 키 없음)');
{ const W=await mk({noOrigin:true, tb:true}), w=await X.page(W,{...INIT, html:HFILE}); await openFd(w); const B=body(w);
  const t=B.textContent;
  ok(/FD 確認 — 相違 \d+（試験）/.test(t)&&/試験/.test(t),'결론 「FD 確認 — 相違 n（試験）」',t.slice(0,300));
  ok(/文字版/.test(t)&&!!B.querySelector('[data-url*="NAA2611-01_.pdf"]'),'읽은 PDF (文字版) · 원본 열기 버튼');
  ok(B.querySelectorAll('.fd-tr').length>=3&&B.querySelectorAll('[data-fa]').length>=1,'試験 줄 (灰色の枠) + 誤検知 버튼',B.querySelectorAll('.fd-tr').length);
  ok(!B.querySelector('.av-ng')&&!B.querySelector('.dt-c-diff'),'試験 = 빨강 아님');
  ok(!/AI 未実行/.test(t)&&!W.aiCalls,'직원 · 키 없음 = AI 안 부름 · 「AI 未実行」 안 보임 (관리자만)');
  const res=w.eval('S.fdRes["'+IV+'"].res'); const o=res.items.find(i=>i.key==='fd:iv:origin'); ok(o&&o.cp==='CP-A21'&&o.trial&&o.would==='DIFF'&&o.status==='INFO','원산국 없음 = 試験 相違 (CP-A21 · 판정 영향 0)',o);
  ok(!res.items.some(i=>i.key==='fd:iv:qty'),'마스터에 없는 줄 = 실행 안 함');
  /* v0.22 (리나이 · 토르_15 질문): 탭을 열면 결과를 기록 (doc_tool/fd/{IV}_{UTC}_d{n}_h{鍵}.json 1 개) · 같은 결과면 다시 안 씀 */
  await X.until(()=>W.writes.length>=1,20000); const wr=W.writes.filter(x=>x.method==='PUT').map(x=>decodeURIComponent(x.url));
  ok(W.writes.length===1&&/doc_tool\/fd\/NAA2611-01_\d{8}-\d{6}_d\d+_h[0-9a-f]{8}\.json/.test(wr[0]||''),'v0.22 탭을 열면 기록 1 (doc_tool/fd/{IV}_{UTC}_d{n}_h{鍵}.json)',wr);
  const nb=W.writes.length; body(w).querySelector('#dtFdRun').click(); await X.sleep(300); await X.until(()=>!!w.eval('S.fdRes["'+IV+'"]')&&!w.eval('S.fdBusy["'+IV+'"]'),20000); await X.until(()=>!!body(w).querySelector('[data-fa]'),20000);
  ok(W.writes.length===nb&&/前回の記録と同じ結果/.test(body(w).textContent),'v0.22 같은 결과 = 다시 안 씀 (「前回の記録と同じ結果です」)',W.writes.slice(nb).map(x=>x.url));
  const n0=W.writes.length; B.querySelector('[data-fa*="CP-A21"]').click(); await X.until(()=>W.writes.length>n0,5000); await X.sleep(50);
  const lw=W.writes.slice(n0).map(x=>decodeURIComponent(x.url)); ok(lw.some(u=>/doc_tool\/cp_trial_log\/\d{8}\/NAA2611-01_CP-A21_\d{8}-\d{6}\.json/.test(u)),'誤検知 → doc_tool/cp_trial_log/',lw);
  const rec=JSON.parse(W.writes[W.writes.length-1].body instanceof Object&&W.writes[W.writes.length-1].body.text?await W.writes[W.writes.length-1].body.text():W.writes[W.writes.length-1].body);
  ok(rec.kind==='false_alarm'&&rec.cp==='CP-A21'&&rec.would==='DIFF'&&rec.by!==undefined,'기록 내용 (CP · would · 사람)',rec);
  ok(/記録しました/.test(body(w).textContent),'버튼 → 「記録しました」');
  ok(!W.writes.some(x=>/api\.anthropic|me\/sendMail|\/send$/.test(x.url)),'메일 보내기 0 · AI 0'); }

console.log('③-3 관리자 · 키 없음 = 「AI 未実行（キーなし）」');
{ const W=await mk({tb:true}), w=await X.page(W,{...INIT, html:HFILE, email:'boss@example.test'}); await openFd(w);
  ok(/AI 未実行（キーなし）/.test(body(w).textContent)&&!W.aiCalls,'관리자에게만 「AI 未実行（キーなし）」'); }

console.log('③-3 키 있음 = 자동 2 회 · 저장본 · 비용 · 다시 안 부름');
{ const W=await mk({tb:true}); W.aiAnswer=n=>({doc_type:n<=2?'IV':'PL', mark:'NONE', signed:true, first:true});
  /* v0.22: 保険証券 AI の保存本 (この TO BANK · 保険の頁なし) を置いて TO BANK の判別だけ数える */
  const shaT=nodeCrypto.createHash('sha256').update(W.tbBytes).digest('hex'), INSC=JSON.stringify({schema:'fd_ins_ai/1', sha256:shaT, by:'LOCATE', pages:[], reads:[{is_insurance:false},{is_insurance:false}]}); W.content['古紙/-. AI 活用/D-00/ACL_bench/_fd_ai/'+shaT+'.ins.json']=INSC;
  const w=await X.page(W,{...INIT, html:HFILE, ls:{leenai_apikey_v1:'sk-test-fake'}}); w.eval('FD_PNG.fn=async()=>"AAAA"'); await openFd(w);
  ok(W.aiCalls===4,'2 쪽 × 2 회 = 4',W.aiCalls); ok(W.aiHeaders&&W.aiHeaders['anthropic-dangerous-direct-browser-access']==='true'&&W.aiHeaders['x-api-key']==='sk-test-fake','브라우저 호출 헤더');
  const sha=nodeCrypto.createHash('sha256').update(W.tbBytes).digest('hex'), wr=W.writes.filter(x=>x.method==='PUT').map(x=>decodeURIComponent(x.url));
  ok(wr.some(u=>u.indexOf('ACL_bench/_fd_ai/'+sha+'.json')>=0),'저장본 ACL_bench/_fd_ai/{sha256}.json',wr); ok(wr.some(u=>/doc_tool\/ai_cost\/\d{8}\/NAA2611-01_/.test(u)),'비용 기록 doc_tool/ai_cost/');
  const cache=W.writes.find(x=>decodeURIComponent(x.url).indexOf('_fd_ai/')>=0); const C=JSON.parse(cache.body.text?await cache.body.text():cache.body); ok(C.schema==='fd_ai/1'&&C.pages.length===2&&C.pages.every(p=>p.r1&&p.r2)&&C.sha256===sha,'저장본 내용 (2 회 · 쪽마다)',C);
  /* 두 번째 사람 — 저장본이 있으면 AI 를 안 부름 */
  /* v0.22.1: 2 つ目の世界の TO BANK は 作り直した PDF (作成時刻で sha256 が変わることがある) → その sha256 で保存本を置く */
  const W2=await mk({tb:true}), sha2=nodeCrypto.createHash('sha256').update(W2.tbBytes).digest('hex');
  W2.content['古紙/-. AI 活用/D-00/ACL_bench/_fd_ai/'+sha2+'.json']=JSON.stringify(Object.assign({},C,{sha256:sha2})); W2.content['古紙/-. AI 活用/D-00/ACL_bench/_fd_ai/'+sha2+'.ins.json']=JSON.stringify(Object.assign(JSON.parse(INSC),{sha256:sha2}));
  const w2=await X.page(W2,{...INIT, html:HFILE, ls:{leenai_apikey_v1:'sk-test-fake'}}); w2.eval('FD_PNG.fn=async()=>"AAAA"'); await openFd(w2);
  ok(!W2.aiCalls&&/保存した判別/.test(body(w2).textContent),'저장본 있음 → AI 0 (「保存した判別を使いました」)',W2.aiCalls); }

console.log('③-4 今日やること 배지 · 관리자 실적표 버튼');
{ const W=await mk(), w=await X.page(W,{...INIT, html:HFILE});
  w.eval('S.fdLatest={"'+IV+'":{stamp:"20261125-010203",diff:2,name:"x"}}'); const b=w.eval('fdTodoBadge("'+IV+'")'); ok(/FD 確認 — 相違 2（試験）/.test(b)&&/fd-badge/.test(b),'「FD 確認 — 相違 n（試験）」 (fd-badge · 회색)',b);
  ok(w.eval('fdTodoBadge("NBB2611-01")')==='','결과 없음 / 0 = 배지 없음');
  ok(/r\.gkey==='fd'\?fdTodoBadge\(r\.iv\)/.test(HTML),'「FD 作成・送付」 그룹 행에만'); }
{ const W=await mk(), w=await X.page(W,{...INIT, html:HFILE, email:'boss@example.test'}); await X.until(()=>w.eval('CPS.state')==='ok',20000);
  await w.eval('cpListModal()'); ok(!!w.document.getElementById('dtCpTrial'),'관리자 = 「試験チェックポイント実績」 버튼');
  W.sp['古紙/-. AI 活用/D-00/doc_tool/fd']=[{id:'r1',name:IV+'_20261125-010203_d1.json',file:{}}];
  W.content['古紙/-. AI 活用/D-00/doc_tool/fd/'+IV+'_20261125-010203_d1.json']=JSON.stringify({result:{items:[{cp:'CP-A21',trial:true,would:'DIFF'}]}});
  W.sp['古紙/-. AI 活用/D-00/doc_tool/cp_trial_log']=[{id:'l',name:'20261125',folder:{}}]; W.sp['古紙/-. AI 活用/D-00/doc_tool/cp_trial_log/20261125']=[{id:'l1',name:IV+'_CP-A21_20261125-020000.json',file:{}}];
  W.content['古紙/-. AI 活用/D-00/doc_tool/cp_trial_log/20261125/'+IV+'_CP-A21_20261125-020000.json']=JSON.stringify({cp:'CP-A21',kind:'false_alarm'});
  w.document.getElementById('dtCpTrial').click(); await X.until(()=>/割合/.test(w.document.getElementById('dtModalBox').textContent)&&!/読み込み中/.test(w.document.getElementById('dtModalBox').textContent),20000);
  const row=[...w.document.querySelectorAll('#dtModalBox tr')].find(tr=>/CP-A21/.test(tr.textContent)); eq(row?[...row.querySelectorAll('td')].map(td=>td.textContent):null,['CP-A21','TEST CP-A21','FD','1','1','100 %'],'CP-A21 출현 1 · 誤検知 1 · 100 %'); }
{ const W=await mk(), w=await X.page(W,{...INIT, html:HFILE}); await X.until(()=>w.eval('CPS.state')==='ok',20000); await w.eval('cpListModal()'); ok(!w.document.getElementById('dtCpTrial'),'직원 = 실적표 버튼 없음'); }

console.log('③-6 S/I · ACL · B/L 탭의 試験 줄 (같은 모양) · 새 줄만');
{ ok(/siTrialAppend\(r\);/.test(HTML)&&/trialAppend\(\$\('dtIvBody'\), \(ar\.items\|\|\[\]\)\.filter\(i=>\/\^CP-A\//.test(HTML)&&/\(bx\.CP\|\|\[\]\)\.filter\(i=>\/\^CP-A\//.test(HTML),'S/I · ACL · B/L 탭에 trialAppend (CP-A03 부터의 새 줄만)');
  const W=await mk(), w=await X.page(W,{...INIT, html:HFILE}); const items=[{cp:'CP-A05',key:'cp:CP-A05',label:'TEST',trial:true,would:'DIFF',expected:'A',actual:'B',detail:'【試験】 X'},{cp:'CP-A06',key:'cp:CP-A06',label:'OK',trial:true,would:'MATCH'}];
  w.__items=items; const h=w.eval('trialRowsHtml(window.__items,"LRS-2611AA1","S/I")'); ok(/fd-tr/.test(h)&&/CP-A05/.test(h)&&!/CP-A06/.test(h)&&/誤検知/.test(h),'相違 · 注意 · 読取確認 만 (一致 는 안 보임) · 誤検知',h.slice(0,200)); }

console.log('v21 pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL 예외',e.stack); process.exit(1); });
