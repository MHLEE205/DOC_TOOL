/* 화면 흐름 시험 (#3 기억 · #4 · #9) — jsdom + 가짜 COMPASS · SharePoint. 현황판 → 상세 → 탭 → 돌아가기 · 검색 → 상세 · 설정. node app.js [html] */
const X=require('./fake');
/* v0.1 의 회귀 시험 — 「FD済みは表示しない」 를 끈 상태로 (v0.2 기본 ON 은 v02.js 에서) */
const P=(W,o)=>X.page(W,Object.assign({},o,{ls:Object.assign({doc_tool_hide_fd:'0'},(o||{}).ls)}));
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,600));} };
const html=process.argv[2];
const rowsOf=w=>[...w.document.querySelectorAll('#dtTable tbody tr')];
const ivs=w=>rowsOf(w).map(tr=>tr.querySelector('button[data-iv]').textContent);
const cellsOf=(w,iv)=>{ const tr=rowsOf(w).find(t=>t.querySelector('button[data-iv]').textContent===iv); return tr?[...tr.querySelectorAll('td.c .st')].map(s=>s.textContent):null; };
const click=(w,sel)=>{ const e=w.document.querySelector(sel); if(!e) throw new Error('없음 '+sel); e.click(); };
const txt=(w,id)=>w.document.getElementById(id).textContent;

