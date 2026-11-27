/* v0.16 시험 (지시서 THOR_8 D00 書類ツール v0.16 · PORTAL 동일표) — 가짜 데이터만 · 네트워크 없음. node v16.js [html]
   열 순서 (PORTAL 글자 그대로) · 줄 조건 (L 始まり · FD送付日 · ETD -30 · 빈 ETD · 순서) · 担当者 (PORTAL 방식 · 다르면 표시) · DEP 우선순위
   저장 = 그 Invoice 그 칸만 (나머지 바이트 같음) · eTag 조건 · 412 → 1 번 재시도 (둘 다 남음) · 두 번 412 → 「他の人が更新しました」 · 提案 = 자동 저장 없음 · 누르면 저장
   試験モード = save_test 사본만 · 문지기 (다른 경로 · eTag 없음 = 거부) · 「ETD 範囲で見る」 = v0.15 표 · 쓰기 = PORTAL 파일 PUT 뿐 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const thr=(f,m)=>{ let t=false; try{ f(); }catch(e){ t=true; } ok(t,m); };
const PT=DOC.PT, T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z';
const qa=(w,s)=>[...w.document.querySelectorAll(s)];

/* ── 1. 규칙 (doc-core) ── */
eq(PT.COLS,['ETD(E)','ETA(E)','CY_CUT','通関','POL','IV_NO','BKG本','CNTR','SHIP','BKG_NO','担当者'],'열 이름 = PORTAL 글자 그대로');
eq(PT.CHIPS.map(c=>c[1]),['ACL','B/L Draft','保険','RR'],'판정 칩 열 이름 그대로');
eq(PT.INPUTS,['DEP','振込','FD送付日','備考'],'입력 열 = PORTAL');
eq(PT.PATH,'古紙/-. AI 活用/PORTAL/clearance_status.json','PORTAL 파일 경로');
ok(PT.TEST_PATH===DOC.OUT_ROOT+'save_test/clearance_status_test.json','시험 경로 = doc_tool/save_test/clearance_status_test.json');
{ const b=(iv,etd,bl,id)=>({cr49f_bookingid:id||iv,cr49f_invoice_no:iv,cr49f_etd:etd,crcf9_bl_etd:bl||null});
  const L=[b('NTEST-01',D(5)),b('LTEST-01',D(3)),b('NTEST-02',D(-40)),b('NTEST-03',D(-40),D(-10)),b('NTEST-04',null,null),b('NTEST-05',D(2)),b('NTEST-06',D(5),null,'x6'),b('NTEST-07',D(1))];
  const sh={'NTEST-05':{dep:'未',furikomi:'未',fd_date:'2026-11-01',fd_note:''},'NTEST-07':{dep:'未',furikomi:'未',fd_date:'  ',fd_note:''}};
  const r=DOC.ptRows(L, sh, T).map(x=>x.cr49f_invoice_no);
  eq(r,['NTEST-04','NTEST-03','NTEST-07','NTEST-01','NTEST-06'],'줄 조건 — L 始まり 빼기 · FD送付日 있음 빼기 (빈칸만은 남김) · ETD -30 전 빼기 (B/L ETD 우선) · 빈 ETD 남김 · 순서 = ETD (빈 것 먼저 · 같으면 원래 순)');
  ok(DOC.ptRows([b('ltest-02',D(1))],{},T).length===0,'소문자 l 도 국내 전매');
  ok(DOC.ptRows([b('NTEST-08',X.addDays(T,-30)+'T00:00:00Z')],{},T).length===1&&DOC.ptRows([b('NTEST-09',X.addDays(T,-31)+'T00:00:00Z')],{},T).length===0,'경계 — 30 일 전은 남김 · 31 일 전은 뺌'); }
{ const items=[{iv_code:'A',staff:'S1'},{iv_code:'AA',staff:'S2'},{iv_code:'AB',staff:'S3'}];
  eq([DOC.ptStaff('NAA2611-01',items),DOC.ptStaff('NA2611-01',items),DOC.ptStaff('NAB2611-01',items),DOC.ptStaff('NAC2611-01',items),DOC.ptStaff('',items)],['S2','S1','S3','',''],'担当者 = PORTAL getShipStaff (긴 기호 먼저 · 뒤는 숫자)'); }
