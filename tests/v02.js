/* v0.2 수정 9건 시험 (지시서 v0.2 「자체 확인」 #1 ~ #8) — 가짜 데이터만. node v02.js [html]
   #1 FD済み 숨김 · #2 탭 상태 점 · いまここ · #3 ACL 이름 · #4 (si.js) · #5 T/T 추천 · #6 出港済 · #7 (acl.js · si.js + 여기) · #8 전환 순서 · 기억 · #9 = theme.js */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
DOC.useAclEngine(require('./engine').engine(HTML));   // v0.3: ACL 이름 규칙 = 엔진 v0.5 (v0.2 의 이 TOOL 규칙을 옮긴 것 — 아래 시험은 그대로 통과해야 함)
DOC.aclFiles=(fs,iv,ctx)=>DOC.aclScan(fs,iv,ctx).formal;   // v0.2 시험용 이름 (v0.3 에서 aclPick 으로 바뀜)
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,600));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const clone=o=>JSON.parse(JSON.stringify(o)), FVK='@OData.Community.Display.V1.FormattedValue';
const G=(p,n)=>(p+'00000000').slice(0,8)+'-0000-4000-8000-'+String(n).padStart(12,'0');

(async()=>{
/* ════════ 순수 로직 ════════ */
const IV='NZZ2699-01', f=(name,mod)=>({name, lastModified:mod||'2026-11-10T00:00:00Z'});
/* #3 ACL 이름 — 표의 모양 전부 (가짜 번호) */
const shape=n=>{ const r=DOC.aclScan([f(n)],IV,{booking:'TESTBK0001',others:['TESTBK0002']}); return r.formal.length?r.formal[0].shape:r.temp.length?'仮':r.excluded.length?'除外:'+r.excluded[0].why:'なし'; };
eq(shape(IV+'_ACL.pdf'),'{IV}_ACL','{IV}_ACL.pdf');
eq(shape(IV+'_ACL REV2.pdf'),'{IV}_ACL','{IV}_ACL REV2.pdf');
eq(shape(IV+'_DR.pdf'),'{IV}_DR','{IV}_DR.pdf');
eq(shape(IV+'_DRAFT.pdf'),'なし','{IV}_DRAFT.pdf 는 ACL 아님 (B/L Draft)');
eq(shape('DR_SAMPLE_JAKARTA_TESTBK0001_SAMPLE VESSEL 120S.pdf'),'DR_ · DR 番号','DR_….pdf (이 부킹 번호)');
eq(shape('DR TEST0000001.pdf'),'DR_ · DR 番号','DR 번호.pdf');
eq(shape('DR #T000000001.pdf'),'DR_ · DR 番号','DR #….pdf');
eq(shape('再送DR(TST0001).pdf'),'再送DR','再送DR(…).pdf');
eq(shape('SAMPLE_DR(TST0002).pdf'),'…DR(番号)','…DR(…).pdf');
eq(shape('ACL-TST26K00001.pdf'),'ACL-番号 · ACL 番号','ACL-번호.pdf');
eq(shape('ACL  TEST2600001.pdf'),'ACL-番号 · ACL 番号','ACL  번호.pdf (공백 2칸)');
eq(shape('ACL01_TEST0000000001.pdf'),'ACL-番号 · ACL 番号','ACL01_….pdf');
eq(shape('ACL本登録.pdf'),'ACL本登録','ACL本登録.pdf');
eq(shape('仮ACL.pdf'),'仮','仮ACL.pdf');
eq(shape('仮ACL_REV.pdf'),'仮','仮ACL_REV.pdf');
eq(shape(IV+'_仮ACL.pdf'),'仮','{IV}_仮ACL.pdf');
eq(shape('ACL仮登録.pdf'),'仮','ACL仮登録.pdf');
eq(shape('NZZ2699-02_DR.pdf'),'除外:ほかの Invoice 番号','다른 Invoice 번호 → 제외');
eq(shape('DR_TESTBK0002.pdf'),'除外:ほかのブッキング番号','다른 부킹 번호 → 제외');
eq(shape('DR_SAMPLE.xlsx'),'なし','xlsx 제외 (PDF 만)');
eq(DOC.aclScan([Object.assign(f('DR_SAMPLE.pdf'),{sub:'PHOTO'})],IV).formal.length,0,'하위 폴더 파일은 제외 (v0.1 과 같은 범위)');
/* 우선순위 本登録 > REV > 再送 > 시각 */
const pick=names=>DOC.aclFiles(names.map(n=>Array.isArray(n)?f(n[0],n[1]):f(n)),IV)[0].f.name;
eq(pick([IV+'_ACL REV3.pdf','ACL本登録.pdf','再送DR(T1).pdf']),'ACL本登録.pdf','本登録 이 최우선');
eq(pick([IV+'_ACL.pdf',IV+'_ACL REV2.pdf','再送DR(T1).pdf']),IV+'_ACL REV2.pdf','REV 번호 > 再送');
eq(pick([['DR_A.pdf','2026-11-12T00:00:00Z'],'再送DR(T1).pdf']),'再送DR(T1).pdf','再送 > 시각');
eq(pick([['DR_A.pdf','2026-11-12T00:00:00Z'],['ACL-T1.pdf','2026-11-11T00:00:00Z']]),'DR_A.pdf','나머지는 늦은 시각');
eq(DOC.aclFiles([f(IV+'_ACL REV2.pdf')],IV)[0].version,'REV2','판 이름 REV2');
/* 상태 — 仮 만 → 確認 · 없음 → 待ち · 정식 → 照合結果なし 確認 */
const J=files=>DOC.judgeIv({iv:IV,country:'VIETNAM',term:'CIF',premium:1,etdPast:false,folder:{files:files.map(n=>f(n))},acl:null,mailRules:[],bookingNo:'TESTBK0001',otherBookings:['TESTBK0002']}).acl;
eq([J(['仮ACL.pdf']).s,J(['仮ACL.pdf']).pick.f.name,J(['仮ACL.pdf']).label],['todo','仮ACL.pdf','仮'],'仮 만 → 確認 (v0.3: 仮 = ACL 로 照合 대상 · 판 「仮」 — 형님 D3)');
eq(J([]).s,'wait','ACL 없음 → 待ち');
eq(J(['DR_TESTBK0002.pdf']).s,'wait','다른 부킹의 DR 만 → 待ち (제외)');
ok(J(['DR TEST001.pdf','仮ACL.pdf']).s==='todo'&&J(['DR TEST001.pdf','仮ACL.pdf']).pick.f.name==='DR TEST001.pdf','정식이 있으면 仮 는 안 씀');
ok(/照合結果なし/.test(J(['DR TEST001.pdf']).why)&&/DR TEST001\.pdf \(初版 · DR_ · DR 番号\)/.test(J(['DR TEST001.pdf']).files[0]),'고른 파일 · 판 · 모양을 툴팁에',J(['DR TEST001.pdf']).files);

/* #1 FD 숨김 규칙 */
const C=(s)=>({s}), cells=(fd)=>({fd:C(fd)});
ok(DOC.fdDone(cells('done'))&&!DOC.fdDone(cells('wait')),'Invoice: FD 済 → 숨김');
ok(DOC.fdHiddenCt===undefined,'v0.3: 契約別 의 FD済み 숨김은 없앰 (FD済み · ETD 는 Invoice 別에서만 — 형님 D5)');
/* #2 いまここ */
eq(DOC.nowTab({customs:C('done'),acl:C('diff'),depo:C('na'),bl:C('todo')},DOC.STEPS),'acl','いまここ = 済 아닌 첫 탭');
eq(DOC.nowTab({customs:C('done'),acl:C('done'),depo:C('na'),bl:C('done'),ins:C('na'),rr:C('na'),fd:C('done')},DOC.STEPS),'','모두 済 (대상 외 제외) → 없음');
eq(DOC.nowTab({customs:C('done'),acl:C('done'),depo:C('wait')},DOC.STEPS),'depo','待ち 도 済 아님');
eq(DOC.nowTab({lc:C('na'),si:C('wait')},DOC.CT_STEPS),'si','계약: LC 대상 외 → S/I');
/* #6 */
eq(DOC.shipLabel(2,10),'出港済 2 / 全 10 件','出港済 n / 全 m 件');

/* #5 T/T — 직전 S/I 고르기 · 머리 칸 복사 · PO 4경우 · L/C 칸 · 어긋나는 칸 */
const H=(sn,o)=>Object.assign({crcf9_sino:sn},DOC.SI_HEAD_COLS.reduce((a,c)=>(a[c]='V-'+c,a),{}),{cr49f_lc_no:'',crcf9_place_of_delivery_1:'SAMPLE PORT KR',crcf9_port_of_discharge:'SAMPLE PORT KR',cr49f_payment_terms:'CFR SAMPLE PORT'},o||{});
const P=(no,date,o,dets)=>({no,date,sis:[H(1,o)],details:dets||[]});
ok(DOC.ttEarlier({no:'LRS-2601TT1',date:'2026-01-05'},{no:'LRS-2602TT1',date:'2026-02-05'})&&!DOC.ttEarlier({no:'LRS-2603TT1',date:'2026-03-05'},{no:'LRS-2602TT1',date:'2026-02-05'})&&!DOC.ttEarlier({no:'LRS-2602TT1',date:'2026-02-05'},{no:'LRS-2602TT1',date:'2026-02-05'}),'앞선 계약 = 계약일 순 · 같은 번호 아님');
ok(DOC.ttEarlier({no:'LRS-2602TT1',date:'2026-02-05'},{no:'LRS-2602TT2',date:'2026-02-05'}),'같은 날 → 계약번호 순');
const prev=[P('LRS-2601TT1','2026-01-05',{crcf9_po_vo:'PO-AAA1',crcf9_vo_no:'VO-SAME'}),P('LRS-2603TT1','2026-03-05',{crcf9_po_vo:'PO-CCC3',crcf9_vo_no:'VO-SAME',cr49f_lc_no:'OLDLC-1',crcf9_port_of_discharge:'OTHER PORT'},[{_crcf9_item_id_value:'IT1',crcf9_productname:'SAMPLE ITEM A (PREV)',crcf9_hs_code:'HS 0000.00'}]),P('LRS-2602TT1','2026-02-05',{crcf9_po_vo:'PO-BBB2',crcf9_vo_no:'VO-SAME'})];
const sale=[{cr49f_sale_detailid:'SD1',_cr49f_item_id_value:'IT1',cr49f_quantity:100,cr49f_price:50,item:'SAMPLE ITEM A'},{cr49f_sale_detailid:'SD2',_cr49f_item_id_value:'IT2',cr49f_quantity:20,cr49f_price:30,item:'SAMPLE ITEM B'}];
const R=DOC.ttRecommend({prev,sale,term:'CFR',pod:'SAMPLE PORT KR'}), s1=R.rec.sinos[1], b1=R.rec.basis[1];
eq(R.tt.prev,'LRS-2603TT1','직전 S/I = 가장 최근 앞선 계약');
eq(R.tt.recent,['LRS-2603TT1','LRS-2602TT1','LRS-2601TT1'],'PO 비교 = 최근 3건');
ok(DOC.SI_HEAD_COLS.filter(c=>['crcf9_po_vo','cr49f_lc_no'].indexOf(c)<0).every(c=>s1[c]===prev[1].sis[0][c]),'머리 칸 22칸 그대로 복사 (PO · L/C 빼고)');
ok(b1.crcf9_consignee.source==='前回 S/I: LRS-2603TT1','근거 「前回 S/I: …」');
ok(s1.crcf9_po_vo===''&&/毎回変わる \(前回: PO-CCC3\)/.test(b1.crcf9_po_vo.flag)&&R.tt.po.crcf9_po_vo.kind==='changes','PO 매번 다름 → 빈칸 · 要確認 毎回変わる (前回: …)',b1.crcf9_po_vo);
ok(s1.crcf9_vo_no==='VO-SAME'&&!b1.crcf9_vo_no.flag&&b1.crcf9_vo_no.ok==='一致'&&R.tt.po.crcf9_vo_no.kind==='same','늘 같음 → 복사 · 一致');
const R2=DOC.ttRecommend({prev:[P('LRS-2601TT1','2026-01-05',{crcf9_po_vo:''}),P('LRS-2602TT1','2026-02-05',{crcf9_po_vo:''})],sale:[],term:'CFR'});
ok(R2.rec.sinos[1].crcf9_po_vo===''&&R2.rec.basis[1].crcf9_po_vo.ok==='一致'&&R2.tt.po.crcf9_po_vo.kind==='blank','늘 빈칸 → 빈칸 · 一致');
const R3=DOC.ttRecommend({prev:[P('LRS-2601TT1','2026-01-05',{crcf9_po_vo:'PO-ONLY'})],sale:[],term:'CFR'});
ok(R3.rec.sinos[1].crcf9_po_vo==='PO-ONLY'&&/前回 1 件のみ/.test(R3.rec.basis[1].crcf9_po_vo.flag),'이전 S/I 1건뿐 → 복사 · 要確認 前回 1 件のみ');
ok(s1.cr49f_lc_no===''&&/T\/T なので空欄 \(前回: OLDLC-1\)/.test(b1.cr49f_lc_no.flag),'L/C 칸 → 빈칸 · 前回 값 있으면 要確認');
ok(R2.rec.sinos[1].cr49f_lc_no===''&&!R2.rec.basis[1].cr49f_lc_no.flag,'L/C 칸 前回도 빈칸 → 一致');
ok(/今回のブッキング POD: SAMPLE PORT KR/.test(b1.crcf9_port_of_discharge.flag||'')&&!b1.crcf9_place_of_delivery_1.flag,'POD 다른 칸만 要確認 (참고)');
const R4=DOC.ttRecommend({prev:[P('LRS-2601TT1','2026-01-05')],sale:[],term:'CIF'}); ok(/今回の契約は CIF/.test(R4.rec.basis[1].cr49f_payment_terms.flag||''),'Trade Term 이 이번 계약과 다름 → 要確認');
eq(R.rec.details.map(d=>[d.crcf9_productname,d.crcf9_hs_code]),[['SAMPLE ITEM A (PREV)','HS 0000.00'],['SAMPLE ITEM B','']],'명세 = 이번 판매 명세 (품명 · HS 는 前回 같은 품목)');
ok(R.rec.details[1].crcf9_hs_code__flag&&!R.rec.details[0].crcf9_hs_code__flag,'前回에 없는 품목 → 要確認');
const R5=DOC.ttRecommend({no:'LRS-2604TT1',prev:[P('LRS-2601TT1','2026-01-05',{crcf9_po_vo:'PO NO: LRS-2601TT1'}),P('LRS-2602TT1','2026-02-05',{crcf9_po_vo:'PO NO: LRS-2602TT1'}),P('LRS-2603TT1','2026-03-05',{crcf9_po_vo:'PO NO: lrs-2603tt1'})],sale:[]});
ok(R5.rec.sinos[1].crcf9_po_vo==='PO NO: LRS-2604TT1'&&R5.tt.po.crcf9_po_vo.kind==='ctno'&&/PO = 契約番号/.test(R5.rec.basis[1].crcf9_po_vo.flag),'PO = 그 계약 번호 → 이번 계약 번호로 바꿔 넣고 要確認 (실제 자료 보강)',[R5.rec.sinos[1].crcf9_po_vo,R5.rec.basis[1].crcf9_po_vo]);
let thrown=''; try{ DOC.ttRecommend({prev:[],sale}); }catch(e){ thrown=e.message; } ok(/前の契約に S\/I がありません/.test(thrown),'앞선 S/I 없음 → 멈춤 (만들지 않음)');
/* 状態 — flag → 要確認 · ok → 一致 */
eq(DOC.siFieldState({col:'crcf9_po_vo',value:'',hasCur:false,basis:b1.crcf9_po_vo}).label,'要確認','flag → 要確認');
eq(DOC.siFieldState({col:'crcf9_vo_no',value:'VO-SAME',hasCur:false,basis:b1.crcf9_vo_no}).label,'一致','ok → 一致');

/* ════════ 화면 (jsdom) ════════ */
const $$=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const ivs=w=>$$(w,'#dtTable tbody tr').map(tr=>tr.querySelector('button.dt-link').textContent);
/* #8 전환 순서 */
let W=X.world(), w=await X.page(W,{ls:{doc_tool_who:'all'}});
eq($$(w,'.dt-seg button').map(b=>b.id),['dtBCt','dtBIv'],'전환 버튼 순서 = 契約別 → Invoice 別');
ok(w.document.getElementById('dtBIv').classList.contains('on'),'처음 여는 사람 기본 = Invoice 別');
/* #1 FD済み 기본 ON */
ok(w.document.getElementById('dtHideFd').checked,'「FD済みは表示しない」 기본 ON');
eq(ivs(w),['NAA2611-01','NAA2611-02'],'FD 있는 NBB2611-01 숨김');
ok(/すべて 2/.test(txt(w,'dtAll'))&&/要対応のみ 1/.test(txt(w,'dtTodo')),'건수 = 보이는 행 기준',[txt(w,'dtAll'),txt(w,'dtTodo')]);
ok(/読み込み完了.*FD済み 1 件を非表示/.test(txt(w,'dtProg')),'읽기 완료 줄에 「FD済み n 件を非表示」',txt(w,'dtProg'));
const hf=w.document.getElementById('dtHideFd'); hf.checked=false; hf.dispatchEvent(new w.Event('change'));
eq(ivs(w),['NBB2611-01','NAA2611-01','NAA2611-02'],'끄면 전부 보임');
ok(!/非表示/.test(txt(w,'dtProg'))&&/すべて 3/.test(txt(w,'dtAll')),'끄면 건수 3 · 숨김 문구 없음');
ok(w.localStorage.getItem('doc_tool_hide_fd')==='0','기억 (localStorage)');
/* 契約別 — v0.3: FD済み · ETD 조작은 Invoice 別에서만 · 契約別 = 계약일 기간 */
hf.checked=true; hf.dispatchEvent(new w.Event('change')); w.document.getElementById('dtBCt').click();
const cts=()=>$$(w,'#dtTable button.dt-link[data-ct]').map(b=>b.textContent);
eq([w.document.getElementById('dtIvCtl').style.display,w.document.getElementById('dtCtCtl').style.display],['none',''],'v0.3 契約別: ETD · FD済み 조작 숨김 · 期間 보임');
eq(cts(),['LRS-2611CC1'],'v0.3 契約別: 直近1ヶ月 (FD 숨김과 무관)');
ok(w.localStorage.getItem('doc_tool_board')==='ct','현황판 선택 기억');
/* 검색은 숨김과 무관 */
hf.checked=true; hf.dispatchEvent(new w.Event('change')); w.document.getElementById('dtBIv').click();
w.document.getElementById('dtQ').value='NBB2611-01'; w.document.getElementById('dtGo').click();
await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&/NBB2611-01/.test(txt(w,'dtIvSum')));
ok(true,'숨긴 Invoice 도 검색으로 열림');
/* #2 모두 済 → いまここ 없음 */
ok(!w.document.querySelector('#dtIvTabs button.now')&&!/いまここ/.test(txt(w,'dtIvTabs')),'모두 済 → 「いまここ」 없음',txt(w,'dtIvTabs'));
ok(w.document.querySelector('#dtIvTabs button.on').dataset.tab==='customs','모두 済 → 첫 탭');
w.document.querySelector('#dtIv [data-back]').click();
/* #2 현황판 칸 누르면 그 탭 */
const row=$$(w,'#dtTable tbody tr').find(t=>/NAA2611-01/.test(t.textContent));
const blBtn=row.querySelectorAll('td.c button.st')[3]; ok(blBtn&&blBtn.dataset.tab==='bl'&&blBtn.textContent==='確認','현황판 상태 = 누를 수 있음 (B/L 確認)');
blBtn.click(); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button'));
ok(w.document.querySelector('#dtIvTabs button.on').dataset.tab==='bl'&&w.document.querySelector('#dtIvTabs button.now').dataset.tab==='acl','눌러서 들어오면 그 탭 · いまここ 는 따로 (ACL)');
w.document.querySelector('#dtIv [data-back]').click();
$$(w,'#dtTable tbody tr').find(t=>/NAA2611-01/.test(t.textContent)).querySelectorAll('td.c button.st')[1].click(); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button'));
ok(w.document.querySelector('#dtIvTabs button.on').dataset.tab==='acl','相違 칸을 눌러 → ACL 탭');
ok(!$$(w,'#dtTable td.c button.st-na').length,'대상 외 (—) 는 누를 수 없음');
/* #6 계약 상세 툴팁 */
w.document.querySelector('#dtIvSum button[data-goct]').click(); await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&!!w.document.querySelector('#dtCtTabs button'));
const shipDiv=[...w.document.querySelectorAll('#dtCtSum > div')].find(d=>/出港済/.test(d.textContent));
ok(shipDiv&&/ETD \(B\/L ETD 優先\) が過ぎたもの 0 件/.test(shipDiv.getAttribute('title')),'出港済 툴팁',shipDiv&&shipDiv.getAttribute('title'));
ok(!w.document.querySelector('#dtCtTabs button.now')&&w.document.querySelectorAll('#dtCtTabs .dot').length===2,'계약 상세 탭도 점 (LC · S/I 済 → いまここ 없음)');
/* #7 S/I 탭 — 직원은 a1_bench 버튼 없음 · 관리자는 있음 */
w.document.querySelector('#dtCtTabs button[data-tab="si"]').click(); await X.sleep(30);
ok(!w.document.querySelector('[data-open="a1"]')&&!w.document.querySelector('[data-open="acl"]'),'직원 — 시험 페이지 버튼 없음');
let W2=X.world(), w2=await X.page(W2,{email:'boss@example.test'});
w2.document.getElementById('dtQ').value='LRS-2611AA1'; w2.document.getElementById('dtGo').click(); await X.until(()=>w2.document.getElementById('dtCt').style.display==='flex'&&!!w2.document.querySelector('#dtCtTabs button'));
w2.document.querySelector('#dtCtTabs button[data-tab="si"]').click(); await X.until(()=>!!w2.document.querySelector('#dtCtBody [data-open="a1"]'),5000).catch(()=>{});
ok(!!w2.document.querySelector('#dtCtBody [data-open="a1"]'),'관리자 — a1_bench を開く 있음 (L/C 계약)');

