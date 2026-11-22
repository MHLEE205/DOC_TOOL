/* v0.4 시험 (지시서 D00 ACL 최종분석 acl_bench v0.6 · 書類ツール v0.4 · 자체 확인 #6) — 가짜 데이터만. node v04.js [html]
   #6 현황판 ACL 칸 상태 4경우 (待ち · 相違 · 確認 · 済) · 최종 분석 반영 규칙 (足りない · セット違う · 칸별 相違 [Description 제외]) · v0.5 결과 (final 없음) = v0.3 규칙
      · 엔진 고정 = v0.6 커밋 + sha256 · ACL 탭 맨 위 最終確認 (+ 本登録) · 툴팁 「最終確認 ✓ / ✗ n」 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const P=ENG.pin(HTML), E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,600));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});

(async()=>{
/* 엔진 고정 */
ok(+P.ver>=0.6&&typeof E.finalView==='function'&&typeof E.finalCheck==='function','엔진 고정 = acl_bench v'+P.ver+' (v0.6 이상 — 最終確認 있음 · 커밋 '+P.commit.slice(0,7)+' · sha256 확인 — engine.js 가 다르면 멈춤)',P);
/* 상태 규칙 표 */
eq(DOC.ACL_RULE.map(r=>r[1]),['待ち','相違','確認','済'],'ACL 상태 표 4줄 (待ち · 相違 · 確認 · 済) — 규칙은 doc-core 표 1곳');
/* aclJudge */
const fin=(o)=>Object.assign({total:20, found:20, missing:[], aclOnly:[], moved:[], sets:{total:3, ok:3, diff:[], read:[], aclOnly:[], cpOnly:[], allOk:true}},o||{});
const it=(key,status,label)=>({group:'x', key, label:label||key, status, expected:'', actual:'', detail:'', kind:''});
const R=(verdict,items,final)=>Object.assign({verdict, items:items||[]}, final===undefined?{}:{final});
const j=r=>{ const x=DOC.aclJudge(r); return [x.v, x.short]; };
eq(j(R('表記差のみ',[it('description','NOTATION')],fin())),['ok','最終確認 ✓'],'내용 다 있음 · 세트 일치 · 表記差만 → 확인 쪽 (ok) · 「最終確認 ✓」');
eq(j(R('相違あり',[it('description','DIFF')],fin({aclOnly:[{field:'description',text:'X'}]}))),['ok','最終確認 ✓'],'칸별 相違 가 Description 뿐 (ACL 에만 있는 줄) · 최종 분석 ✓ → 相違 아님 (Description 제외)');
eq(j(R('相違あり',[it('description','DIFF')],fin({missing:[{text:'A'}], found:19}))),['diff','最終確認 ✗ 1'],'최종 분석 「足りない」 1 → 相違 · 「最終確認 ✗ 1」');
eq(j(R('相違あり',[it('set:X','DIFF')],fin({sets:{total:3, ok:2, diff:[{container:'X',items:[]}], read:[], aclOnly:[], cpOnly:[], allOk:false}}))),['diff','最終確認 ✗ 1'],'컨테이너 세트 違う → 相違');
const vs=DOC.aclJudge(R('相違あり',[it('vessel','DIFF','Ocean Vessel + Voy.No.')],fin()));
eq([vs.v,vs.short,/欄の相違 1 \(Ocean Vessel/.test(vs.why)],['diff','最終確認 ✓',true],'최종 분석 ✓ 라도 Description 외 칸별 相違 (본선) → 相違 · 이유에 칸 이름');
eq(j(R('読取確認要',[it('set:X','READ_CHECK')],fin({sets:{total:3, ok:2, diff:[], read:['X'], aclOnly:[], cpOnly:[], allOk:false}}))),['check','最終確認 ー (コンテナを読めない)'],'세트 읽기만 불확실 → 相違 아님 (確認)');
eq(j(R('相違あり',[it('vessel','DIFF')])),['diff',''],'final 없는 결과 (v0.5 까지) → v0.3 규칙 (verdict 그대로)');
eq(j(R('読取対象外',[])),['check',''],'読取対象外 → 確認 쪽 (v0.3 그대로)');
/* judgeIv 4 경우 */
const IV='NZZ2699-01', f=n=>({name:n, lastModified:'2026-11-10T00:00:00Z'});
const J=(files,acl,hon)=>DOC.judgeIv({iv:IV,country:'VIETNAM',term:'CFR',premium:0,etdPast:false,folder:{files},acl,hon:hon||[],mailRules:[],bookingNo:'TESTBK0001',blNo:'',otherBookings:[]}).acl;
const res=(v,items,final)=>({runId:'ACL_T', result:Object.assign({file:'x/'+IV+'_ACL.pdf', fileModified:'2026-11-10T00:00:00Z', aclVersion:'初版'}, R(v,items,final))});
const c1=J([f('X.pdf')],null), c2=J([f(IV+'_ACL.pdf')],res('相違あり',[it('description','DIFF')],fin({missing:[{text:'A'}]}))), c3=J([f(IV+'_ACL.pdf')],res('相違あり',[it('description','DIFF')],fin()));
const c4=J([f(IV+'_ACL.pdf')],res('相違あり',[it('description','DIFF')],fin({missing:[{text:'A'}]})),[{at:'2026-11-18T00:00:00Z',name:'佐藤'}]);
eq([c1.s,c2.s,c3.s,c4.s],['wait','diff','todo','done'],'현황판 4 경우 — ACL 없음 = 待ち · 足りない = 相違 · 내용 다 있음 (Description 줄만 다름) = 確認 · 本登録 메일 = 済');
ok(/^最終確認 ✗ 1 \(足りない内容 1\)/.test(c2.why)&&/^最終確認 ✓ · 照合 相違あり/.test(c3.why)&&/相違のまま本登録/.test(c4.why)&&/本登録 まだ/.test(c3.why),'툴팁 = 「最終確認 ✓ / ✗ n (이유)」 · 済 는 「相違のまま本登録」',[c2.why,c3.why,c4.why]);
eq([c2.final&&c2.final.short, c3.final&&c3.final.short],['最終確認 ✗ 1','最終確認 ✓'],'셀에 final (ACL 탭 머리에 씀)');

/* 화면 (jsdom) — 결과에 final 이 있는 run → ACL 탭 맨 위 最終確認 · 현황판 칸 */
{ const W=X.world(), key='古紙/-. AI 活用/D-00/ACL_bench/ACL_20261120-000000/results.json', run=JSON.parse(W.content[key]);
  const a=run.results.find(r=>r.invoice==='NAA2611-01'); a.final={total:12, found:11, missing:[{text:'SAMPLE ROAD 9', type:'text', kind:'文', group:'当事者', src:'notify', srcs:['notify'], srcLabel:'通知先', srcCol:'crcf9_notify_party · address · tel · fax', similar:'SAMPLE ROAD 8', similarField:'notify'}], aclOnly:[], moved:[], sets:{total:1, ok:1, diff:[], read:[], aclOnly:[], cpOnly:[], allOk:true}};
  W.content[key]=JSON.stringify(run);
  const w=await X.page(W,{ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  const cell=iv=>{ const tr=[...w.document.querySelectorAll('#dtTable tbody tr')].find(t=>t.textContent.indexOf(iv)>=0); return tr?tr.querySelectorAll('td.c .st')[1]:null; };
  ok(cell('NAA2611-01').textContent==='相違'&&/^最終確認 ✗ 1/.test(cell('NAA2611-01').getAttribute('title')),'현황판 칸 = 相違 · 툴팁 「最終確認 ✗ 1」',cell('NAA2611-01').getAttribute('title'));
  w.document.getElementById('dtQ').value='NAA2611-01'; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button'));
  w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click();
  const B=w.document.getElementById('dtIvBody'), F=B.querySelector('.av-final'), html=B.innerHTML;
  ok(F&&html.indexOf('av-final')<html.indexOf('項目ごとの確認')&&/✗ 足りない内容 1 項目/.test(F.textContent)&&/SAMPLE ROAD 9/.test(F.textContent)&&/本登録: まだ/.test(F.textContent),'ACL 탭 맨 위 = 最終確認 (✗ 足りない内容 1 項目 · 항목 · 本登録) → 그 아래 項目ごとの確認',F&&F.textContent);
  ok(/✓ コンテナ 1 セット一致/.test(F.textContent),'最終確認 — コンテナ セット 줄');
  ok(/最終確認 ✗ 1/.test(B.querySelector('.dt-note').textContent),'ACL 탭 머리에 「最終確認 ✗ 1」',B.querySelector('.dt-note').textContent);
  ok(!/crcf9_/.test(html),'직원 화면: 내부 이름 없음');
  w.eval('S.me.admin=true; renderIv()'); ok(/crcf9_notify_party/.test(w.document.getElementById('dtIvBody').innerHTML),'관리자: 내부 이름은 title');
}
console.log('v04 pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL',e&&e.stack); process.exitCode=1; });