(async()=>{
  /* ── 일반 담당자 (STAFF_A) ── */
  let W=X.world(), w=await P(W,{html});
  ok(/読み込み完了/.test(txt(w,'dtProg')),'읽기 완료',txt(w,'dtProg'));
  ok(w.document.title==='LEENAI D-00 書類ツール v0.7','title · version 0.7');
  ok(w.__cfg.redirectUri==='https://mhlee205.github.io/DOC_TOOL/'&&w.__cfg.sys==='D-00'&&w.__cfg.version==='0.7','LEENAI.init 설정 (redirectUri · sys · version)');
  ok(/試験運用/.test(txt(w,'ln-hdr-right'))&&/山田/.test(txt(w,'ln-hdr-right')),'오른쪽 위 試験運用 · 내 이름',txt(w,'ln-hdr-right'));
  ok(!w.document.querySelector('#dtMain input[type=password]'),'평소 화면에 API 키 칸 없음');
  ok(JSON.stringify(ivs(w))===JSON.stringify(['NAA2611-01','NAA2611-02']),'自分の担当 = 내 Invoice 만 (ETD 순)',ivs(w));
  ok(JSON.stringify(cellsOf(w,'NAA2611-01'))===JSON.stringify(['済','相違','待ち','確認','済','—','待ち']),'NAA2611-01 칸 (通関 済 · ACL 相違 · DEPO 待ち · B/L 確認 · 保険 済 · RR — · FD 待ち)',cellsOf(w,'NAA2611-01'));
  ok(JSON.stringify(cellsOf(w,'NAA2611-02'))===JSON.stringify(['待ち','待ち','待ち','待ち','待ち','—','待ち']),'폴더 없음 · ETD 앞 → 待ち',cellsOf(w,'NAA2611-02'));
  const tr1=rowsOf(w)[0]; ok(/本船変更/.test(tr1.textContent)&&/本船変更/.test(rowsOf(w)[1].textContent),'本船変更 꼬리표 (ACL · 메일)');
  ok(/照合 相違あり/.test(tr1.querySelectorAll('td.c .st')[1].getAttribute('title')),'칸 툴팁 = 근거');
  ok(/要対応のみ 1/.test(txt(w,'dtTodo'))&&/すべて 2/.test(txt(w,'dtAll')),'要対応 1 · 전체 2',[txt(w,'dtTodo'),txt(w,'dtAll')]);
  click(w,'#dtTodo'); ok(JSON.stringify(ivs(w))===JSON.stringify(['NAA2611-01']),'要対応のみ');
  click(w,'#dtAll');
  click(w,'#dtWho button[data-who="all"]');
  ok(JSON.stringify(ivs(w))===JSON.stringify(['NBB2611-01','NAA2611-01','NAA2611-02']),'全員 · ETD 순',ivs(w));
  ok(w.localStorage.getItem('doc_tool_who')==='all','고른 담당 기억 (localStorage)');
  ok(JSON.stringify(cellsOf(w,'NBB2611-01'))===JSON.stringify(['済','済','—','済','—','済','済']),'NBB2611-01 (KOREA · CFR · REV 照合 · SWB · RR · FD)',cellsOf(w,'NBB2611-01'));
  const chips=[...w.document.querySelectorAll('#dtWho button')].map(b=>b.textContent);
  ok(chips[0]==='自分の担当'&&chips.includes('全員')&&chips.includes('山田')&&chips.includes('佐藤')&&chips.includes('担当未登録'),'担当 버튼 줄',chips);
  click(w,'#dtWho button[data-who="STAFF_B"]'); ok(JSON.stringify(ivs(w))===JSON.stringify(['NBB2611-01']),'담당자별 (佐藤)');

  /* 상세 — 현황판 → Invoice 상세 → 탭 → 돌아가기 */
  click(w,'#dtWho button[data-who="all"]');
  click(w,'#dtTable button[data-iv="NAA2611-01"]'); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button'));
  await X.until(()=>/40HC/.test(txt(w,'dtIvSum')));
  const sum=txt(w,'dtIvSum'); ok(/LRS-2611AA1/.test(sum)&&/VIETNAM/.test(sum)&&/SAMPLE POL → SAMPLE PORT VN/.test(sum)&&/CIF/.test(sum)&&/SAMPLE VESSEL 001/.test(sum)&&/2 本/.test(sum)&&/TESTLC001/.test(sum)&&/LC 原本を開く/.test(sum),'Invoice 요약 (契約 · 国 · POL→POD · 条件 · 本船 · コンテナ · LC)',sum);
  const tabs=[...w.document.querySelectorAll('#dtIvTabs button')].map(b=>b.textContent);
  ok(JSON.stringify(tabs)===JSON.stringify(['通関','ACLいまここ','DEPO','B/L Draft','保険','FD','履歴']),'탭 — 대상 외 (RR) 숨김 · 「いまここ」 (v0.2)',tabs);
  const dots=[...w.document.querySelectorAll('#dtIvTabs button')].map(b=>{ const d=b.querySelector('.dot'); return d?d.dataset.st:''; });
  ok(JSON.stringify(dots)===JSON.stringify(['done','diff','wait','todo','done','wait','']),'탭 상태 점 (v0.2)',dots);
  ok(w.document.querySelector('#dtIvTabs button.on').dataset.tab==='acl','처음 탭 = 첫 相違/確認');
  ok(/直してもらうところ/.test(txt(w,'dtIvBody'))&&/SAMPLE VESSEL 009/.test(txt(w,'dtIvBody'))&&/相違 1/.test(txt(w,'dtIvBody'))&&/表記差 1/.test(txt(w,'dtIvBody'))&&/一致 2/.test(txt(w,'dtIvBody')),'ACL 탭 (저장된 照合 — 相違 · 表記差 · 一致)',txt(w,'dtIvBody').slice(0,300));
  click(w,'#dtIvTabs button[data-tab="customs"]'); ok(/輸出許可 済/.test(txt(w,'dtIvBody'))&&/NAA2611-01_ED\.pdf/.test(txt(w,'dtIvBody')),'通関 탭 (근거 파일)');
  click(w,'#dtIvBody button[data-open="d03"]'); ok(W.opened.pop()==='https://mhlee205.github.io/Shipping_Document/','通関 → D-03 새 창');
  click(w,'#dtIvBody button[data-open="c01"]'); ok(W.opened.pop()==='https://mhlee205.github.io/HANNYU_TOOL/','通関 → C-01 새 창');
  click(w,'#dtIvBody button[data-copy]'); await X.sleep(5); ok(W.copied==='NAA2611-01','Invoice 번호 복사');
  click(w,'#dtIvTabs button[data-tab="bl"]'); ok(/初版/.test(txt(w,'dtIvBody'))&&/NAA2611-01_DRAFT\.pdf/.test(txt(w,'dtIvBody')),'B/L 탭');
  click(w,'#dtIvBody button[data-open="d01"]'); ok(W.opened.pop()==='https://mhlee205.github.io/LC_FD_CHECKER/','B/L → D-01');
  click(w,'#dtIvTabs button[data-tab="ins"]'); click(w,'#dtIvBody button[data-open="d04"]'); ok(W.opened.pop()==='https://mhlee205.github.io/SI_COMPASS/','保険 → D-04');
  click(w,'#dtIvTabs button[data-tab="fd"]'); ok(w.document.querySelectorAll('#dtIvBody button[data-open]').length===2,'FD → D-01 · D-03');
  click(w,'#dtIvTabs button[data-tab="log"]'); await X.until(()=>/まだ記録はありません|履歴を読めません/.test(txt(w,'dtIvBody'))); ok(/まだ記録はありません/.test(txt(w,'dtIvBody')),'履歴 탭 (없음)');
  click(w,'#dtIvSum button[data-lcjson]'); await X.until(()=>!w.document.getElementById('dtModal').hidden); ok(/TESTLC001/.test(txt(w,'dtModalBox'))&&/SAMPLE BANK/.test(txt(w,'dtModalBox')),'LC 読み取り結果 (D-01 JSON 읽기만)');
  click(w,'#dtModalBox button[data-close]'); ok(w.document.getElementById('dtModal').hidden,'모달 닫기');
  click(w,'#dtIvSum button[data-lcorig]'); await X.until(()=>W.opened.length); ok(/TESTLC001\.pdf/.test(W.opened.pop()),'LC 原本を開く (이름으로 찾아 새 창)');
  click(w,'#dtIv [data-back]'); ok(w.document.getElementById('dtList').style.display==='flex'&&ivs(w).length===3,'← 一覧へ');

  /* 상세 — 계약 */
  click(w,'#dtTable button[data-iv="NAA2611-01"]'); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button'));
  click(w,'#dtIvSum button[data-goct]'); await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&!!w.document.querySelector('#dtCtTabs button'));
  const cs=txt(w,'dtCtSum'); ok(/LRS-2611AA1/.test(cs)&&/BUYER-A/.test(cs)&&/LC · CIF/.test(cs)&&/出港済 0 \/ 全 2 件/.test(cs),'계약 요약',cs);
  ok(JSON.stringify([...w.document.querySelectorAll('#dtCtTabs button')].map(b=>b.dataset.tab))===JSON.stringify(['lc','si','log']),'계약 탭 LC · S/I · 履歴');
  ok(/NAA2611-01/.test(txt(w,'dtCtShips'))&&/NAA2611-02/.test(txt(w,'dtCtShips')),'この契約の船積');
  click(w,'#dtCtShips button[data-iv="NAA2611-02"]'); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&/NAA2611-02/.test(txt(w,'dtIvSum'))); ok(true,'계약 → 다른 Invoice');
  click(w,'#dtIvSum button[data-goct]'); await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&!!w.document.querySelector('#dtCtTabs button'));
  click(w,'#dtCt [data-back]'); ok(w.document.getElementById('dtBCt').classList.contains('on'),'계약에서 ← 一覧へ = 계약별');
  const cts=[...w.document.querySelectorAll('#dtTable button.dt-link[data-ct]')].map(b=>b.textContent);
  /* v0.3 (형님 D5): 계약별 = 계약일 直近1ヶ月 (기본) · 계약일 역순 — 가짜 계약일: AA1 · BB1 = 120 일 전 · CC1 = 10 일 전 */
  ok(JSON.stringify(cts)===JSON.stringify(['LRS-2611CC1']),'v0.3 계약별 — 直近1ヶ月 (기본) = 10 일 전 계약만',cts);
  click(w,'#dtCtPeriod button[data-days="180"]');
  const cts6=[...w.document.querySelectorAll('#dtTable button.dt-link[data-ct]')].map(b=>b.textContent);
  ok(JSON.stringify(cts6)===JSON.stringify(['LRS-2611CC1','LRS-2611BB1','LRS-2611AA1'])&&w.localStorage.getItem('doc_tool_ct_days')==='180','v0.3 直近6ヶ月 (v0.6: 180 日) → 계약일 역순 (같은 날 = 번호 역순) · 기억',cts6);
  const ctCell=no=>[...[...w.document.querySelectorAll('#dtTable tbody tr')].find(t=>t.textContent.indexOf(no)>=0).querySelectorAll('td.c .st')].map(s=>s.textContent);
  ok(JSON.stringify(ctCell('LRS-2611AA1'))===JSON.stringify(['済','済'])&&JSON.stringify(ctCell('LRS-2611BB1'))===JSON.stringify(['—','済'])&&JSON.stringify(ctCell('LRS-2611CC1'))===JSON.stringify(['待ち','待ち']),'계약 LC · S/I 칸',[ctCell('LRS-2611AA1'),ctCell('LRS-2611BB1'),ctCell('LRS-2611CC1')]);
  { const th=[...w.document.querySelectorAll('#dtTable thead th')].map(x=>x.textContent);
    ok(JSON.stringify(th)===JSON.stringify(['契約番号','契約日','国','バイヤー','ITEM','QTY(MT)','単価($/MT)','最終船積日','担当','LC','S/I'])&&!/出港済/.test(txt(w,'dtTable')),'v0.6 계약별 열 = 契約番号 · 契約日 · 国 · バイヤー · ITEM · QTY(MT) · 単価 · 最終船積日 · 担当 | LC · S/I (POD · 決済 없음)',th); }

  /* 검색 → 상세 */
  const search=async q=>{ w.document.getElementById('dtQ').value=q; click(w,'#dtGo'); await X.sleep(30); };
  await search('lrs-2611cc1'); await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&/LRS-2611CC1/.test(txt(w,'dtCtSum'))); ok(w.document.querySelector('#dtCtTabs button.on').dataset.tab==='lc','검색 계약 → 계약 상세 (いまここ = LC 待ち)');
  await search('NCC2611-01'); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&/NCC2611-01/.test(txt(w,'dtIvSum'))); ok(/INDONESIA/.test(txt(w,'dtIvSum')),'검색 Invoice (범위 밖 → COMPASS 에서)');
  await search('TESTLC001'); await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&/LRS-2611AA1/.test(txt(w,'dtCtSum'))); ok(true,'검색 LC 번호 → 계약');
  await search('NZZ2611-99'); ok(/ありません/.test(txt(w,'dtQSt')),'검색 없음 → 안내',txt(w,'dtQSt'));

  /* ⚙ 設定 — API 키는 설정 안에만 · 이 브라우저에만 */
  ok(w.__btns.length===1&&/設定/.test(w.__btns[0].label),'헤더 ⚙ 設定 버튼');
  w.__btns[0].onClick(); ok(!w.document.getElementById('dtModal').hidden&&w.document.getElementById('dtKey'),'설정 열기');
  w.document.getElementById('dtKey').value='TEST-KEY-0000'; click(w,'#dtKeySave'); ok(w.localStorage.getItem('leenai_apikey_v1')==='TEST-KEY-0000'&&w.document.getElementById('dtKey').value==='','키 저장 (a1_bench 와 같은 곳) · 입력칸 비움');
  ok(!/TEST-KEY-0000/.test(w.document.body.innerHTML),'키가 화면에 안 나옴');
  click(w,'#dtKeyDel'); ok(w.localStorage.getItem('leenai_apikey_v1')===null,'키 지우기');
  click(w,'#dtMaster'); ok(w.__master===1,'마스터 설정 열기');
  ok(W.writes.length===0,'P1 은 아무것도 쓰지 않음 (PUT · PATCH · POST · DELETE 0)',W.writes);

  /* ── 기억: 다시 열면 고른 담당 그대로 ── */
  W=X.world(); w=await P(W,{html,ls:{doc_tool_who:'STAFF_B',doc_tool_board:'ct'}});
  ok(w.document.querySelector('#dtWho button.on').dataset.who==='STAFF_B'&&w.document.getElementById('dtBCt').classList.contains('on'),'다시 열면 담당 · 현황판 기억');
  /* ── 관리자: 自分の担当 = 전원 ── */
  W=X.world(); w=await P(W,{html,email:'boss@example.test'});
  ok(ivs(w).length===3&&/管理者 = 全員/.test(txt(w,'dtWho')),'관리자 自分の担当 = 전원',ivs(w));
  /* ── 등록 안 된 사람 ── */
  W=X.world(); w=await P(W,{html,email:'nobody@example.test'});
  ok(ivs(w).length===0&&/マスター「担当者」にありません/.test(txt(w,'dtBoardNote')),'미등록 사용자 → 안내');
  /* ── 범위 바꾸기 ── */
  W=X.world(); w=await P(W,{html,ls:{doc_tool_who:'all'}});
  w.document.getElementById('dtFrom').value=X.addDays(W.T,0); w.document.getElementById('dtTo').value=X.addDays(W.T,5); click(w,'#dtReload');
  await X.until(()=>/読み込み完了/.test(txt(w,'dtProg'))&&ivs(w).length===1); ok(JSON.stringify(ivs(w))===JSON.stringify(['NAA2611-01']),'ETD 범위 바꿈');
  w.document.getElementById('dtFrom').value=X.addDays(W.T,9); w.document.getElementById('dtTo').value=X.addDays(W.T,1); click(w,'#dtReload'); ok(/正しくありません/.test(txt(w,'dtProg')),'범위 거꾸로 → 안내');

  console.log((fail?'FAIL':'PASS')+' app — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL app 예외',e.stack); process.exitCode=1; });
