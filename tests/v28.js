/* v0.28 시험 (지시서 THOR_26 · 묶음 v0.21 U1 ~ U9 · N33 · N34 · 형님 추가 「오늘 날짜」) — 가짜 데이터 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v28.js [html]
   U2 열 순서 · Invoice / 契約 두 줄 · U3 표시 대응 (판정 그대로) · U4 要対応 = 今日やること 의 やること 줄 수 · U5 오른쪽 패널 (열기 · ← → · ⤢ · ✕ · URL) · U6 칩 색 · 同期 · U7 출처 · U8 契約 표 · U9 접는 띠 · 오늘 = 노랑 · N33 · N34 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z', PT_PATH='古紙/-. AI 活用/PORTAL/clearance_status.json';
const V=DOC.V28;
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.(?:2[89]|3[0-6](?:\.1)?)<\/title>/.test(HTML)&&/version:'0\.(?:2[89]|3[0-6](?:\.1)?)'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.28 · 푸터');

console.log('U3 표시 대응 (지금 판정 → 印 · 판정 변경 0)');
eq(Object.keys(DOC.ST).map(k=>[k,DOC.mark({s:k}).k,DOC.mark({s:k}).g]),[['done','ok','✓'],['todo','now','●'],['diff','ng','◆'],['wait','wait','◐'],['not','todo','○'],['na','na','―'],['unk','unk','?'],['load','load','…']],'ST 8 가지 → 印 (済 ✓ · 確認 ● · 相違 ◆ · 待ち ◐ · 未 ○ · — ― · ? · …)');
eq(DOC.mark({s:'diff', why:'B/L 相違'}).why,'B/L 相違','이유 = 지금 칩의 문장 그대로 (마우스)');
eq(V.ST_HEAD.map(s=>s[0]),['customs','acl','bl','depo','ins','rr','fd'],'단계 7 열 = 通関 ACL B/L DEP 保険 RR FD');

console.log('U6 담당 색 (목업 · B-06)');
eq([DOC.staffColor('大場 未由','X'),DOC.staffColor('朴 成旭','Y'),DOC.staffColor('朴　秀旻','Z')],['#f472b6','#34d399','#a78bfa'],'大場 · 朴 成旭 · 朴 秀旻 = 목업 색 (공백 무시)');
const ord=DOC.polStaffOrder([{pol:'TOKYO',staff:'S1',assist:'S2'},{pol:'*',staff:'S3'},{pol:'',staff:'S9'},{pol:'OSAKA',staff:'S1'}]);
eq(ord,['S1','S2','S3'],'B-06 setPolStaff 와 같은 순서 (担当 · 補助 · 빈 항구 제외)');
eq([DOC.staffColor('山田','S2',ord),DOC.staffColor('山田','S8',ord)],[V.B06_COLORS[1],V.STAFF_NONE],'그 밖 직원 = B-06 순서의 색 · 없으면 회색');

console.log('U2 · U4 순서');
const R=(etd,cut,i,due,rank)=>({key:{etd,cut,due:due==null?null:due,rank:rank==null?5:rank},i});
eq(DOC.sort28([R('2026-11-20','',0),R('',' ',1),R('2026-11-18','',2),R('2026-11-18','',3)],'etd').map(r=>r.i),[1,2,3,0],'ETD 순 = 지금 Invoice 別 (빈 ETD 먼저 · 같으면 원래 순서)');
eq(DOC.sort28([R('a','2026-11-25',0,5,2),R('b','2026-11-20',1,9,0),R('c','',2,null,3)],'due').map(r=>r.i),[1,0,2],'期限順 = 期限切れ → 今日 → 뒤 → 없음');
eq(DOC.sort28([R('a','2026-11-25',0),R('b','',1),R('c','2026-11-20',2)],'cut').map(r=>r.i),[2,0,1],'CY CUT 순 (빈 칸 뒤)');
const rq=DOC.reqSort([{iv:'B',group:'later',due:5,gkey:'fd'},{iv:'A',group:'late',due:null,gkey:'acl'},{iv:'C',group:'today',due:3,gkey:'acl'},{iv:'D',group:'none',due:null,gkey:'acl'}]);
eq(rq.map(r=>r.iv),['A','C','B','D'],'要対応 = 期限切れ (빨강 · 기한 없음 포함) → 今日 → 뒤 → 없음');
ok(DOC.hit28({iv:'NAA2611-01',ct:'LRS-2611AA1',bkg:'TESTBK1',lc:'TESTLC001',vessel:'SAMPLE VESSEL 001'},'testlc')&&DOC.hit28({vessel:'SAMPLE VESSEL'},'sample vessel')&&!DOC.hit28({iv:'X'},'Y'),'검색 하나 = Invoice · 契約 · BKG · L/C · 本船 (대소문자 · 공백 무시)');
eq(DOC.hashParse(DOC.hashOf('iv','NAA2611-01','acl')),{kind:'iv',id:'NAA2611-01',tab:'acl'},'URL #iv=…&tab=… 왕복');
eq(DOC.hashParse('#ct=abc-1'),{kind:'ct',id:'abc-1',tab:''},'#ct=… (계약)'); eq(DOC.hashParse('#x=1'),null,'다른 # = 무시');

console.log('N33 依頼者名 · N34 LG 件名');
eq([DOC.lgPerson({name_en:'Sm Park',name_en_full:'SUMIN PARK'}),DOC.lgPersonNeed({name_en_full:'SUMIN PARK'})],['SUMIN PARK',false],'name_en_full 이 있으면 그대로 · 確認 없음');
eq([DOC.lgPerson({name_en:'Lee  Juah'}),DOC.lgPersonNeed({name_en:'Lee Juah'})],['LEE JUAH',true],'없으면 name_en 대문자 + 確認');
const vals=DOC.lgValues({cells:{person:'A37'}, blocks:[], today:'2026-11-26', person:'LEE JUAH', personNeed:true});
ok(vals.person.need===true&&DOC.lgValues({cells:{person:'A37'}, blocks:[], today:'2026-11-26', person:'SUMIN PARK'}).person.need===false,'依頼者名 칸 = name_en 대신이면 확인 표시 · full 이면 없음');
eq(DOC.lgHead28({bl:'TESTBL01',bkg:'TESTBK1',vessel:'SAMPLE  VESSEL S001',iv:'naa2611-01'}),'[LG付き訂正依頼:BL#TESTBL01] SAMPLE VESSEL S001 / NAA2611-01','머리 = [LG付き訂正依頼:BL#B/L] 本船 航海 / Invoice');
eq(DOC.lgHead28({bkg:'TESTBK1',iv:'NAA2611-01'}),'[LG付き訂正依頼:BL#TESTBK1] / NAA2611-01','B/L 없으면 BKG');
const patNew={mail:{mode:'new',subj:'[LG訂正依頼]BKG#{BKG}',to:['lg@carrier.example.test'],cc:[],body:['x'],att:'LG({BL}).xlsx'}}, patRe={mail:{mode:'reply',subj:'[LG付き訂正依頼:{BL}]',to:[],cc:[],body:['x'],att:'LG({BL}).xlsx'}};
const d1=DOC.lgMailDraft({pat:patNew, carrier:'SAMPLE', iv:'NAA2611-01', bl:'TESTBL01', bkg:'TESTBK1', vessel:'SAMPLE VESSEL S001', att:'NAA2611-01_LG.xlsx'});
const d2=DOC.lgMailDraft({pat:patRe, carrier:'SAMPLE', iv:'NAA2611-01', bl:'TESTBL01', bkg:'TESTBK1', vessel:'SAMPLE VESSEL S001', src:{id:'m1',subj:'RE: B/L DRAFT TESTBL01'}, att:'NAA2611-01_LG.xlsx'});
eq([d1.subject,d2.subject],['[LG付き訂正依頼:BL#TESTBL01] SAMPLE VESSEL S001 / NAA2611-01','[LG付き訂正依頼:BL#TESTBL01] SAMPLE VESSEL S001 / NAA2611-01 Re: B/L DRAFT TESTBL01'],'모든 선사 = 같은 머리 (선사 실적 태그 대신) · 답장 = 같은 머리 + 「 Re: 원래 제목」');
ok(!d1.block&&!d2.block,'첨부 번호 검사 통과',[d1.block,d2.block]);
ok(/subj:/.test(HTML)&&/patterns\.json/.test(HTML),'patterns.json (선사별 태그) 은 지우지 않음 — 읽기 그대로');

console.log('화면 (가짜 세계 · 처음 화면 = 표 하나)');
const W=X.world();
W.bookings[0].cr49f_cy_cut=D(0); W.bookings[1].cr49f_cy_cut=D(5);
const rec={}; W.bookings.forEach(b=>{ rec[b.cr49f_invoice_no]={tsukan_irai:true, tsukan_irai_at:D(-1)}; });
W.content[PT_PATH]=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:rec,cotecna:{},shipping:{}},null,2);
const w=await X.page(W,{first:true, ls:{doc_tool_who:'all'}}); const d=w.document, ev=s=>w.eval(s);
await X.until(()=>ev('TODO.mailSt')==='ok'||ev('TODO.mailSt')==='error',20000).catch(()=>{}); await X.sleep(400); ev('render()'); await X.sleep(100);
eq(ev('S.board'),'main','처음 화면 = 표 하나 (Invoice)');
ok(!d.getElementById('dtBTodo').offsetParent&&d.getElementById('dtBTodo').hidden,'「今日やること」 버튼 없음 (표로 합침)');
eq([...d.querySelectorAll('#dtTable thead th')].map(t=>t.textContent),['','ETDC','ETAC','CY CUTC','POLC','Invoice · 契約C','BKGC','船社 · 本船C','担当','通関','ACL','B/L','DEP','保険','RR','FD','次にやることM','振込P','FD送付日P','備考P'],'U2 열 순서 = 목업 ① (v0.29 U10: ETD 맨 왼쪽) · U7 출처 C · M · P');
const rows=[...d.querySelectorAll('#dtTable tbody tr.v8-r')]; ok(rows.length>=3,'줄이 있음',rows.length);
const ivc=rows[0].querySelector('td.v8-iv'); ok(ivc&&ivc.querySelector('.dt-link')&&ivc.querySelector('.v8-ct'),'Invoice · 契約 = 두 줄 (위 Invoice · 아래 契約)');
ok(/\.v8-iv \.dt-link\{display:block;[^}]*white-space:nowrap/.test(HTML)&&/\.v8-ct\{display:block;[^}]*white-space:nowrap/.test(HTML),'두 줄 고정 (nowrap)');
/* U3 — 표의 印 = 그 Invoice 의 지금 판정 */
const mk=ev(`(()=>{ const out=[]; document.querySelectorAll('#dtTable tbody tr.v8-r[data-row=iv]').forEach(tr=>{ const b=S.bk.concat(S.pbk||[]).find(x=>DOC.up(x.cr49f_invoice_no)===tr.dataset.id); if(!b) return; const c=ivRow(b).cells;
  const got=[...tr.querySelectorAll('td.v8-s .mk')].map(m=>m.className.replace(/.*mk-(\\w+).*/,'$1')), want=DOC.V28.ST_HEAD.filter(([k])=>!(k==='customs'&&tr.querySelector('input.pt-ts'))).map(([k])=>DOC.mark(c[k]).k);   /* v0.29 (U13): 通関 = チェック 1 つ */ out.push([tr.dataset.id, got.join(','), want.join(',')]); }); return out; })()`);