/* #5 T/T 화면 — 가짜 COMPASS 에 T/T 바이어 계약 5건 (앞선 3건 S/I 있음 · 대상 · 뒤 1건) */
W=X.world(); const T=W.T, D=n=>X.addDays(T,n), b2=X.g('c',2), item1=G('17e0',1), item2=G('17e0',2);
const ct=(n,no,date)=>({cr49f_sale_contractid:G('7c00',n),cr49f_sale_contract_no:no,cr49f_pay_cls:2,['cr49f_pay_cls'+FVK]:'TT',cr49f_terms_conditions:'CFR',_cr49f_buyer_id_value:b2,['_cr49f_buyer_id_value'+FVK]:'BUYER-B',cr49f_sale_contract_date:date,cr49f_latest_shipment:null});
W.contracts.push(ct(1,'LRS-2607BB1',D(-110)),ct(2,'LRS-2608BB1',D(-80)),ct(3,'LRS-2609BB1',D(-50)),ct(4,'LRS-2610BB1',D(-30)),ct(5,'LRS-2610BB2',D(-20)));
W.contracts.find(c=>c.cr49f_sale_contract_no==='LRS-2611BB1').cr49f_sale_contract_date=D(-10);   // 기존 BB1 (S/I 있음) 은 대상보다 뒤
const head=(n,c,o)=>Object.assign({cr49f_s_iid:G('5100',n),_cr49f_sale_contract_id_value:G('7c00',c),crcf9_sino:1,modifiedon:'2026-11-01T00:00:00Z'},DOC.SI_HEAD_COLS.reduce((a,k)=>(a[k]='TEST '+k,a),{}),{cr49f_lc_no:'',cr49f_payment_terms:'CFR SAMPLE PORT KR',crcf9_place_of_delivery_1:'SAMPLE PORT KR',crcf9_port_of_discharge:'SAMPLE PORT KR'},o);
W.sis.push(head(1,1,{crcf9_po_vo:'PO-TEST-1',crcf9_vo_no:'VO-SAME'}),head(2,2,{crcf9_po_vo:'PO-TEST-2',crcf9_vo_no:'VO-SAME'}),head(3,3,{crcf9_po_vo:'PO-TEST-3',crcf9_vo_no:'VO-SAME',crcf9_consignee:'SAMPLE CONSIGNEE (PREV)'}),head(5,5,{crcf9_po_vo:'PO-LATER',crcf9_consignee:'LATER — 쓰면 안 됨'}));
W.dets=[{crcf9_s_i_detailid:G('de00',3),_crcf9_s_i_id_value:G('5100',3),_crcf9_item_id_value:item1,_crcf9_sale_detail_id_value:G('5d00',3),crcf9_productname:'SAMPLE ITEM A (S/I)',crcf9_hs_code:'HS CODE: 0000.00',crcf9_weight:10,crcf9_price:1}];
W.sale=[{cr49f_sale_detailid:G('5d00',4),_cr49f_sale_contract_id_value:G('7c00',4),_cr49f_item_id_value:item1,['_cr49f_item_id_value'+FVK]:'SAMPLE ITEM A',cr49f_quantity:120,cr49f_price:80},
  {cr49f_sale_detailid:G('5d00',5),_cr49f_sale_contract_id_value:G('7c00',4),_cr49f_item_id_value:item2,['_cr49f_item_id_value'+FVK]:'SAMPLE ITEM B',cr49f_quantity:30,cr49f_price:40}];