ok(DOC.ptTsukan({tsukan_irai:true},null)&&DOC.ptTsukan(null,'2026-08-17T00:00:00Z')&&!DOC.ptTsukan(null,'2026-08-18T00:00:00Z')&&!DOC.ptTsukan({tsukan_irai:false},null),'通関 ✅ = 通関依頼済 · CY_CUT 8/17 이전');
eq([DOC.ptPol({crcf9_pol:'TEST PORT, JAPAN'}),DOC.ptPol({crcf9_region_japan:'TEST AREA'}),DOC.ptPol(null)],['TEST PORT','TEST AREA','—'],'POL = crcf9_pol · 없으면 crcf9_region_japan · 「, JAPAN」 뺌');
eq(DOC.ptDate('2026-11-05T00:00:00Z'),'2026/11/05','날짜 = PORTAL 모양 (title · 提案 설명)');
eq([DOC.ptDateS('2026-12-01T00:00:00Z','2026-11-24'),DOC.ptDateS('2027-01-02','2026-11-24'),DOC.ptDateS('','2026-11-24')],['12/01','2027/01/02','—'],'v0.16.1 표 날짜 = 올해 MM/DD · 다른 해 = v0.34 (N56-9) 2027/01/02');
eq(PT.FOLD,['f-eta','f-cntr','f-bkg'],'v0.16.1 접는 순서 = ETA → CNTR → BKG_NO');
eq(DOC.ptDep({dep:'確認'},{s:'wait'},true),{sel:true,val:'確認',hint:''},'DEP — PORTAL 값 있으면 그것');
eq(DOC.ptDep(null,{s:'done'},true),{sel:true,val:'未',hint:'済'},'DEP — 없으면 書類ツール 판정 (済)');
eq(DOC.ptDep({dep:'未'},{s:'wait'},true).hint,'待ち','DEP — 未 면 판정 (待ち)');
eq(DOC.ptDep({dep:'未'},{s:'unk'},true).hint,'—','DEP — 판정 모름 = —');
eq(DOC.ptDep({dep:'確認'},null,false),{sel:false},'DEP — 베트남 외 = —');
ok(DOC.ptPropose(null,{fd:DOC.at('2026-11-10','10:00'),fdSrc:'フォルダ FD'}).date==='2026-11-10','提案 = TOOL 이 찾은 FD 날짜');
ok(DOC.ptPropose({fd_date:'2026-11-09'},{fd:1,fdSrc:'FD メール'})===null&&DOC.ptPropose(null,{fd:null})===null&&DOC.ptPropose(null,{fd:1,fdSrc:'PORTAL FD送付日'})===null,'提案 없음 — 이미 입력 · 신호 없음 · PORTAL 값');
/* ptMerge — 그 칸만 */
const BASE={last_updated:'2026-11-20T00:00:00.000Z',records:{'NTEST-01':{tsukan_irai:true,tsukan_status:'ED未',updated_by:'X',updated_at:'2026-11-19T00:00:00Z'}},cotecna:{'NTEST-01|1|P1':{report_status:'提出'}},
  shipping:{'NTEST-01':{dep:'未',furikomi:'未',fd_date:'',fd_note:'メモ1',updated_by:'X'},'NTEST-02':{dep:'確認',furikomi:'確認済',fd_date:'',fd_note:''}}};
