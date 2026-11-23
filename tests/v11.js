/* v0.11 시험 (지시서 D00 체크포인트 마스터 v1 Step 3 · 5) — 가짜 데이터만 · 네트워크 없음 · 실제 거래처 · 은행 · 항구 0. node v11.js [html]
   1 규칙 (보고 파일 이름 · 문지기 · 본문 · 미확인 수 · 직원/관리자 목록 · 거르기 · 새 체크 띠 대상)
   2 화면 — 직원: 머리 버튼 · 一覧 (基本 + 有効 追加 만) · 설명 · 見落とし報告 저장 (새 파일 1 · 빈 칸 = 저장 안 함) · 새 체크 띠 · 「確認した」
   3 화면 — 관리자: 一覧 전부 (試験 · 承認待ち) · 배지 「見落とし報告 n 件 (未確認)」 · 確認済み = .ack.json 새 파일
   4 ACL 결과의 CP 번호 → 설명 창 · 직원 화면에 試験 줄 없음 · 엔진 v0.11 고정 · compareOne 에 checkpoints */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML), Pn=ENG.pin(HTML);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const T=X.todayIso();
/* 가짜 마스터 (BOSS = portal_admin) */
const B=(n,key,extra)=>Object.assign({id:'CP-B0'+n, kind:'基本', stage:'ACL', pay:'ALL', scope_type:'all', scope:'ALL', engine_key:key, title_ja:'基本の確認 '+n, why_ja:'なぜ '+n, example:'実例 '+n, status:'有効', approved_by:'BOSS', approved_at:'2026-11-01'},extra||{});
const ROWS=[B(1,'booking'),B(2,'consignee'),B(3,'final'),
  {id:'CP-A01', kind:'追加', stage:'ACL,BL_DRAFT', pay:'LC', scope_type:'all', scope:'ALL', left:'lc.bl.consignee_text', op:'same_text_ws', right:'acl.consignee', result:'相違', title_ja:'試験中のチェック', why_ja:'試験のなぜ', example:'', status:'試験', approved_by:'', approved_at:''},
  {id:'CP-A02', kind:'追加', stage:'ACL', pay:'ALL', scope_type:'buyer', scope:'BUYER-A', left:'text:SAMPLE WORD', op:'not_contains', right:'acl.description', result:'注意', title_ja:'新しい有効のチェック', why_ja:'新しいなぜ', example:'', status:'有効', approved_by:'BOSS', approved_at:T},
  {id:'CP-A03', kind:'追加', stage:'ACL', pay:'ALL', scope_type:'all', scope:'ALL', left:'text:X', op:'not_contains', right:'acl.marks', result:'相違', title_ja:'職員が有効にしたチェック', why_ja:'', example:'', status:'有効', approved_by:'BOSS', approved_at:T}];
const ALIAS=[{group:'SAMPLEPORT', name:'SAMPLEPORT', approved_by:'BOSS'},{group:'SAMPLEPORT', name:'SAMPLE HARBOR', approved_by:'BOSS'}];
function setup(W){
  W.masters={checkpoint:ROWS, port_alias:ALIAS};
  W.metaId={'古紙/-. AI 活用/MASTER/master_checkpoint.json':'MCP', '古紙/-. AI 活用/MASTER/master_port_alias.json':'MPA'};
  /* 판 기록 (새 → 옛): 맨 위 판 = 직원 (STAFF_B) 이 CP-A03 을 有効 으로 · 그 전 = 관리자 */
  const old=ROWS.map(r=>r.id==='CP-A03'?Object.assign({},r,{status:'試験'}):r);
  W.versions={MCP:[{id:'3.0', by:'b@example.test', items:ROWS},{id:'2.0', by:'boss@example.test', items:old}], MPA:[{id:'1.0', by:'boss@example.test', items:ALIAS}]};
  W.sp['古紙/-. AI 活用/D-00/checkpoint_reports']=[{id:'r1',name:'20261120-090000_STAFF_A.json',file:{}},{id:'r2',name:'20261121-100000_STAFF_B.json',file:{}},{id:'r3',name:'20261120-090000_STAFF_A.ack.json',file:{}},{id:'r4',name:'memo.txt',file:{}}];
  W.content['古紙/-. AI 活用/D-00/checkpoint_reports/20261121-100000_STAFF_B.json']=JSON.stringify({invoice:'NBB2611-01',stage:'ACL',what:'TEST の違い',where:'B/L Draft',by:'STAFF_B',at:'2026-11-21T01:00:00Z'});
  W.content['古紙/-. AI 活用/D-00/checkpoint_reports/20261120-090000_STAFF_A.json']=JSON.stringify({invoice:'NAA2611-01',stage:'FD',what:'TEST 2',by:'STAFF_A',at:'2026-11-20T00:00:00Z'});
  return W; }
