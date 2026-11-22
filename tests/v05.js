/* v0.5 시험 (지시서 D00 書類ツール v0.5 · 자체 확인 1 · 4 (DOC 쪽) · 6) — 가짜 데이터만. node v05.js [html]
   A  상세를 누르면 「読み込み中…」 가 먼저 (같은 순간) → 그 뒤 탭 · 내용 · 큰 결과 (가짜 23 MB 규모 results.json) 로도 현황판 · 상세 열기 시간 · 멈춤 없음 · 옛 run (final 없음) 그대로
   B3 엔진 v0.7 의 コンテナ別記載の指示 ✗ = 相違 (aclJudge · 2 번 세지 않음) · ✓ / ー 는 相違 아님 · 엔진 고정 v0.7 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const P=ENG.pin(HTML), E=ENG.engine(HTML); DOC.useAclEngine(E);
const TIMES={}; let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,600));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
(async()=>{
ok(+P.ver>=0.7&&typeof E.cntrListed==='function'&&typeof E.jpSplit==='function','엔진 고정 = acl_bench v0.7 이상 (v0.6: v0.8 · 커밋 '+P.commit.slice(0,7)+' · sha256)',P);
/* B3 → aclJudge */
const fin=o=>Object.assign({total:20, found:20, missing:[], aclOnly:[], moved:[], sets:{total:3, ok:3, diff:[], read:[], aclOnly:[], cpOnly:[], allOk:true}, unread:[], instr:{list:[], cntr:null}},o||{});
const it=(key,status,label)=>({group:'x', key, label:label||key, status, expected:'', actual:'', detail:'', kind:''});
const R=(items,final)=>({verdict:'相違あり', items, final});
const ng={list:[{text:'各コンテナの重量/BALE数追記', cntr:true}], cntr:{need:true, ok:false, n:3, found:0, rows:[]}}, okc={list:ng.list, cntr:{need:true, ok:true, n:3, found:3, rows:[]}}, rd={list:ng.list, cntr:{need:true, ok:null, n:0, found:0, rows:[]}};
const a=DOC.aclJudge(R([it('instr:cntr','DIFF','コンテナ別の重量・BALE 数 (S/I の指示)')],fin({instr:ng})));
eq([a.v,a.short,a.why],['diff','最終確認 ✗ 1','コンテナ別記載の指示 ✗'],'コンテナ別記載の指示 ✗ → 相違 · 「最終確認 ✗ 1」 · 欄の相違 으로 다시 세지 않음');
const b=DOC.aclJudge({verdict:'表記差のみ', items:[it('instr:cntr','MATCH')], final:fin({instr:okc})}); eq([b.v,b.short],['ok','最終確認 ✓'],'✓ → 相違 아님');
const c=DOC.aclJudge({verdict:'読取確認要', items:[it('instr:cntr','READ_CHECK')], final:fin({instr:rd})}); ok(c.v!=='diff','コンテナを読めない (ー) → 相違 아님',c);
const d=DOC.aclJudge(R([it('instr:cntr','DIFF'),it('description','DIFF')],fin({instr:ng, missing:[{text:'A'}]}))); eq([d.v,d.short],['diff','最終確認 ✗ 2'],'足りない 1 + 指示 ✗ 1 = ✗ 2');
ok(/コンテナ別記載の指示/.test(DOC.ACL_RULE[1][2]),'상태 표 (ACL_RULE) 相違 줄에 コンテナ別記載の指示');
/* 화면 — 큰 결과 · 「読み込み中…」 먼저 */
{ const W=X.world(), key='古紙/-. AI 活用/D-00/ACL_bench/ACL_20261120-000000/results.json', run=JSON.parse(W.content[key]);
  const pad='X'.repeat(28000), extra=[]; for(let i=0;i<820;i++) extra.push({invoice:'NZZ26'+String(i).padStart(4,'0'), verdict:'相違あり', items:[{group:'S/I 文面',key:'description',label:'Description of Goods',status:'DIFF',expected:pad,actual:pad,detail:'',kind:''}], final:fin({instr:ng})});
  run.results=run.results.concat(extra); W.content[key]=JSON.stringify(run,null,1);
  const MB=W.content[key].length/1e6; ok(MB>22,'가짜 results.json '+MB.toFixed(1)+' MB (v0.6 실제 23.3 MB 규모)');
  const t0=Date.now(), w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}}); const tb=Date.now()-t0; TIMES.boardMs=tb; TIMES.resultMB=+MB.toFixed(1);
  ok(/ACL 照合結果 ACL_20261120-000000/.test(w.document.getElementById('dtProg').textContent),'큰 결과로 현황판 읽기 끝 ('+tb+' ms)',w.document.getElementById('dtProg').textContent);
  const btn=w.document.querySelector('#dtTable button[data-iv="NAA2611-01"]'), t1=Date.now(); btn.click();
  const body0=w.document.getElementById('dtIvBody').textContent, vis0=w.document.getElementById('dtIv').style.display;
  ok(vis0==='flex'&&/読み込み中/.test(body0)&&!w.document.querySelector('#dtIvTabs button'),'누른 순간 상세 화면 + 「読み込み中…」 (탭은 아직)',[vis0,body0]);
  await X.until(()=>!!w.document.querySelector('#dtIvTabs button')); const t2=Date.now()-t1; TIMES.detailMs=t2;
  ok(t2<2000&&!/読み込み中/.test(w.document.getElementById('dtIvBody').textContent.slice(0,20)),'상세 열기 '+t2+' ms (기준 2 초)',t2);
  ok(w.eval('S')&&w.eval('S').perf&&w.eval('S').perf.iv==='NAA2611-01'&&w.eval('S').perf.total>=0&&w.eval('S').perf.render>=0,'걸린 시간 기록 S.perf (화면에는 안 나옴)',w.eval('S')&&w.eval('S').perf);
  w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click(); ok(w.document.querySelector('#dtIvBody .av-final, #dtIvBody .av-concl'),'ACL 탭 그림');
  /* 빨리 다른 것을 누르면 앞의 것은 그리지 않음 */
  w.document.querySelector('#dtIv [data-back]').click();
  const bs=[...w.document.querySelectorAll('#dtTable button[data-iv]')].filter(x=>!x.dataset.tab); bs[0].click(); bs[1].click();
  await X.until(()=>!!w.document.querySelector('#dtIvTabs button')); await X.sleep(80);
  ok(w.eval('S').cur.iv===bs[1].dataset.iv&&new RegExp(bs[1].dataset.iv).test(w.document.getElementById('dtIvSum').textContent),'두 번 빨리 누름 → 마지막 것만 그림',[w.eval('S').cur.iv,bs[1].dataset.iv]);
  /* 계약 상세도 「読み込み中…」 먼저 */
  w.document.querySelector('#dtIv [data-back]').click(); w.document.getElementById('dtBCt').click(); await X.sleep(20);
  const cb=w.document.querySelector('#dtTable button[data-ct]'); if(cb){ cb.click(); ok(/読み込み中/.test(w.document.getElementById('dtCtBody').textContent),'계약 상세 — 「読み込み中…」 먼저'); await X.until(()=>!!w.document.querySelector('#dtCtTabs button')); ok(true,'계약 상세 그림'); }
  else ok(false,'계약 버튼 없음');
}
/* 검색 — LC 번호를 S/I 칸 그대로 (「… DATED ON …」) 붙여 넣어도 계약으로 */
{ const W=X.world(), w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); w.document.getElementById('dtQ').value='TESTLC001 DATED ON OCT 01, 2026'; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&!!w.document.querySelector('#dtCtTabs button'),3000).catch(()=>{});
  ok(/LRS-2611AA1/.test(w.document.getElementById('dtCtSum').textContent),'LC 번호 + 「DATED ON …」 → 계약 LRS-2611AA1',w.document.getElementById('dtQSt').textContent); }
/* 옛 run (final 없음) 그대로 */
eq(DOC.aclJudge({verdict:'相違あり', items:[it('vessel','DIFF')]}).v,'diff','옛 결과 (final 없음) = v0.3 규칙 그대로');
console.log('v05 times '+JSON.stringify(TIMES)); console.log('v05 pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v05 예외',e.stack); console.log('v05 pass '+pass+' fail '+(fail+1)); process.exit(1); });