const BT=JSON.stringify(BASE,null,2);
{ const M=DOC.ptMerge(BT,'NTEST-01','furikomi','確認済','USER','2026-11-24T01:00:00.000Z'), o=JSON.parse(M.text);
  ok(M.changed&&o.shipping['NTEST-01'].furikomi==='確認済'&&o.shipping['NTEST-01'].updated_by==='USER'&&o.last_updated==='2026-11-24T01:00:00.000Z','저장 — 그 칸 · updated_by · last_updated');
  const a=BT.split('\n'), c=M.text.split('\n'), diff=a.map((l,i)=>l===c[i]?null:i).filter(i=>i!==null);
  ok(a.length===c.length&&diff.length===3&&diff.every(i=>/"(furikomi|updated_by|last_updated)"/.test(c[i])),'나머지 줄 (바이트) 같음 — 바뀐 줄 = furikomi · updated_by · last_updated',diff.map(i=>c[i]));
  eq(Object.keys(o),['last_updated','records','cotecna','shipping'],'키 순서 · 새 키 0'); }
{ const M=DOC.ptMerge(BT,'NTEST-09','fd_note','テスト','U','Z'), e=JSON.parse(M.text).shipping['NTEST-09'];
  eq(Object.keys(e),['dep','furikomi','fd_date','fd_note','updated_by'],'새 Invoice = PORTAL 과 같은 모양'); ok(e.fd_note==='テスト'&&e.dep==='未','새 Invoice 기본값'); }
{ const M=DOC.ptMerge(BT,'NTEST-01','fd_note','メモ1','U','Z'); ok(!M.changed&&M.text===BT,'같은 값 = 쓰지 않음'); }
thr(()=>DOC.ptMerge(BT,'NTEST-01','dep','済','U','Z'),'DEP 선택지 밖 = 거부');
thr(()=>DOC.ptMerge(BT,'NTEST-01','furikomi','x','U','Z'),'振込 선택지 밖 = 거부');
thr(()=>DOC.ptMerge(BT,'NTEST-01','fd_date','11/24','U','Z'),'FD送付日 형식 = 거부');
thr(()=>DOC.ptMerge(BT,'NTEST-01','tsukan_irai',true,'U','Z'),'다른 키 = 거부');
thr(()=>DOC.ptMerge('{bad','NTEST-01','dep','確認','U','Z'),'깨진 JSON = 거부');
/* 문지기 */
ok(DOC.guardOut(PT.PATH,{portal:true,ifMatch:'"e1"'})===true&&DOC.guardOut(PT.TEST_PATH,{portal:true,ifMatch:'"e1"'})===true,'문지기 — PORTAL 파일 · 시험 사본 OK');
thr(()=>DOC.guardOut(PT.PATH,{portal:true}),'문지기 — eTag 없으면 거부');
thr(()=>DOC.guardOut('古紙/-. AI 活用/PORTAL/other.json',{portal:true,ifMatch:'x'}),'문지기 — 다른 PORTAL 파일 거부');
thr(()=>DOC.guardOut(PT.PATH),'문지기 — portal 표시 없이 PORTAL 파일 = 거부 (doc_tool 밖)');
thr(()=>DOC.guardOut('古紙/-. AI 活用/MASTER/master_staff.json',{portal:true,ifMatch:'x'}),'문지기 — MASTER 거부');

/* ── 2. 화면 (jsdom · 가짜 세계) ── */
function world16(){
  const W=X.world(), b0=W.bookings[0];
  W.regions[0].cr49f_region='VIETNAM'; W.pols[0].crcf9_pol='SAMPLE POL, JAPAN';
  W.carriers=[{crcf9_carrierid:X.g('5',1),crcf9_carrier:'TEST LINE'}]; W.bookings.forEach(b=>{ b._cr49f_carrier_id_value=X.g('5',1); b.cr49f_eta=null; });
  W.bookings[0].cr49f_eta=D(13); W.bookings[0].cr49f_cy_cut=D(1);
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',11),cr49f_invoice_no:'LAA2611-01',cr49f_booking_no:'TESTBK11',cr49f_etd:D(4),crcf9_bl_etd:D(4)}));   // 국내 전매
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',12),cr49f_invoice_no:'NAA2611-12',cr49f_booking_no:'TESTBK12',cr49f_etd:D(6),crcf9_bl_etd:D(6)}));   // FD送付日 있음
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',13),cr49f_invoice_no:'NAA2611-13',cr49f_booking_no:'TESTBK13',cr49f_etd:D(100),crcf9_bl_etd:null}));   // ETD 범위 밖 (+100)
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',14),cr49f_invoice_no:'NAA2611-14',cr49f_booking_no:'TESTBK14',cr49f_etd:D(-60),crcf9_bl_etd:D(-60)}));   // -60 = 안 보임
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',15),cr49f_invoice_no:'NAA2611-15',cr49f_booking_no:'TESTBK15',cr49f_etd:D(9),crcf9_bl_etd:D(9),cr49f_cy_cut:D(7)}));   // v0.17 (H1): 通関依頼 前 = 안 보임
  W.docStaff.push({iv_code:'cc',importer:'BUYER-C',staff:'STAFF_B'});   // 書類ツール = CC → STAFF_B · PORTAL = 대소문자 그대로 → 없음 (다르면 표시)
  W.content[PT.PATH]=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:{'NAA2611-01':{tsukan_irai:true,tsukan_status:'ED未'},'NBB2611-01':{tsukan_irai:true},'NAA2611-02':{tsukan_irai:true},'NCC2611-01':{tsukan_irai:true},'NAA2611-13':{tsukan_irai:true},'NAA2611-15':{tsukan_irai:false}},cotecna:{},
    shipping:{'NAA2611-01':{dep:'確認',furikomi:'未',fd_date:'',fd_note:'メモA',updated_by:'PORTAL USER'},'NAA2611-12':{dep:'未',furikomi:'確認済',fd_date:X.addDays(T,-1),fd_note:''},'NOTHER-01':{dep:'未',furikomi:'未',fd_date:'2026-10-01',fd_note:'そのまま'}}},null,2);
  W.etag={}; W.etag[PT.PATH]='"e0"';
  return W;
}
const sel=(w,iv,f)=>w.document.querySelector('[data-pt="'+iv+'"][data-f="'+f+'"]');
const change=async(w,el,v)=>{ el.value=v; el.dispatchEvent(new w.Event('change')); await X.until(()=>!el.isConnected||!el.disabled); await X.sleep(30); };
const ivList=w=>qa(w,'#dtTable tbody tr').map(tr=>tr.cells[5].textContent.replace(/LRS-.*$/,'').trim());