W.bookings.push({cr49f_bookingid:X.g('e',9),cr49f_invoice_no:'NBB2610-01',cr49f_booking_no:'TESTBK9',cr49f_etd:D(20)+'T00:00:00Z',crcf9_bl_etd:null,_cr49f_sale_contract_id_value:G('7c00',4),_cr49f_region_id_value:X.g('a',2),_cr49f_region_japan_id_value:X.g('b',1),crcf9_insurance_premiums:null,modifiedon:'2026-11-01T00:00:00Z'});
const M2O={cr49f_s_i:[{ReferencingAttribute:'cr49f_sale_contract_id',ReferencedEntity:'cr49f_sale_contract',ReferencingEntityNavigationPropertyName:'cr49f_sale_contract_id'}],
  crcf9_s_i_detail:[{ReferencingAttribute:'crcf9_s_i_id',ReferencedEntity:'cr49f_s_i',ReferencingEntityNavigationPropertyName:'crcf9_s_i_id'},{ReferencingAttribute:'crcf9_sale_detail_id',ReferencedEntity:'cr49f_sale_detail',ReferencingEntityNavigationPropertyName:'crcf9_sale_detail_id'},{ReferencingAttribute:'crcf9_item_id',ReferencedEntity:'cr49f_item',ReferencingEntityNavigationPropertyName:'crcf9_item_id'}]};