ok(mk.length&&mk.every(x=>x[1]===x[2]),'U3 印 = ivRow 판정 그대로 (모든 줄)',mk);
/* U4 — 要対応 = 今日やること の やること 의 줄 수 */
const nReq=+d.getElementById('dtTodo').textContent.replace(/\D/g,''), nDo=ev('todoRows().filter(v8Vis()).filter(DOC.reqRow).length');   /* v0.29 (U11): やること + 催促 */
eq(nReq,nDo,'要対応のみ n = 今日やること 「やること」 줄 수 (같은 조건)');
ev('S.board="todo"; render()'); await X.sleep(50);
const oldDo=d.querySelectorAll('#dtTodoBox .tl-z-do .tl-rows .tl-row').length; ev('S.board="main"; render()'); await X.sleep(50);
eq(nReq,oldDo,'옛 今日やること 화면 (같은 데이터) 의 やること 줄 수와 같음');
d.getElementById('dtTodo').click(); await X.sleep(50);
eq(d.querySelectorAll('#dtTable tbody tr.v8-r').length,nReq,'要対応のみ 를 누르면 그 줄만');
eq(d.getElementById('dtSort').value,'due','要対応 = 期限順');
const bands=[...d.querySelectorAll('#dtTable tbody tr.v8-r td.v8-bd')].map(t=>t.className.replace('v8-bd','').trim());
ok(bands.every(b=>b===''||/^b-(late|today|soon)$/.test(b)),'왼쪽 기한 띠 = late · today · soon',bands);
d.getElementById('dtAll').click(); await X.sleep(50);
ok(ev('(()=>{ const R=v8Compute(); return R.all.length+R.far.length; })()')===+d.getElementById('dtAll').textContent.replace(/\D/g,''),'すべて n = 표의 줄 수 (v0.29: その先 畳んだ行 포함)');
/* 오늘 = 노랑 */
const todayCell=[...d.querySelectorAll('#dtTable td[data-c=cut] .v8-today')]; ok(todayCell.length>=1&&/\.v8-today\{background:var\(--v8-today-bg\)!important;color:var\(--v8-today-fg\)!important/.test(HTML),'오늘인 CY CUT 칸 = 노란 바탕 · 검은 굵은 글자',todayCell.length);
ok(!d.querySelector('#dtTable td[data-c=etd] .v8-today')||ev('S.bk.some(b=>DOC.ptEtd(b)===v8Today())'),'오늘이 아닌 칸은 그대로');
ok(/^今日 \d\d\/\d\d（[日月火水木金土]）$/.test(d.getElementById('dtToday').textContent),'머리줄 「今日 MM/DD（曜）」',d.getElementById('dtToday').textContent);
eq(ev('v8Today()'),ev('DOC.dayOf(DOC.jst(new Date().toISOString()))'),'오늘 = 일본 시간');
/* U6 · U9 */
ok(/^✓ 同期 \d\d:\d\d（COMPASS · メール · PORTAL）$/.test(d.getElementById('dtSync').textContent),'「✓ 同期 HH:MM（COMPASS · メール · PORTAL）」',d.getElementById('dtSync').textContent);
ok(d.getElementById('dtProg').hidden,'긴 「読み込み完了 — …」 = 숨김 (「？」 안)');
const chip=[...d.querySelectorAll('#dtWho button')].find(b=>b.dataset.who==='STAFF_A'); ok(chip&&chip.querySelector('.v8-dot'),'담당자 칩 = 색 점');
ok(d.getElementById('dtSvFold')&&d.getElementById('dtSvBody').hidden,'保存の入口 = 접는 띠 (처음 닫힘)');
d.getElementById('dtSvFold').click(); await X.sleep(20); ok(!d.getElementById('dtSvBody').hidden&&w.localStorage.getItem(V.FOLD_KEY)==='1','누르면 지금 목록 · 기억');
ok(/表示:/.test(d.getElementById('dtInbox').textContent)&&/出所:/.test(d.getElementById('dtInbox').textContent),'범례 한 줄 (印 · 출처)');
d.getElementById('dtColsBtn').click(); await X.sleep(20); const cb=d.querySelector('#dtColsMenu input[data-col=eta]'); cb.checked=false; cb.dispatchEvent(new w.Event('change')); await X.sleep(20);
ok(d.getElementById('dtTable').classList.contains('v8-h-eta')&&JSON.parse(w.localStorage.getItem(V.COLS_KEY)).indexOf('eta')>=0,'☰ 列 = 열 숨기기 · 그 PC 기억');
const q=d.getElementById('dtQ'); q.value='NBB'; q.dispatchEvent(new w.Event('input')); await X.sleep(300);
const qr=[...d.querySelectorAll('#dtTable tbody tr.v8-r')].map(t=>t.dataset.id); ok(qr.length>=1&&qr.every(x=>/NBB/.test(x)),'검색 = 표를 거름',qr);
q.value=''; q.dispatchEvent(new w.Event('input')); await X.sleep(300);
/* 입력 저장 = 지금과 같은 방식 (칸 단위 · eTag) */
{ const fx=[...d.querySelectorAll('#dtTable button[data-ptfix$="|furikomi"]')][0]; ok(!!fx&&!d.querySelector('#dtTable select[data-f=furikomi]'),'v0.34 (N58): 振込 = 字 + 「直す」 (처음엔 고르는 칸 없음)'); fx.click(); await X.sleep(150); }
const n0=W.writes.length, sel=[...d.querySelectorAll('#dtTable select[data-f=furikomi]')][0]; const ivS=sel.dataset.pt; sel.value='確認済'; sel.dispatchEvent(new w.Event('change')); await X.sleep(300);
const wr=W.writes.slice(n0); ok(wr.length===1&&/clearance_status\.json/.test(decodeURIComponent(wr[0].url)),'振込 저장 = PORTAL 같은 파일 1 번',wr.map(x=>x.method+' '+decodeURIComponent(x.url)));
const saved=JSON.parse(W.content[PT_PATH]); eq(saved.shipping[ivS]&&saved.shipping[ivS].furikomi,'確認済','그 Invoice 그 칸만');
/* U5 오른쪽 패널 */
const tr=[...d.querySelectorAll('#dtTable tbody tr.v8-r[data-row=iv]')][0], iv0=tr.dataset.id; tr.querySelector('td[data-c=pol]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
await X.until(()=>ev('S.view')==='iv'&&ev('S.cur&&S.cur.iv')===iv0,5000); await X.sleep(200);
ok(d.getElementById('dtMain').classList.contains('v8-split')&&!d.getElementById('dtSide').hidden,'줄을 누르면 오른쪽 패널 · 왼쪽 좁은 목록');
ok(d.querySelector('#dtSide .v8-sr.on')&&/v8-sr on/.test(d.querySelector('#dtSide .v8-sr.on').className),'고른 줄 표시');
ok(/^#iv=/.test(w.location.hash)&&w.location.hash.indexOf(encodeURIComponent(iv0))>0,'URL #iv=…',w.location.hash);
ok(d.getElementById('dtIvHead').textContent.indexOf(iv0)===0&&d.querySelector('#dtIvHead [data-v8close]')&&d.querySelector('#dtIvHead [data-v8full]'),'머리 = Invoice … + ← → ⤢ ✕');
ok(d.querySelector('#dtIvTabs .mk'),'단계 탭 = 같은 印');
const tb=[...d.querySelectorAll('#dtIvTabs button')].find(b=>b.dataset.tab==='log'); tb.click(); await X.sleep(100); ok(/tab=log/.test(w.location.hash),'탭을 바꾸면 URL 도',w.location.hash);
const L=ev('V8.last.filter(o=>o.kind==="iv").map(o=>o.id)'), i0=L.indexOf(iv0);
d.querySelector('#dtIvHead [data-v8nav="1"]').click(); await X.until(()=>ev('S.cur&&S.cur.iv')!==iv0,5000).catch(()=>{}); await X.sleep(100);
eq(ev('S.cur.iv'),ev('V8.last')[ev('V8.last').findIndex(o=>o.kind+":"+o.id==="iv:"+iv0)+1].id,'→ = 다음 줄');
d.querySelector('#dtIvHead [data-v8nav="-1"]').click(); await X.until(()=>ev('S.cur&&S.cur.iv')===iv0,5000).catch(()=>{}); eq(ev('S.cur.iv'),iv0,'← = 앞 줄');
d.querySelector('#dtIvHead [data-v8full]').click(); ok(d.getElementById('dtMain').classList.contains('v8-full'),'⤢ = 전체 화면');
d.querySelector('#dtIvHead [data-v8close]').click(); await X.sleep(50);
ok(ev('S.view')==='list'&&!d.getElementById('dtMain').classList.contains('v8-split')&&w.location.hash==='','✕ = 표로 · URL 지움');
const stb=d.querySelector('#dtTable tbody tr.v8-r[data-row=iv] button.mk[data-tab]'); if(stb){ const t0=stb.dataset.tab; stb.click(); await X.until(()=>ev('S.view')==='iv'&&ev('S.curTab')===t0,5000).catch(()=>{}); await X.sleep(100); eq(ev('S.curTab'),t0,'단계 칸을 누르면 그 탭'); d.querySelector('#dtIvHead [data-v8close]').click(); await X.sleep(30); }
/* U8 契約 */
d.getElementById('dtBCt').click(); await X.sleep(100);
eq(ev('S.board'),'ctt','契約 탭'); ok(d.querySelector('#dtTable table.v8-t')&&[...d.querySelectorAll('#dtTable thead th')].map(t=>t.textContent).join('|').indexOf('L/C|S/I')>0,'契約 = 같은 모양의 표 (L/C · S/I 印)');
const ctr=d.querySelector('#dtTable tbody tr.v8-r[data-row=ct]'); ok(ctr,'1 줄 = 1 계약'); ctr.querySelector('td[data-c=country]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
await X.until(()=>ev('S.view')==='ct'&&!!w.location.hash,8000).catch(()=>{}); await X.sleep(100); ok(ev('S.view')==='ct'&&/^#ct=/.test(w.location.hash)&&d.getElementById('dtCtHead').textContent.length>0,'契約 줄 → 오른쪽 패널 (#ct=…)');
d.querySelector('#dtCtHead [data-v8close]').click(); await X.sleep(30); d.getElementById('dtBIv').click(); await X.sleep(30);
ok(w.localStorage.getItem(V.BOARD_KEY)==='main','고른 탭 기억 (새 키)');
/* 메일 보내기 0 · 쓰기 범위 */
ok(!W.req.some(r=>/sendMail|\/send$/.test(r)),'메일 보내기 0');
ok(W.writes.every(x=>/clearance_status\.json|doc_tool\//.test(decodeURIComponent(x.url))),'쓰기 = PORTAL 같은 파일 (저장한 칸) · doc_tool 기록만',W.writes.map(x=>decodeURIComponent(x.url).slice(-60)));

console.log('URL 로 열기 (새로 고쳐도 같은 곳)');
const W2=X.world(); const w2=await X.page(W2,{first:true, url:'#iv=NAA2611-01&tab=log', ls:{doc_tool_who:'all'}});
await X.until(()=>w2.eval('S.view')==='iv'&&w2.eval('S.curTab')==='log',8000).catch(()=>{}); eq([w2.eval('S.view'),w2.eval('S.cur&&S.cur.iv'),w2.eval('S.curTab')],['iv','NAA2611-01','log'],'#iv=NAA2611-01&tab=log → 그 Invoice 의 그 탭');

console.log('\n'+(fail?'FAIL':'PASS')+' v28 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v28 ERR',e.stack); process.exit(1); });