(async()=>{
  /* 2-1 기본 = PORTAL 과 같은 표 */
  let W=world16(), w=await X.page(W,{ls:{doc_tool_iv_mode_v16:'',doc_tool_who:'all'}});
  ok(w.document.getElementById('dtIvPortal').classList.contains('on')&&w.document.getElementById('dtEtdBox').style.display==='none'&&w.document.getElementById('dtHideFdBox').style.display==='none','기본 = 「PORTAL と同じ」 · ETD 범위 · FD済み 숨김');
  eq(qa(w,'#dtTable thead th').map(t=>t.textContent),PT.COLS.concat(['ACL','B/L Draft','保険','RR'],PT.INPUTS),'열 순서 = PORTAL 11 + 판정 4 + 입력 4');
  eq(ivList(w),['NBB2611-01','NAA2611-01','NAA2611-02','NCC2611-01','NAA2611-13'],'줄 = PORTAL 조건 (L · FD送付日 · -60 뺌 · ETD 범위 밖 +100 남김 · ETD 순) + v0.17 H1 通関依頼済 만 (NAA2611-15 = 통관 전 → 없음)');
  { const tr=qa(w,'#dtTable tbody tr')[1], c=[...tr.cells].map(x=>x.textContent.trim());
    if(!c[3]&&tr.cells[3].querySelector('input[data-ptts]:checked')) c[3]='✅';   // v0.26 (N17): 通関 = チェック (通関依頼済 = ✓)
    eq([c[0],c[1],c[2],c[3],c[4],c[6],c[7],c[8],c[9]],[DOC.ptDateS(D(3),T),DOC.ptDateS(D(13),T),DOC.ptDateS(D(1),T),'✅','SAMPLE POL','2','VIETNAM','TEST LINE','TESTBK1'],'열 값 — ETD · ETA · CY_CUT · 通関 · POL · BKG本 · CNTR · SHIP · BKG_NO');
    ok(/LRS-2611AA1/.test(tr.cells[5].querySelector('button').title)&&!/LRS/.test(c[5]),'계약번호 = IV_NO title (줄 아래 글씨 없음 · v0.16.1)');
    ok(sel(w,'NAA2611-01','dep').value==='確認'&&sel(w,'NAA2611-01','fd_note').value==='メモA','입력 칸 = PORTAL 값 (DEP 確認 · 備考)'); }
  ok(!sel(w,'NBB2611-01','dep')&&sel(w,'NBB2611-01','furikomi'),'DEP = 베트남만 선택 · 그 밖 —');
  { const tr=qa(w,'#dtTable tbody tr').find(t=>/NCC2611-01/.test(t.textContent)); ok(/PORTAL の担当者.*: —$/.test((tr.cells[10].querySelector('.pt-mk')||{}).title||''),'担当者 다르면 ＊ 표시만 (title = PORTAL 担当者 · v0.16.1)',tr.cells[10].innerHTML); }
  { const tr=qa(w,'#dtTable tbody tr').find(t=>/NAA2611-13/.test(t.textContent)); ok(tr&&!/読み込み中/.test(tr.textContent),'ETD 범위 밖 줄도 폴더 · 판정 칩 (읽기 끝)',tr&&tr.textContent); }
  /* v0.16.1 한 화면 — 창 폭 전체 · 1 줄 (줄 안에 div · br 없음) · 접는 열 표시 · 열 머리 고정 CSS */
  ok(w.document.getElementById('dtMain').classList.contains('pt-full')&&w.document.getElementById('dtTable').classList.contains('pt-wide'),'PORTAL 표 = 창 폭 전체 (pt-full · pt-wide)');
  ok(qa(w,'#dtTable tbody div, #dtTable tbody br').length===0,'모든 줄 = 1 줄 (칸 안 줄바꿈 0)');
  ok(!/min-width:1500px/.test(w.document.getElementById('dtTable').innerHTML)&&w.document.querySelector('#dtTable table').classList.contains('pt-t'),'표 최소폭 강제 없음');
  { const th=qa(w,'#dtTable thead th'); ok(th[1].classList.contains('c-eta')&&th[7].classList.contains('c-cntr')&&th[9].classList.contains('c-bkg'),'접는 열 표시 (ETA · CNTR · BKG_NO)'); }
  { const css=[...w.document.querySelectorAll('style')].map(x=>x.textContent).join(''); ok(/\.dt-t\.pt-t thead th\{position:sticky/.test(css)&&/\.dt-main\.pt-full\{max-width:none/.test(css)&&/\.pt-t \.pt-note\{width:120px\}/.test(css),'CSS — 열 머리 sticky · 창 폭 · 備考 120px'); }
  /* 접기 — jsdom 은 폭 계산이 없으므로 폭을 흉내: 표 1,400 px · 접을 때마다 -60 · 틀 1,335 px → ETA · CNTR 접음 (BKG_NO 는 남음) */
  { const t=w.document.getElementById('dtTable'), tb=t.querySelector('table'); Object.defineProperty(t,'clientWidth',{configurable:true,get:()=>1335}); Object.defineProperty(tb,'offsetWidth',{configurable:true,get:()=>1400-60*PT.FOLD.filter(c=>t.classList.contains(c)).length});
    w.eval('ptFit()'); ok(t.classList.contains('f-eta')&&t.classList.contains('f-cntr')&&!t.classList.contains('f-bkg'),'좁은 폭 → ETA → CNTR 순서로 접음 (넘침 없어지면 멈춤)',t.className);
    Object.defineProperty(t,'clientWidth',{configurable:true,get:()=>1900}); w.eval('ptFit()'); ok(!PT.FOLD.some(c=>t.classList.contains(c)),'넓은 폭 (1,920) → 아무것도 접지 않음'); delete t.clientWidth; delete tb.offsetWidth; }
  /* 提案 — NBB2611-01 = 폴더에 FD · FD送付日 빈칸 → 흐린 提案 · 쓰기 0 */
  { const b=w.document.querySelector('button[data-pt-prop="NBB2611-01"]'); ok(b&&/提案/.test(b.parentNode.textContent),'提案 표시 (TOOL 이 FD 를 찾음 · FD送付日 빈칸)');
    ok(W.writes.length===0,'열기만 = 쓰기 0 (提案 은 자동 저장 안 함)',W.writes.map(x=>x.method+' '+decodeURIComponent(x.url)));
    const before=W.content[PT.PATH]; b.click(); await X.until(()=>W.writes.length===1); await X.sleep(50);
    const o=JSON.parse(W.content[PT.PATH]); ok(o.shipping['NBB2611-01']&&o.shipping['NBB2611-01'].fd_date===b.dataset.date,'「入力」 → FD送付日 저장');
    ok(!ivList(w).includes('NBB2611-01'),'FD送付日 들어가면 줄에서 빠짐 (= FD 済)');
    const o0=JSON.parse(before); delete o.shipping['NBB2611-01']; o.last_updated=o0.last_updated; eq(o,o0,'다른 Invoice · 다른 칸 그대로');
    const wr=W.writes[0]; ok(wr.method==='PUT'&&decodeURIComponent(wr.url).indexOf(PT.PATH)>0&&!/conflictBehavior/.test(wr.url),'PUT = PORTAL 파일 (덮어쓰기 · If-Match)'); }
  /* 振込 · 備考 저장 = 그 칸만 · 바이트 */
  { const before=W.content[PT.PATH]; await change(w,sel(w,'NAA2611-01','furikomi'),'確認済');
    const a=before.split('\n'), c=W.content[PT.PATH].split('\n'), diff=a.map((l,i)=>l===c[i]?null:i).filter(i=>i!==null);
    ok(a.length===c.length&&diff.length===3&&diff.every(i=>/"(furikomi|updated_by|last_updated)"/.test(c[i])),'振込 저장 — 그 칸 (+ updated_by · last_updated) 만 · 나머지 바이트 같음',diff.map(i=>c[i]));
    ok(JSON.parse(W.content[PT.PATH]).shipping['NAA2611-01'].updated_by==='TEST USER','updated_by = 로그인한 사람 (PORTAL 과 같음)');
    await change(w,sel(w,'NAA2611-01','fd_note'),'テスト'); ok(JSON.parse(W.content[PT.PATH]).shipping['NAA2611-01'].fd_note==='テスト','備考 저장 (칸을 벗어날 때 = change)');
    const n=W.writes.length; await change(w,sel(w,'NAA2611-01','fd_note'),'テスト'); ok(W.writes.length===n,'같은 값 = 쓰지 않음'); }
  /* 동시 저장 흉내 (두 탭) — PUT 직전에 다른 사람이 다른 Invoice 저장 → 412 → 다시 읽고 1 번 재시도 → 둘 다 남음 */
  { let once=true; W.beforePut=async p=>{ if(!once) return; once=false; const o=JSON.parse(W.content[p]); o.shipping['NOTHER-02']={dep:'未',furikomi:'確認済',fd_date:'',fd_note:'別タブ'}; W.content[p]=JSON.stringify(o,null,2); W.etag[p]='"other1"'; };
    const p412=W.puts412||0; await change(w,sel(w,'NAA2611-02','furikomi'),'確認済'); W.beforePut=null;
    const o=JSON.parse(W.content[PT.PATH]); ok((W.puts412||0)===p412+1&&o.shipping['NOTHER-02']&&o.shipping['NOTHER-02'].fd_note==='別タブ'&&o.shipping['NAA2611-02'].furikomi==='確認済','412 → 재시도 1 번 → 두 저장 모두 남음'); }
  { W.beforePut=async p=>{ W.etag[p]='"other'+Math.random()+'"'; }; const t0=(w.__toasts||[]).length, n412=W.puts412||0; await change(w,sel(w,'NAA2611-02','fd_note'),'X'); W.beforePut=null;
    ok((W.puts412||0)===n412+2&&(w.__toasts||[]).slice(t0).some(m=>m===PT.CONFLICT)&&JSON.parse(W.content[PT.PATH]).shipping['NAA2611-02'].fd_note==='','두 번 412 → 「他の人が更新しました — もう一度」 · 바뀌지 않음'); }
  ok(W.writes.every(x=>x.method==='PUT'&&decodeURIComponent(x.url).indexOf(PT.PATH)>0&&x.url.indexOf('/content')>0),'쓰기 = PORTAL 파일 PUT 뿐',W.writes.map(x=>decodeURIComponent(x.url)));
  /* ETD 범위 버튼 = v0.15 표 */
  w.document.getElementById('dtIvEtd').click(); await X.sleep(30);
  ok(/^ETDInvoice契約国担当/.test(qa(w,'#dtTable thead th').map(t=>t.textContent).join(''))&&!w.document.getElementById('dtMain').classList.contains('pt-full')&&w.document.getElementById('dtEtdBox').style.display===''&&w.localStorage.getItem('doc_tool_iv_mode_v16')==='etd','「ETD 範囲で見る」 = v0.15 표 · 기억');
  w.document.getElementById('dtIvPortal').click(); await X.sleep(30); ok(qa(w,'#dtTable thead th').length===19,'다시 「PORTAL と同じ」');
  /* 담당 칩 — 자기 담당 (STAFF_A = AA) 만 */
  w.document.querySelector('#dtWho button[data-who="me"]').click(); await X.sleep(30);
  ok(ivList(w).every(iv=>/^NAA/.test(iv))&&ivList(w).length>0,'담당 칩 그대로 적용 (自分 = AA 만)',ivList(w));
  w.close();

  /* 2-2 試験モード (관리자) — 저장 = save_test 사본만 · 실파일 0 */
  W=world16(); W.content[PT.TEST_PATH]=W.content[PT.PATH]; W.etag[PT.TEST_PATH]='"t0"'; const real=W.content[PT.PATH];
  w=await X.page(W,{email:'boss@example.test',ls:{doc_tool_iv_mode_v16:'portal',doc_tool_who:'all',doc_tool_save_test:'1'}});
  ok(/試験モード/.test(w.document.getElementById('dtBoardNote').textContent),'試験モード 표시');
  await change(w,sel(w,'NAA2611-02','furikomi'),'確認済');
  ok(W.content[PT.PATH]===real&&JSON.parse(W.content[PT.TEST_PATH]).shipping['NAA2611-02'].furikomi==='確認済'&&W.writes.every(x=>decodeURIComponent(x.url).indexOf(PT.TEST_PATH)>0),'試験モード — 사본에만 · 실파일 바이트 그대로');
  w.close();
  /* 2-3 試験モード 인데 사본 없음 → 저장 안 함 (실파일로 넘어가지 않음) */
  W=world16(); w=await X.page(W,{email:'boss@example.test',ls:{doc_tool_iv_mode_v16:'portal',doc_tool_who:'all',doc_tool_save_test:'1'}});
  { const t0=(w.__toasts||[]).length; await change(w,sel(w,'NAA2611-02','furikomi'),'確認済'); ok(W.writes.length===0&&(w.__toasts||[]).slice(t0).some(m=>/試験用の写し/.test(m)),'사본 없음 → 쓰기 0 · 안내'); }
  w.close();
  /* 2-3b updated_by 가 없던 Invoice — 키 1 개 추가 (PORTAL 과 같은 모양) · 파싱하면 그 Invoice 말고 같음 · 문자 모양 = JSON.stringify(…, null, 2) 그대로 */
  W=world16(); w=await X.page(W,{ls:{doc_tool_iv_mode_v16:'portal',doc_tool_who:'all'}});
  { const o0=JSON.parse(W.content[PT.PATH]); await change(w,sel(w,'NAA2611-02','furikomi'),'確認済'); const o=JSON.parse(W.content[PT.PATH]);
    ok(W.content[PT.PATH]===JSON.stringify(o,null,2),'문자 모양 = PORTAL 과 같음 (2 칸 들여쓰기 · 키 순서)');
    eq(o.shipping['NAA2611-02'],{dep:'未',furikomi:'確認済',fd_date:'',fd_note:'',updated_by:'TEST USER'},'처음 Invoice = PORTAL 기본 모양');
    delete o.shipping['NAA2611-02']; o.last_updated=o0.last_updated; eq(o,o0,'나머지 그대로'); }
  w.close();
  /* 2-4 PORTAL 파일 없음 → 표 대신 안내 (쓰기 0) */
  W=world16(); delete W.content[PT.PATH]; w=await X.page(W,{ls:{doc_tool_iv_mode_v16:'portal',doc_tool_who:'all'}});
  ok(/clearance_status\.json\) がありません/.test(w.document.getElementById('dtTable').textContent)&&W.writes.length===0,'PORTAL 파일 없음 → 안내 · 쓰기 0',w.document.getElementById('dtTable').textContent.slice(0,200));
  w.close();
  /* 한글 0 (화면) */
  ok(!/[가-힣]/.test(DOC.PT.CONFLICT+PT.COLS.join('')+PT.INPUTS.join('')),'화면 글자 한글 0');

  console.log((fail?'FAIL':'PASS')+' v16 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v16 예외',e.stack); process.exitCode=1; });