const P=(W,o)=>X.page(W,Object.assign({},o,{ls:Object.assign({doc_tool_hide_fd:'0',doc_tool_who:'all'},(o||{}).ls)}));
const box=w=>w.document.getElementById('dtModalBox'), mtxt=w=>box(w).textContent, open=w=>!w.document.getElementById('dtModal').hidden;
const btn=(w,label)=>w.__btns.find(b=>b.label===label);

(async()=>{
console.log('1 규칙');
eq(DOC.CP_REPORT_DIR,'古紙/-. AI 活用/D-00/checkpoint_reports/','보고 폴더');
const d=new Date(2026,10,23,9,5,7); eq([DOC.cpReportName(d,'STAFF_A'),DOC.cpAckPath('20261123-090507_STAFF_A.json')],['20261123-090507_STAFF_A.json','古紙/-. AI 活用/D-00/checkpoint_reports/20261123-090507_STAFF_A.ack.json'],'이름 {yyyymmdd-hhmmss}_{직원코드}.json · 確認済み = .ack.json');
const G=p=>{ try{ return DOC.guardOut(p); }catch(e){ return false; } };
eq([G(DOC.cpReportPath(d,'STAFF_A')),G(DOC.cpAckPath('20261123-090507_STAFF_A.json')),G(DOC.CP_REPORT_DIR+'x/20261123-090507_A.json'),G(DOC.CP_REPORT_DIR+'memo.json'),G('古紙/-. AI 活用/D-00/other/a.json'),G('古紙/-. AI 活用/MASTER/master_checkpoint.json')],[true,true,false,false,false,false],'문지기 — 보고 · 確認済み 이름만 (하위 폴더 · 다른 이름 · 마스터 = 막음)');
let er=''; try{ DOC.cpReportBody({what:'  '},{}); }catch(e){ er=e.message; } ok(/何が違っていたか/.test(er),'「何が違っていたか」 비면 저장 안 함');
const rb=DOC.cpReportBody({invoice:'naa2611-01',stage:'ACL',what:' X ',where:'Y'},{code:'STAFF_A',name:'山田',email:'tester@example.test',at:'2026-11-23T00:00:00Z',tool:'書類ツール v0.11'});
eq([rb.invoice,rb.what,rb.by,rb.tool,rb.status],['NAA2611-01','X','STAFF_A','書類ツール v0.11','未確認'],'본문 (Invoice · 무엇 · 보낸 사람 · 버전 · 未確認)');
const rs=DOC.cpReportsState(['20261120-090000_STAFF_A.json','20261121-100000_STAFF_B.json','20261120-090000_STAFF_A.ack.json','memo.txt']);
eq([rs.reports.map(r=>r.name),rs.reports.map(r=>r.acked),rs.unread],[['20261121-100000_STAFF_B.json','20261120-090000_STAFF_A.json'],[false,true],1],'보고 목록 (새 순) · 確認済み · 未確認 수');
const G2=E.cpPrepare(ROWS,[],{admins:E.cpAdmins(X.world().staff),lastBy:E.cpLastChangers([{by:'b@example.test',items:ROWS},{by:'boss@example.test',items:ROWS.map(r=>r.id==='CP-A03'?Object.assign({},r,{status:'試験'}):r)}])});
eq([DOC.cpVisible(G2.rows,false).map(r=>r.id),DOC.cpVisible(G2.rows,true).length],[['CP-B01','CP-B02','CP-B03','CP-A02'],6],'직원 = 基本 + 有効 追加 (試験 · 承認待ち 안 보임) · 관리자 = 전부');
eq([DOC.cpFilter(G2.rows,{kind:'追加'}).length,DOC.cpFilter(G2.rows,{stage:'BL_DRAFT'}).map(r=>r.id),DOC.cpFilter(G2.rows,{buyer:'buyer-z'}).length,DOC.cpFilter(G2.rows,{q:'なぜ 2'}).map(r=>r.id),DOC.cpFilter(G2.rows,{state:'承認待ち'}).map(r=>r.id)],[3,['CP-A01'],5,['CP-B02'],['CP-A03']],'거르기 (종류 · 단계 · 바이어 · 말 · 상태)');
const me=s=>({code:s, admin:s==='BOSS'}), ds={AA:'STAFF_A', BB:'STAFF_B'};
eq([DOC.cpNewFor(G2.rows,me('STAFF_A'),ds,{'BUYER-A':'AA'},T,[]).map(r=>r.id),DOC.cpNewFor(G2.rows,me('STAFF_B'),ds,{'BUYER-A':'AA'},T,[]).map(r=>r.id),DOC.cpNewFor(G2.rows,me('STAFF_A'),ds,{'BUYER-A':'AA'},T,['CP-A02']).length,DOC.cpNewFor(G2.rows,me('STAFF_A'),ds,{'BUYER-A':'AA'},X.addDays(T,7),[]).length],
  [['CP-A02'],[],0,0],'새 체크 띠 — 그 바이어 담당만 · 承認待ち 제외 · 「確認した」 · 7 일 뒤 사라짐');

console.log('2 화면 — 직원');
{ const W=setup(X.world()), w=await P(W);
  ok(btn(w,'チェックポイント')&&btn(w,'見落とし報告'),'머리 버튼 「チェックポイント」 · 「見落とし報告」');
  await X.until(()=>w.eval('CPS.state')==='ok');
  btn(w,'チェックポイント').onClick(); await X.until(()=>open(w)&&/件/.test(mtxt(w)));
  const ids=[...box(w).querySelectorAll('[data-cpd]')].map(b=>b.dataset.cpd);
  eq(ids,['CP-B01','CP-B02','CP-B03','CP-A02'],'一覧 (직원) = 基本 3 + 有効 追加 1 — 試験 · 직원이 有効 으로 바꾼 줄 (承認待ち) 은 없음');
  ok(/編集は ⚙ マスター設定/.test(mtxt(w))&&!box(w).querySelector('input[type=checkbox]'),'보기 전용 (편집은 ⚙ マスター設定)');
  const sel=box(w).querySelector('select[data-f="kind"]'); sel.value='追加'; sel.onchange(); await sleep(5);
  eq([...box(w).querySelectorAll('[data-cpd]')].map(b=>b.dataset.cpd),['CP-A02'],'걸러 보기 (種類 = 追加)');
  box(w).querySelector('[data-cpd="CP-A02"]').click(); await X.until(()=>/新しいなぜ/.test(mtxt(w)));
  ok(/なぜ必要か/.test(mtxt(w))&&/比べ方/.test(mtxt(w))&&/ない/.test(mtxt(w))&&/管理 者/.test(mtxt(w))&&!/試験結果/.test(mtxt(w)),'설명 = 名前 · なぜ必要か · 比べ方 (쉬운 말) · 承認 (이름) · 직원에게 試験結果 없음',mtxt(w).slice(0,300));
  w.eval('closeModal()'); w.eval("CPF.kind=''");
  /* 今日やること 의 새 체크 띠 */
  w.eval("S.board='todo'; lsSet(LS.board,'todo'); render()"); await X.until(()=>!!w.document.querySelector('#dtTodoBox .cp-new'));
  ok(/新しいチェック/.test(w.document.querySelector('#dtTodoBox .cp-new').textContent)&&/新しい有効のチェック/.test(w.document.querySelector('#dtTodoBox .cp-new').textContent),'今日やること 머리 띠 「新しいチェック: 이름」 (내 바이어 · 有効 7 일)');
  w.document.querySelector('#dtTodoBox [data-cpseen="CP-A02"]').click(); await sleep(5);
  ok(!w.document.querySelector('#dtTodoBox .cp-new')&&/CP-A02/.test(w.localStorage.getItem('doc_tool_cp_seen')),'「確認した」 → 사라짐 (이 브라우저에 기억)');
  ok(!w.document.getElementById('dtCpRep')||w.document.getElementById('dtCpRep').hidden,'직원 = 見落とし報告 배지 없음');
  /* 見落とし報告 */
  const before=W.writes.length; btn(w,'見落とし報告').onClick(); await X.until(()=>open(w)&&!!w.document.getElementById('cpRSend'));
  w.document.getElementById('cpRSend').click(); await sleep(20); ok(W.writes.length===before&&/何が違っていたか/.test(w.document.getElementById('cpRSt').textContent),'빈 칸 → 저장 안 함 · 안내');
  w.document.getElementById('cpRIv').value='NAA2611-01'; w.document.getElementById('cpRStage').value='ACL'; w.document.getElementById('cpRWhat').value='TEST: ACL の Consignee の銀行名'; w.document.getElementById('cpRWhere').value='B/L Draft';
  w.document.getElementById('cpRSend').click(); await X.until(()=>W.writes.length>before);
  const wr=W.writes.slice(before), u=decodeURIComponent(wr[0].url), body=JSON.parse(await (async b=>b&&b.text?await b.text():String(b))(wr[0].body));
  ok(wr.length===1&&wr[0].method==='PUT'&&/checkpoint_reports\/\d{8}-\d{6}_STAFF_A\.json:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(u),'저장 = checkpoint_reports/{시각}_STAFF_A.json 새 파일 1 (덮어쓰기 없음)',u);
  eq([body.invoice,body.stage,body.what,body.where,body.by,body.tool],['NAA2611-01','ACL','TEST: ACL の Consignee の銀行名','B/L Draft','STAFF_A','書類ツール v0.11'],'본문');
  ok(!W.writes.some(x=>/MASTER|cr49f_|crcf9_/.test(decodeURIComponent(x.url))),'마스터 · COMPASS 쓰기 0'); }

console.log('3 화면 — 관리자');
{ const W=setup(X.world()), w=await P(W,{email:'boss@example.test'});
  await X.until(()=>w.document.getElementById('dtCpRep')&&!w.document.getElementById('dtCpRep').hidden);
  eq(w.document.getElementById('dtCpRep').textContent,'見落とし報告 1 件 (未確認)','배지 「見落とし報告 1 件 (未確認)」 (.ack 있는 것 · 다른 파일 제외)');
  await X.until(()=>w.eval('CPS.state')==='ok');
  btn(w,'チェックポイント').onClick(); await X.until(()=>open(w)&&!!box(w).querySelector('[data-cpd]'));
  const ids=[...box(w).querySelectorAll('[data-cpd]')].map(b=>b.dataset.cpd), t=mtxt(w);
  ok(ids.length===6&&/承認待ち/.test(t)&&/試験/.test(t)&&/管理者の画面/.test(t),'관리자 一覧 = 전부 (試験 · 承認待ち 표시)',ids);
  box(w).querySelector('[data-cpd="CP-A03"]').click(); await X.until(()=>/職員が有効にした/.test(mtxt(w)));
  ok(/承認待ち — 最後に変えた人 b@example\.test は管理者でない/.test(mtxt(w)),'직원이 有効 으로 바꾼 줄 → 「承認待ち — 마지막 변경자 … 관리자 아님」',mtxt(w).slice(0,400));
  w.eval('closeModal()');
  w.document.getElementById('dtCpRep').click(); await X.until(()=>open(w)&&/未確認 1/.test(mtxt(w)));
  ok(/TEST の違い/.test(mtxt(w))&&/確認済み/.test(mtxt(w))&&/自動送信はしていません/.test(mtxt(w)),'보고 목록 (내용 · 確認済み · 자동 송신 안 함)');
  const before=W.writes.length; box(w).querySelector('[data-ack="20261121-100000_STAFF_B.json"]').click(); await X.until(()=>W.writes.length>before);
  ok(/checkpoint_reports\/20261121-100000_STAFF_B\.ack\.json:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(decodeURIComponent(W.writes[before].url)),'確認済み = .ack.json 새 파일 (같은 폴더)'); }

console.log('4 ACL 결과');
{ const W=setup(X.world()), key='古紙/-. AI 活用/D-00/ACL_bench/ACL_20261120-000000/results.json', run=JSON.parse(W.content[key]), a=run.results.find(r=>r.invoice==='NAA2611-01');
  a.items[0].cp='CP-B01';
  a.items.push({group:'チェック', key:'cp:CP-A01', cp:'CP-A01', label:'試験中のチェック', status:'INFO', expected:'A', actual:'B', detail:'【試験】 x', kind:'', trial:true, would:'DIFF', cpState:'試験'});
  W.content[key]=JSON.stringify(run);
  const w=await P(W); await X.until(()=>w.eval('CPS.state')==='ok');
  w.document.getElementById('dtQ').value='NAA2611-01'; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button[data-tab="acl"]'));
  w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click(); await X.until(()=>!!w.document.querySelector('#dtIvBody .av'));
  const body=w.document.getElementById('dtIvBody');
  ok(!!body.querySelector('button.av-cp[data-cp="CP-B01"]'),'ACL 결과 항목에 CP 번호 (CP-B01)');
  ok(!/試験中のチェック/.test(body.textContent),'직원 화면 = 試験 줄 없음');
  ok(!!body.querySelector('#dtAclMiss'),'ACL 결과 화면에 「見落とし報告」 버튼');
  body.querySelector('button.av-cp[data-cp="CP-B01"]').click(); await X.until(()=>open(w)&&/基本の確認 1/.test(mtxt(w)));
  ok(/なぜ 1/.test(mtxt(w))&&/実例 1/.test(mtxt(w)),'CP 번호 → 설명 창 (なぜ必要か · 実例)'); w.eval('closeModal()');
  w.document.getElementById('dtAclMiss').click(); await X.until(()=>open(w)&&!!w.document.getElementById('cpRIv'));
  eq(w.document.getElementById('cpRIv').value,'NAA2611-01','見落とし報告 — Invoice 는 화면에서 자동');
  w.eval('closeModal(); S.me.admin=true; renderIv()'); ok(/試験中のチェック/.test(w.document.getElementById('dtIvBody').textContent),'관리자 화면 = 試験 줄 보임'); }

console.log('5 엔진 · 照合');
ok(Pn.ver==='0.11'&&typeof E.cpPrepare==='function'&&typeof E.cpApply==='function','엔진 고정 = acl_bench v0.11 (커밋 '+Pn.commit.slice(0,7)+' · sha256 확인)',Pn);
ok((HTML.match(/checkpoints:cpx\|\|undefined/g)||[]).length===2,'ACL 照合 2 곳 (화면 · 保存の入口) 이 checkpoints 를 엔진에 넘김 (못 읽으면 undefined = v0.10 과 같음)');
{ const W=X.world(); W.masters={}; const w=await P(W); await X.until(()=>w.eval('CPS.state')!=='');
  ok(w.eval('CPS.state')==='error'&&w.eval('CPS.prep')===null,'마스터를 못 읽음 → checkpoints 없음 (엔진 v0.10 과 같은 결과)'); }
console.log((fail?'FAIL':'PASS')+' v11 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v11 예외',e.stack); process.exitCode=1; });
