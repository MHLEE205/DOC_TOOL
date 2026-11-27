/* v0.29 시험 (지시서 THOR_27 · 묶음 v0.24 U10 ~ U14 · N35 · N36 · 추가 지시 1 (N35 입금 단계) · 2 (운임 송금 ③)) — 가짜 데이터 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v29.js [html]
   U10 ETD 맨 왼쪽 · 순서 · 契約 표 · 패널 / U11 要対応 = やること + 催促 / U12 국내 0 / U13 通関 체크 하나 / U14 FD 済 빠짐 · +14 일 · 접힘 · 접힌 줄 폴더 읽기 0 · CY CUT 칸 없음 / N35 바이어 남김 · 입금 단계 · 下書き / 送金 ③ 手入力 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z', PT_PATH='古紙/-. AI 活用/PORTAL/clearance_status.json', W9=DOC.V29;
const J=iso=>DOC.jst(iso);
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.(?:29|3[0-5](?:\.1)?)<\/title>/.test(HTML)&&/version:'0\.(?:29|3[0-5](?:\.1)?)'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.29 · 푸터');

console.log('U14 보이는 범위 (순수)');
const z=(etd,fd,obl)=>DOC.v29Zone({etd, fd, obl, today:'2026-11-26'});
eq([z('2026-08-01',''),z('2026-11-25',''),z('2026-11-26',''),z('2026-12-10',''),z('2026-12-11',''),z('',''),z('2026-11-01','2026-11-05'),z('2026-12-20','2026-11-05'),z('2026-11-01','2026-11-05',true)],
  ['past','past','near','near','far','near','','','past'],'지난 ETD = 남음 (아래 끝 없음) · 오늘 ~ +14 = 펼침 · +15 = 접힘 · ETD 없음 = 펼침 · FD送付日 = 빠짐 · N35 = FD 있어도 남음');

console.log('U11 要対応 = やること + 催促');
eq([{zone:'do'},{zone:'wait',group:'chase'},{zone:'wait',group:'wait'},null].map(DOC.reqRow),[true,true,false,false],'do · 催促 = 要対応 · 그냥 待ち 아님');
ok(W9.CHASE==='催促: ','「次にやること」 = 「催促: …」');
ok(DOC.bandOf('chase')===''&&DOC.bandOf('late')==='late','催促 줄 왼쪽 띠 = v0.34 (N57) 없음 · 빨강 (期限切れ) 만');

console.log('U12 국내 (규칙 한 곳)');
eq([DOC.isDomestic({iv:'LTO2611-01'}),DOC.isDomestic({iv:'NAA2611-01',ct:'LS-2611AA1'}),DOC.isDomestic({iv:'NAA2611-01',carrier:'国内転売'}),DOC.isDomestic({iv:'NAA2611-01',pod:'国内転売'}),DOC.isDomestic({iv:'NAA2611-01',carrier:'SAMPLE LINE'})],[true,true,true,true,false],'L 시작 · LS- · 船社 / POD 「国内転売」 = 국내 · 보통 = 아님');

console.log('U10 契約 ETD');
eq([DOC.ctEtd([{etd:'2026-11-01'},{etd:'2026-12-05'},{etd:'2026-12-01'}],'2026-11-26'),DOC.ctEtd([{etd:'2026-11-01'},{etd:'2026-10-01'}],'2026-11-26'),DOC.ctEtd([],'2026-11-26')],['2026-12-01','2026-11-01',''],'아직 안 나간 제일 이른 ETD · 다 나갔으면 마지막 ETD · 없으면 빈칸');

console.log('N35 OBL → 入金 → SWB (순수)');
const ds=[{iv_code:'RA',importer:'R. A.',obl_then_swb:true},{iv_code:'DD',importer:'DDT',obl_then_swb:'true'},{iv_code:'AA',importer:'X'}];
eq([DOC.oblFlow('NRA2610-01',ds),DOC.oblFlow('NDD2608-01',ds),DOC.oblFlow('NAA2611-01',ds),DOC.oblFlow('NRE2611-01',ds)],[true,true,false,false],'doc_staff obl_then_swb (RA · DD) 만');
const now=J('2026-11-26T03:00:00Z'), fdT=J('2026-11-05T09:00:00Z'), Sg={fd:fdT};
const base={obl:true, iv:'NRA2610-01', carrier:'SAMPLE LINE', files:[], mails:[]};
const r1=DOC.swbRow(base,Sg,now,null);
ok(r1&&r1.what===W9.SWB.wait&&r1.zone==='wait'&&r1.gkey==='w_buyer'&&r1.due==null&&!r1.nudge&&r1.stage===9,'① 着金日 없음 = ◐ 入金待ち（SWB 切替前） · 기한 · 재촉 없음',r1);
ok(DOC.todoGroup(r1,now)==='wait'&&!DOC.reqRow(Object.assign({},r1,{group:DOC.todoGroup(r1,now)})),'入金待ち = 要対応 아님 (회색 · 待ち)');
const r2=DOC.swbRow(Object.assign({},base,{paid:'2026-11-17T00:00:00Z'}),Sg,now,null);
ok(r2&&r2.what===W9.SWB.req&&r2.zone==='do'&&r2.gkey==='swb'&&r2.stage===10&&/着金 11\/17/.test(r2.why)&&r2.dueText==='着金 11/17','② 着金日 있음 = ● SWB 切替を依頼 (요対応)',r2);
const reqM={t:J('2026-11-19T00:22:52Z'), subj:'[BL TYPE変更依頼]BL#TESTBL9', skind:'staff', uses:[]};
const r3=DOC.swbRow(Object.assign({},base,{paid:'2026-11-17T00:00:00Z', mails:[reqM]}),Sg,now,null);
ok(r3&&r3.what===W9.SWB.sent&&r3.zone==='wait'&&r3.gkey==='w_carrier'&&r3.stage===11&&r3.nudge,'③ 依頼 메일 = ◐ SWB 切替 依頼済（船社待ち） (재촉 시간 있음)',r3);
ok(DOC.swbRow(Object.assign({},base,{mails:[{t:J('2026-07-15T04:10:15Z'),subj:'[BL TYPE訂正依頼:TESTBL9]',skind:'staff',uses:[]}]}),Sg,now,null).stage===11,'옛 제목 [BL TYPE訂正依頼:…] 도 依頼');
const ack={t:J('2026-11-19T01:49:23Z'), subj:'Re: [BL TYPE変更依頼]BL#TESTBL9', skind:'carrier', uses:[]};
ok(DOC.swbRow(Object.assign({},base,{paid:'2026-11-17', mails:[reqM,ack]}),Sg,now,null).stage===11,'선사의 「承知」 답장 = 아직 끝 아님');
const done=[{t:J('2026-11-20T01:00:00Z'), subj:'SWB is Ready for Print BL#TESTBL9', skind:'carrier', uses:[]},{t:J('2026-11-20T01:00:00Z'), subj:'【SWB発行完了】TESTBL9', skind:'carrier', uses:[]}];
ok(done.every(m=>DOC.swbRow(Object.assign({},base,{paid:'2026-11-17', mails:[reqM,m]}),Sg,now,null)===null),'④ SWB 발행 메일 = ✓ 끝 (줄 없음)');
ok(DOC.swbRow(Object.assign({},base,{paid:'2026-11-17', mails:[reqM,{t:J('2026-11-20T01:00:00Z'),subj:'RE: [SWB発行一時保留依頼]BL#TESTBL9',skind:'carrier',uses:[]}]}),Sg,now,null).stage===11,'「保留」 메일 = 끝 아님');
ok(DOC.swbRow(Object.assign({},base,{files:[{name:'NRA2610-01_SWB.pdf'}]}),Sg,now,null)===null&&DOC.swbRow(Object.assign({},base,{files:[{name:'NRA2610-01_OBL.pdf'}]}),Sg,now,null).stage===9,'④ 폴더 SWB 사본 = ✓ 끝 · OBL 만 = 남음');
ok(['NRA2608-02_SURRENDER.PDF','NRA2608-03_Surrendered BL.pdf','NRA2608-02_Telex Release Acknowledgement BL.PDF','NRA2608-21_SWB.pdf'].every(n=>DOC.swbRow(Object.assign({},base,{files:[{name:n}]}),Sg,now,null)===null)&&DOC.swbRow(Object.assign({},base,{files:[{name:'LG(TESTBL9)SWB.pdf'},{name:'NRA2610-01_DRAFT SWB.pdf'}]}),Sg,now,null).stage===9,'④ 폴더 Surrender · Telex Release · SWB = 끝 · LG · DRAFT 파일 = 아님 (실자료 이름)');
ok(DOC.swbRow(Object.assign({},base,{paid:'2026-11-17', mails:[reqM,{t:J('2026-11-19T05:00:00Z'),subj:'[Surrendered B/L for NRA2608-03] Re: PAYMENT',skind:'staff',uses:[]}]}),Sg,now,null)===null&&DOC.swbRow(Object.assign({},base,{paid:'2026-11-25', mails:[{t:J('2026-11-26T07:40:39Z'),subj:'[SWB for NRA2608-21] Re: PYMT',skind:'staff',uses:[]}]}),Sg,now,null)===null,'④ 담당 → 바이어 「SWB / Surrendered B/L for …」 = 끝 (실자료 제목)');
ok(DOC.swbRow(Object.assign({},base,{paid:'2026-11-17', mails:[{t:J('2026-11-25T09:05:29Z'),subj:'[BLTYPE変更依頼] BKG NO.JP01227218',skind:'staff',uses:[]}]}),Sg,now,null).stage===11,'依頼 = [BLTYPE変更依頼] (띄어쓰기 없음) 도');
ok(DOC.swbRow(Object.assign({},base,{obl:false}),Sg,now,null)===null&&DOC.swbRow(base,{fd:null},now,null)===null,'보통 바이어 · FD 전 = SWB 단계 없음');
ok(DOC.swbRow(Object.assign({},base,{paid:'2026-11-27'}),Sg,now,null).stage===9,'앞날 着金日 = 아직 入金待ち');
ok(!/入金確認/.test(HTML.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'')),'「入金確認」 버튼 없음 (COMPASS 값만 씀)');
ok(/crcf9_payment_date/.test((HTML.match(/const BK_SEL='[^']*'/)||[''])[0]),'着金日 = 부킹 $select 에 crcf9_payment_date');

console.log('送金 ③ 振込 確認済 (手入력)');
const sx=o=>Object.assign({iv:'NAA2611-01', carrier:'SAMPLE LINE', term:'CIF', pay:'TT', country:'INDONESIA', files:[{name:'NAA2611-01_DRAFT.pdf', lastModified:'2026-11-20T01:00:00Z'}], mails:[], portal:{furi:'確認済'}, now}, o||{});
const sig=x=>DOC.todoSignals(x), row=x=>DOC.todoRow(x,sig(x),now,null);
const a=row(sx()); ok(a&&a.gkey==='blreq'&&a.payManual&&/手入力/.test(a.why)&&a.due==null&&a.dueText==='手入力','③ 支払日 · 振込明細 없음 + 振込 確認済 + Draft = B/L 発行依頼 (手入力 · 기한 없음)',a);
const b1=row(sx({payDate:'2026-11-24'})); ok(b1&&b1.gkey==='blreq'&&!b1.payManual&&b1.due==null&&b1.soon&&/送金 11\/24/.test(b1.why),'① COMPASS 支払日 있음 = B/L 発行依頼 · v0.30 기한 = ETD (여기는 ETD 없음)',b1);
{ const b2=row(sx({payDate:'2026-11-24', etd:'2026-11-28'})); ok(DOC.dayOf(b2.due)==='2026-11-28'&&DOC.hmOf(b2.due)==='00:00'&&b2.untilEtd==='by','v0.30 기한 = ETD 당일 0:00 부터 빨강',b2); }
const c1=row(sx({portal:{furi:'未'}})); ok(c1&&c1.gkey==='draft'&&/運賃送金/.test(c1.what),'振込 未 · 支払日 없음 = Draft 확인 → 運賃送金 (그대로)',c1);
const d1=row(sx({files:[]})); ok(!d1||d1.gkey!=='blreq','Draft 없으면 ③ 쓰지 않음',d1);

console.log('화면 (가짜 세계)');
const W=X.world();
W.docStaff.push({iv_code:'RA',importer:'R. A.',staff:'STAFF_A',obl_then_swb:true});
W.carriers=[{crcf9_carrierid:'11111111-0000-0000-0000-000000000001',crcf9_carrier:'SAMPLE LINE'},{crcf9_carrierid:'11111111-0000-0000-0000-000000000002',crcf9_carrier:'国内転売'}];
const bk=(n,iv,etd,extra)=>Object.assign({cr49f_bookingid:'eeeeeeee-0000-0000-0000-0000000009'+String(n).padStart(2,'0'),cr49f_invoice_no:iv,cr49f_booking_no:'TESTBK9'+n,cr49f_bl_number:'TESTBL9'+n,cr49f_etd:etd,crcf9_bl_etd:etd,cr49f_main_ship_name:'SAMPLE VESSEL 9'+n,_cr49f_sale_contract_id_value:W.contracts[0].cr49f_sale_contractid,_cr49f_region_id_value:W.regions[2].cr49f_regionid,_cr49f_region_japan_id_value:W.pols[0].crcf9_region_japanid,_cr49f_carrier_id_value:'11111111-0000-0000-0000-000000000001',crcf9_insurance_premiums:null,modifiedon:'2026-11-01T00:00:00Z'},extra||{});
W.bookings.push(bk(1,'NAA2611-03',D(20)), bk(2,'NAA2611-04',D(-40)), bk(3,'NAA2611-05',D(-10)), bk(4,'NRA2610-01',D(-34)), bk(5,'NRA2608-03',D(-50),{crcf9_payment_date:D(-9)}), bk(6,'LTO2611-01',D(2)), bk(7,'NAA2611-06',D(4),{_cr49f_carrier_id_value:'11111111-0000-0000-0000-000000000002'}));
const rec={}, shp={}; W.bookings.forEach(b=>{ rec[b.cr49f_invoice_no]={tsukan_irai:true, tsukan_irai_at:D(-60)}; });
shp['NAA2611-05']={dep:'未',furikomi:'未',fd_date:X.addDays(T,-3),fd_note:''}; shp['NRA2610-01']={dep:'未',furikomi:'未',fd_date:X.addDays(T,-20),fd_note:''}; shp['NRA2608-03']={dep:'未',furikomi:'未',fd_date:X.addDays(T,-40),fd_note:''};
W.content[PT_PATH]=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:rec,cotecna:{},shipping:shp},null,2);
const w=await X.page(W,{first:true, ls:{doc_tool_who:'all'}}); const d=w.document, ev=s=>w.eval(s);
await X.until(()=>ev('TODO.mailSt')==='ok'||ev('TODO.mailSt')==='error',20000).catch(()=>{}); await X.until(()=>/読み込み完了/.test(ev('S.doneMsg')||''),20000).catch(()=>{}); await X.sleep(400); ev('render()'); await X.sleep(100);
eq(ev('S.board'),'main','처음 화면 = 표');
const heads=[...d.querySelectorAll('#dtTable thead th')].map(t=>t.textContent);
eq(heads.slice(1,6),['ETDC','ETAC','CY CUTC','POLC','Invoice · 契約C'],'U10 열 순서 = ETD · ETA · CY CUT · POL · Invoice/契約 (ETD 맨 왼쪽)');
const ids=()=>[...d.querySelectorAll('#dtTable tbody tr.v8-r[data-row=iv]')].map(t=>t.dataset.id);
const L=ids();
const etds=ev('V8.last.filter(o=>o.kind==="iv").map(o=>o.key.etd)'); ok(etds.every((e,i)=>i===0||!etds[i-1]||e>=etds[i-1]),'U10 순서 = ETD 가까운 순 (오름차순)',etds);
ok(L.indexOf('NAA2611-04')>=0,'U14 ① 지난 ETD (40 일 전) · FD送付日 없음 = 남음',L);
ok(L.indexOf('NAA2611-05')<0,'U14 ① FD送付日 있음 = 표에서 빠짐',L);
ok(L.indexOf('NBB2611-01')>=0,'지난 ETD (5 일 전) · FD送付日 없음 = 남음',L);
ok(L.indexOf('NAA2611-03')<0&&L.indexOf('NCC2611-01')<0,'U14 ② +15 일 이후 = 펼친 곳에 없음',L);
const fb=d.getElementById('dtFar'); ok(fb&&/その先（ETD 15 日以降）/.test(fb.textContent)&&/▸/.test(fb.textContent),'U14 ② 표 맨 아래 「その先（ETD 15 日以降）n 件 ▸」',fb&&fb.textContent);
ok(d.querySelector('#dtTable tbody tr:last-child.v8-fold'),'접힘 줄 = 표 맨 아래');
ok(ev('S.folders["NAA2611-03"]')===undefined&&ev('S.folders["NAA2611-05"]')===undefined,'U14 ③ FD 済 · 접힌 줄 = 폴더 읽기 0',[ev('typeof S.folders["NAA2611-03"]'),ev('typeof S.folders["NAA2611-05"]')]);
ok(ev('S.folders["NAA2611-01"]')!==undefined,'펼친 줄 = 폴더 읽음');
ok(!W.req.some(u=>/NAA2611-03|NAA2611-05/.test(decodeURIComponent(u))),'접힌 줄 · FD 済 줄 = 그 Invoice 폴더 요청 0',W.req.filter(u=>/NAA2611-0[35]/.test(decodeURIComponent(u))));
const nAll=+d.getElementById('dtAll').textContent.replace(/\D/g,''), R=ev('(()=>{ const R=v8Compute(); return {all:R.all.length, far:R.far.length}; })()');
ok(nAll===R.all+R.far&&R.far>=2,'すべて n = 펼친 줄 + 접힌 줄',{nAll,R});
fb.click(); await X.sleep(80); await X.until(()=>ev('S.folders["NAA2611-03"]')!==undefined,5000).catch(()=>{});
ok(ids().indexOf('NAA2611-03')>=0&&/▾/.test(d.getElementById('dtFar').textContent),'누르면 펼침 (▾)',ids());
eq(w.localStorage.getItem(W9.FOLD_KEY),'1','펼침 = 이 PC 에 기억');
ok(ev('S.folders["NAA2611-03"]')!==undefined,'펼칠 때 그 줄 폴더 읽음');
d.getElementById('dtFar').click(); await X.sleep(50); ok(ids().indexOf('NAA2611-03')<0&&w.localStorage.getItem(W9.FOLD_KEY)!=='1','다시 누르면 접힘');
ok(!d.getElementById('dtCutF')&&!d.getElementById('dtCutBox'),'U14 ⑤ 위 기간 칸 (CY CUT) 없음');
d.getElementById('dtHelp').click(); await X.sleep(30); ok(/見える範囲（自動）/.test(d.getElementById('dtModalBox').textContent)&&/その先は 表の一番下に畳む/.test(d.getElementById('dtModalBox').textContent),'「？」 안 = 보이는 범위 설명'); ev('closeModal()');

ok(ev('(()=>{ const x=todoInput(S.bk[0]).x; return Array.isArray(x.mails)&&Array.isArray(x.hon)&&("bookingNo" in x)&&("blNo" in x)&&("asof" in x)&&("vchg" in x)&&x.portal&&("furi" in x.portal); })()'),'今日やること の材料 (メール · 本登録 · B/L 番号 · 振込) が全部ある');
console.log('U12 국내 0');
ok(L.indexOf('LTO2611-01')<0&&L.indexOf('NAA2611-06')<0,'LTO (L 시작) · 船社 「国内転売」 = 표에 없음',L);
ok(!ev('v8Compute().req.some(o=>o.id==="LTO2611-01"||o.id==="NAA2611-06")'),'要対応 에도 없음');

console.log('N35 화면');
const nr=id=>d.querySelector('#dtTable tr.v8-r[data-id="'+id+'"]');
ok(nr('NRA2610-01')&&/入金待ち（SWB 切替前）/.test(nr('NRA2610-01').querySelector('td[data-c=next]').textContent),'NRA2610-01 (FD送付日 있음 · 着金日 없음) = 남음 · 「入金待ち（SWB 切替前）」',nr('NRA2610-01')&&nr('NRA2610-01').textContent);
ok(nr('NRA2608-03')&&/SWB 切替を依頼/.test(nr('NRA2608-03').querySelector('td[data-c=next]').textContent)&&nr('NRA2608-03').querySelector('button[data-mail=swb]'),'NRA2608-03 (着金 있음) = 「SWB 切替を依頼」 · 下書き 버튼',nr('NRA2608-03')&&nr('NRA2608-03').textContent);
ok(nr('NRA2608-03').querySelector('[data-tddone]')&&nr('NRA2610-01').querySelector('[data-tddone]'),'「済」 (済にする · N10) 로 끝낼 수 있음');
ok(ev('v8Compute().req.some(o=>o.id==="NRA2608-03")')&&!ev('v8Compute().req.some(o=>o.id==="NRA2610-01")'),'要対応 = SWB 切替を依頼 만 (入金待ち 아님)');
const dr=await w.eval('mailDraftBuild("NRA2608-03","swb")');
ok(dr.subject==='[BL TYPE変更依頼]BL#TESTBL95'&&/SWBに変更/.test(dr.body)&&dr.warn.some(x=>/L\/G/.test(x))&&dr.kind==='swb','下書き = [BL TYPE変更依頼]BL#… · L/G 안내',dr);
ok(ev('DOC.MAIL30.GREET.indexOf("swb")>=0'),'下書き = 인사 (N30 확인 창)');

console.log('U13 通関 체크 하나');
const cs=nr('NAA2611-01').querySelector('td.v8-s0');
ok(cs.querySelectorAll('input.pt-ts').length===1&&!cs.querySelector('.mk'),'通関 = 체크박스 하나 (印 없음)',cs.innerHTML);
ok(cs.classList.contains('v8-ts-on')&&cs.querySelector('input.pt-ts').checked,'켜짐 = 초록 바탕');
ok(/--v8-ts-on:#[0-9A-Fa-f]{6}/.test(HTML)&&(HTML.match(/--v8-ts-on:/g)||[]).length>=2,'초록 = 두 테마 표에만');

console.log('U11 要対応 수');
eq(+d.getElementById('dtTodo').textContent.replace(/\D/g,''),ev('(()=>{ const R=v8Compute(); return R.req.length+R.farReq.length; })()'),'要対応のみ n = 펼친 + 접힌 要対応');
eq(ev('(()=>{ const R=v8Compute(); return R.req.length+R.farReq.length; })()'),ev('todoRows().filter(v8Vis()).filter(DOC.reqRow).filter(r=>r.ctRow||!v8Dom(r.b)).filter(r=>r.ctRow||v29ZoneOf(r.b)!==""||oblOf(r.iv)).length'),'要対応 = やること + 催促 (국내 · FD 済 제외)');

console.log('U10 契約 표 · 패널');
d.getElementById('dtBCt').click(); await X.sleep(80);
eq([...d.querySelectorAll('#dtTable thead th')].map(t=>t.textContent).slice(1,3),['契約 · バイヤーC','契約日C'],'契約 표 = v0.34 (N56-12) ETD 없음 · 契約 · 契約日');
d.getElementById('dtBIv').click(); await X.sleep(80);
nr('NAA2611-01').querySelector('td[data-c=pol]').dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await X.sleep(500);
const sr=d.querySelector('#dtSide .v8-sr'); ok(sr&&sr.querySelector('.c').getAttribute('title')==='ETD','오른쪽 패널 왼쪽 목록 = ETD 먼저',sr&&sr.innerHTML);

console.log('쓰기 0');
const wr=W.writes.filter(x=>!(x.method==='PUT'&&/\/D-00\/doc_tool\/fd\//.test(decodeURIComponent(x.url))));
eq(wr.length,0,'화면 = 쓰기 0 (메일 · COMPASS · PORTAL)'); ok(!(W.mailWrites||[]).length,'메일 下書き 0 (누르지 않음)');
ok(!/[가-힣]/.test(HTML.replace(/<!--[\s\S]*?-->/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').match(/V29 = \{[\s\S]*?\n  \};/)[0]),'V29 화면 글자 한글 0');

console.log((fail?'FAIL':'PASS')+' v29 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v29 예외',e&&e.stack||e); process.exit(1); });