const SETS={cr49f_s_i:'cr49f_s_is',crcf9_s_i_detail:'crcf9_s_i_details',cr49f_sale_contract:'cr49f_sale_contracts',cr49f_sale_detail:'cr49f_sale_details',cr49f_item:'cr49f_items'};
w=await X.page(W,{ls:{doc_tool_who:'all'}});   // API 키 없음 — T/T 는 키 없이 됨
const inner=w.fetch, Rs=(st,body)=>({ok:st>=200&&st<300,status:st,statusText:String(st),headers:{get:()=>null},json:async()=>clone(body),text:async()=>JSON.stringify(body)}); let nn=0;
w.fetch=async(url,init)=>{ url=String(url); init=init||{}; const method=(init.method||'GET').toUpperCase(), u=decodeURIComponent(url);
  if(/api\.anthropic\.com|raw\.githubusercontent/.test(url)){ W.req.push('AI/ENGINE '+url); throw new Error('T/T 에서 부르면 안 됨'); }
  if(url.indexOf(X.DV)===0){ const p=u.slice(X.DV.length); let m;
    if(method!=='GET'){ const body=JSON.parse(init.body); W.writes.push({method,url,body:init.body});
      if(p==='cr49f_s_is'){ const id=G('5e00',++nn), row=Object.assign({cr49f_s_iid:id,_cr49f_sale_contract_id_value:(body['cr49f_sale_contract_id@odata.bind'].match(/\(([^)]+)\)/)||[])[1],modifiedon:'2026-11-20T00:00:00Z'},body); delete row['cr49f_sale_contract_id@odata.bind']; W.sis.push(row); return Rs(201,row); }
      if(p==='crcf9_s_i_details'){ const id=G('5f00',++nn), bb=x=>(String(body[x]||'').match(/\(([^)]+)\)/)||[])[1], row=Object.assign({crcf9_s_i_detailid:id,_crcf9_s_i_id_value:bb('crcf9_s_i_id@odata.bind'),_crcf9_sale_detail_id_value:bb('crcf9_sale_detail_id@odata.bind'),_crcf9_item_id_value:bb('crcf9_item_id@odata.bind')},body);
        Object.keys(row).filter(x=>/@odata\.bind$/.test(x)).forEach(x=>delete row[x]); W.dets.push(row); return Rs(201,row); }
      return Rs(400,{error:{message:'unknown '+p}}); }
    if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\/ManyToOneRelationships/))) return Rs(200,{value:M2O[m[1]]||[]});
    if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\?\$select=EntitySetName/))) return Rs(200,{EntitySetName:SETS[m[1]]});
  }
  return inner(url,init); };
const $=id=>w.document.getElementById(id);
$('dtQ').value='LRS-2610BB1'; $('dtGo').click(); await X.until(()=>$('dtCt').style.display==='flex'&&/LRS-2610BB1/.test(txt(w,'dtCtSum')));
ok(w.document.querySelector('#dtCtTabs button.on').dataset.tab==='si','T/T 계약 → S/I 탭 (LC 대상 외)');
await X.until(()=>$('dtSiRun')&&$('dtSiRun').onclick,5000);
ok(/前回の S\/I から作る/.test($('dtSiRun').textContent)&&!$('dtSiRun').disabled&&/AI なし/.test(txt(w,'dtCtBody')),'T/T → 「前回の S/I から作る」 (키 없어도 누를 수 있음)',txt(w,'dtCtBody').slice(0,200));
ok(!w.document.querySelector('#dtCtBody [data-open="a1"]'),'T/T 에는 a1_bench 버튼 없음');
const w0=W.writes.length; $('dtSiRun').click(); await X.until(()=>/ほか \d+ 項目/.test(txt(w,'dtCtBody'))||/推薦できません/.test(txt(w,'dtCtBody')),8000).catch(e=>{ console.log('DEBUG',txt(w,'dtCtBody').slice(0,700)); throw e; });
ok(/ほか \d+ 項目/.test(txt(w,'dtCtBody')),'T/T 추천 완료',txt(w,'dtSiSt'));
ok(!W.req.some(r=>/^AI\/ENGINE/.test(r)),'AI · 엔진 호출 0');
ok(/前回 S\/I LRS-2609BB1/.test(txt(w,'dtCtBody'))&&/費用 0/.test(txt(w,'dtCtBody'))&&/LRS-2609BB1 · LRS-2608BB1 · LRS-2607BB1/.test(txt(w,'dtCtBody')),'직전 S/I = 앞선 계약 중 최근 (뒤 계약 제외) · 費用 0 · PO 비교 3건',txt(w,'dtCtBody').slice(-300));
const val=(sn,col)=>{ const e=w.document.querySelector('#dtCtBody [data-sn="'+sn+'"][data-col="'+col+'"]'); return e?e.value:null; };
w.document.getElementById('dtSiAll').click(); await X.sleep(20);
eq([val(1,'crcf9_consignee'),val(1,'crcf9_po_vo'),val(1,'crcf9_vo_no'),val('明細1','crcf9_productname'),val('明細2','crcf9_productname')],['SAMPLE CONSIGNEE (PREV)','','VO-SAME','SAMPLE ITEM A (S/I)','SAMPLE ITEM B'],'추천 값 (머리 = 前回 · PO 빈칸 · VO 복사 · 명세 = 판매 명세)');
ok(/毎回変わる \(前回: PO-TEST-3\)/.test(txt(w,'dtCtBody')),'PO 「要確認 · 毎回変わる (前回: …)」 표시');
const recPut=W.writes.slice(w0); ok(recPut.length===1&&/si_rec\/LRS-2610BB1_/.test(decodeURIComponent(recPut[0].url)),'추천 저장 (doc_tool/si_rec)');
/* 쓰기 — 취소 → 0 · 쓰기 → POST · 다시 읽기 */
const wr1=W.writes.length; $('dtSiWrite').click(); await X.until(()=>!$('dtModal').hidden,8000);
ok(/新規 S\/I sino 1/.test(txt(w,'dtModalBox'))&&$('dtSiGo').disabled,'쓰기 확인 화면');
w.document.querySelector('#dtModalBox [data-close]').click(); await X.sleep(30); ok(W.writes.length===wr1,'やめる → 쓰기 0');
$('dtSiWrite').click(); await X.until(()=>!$('dtModal').hidden,8000); $('dtSiOk').checked=true; $('dtSiOk').dispatchEvent(new w.Event('change')); $('dtSiGo').click();
await X.until(()=>/書き込みました|途中で止めました|書き込めません/.test(txt(w,'dtCtBody')),10000);
ok(/読み直して一致/.test(txt(w,'dtCtBody')),'T/T 쓰기 → 다시 읽기 일치 (L/C 와 같은 순서)',txt(w,'dtSiSt'));
const ws=W.writes.slice(wr1), dec=x=>decodeURIComponent(x.url);
ok(/si_backup\/LRS-2610BB1_/.test(dec(ws[0])),'처음 = 控え');
const siP=ws.filter(x=>x.method==='POST'&&/cr49f_s_is$/.test(x.url)).map(x=>JSON.parse(x.body)), dP=ws.filter(x=>x.method==='POST'&&/crcf9_s_i_details$/.test(x.url)).map(x=>JSON.parse(x.body));
ok(siP.length===1&&siP[0].crcf9_consignee==='SAMPLE CONSIGNEE (PREV)'&&!('crcf9_po_vo' in siP[0])&&!('cr49f_lc_no' in siP[0]),'S/I POST = 前回 값 · 빈칸은 안 보냄',siP[0]);
ok(dP.length===2&&dP[0].crcf9_weight===120&&dP[0].crcf9_price===80&&dP[1].crcf9_productname==='SAMPLE ITEM B','명세 POST = 판매 명세 수량 · 단가',dP);
ok(!ws.some(x=>x.method==='PATCH'||x.method==='DELETE')&&!W.sis.some(h=>h._cr49f_sale_contract_id_value===G('7c00',5)&&h.crcf9_consignee!=='LATER — 쓰면 안 됨'),'다른 계약은 건드리지 않음 · DELETE 0');
/* S/I 있는 T/T 계약 — 지금 S/I 먼저 · 앞선 S/I 없으면 멈춤 */
$('dtQ').value='LRS-2607BB1'; $('dtGo').click(); await X.until(()=>$('dtCt').style.display==='flex'&&/LRS-2607BB1/.test(txt(w,'dtCtSum')));
await X.until(()=>/今の S\/I（COMPASS/.test(txt(w,'dtCtBody')),5000);
ok(/今の S\/I（COMPASS · 読むだけ）/.test(txt(w,'dtCtBody'))&&/前回の S\/I から作る/.test($('dtSiRun').textContent),'S/I 済 T/T → 지금 S/I 먼저 · 그 아래 前回の S/I から作る');
await X.until(()=>$('dtSiRun')&&$('dtSiRun').onclick,5000); const wr2=W.writes.length; $('dtSiRun').click(); await X.until(()=>/推薦できません/.test(txt(w,'dtCtBody')),5000);
ok(/前の契約に S\/I がありません/.test(txt(w,'dtCtBody'))&&W.writes.length===wr2,'앞선 S/I 없음 → 이유 표시 · 쓰기 0');

console.log((fail?'FAIL':'PASS')+' v02 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v02 예외',e.stack); process.exitCode=1; });
