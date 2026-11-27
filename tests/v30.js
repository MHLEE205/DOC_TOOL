/* v0.30 시험 (지시서 THOR_28 · D1 ~ D8) — 가짜 데이터 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v30.js [html]
   E1 ETD = 늦은 쪽 · 한쪽만 · 둘 다 없음 / E2 出港済 / E3 「計画 MM/DD」 / B1 ~ B4 (CUT 전 · CUT 뒤 · ETD 당일 빨강 · 전날 노랑 · ③ 그대로) / 14:30 · 15:00 기한 없음 /
   R1 船社 受付 메일 (CNC 受付通知 · 【輸出】B/L発行申請 · Webform) · R2 「B/L発行申請」 / F-1 「FD送付日を入力」 / 화면 (표 · 要対応 · 쓰기 0) */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const at=DOC.at, V=DOC.V30, T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z';
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.3[0-3]<\/title>/.test(HTML)&&/version:'0\.3[0-3]'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.30 · 푸터');

console.log('E1 · E2 · E3 ETD = 늦은 쪽');
const B=(e,b)=>({cr49f_etd:e, crcf9_bl_etd:b});
eq([DOC.etdPick(B('2026-12-09T00:00:00Z','2026-12-02T00:00:00Z')),DOC.etdPick(B('2026-11-25T00:00:00Z','2026-11-28T00:00:00Z')),DOC.etdPick(B('2026-11-25',null)),DOC.etdPick(B(null,'2026-11-28')),DOC.etdPick(B(null,null)),DOC.etdPick(null)],
  ['2026-12-09','2026-11-28','2026-11-25','2026-11-28','',''],'E1 늦은 쪽 · 한쪽만 = 그것 · 둘 다 없음 = 빈칸');
ok(DOC.etdOf===DOC.etdPick&&DOC.ptEtd(B('2026-12-09','2026-12-02'))==='2026-12-09','E1 etdOf · ptEtd = 같은 함수 (표 · 정렬 · 범위 · 기한)');
eq([DOC.etdOther(B('2026-12-09','2026-12-02')),DOC.etdOther(B('2026-11-25','2026-11-28')),DOC.etdOther(B('2026-12-01','2026-12-01')),DOC.etdOther(B('2026-12-01',null))],['2026-12-02','2026-11-25','',''],'E3 다른 쪽 날짜 = 참고 (같거나 한쪽 = 없음)');
eq([DOC.shippedOut('2026-11-26','2026-11-26'),DOC.shippedOut('2026-11-25','2026-11-26'),DOC.shippedOut('2026-11-27','2026-11-26'),DOC.shippedOut('','2026-11-26')],[true,true,false,false],'E2 出港済 = 고른 ETD ≤ 오늘');
ok(/meta\.etd=String\(b\.crcf9_bl_etd\|\|b\.cr49f_etd\|\|''\)\.slice\(0,10\)/.test(HTML)&&/blDate:String\(cp\.booking\.crcf9_bl_etd\|\|cp\.booking\.cr49f_etd\|\|''\)\.slice\(0,10\)/.test(HTML),'E4 ACL · FD 엔진 쪽 meta.etd · blDate = 그대로 (B/L date 먼저)');
ok(!/crcf9_bl_etd\|\|b\.cr49f_etd\)\)\|\|''\)/.test(HTML),'옛 「B/L date 먼저」 ETD 코드 없음 (etdOf · ptEtd)');

console.log('B1 ~ B4 (prepaid B/L 단계)');
const NOW=at('2026-11-26','10:00');
const S0=o=>Object.assign({sub:null, subKnown:false, acl:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, payPlan:false, bl:null, ins:null, rr:null, fd:null},o||{});
const X0=o=>Object.assign({iv:'NTE2699-01', country:'INDONESIA', term:'CFR', pay:'TT', carrier:'SAMPLE LINE', otsu:'', buyer:'', cut:'2026-11-24', cutAm:false, blDate:'', etd:'2026-11-28'},o||{});
const row=(x,s,now)=>{ const n=now||NOW, r=DOC.todoRow(X0(x),S0(s),n,null); if(r){ r.group=DOC.todoGroup(r,n); r.when=DOC.whenLabel(r,n); r.whenSub=DOC.whenSub(r,n); } return r; };
const dr={drafts:[at('2026-11-20','10:00')]};
const b1=row({cut:'2026-11-27', etd:'2026-12-05'},dr);
ok(b1.what==='B/L Draft 確認 → CUT 後に送金'&&row({cut:'2026-11-27'},{drafts:[at('2026-11-19','10:00'),at('2026-11-20','10:00')]}).what==='B/L Draft 確認（2回目） → CUT 後に送金'&&b1.due==null&&b1.group==='wait'&&b1.when==='CUT 後'&&!DOC.reqRow(b1)&&b1.cutWait,'B1 CY CUT 전 = ◐ 「CUT 後に送金」 · 기한 없음 · 빨강 0 · 要対応 아님',b1);
const b2=row({cut:'2026-11-24', etd:'2026-11-28'},dr);
ok(b2.what==='B/L Draft 確認 → 運賃送金'&&b2.group==='today'&&b2.when==='なるべく早く（ETD 11/28 まで）'&&DOC.reqRow(b2)&&b2.whenSub==='','B2 CUT 뒤 · 미송금 = 🟡 「なるべく早く（ETD MM/DD まで）」',b2);
const b2d=row({cut:'2026-11-24', etd:'2026-11-26'},dr); ok(b2d.group==='late'&&b2d.when==='期限切れ（ETD 11/26）','B2 ETD 당일 = 🔴 (D4)',b2d);
const b2p=row({cut:'2026-11-24', etd:'2026-11-27'},dr); ok(b2p.group==='today','B2 ETD 전날 = 🟡',b2p);
const b2c=row({cut:'2026-11-26', etd:'2026-11-29'},dr); ok(b2c.what==='B/L Draft 確認 → 運賃送金'&&b2c.group==='today','CY CUT 당일 = CUT 지남 (B2)',b2c);
const b2n=row({cut:'', etd:'2026-11-29'},dr); ok(b2n.what==='B/L Draft 確認 → 運賃送金','CY CUT 빈칸 = CUT 지난 것 (B2)',b2n);
const b3=row({etd:'2026-11-27'},{drafts:dr.drafts, pay:at('2026-11-24','15:00')}); ok(b3.gkey==='blreq'&&b3.group==='today'&&b3.when==='ETD 11/27 まで'&&b3.whenSub==='','B3 送金 끝 · B/L 依頼 없음 = 🟡 「ETD MM/DD まで」',b3);
const b3d=row({etd:'2026-11-26'},{drafts:dr.drafts, pay:at('2026-11-24','15:00')}); ok(b3d.group==='late','B3 ETD 당일 = 🔴',b3d);
const b3p=row({etd:'2026-11-30'},{drafts:dr.drafts, pay:at('2026-11-27','15:00'), payPlan:true}); ok(b3p.gkey==='blreq'&&b3p.group==='today'&&b3p.payPlan,'B3 送金予定 (앞날 支払日) 도 ETD まで',b3p);
const b4=row({},{drafts:dr.drafts, pay:at('2026-11-24','15:00'), payManual:true}); ok(b4.payManual&&b4.due==null&&b4.when==='手入力'&&b4.group==='none','B4 ③ 手入力 = 그대로 (기한 없음 · D7)',b4);
ok(!/TR\.FIX\.draft|TR\.FIX\.pay\)\}/.test(HTML.slice(HTML.indexOf('function todoRow(x, S, now, ext){'),HTML.indexOf('function todoGroup(r, now){')))&&!/at\(dayOf\(S\.pay\),TR\.FIX\.day\)/.test(HTML),'14:30 · 15:00 · 送金日 18:00 기한 없음 (B/L 단계)');
const post=row({carrier:'SINOKOR'},dr); ok(post.gkey==='draft'&&post.when==='ETD 後に B/L 依頼','後払い 「ETD 後に B/L 依頼」 = 그대로',post);
const vn=row({country:'VIETNAM', cut:'2026-11-27'},{sub:1, drafts:dr.drafts, depoReq:at('2026-11-19','10:00'), depoRep:at('2026-11-19','12:00')}); ok(vn&&vn.what==='B/L Draft 確認 → CUT 後に送金','베트남 (Deposit 회답 있음) · CUT 전 = CUT 後に送金',vn);
const fd=row({blDate:'2026-11-24', term:'CIF'},{bl:at('2026-11-24','18:00')}); ok(fd&&fd.gkey==='insrr'&&DOC.hmOf(fd.due)==='18:00','B/L 뒤 FD · 保険 기한 = 그대로',fd);
const sorted=DOC.reqSort([Object.assign(row({iv:'A',etd:'2026-11-30'},dr),{iv:'A'}),Object.assign(row({iv:'B',etd:'2026-11-27'},dr),{iv:'B'}),Object.assign(row({iv:'C',etd:'2026-11-29'},{drafts:dr.drafts, pay:at('2026-11-24','15:00')}),{iv:'C'})]).map(r=>r.iv);
eq(sorted,['B','C','A'],'🟡 줄 = ETD 가까운 순');

console.log('R1 · R2 B/L 依頼 신호');
const rc=DOC.blRcvLink;
const cnc1={subj:'[CMA CGMグループ] B/L発行依頼受付通知メール (チケット番号: 9999-0000-001) [SDL-DOC]', skind:'carrier', fromDom:'example-carrier.test', body:'チケット番号 9999-0000-001 申請種別 B/L発行依頼'};
eq(rc(cnc1),{rcv:true, req:true, ticket:'9999-0000-001'},'R1 CNC 受付通知 = 受付 · 依頼 · 티켓 번호');
eq(rc({subj:'【輸出】B/L発行申請（東京、B/L発行（外地）、9999-0000-001）[SDL-DOC]', skind:'carrier', fromDom:'x.test', body:''}).ticket,'9999-0000-001','R1 【輸出】B/L発行申請 = 같은 티켓');
eq(rc({subj:'<SAMPLE LINE> Webform 受け付け完了のお知らせ', skind:'other', fromDom:'formzu.com', body:'7 申請内容(複数選択可） Waybill送信 8 B/L発行地 東京'}),{rcv:true, req:true, ticket:''},'R3 Webform 申請内容 = Waybill送信 → 依頼');
eq(rc({subj:'<SAMPLE LINE> Webform 受け付け完了のお知らせ', skind:'other', fromDom:'formzu.com', body:'7 申請内容(複数選択可） 入金連絡 8 B/L発行地 東京 10 輸出Original B/L P/Up'}).req,false,'R3 Webform 申請内容 = 入金連絡 만 → 依頼 아님');
eq(rc({subj:'B/L発行依頼受付通知メール', skind:'other', fromDom:'example.test', body:''}).rcv,false,'선사 · formzu 가 아닌 곳 = 아님');
eq(rc({subj:'Re: 【輸出】B/L発行申請（東京、9999-0000-001）', skind:'staff', fromDom:'example.test', body:''}).rcv,false,'담당이 보낸 메일 = R1 아님 (R2 로)');
ok(DOC.mailKind({subj:'Re: 【輸出】B/L発行申請（東京、B/L発行（外地）、9999-0000-001）[SDL-DOC]', att:[], body:''})==='b','R2 담당 → 선사 「B/L発行申請」 = 依頼 (b)');
const base={iv:'NTE2699-01', carrier:'SAMPLE LINE', term:'CFR', pay:'TT', files:[], hon:[], payDate:'2026-11-17', now:NOW};
const m=(t,o)=>Object.assign({t, subj:'', att:[], hasAtt:false, body:'', skind:'carrier', uses:[], kind:''},o);
const sg=DOC.todoSignals(Object.assign({},base,{mails:[m(at('2026-11-18','16:16'),{subj:cnc1.subj, uses:['BLISSUE'], rcv:true, rcvReq:true})]}));
ok(sg.bmail===at('2026-11-18','16:16')&&sg.bmailSrc==='rcv'&&sg.bl==null,'R1 受付 메일 = S.bmail (B/L 依頼 済) · B/L 受領 으로는 안 셈',sg);
const r4=DOC.todoRow(Object.assign({},X0(),{payDate:'2026-11-17'}),sg,NOW,null); ok(r4&&r4.gkey==='w_carrier'&&/^B\/L 待ち/.test(r4.what)&&/（船社の受付）/.test(r4.why),'R4 = B/L 依頼 済 → 다음 단계 (B/L 待ち · v0.31: ETD 전 = 「出港後発行」)',r4);
const sg2=DOC.todoSignals(Object.assign({},base,{mails:[m(at('2026-11-18','16:16'),{subj:'<SAMPLE LINE> Webform 受け付け完了のお知らせ', skind:'other', rcv:true, rcvReq:false})]}));
ok(sg2.bmail==null,'依頼 아닌 受付 (入金連絡) = 신호 아님');

console.log('F-1 FD送付日を入力');
const fi=DOC.fdInputRow({portal:{fd_date:''}},{fd:at('2026-11-10','18:00'), fdSrc:'フォルダ FD'});
ok(fi&&fi.what==='FD送付日を入力'&&fi.zone==='do'&&fi.due==null&&DOC.todoGroup(fi,NOW)==='today'&&DOC.reqRow(fi)&&/フォルダ FD 11\/10/.test(fi.why),'F-1 FD 끝 · FD送付日 빈칸 = 「FD送付日を入力」 (要対応 · 🟡 · 기한 없음)',fi);
ok(/const mailKindOf = r => r&&!r\.fdIn&&/.test(HTML),'「FD送付日を入力」 = 下書き 버튼 없음 (「提案」 으로 입력)');
ok(DOC.fdInputRow({portal:{fd_date:'2026-11-10'}},{fd:at('2026-11-10','18:00')})==null&&DOC.fdInputRow({portal:{fd_date:''}},{fd:null})==null,'FD送付日 있음 · FD 아직 = 없음');
ok(/row=DOC\.todoRow\(x,Sg,now,TODO\.ext\)\|\|DOC\.swbRow\(x,Sg,now,TODO\.ext\)\|\|DOC\.fdInputRow\(x,Sg\)/.test(HTML),'순서 = 단계 → N35 SWB → FD送付日を入力 (SWB 끝난 뒤)');

console.log('화면 (가짜 세계)');
const W=X.world();
const ct=W.contracts[0];
const bk=(n,iv,e,b,extra)=>Object.assign({cr49f_bookingid:'eeeeeeee-0000-0000-0000-0000000030'+String(n).padStart(2,'0'),cr49f_invoice_no:iv,cr49f_booking_no:'TESTBK30'+n,cr49f_bl_number:'TESTBL30'+n,cr49f_etd:e,crcf9_bl_etd:b,cr49f_main_ship_name:'SAMPLE VESSEL 30'+n,_cr49f_sale_contract_id_value:ct.cr49f_sale_contractid,_cr49f_region_id_value:W.regions[2].cr49f_regionid,_cr49f_region_japan_id_value:W.bookings[0]._cr49f_region_japan_id_value,_cr49f_carrier_id_value:W.bookings[0]._cr49f_carrier_id_value,cr49f_cy_cut:D(-2)},extra||{});
W.bookings.push(bk(1,'NAA2611-31',D(13),D(6)), bk(2,'NAA2611-32',D(1),D(3)));
const rec={}; W.bookings.forEach(b=>{ rec[b.cr49f_invoice_no]={tsukan_irai:true, tsukan_irai_at:D(-60)}; }); W.content['古紙/-. AI 活用/PORTAL/clearance_status.json']=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:rec,cotecna:{},shipping:{}},null,2);
const w=await X.page(W,{first:true, ls:{doc_tool_who:'all'}}); const d=w.document, ev=s=>w.eval(s);
await X.until(()=>ev('TODO.mailSt')==='ok'||ev('TODO.mailSt')==='error',20000).catch(()=>{}); await X.until(()=>/読み込み完了/.test(ev('S.doneMsg')||''),20000).catch(()=>{}); await X.sleep(400); ev('render()'); await X.sleep(100);
const tr=id=>d.querySelector('#dtTable tr.v8-r[data-id="'+id+'"]');
const e31=tr('NAA2611-31'), e32=tr('NAA2611-32');
ok(e31&&new RegExp(DOC.fmtMD(X.addDays(T,13)).replace('/','\\/')).test(e31.querySelector('[data-c=etd]').textContent)&&e31.querySelector('.v30-plan')&&e31.querySelector('.v30-plan').textContent==='B/L '+DOC.fmtMD(X.addDays(T,6)),'E3 표 ETD = 늦은 쪽 · 옆 회색 (v0.31 L1: 다른 쪽 = B/L date → 「B/L MM/DD」)',e31&&e31.querySelector('[data-c=etd]').innerHTML);
ok(e32&&e32.querySelector('[data-c=etd]').textContent.indexOf(DOC.fmtMD(X.addDays(T,3)))===0&&e32.querySelector('.v30-plan').textContent==='計画 '+DOC.fmtMD(X.addDays(T,1)),'E3 B/L date 가 뒤 = B/L date 표시 · 計画 = 計画 ETD',e32&&e32.querySelector('[data-c=etd]').innerHTML);
const ks=ev('V8.last.filter(o=>o.kind==="iv").map(o=>o.key.etd)'); ok(ks.every((e,i)=>i===0||!ks[i-1]||e>=ks[i-1]),'정렬 = 고른 ETD 오름차순',ks);
{ const cb=d.body.cloneNode(true); cb.querySelectorAll('script,style').forEach(e=>e.remove()); ok(!/14:30/.test(cb.textContent),'화면에 14:30 마감 문구 없음'); }
const wr=W.req.filter(u=>!/^GET /.test(u)&&/^(?:PUT|POST|PATCH|DELETE) /.test(u)); eq((W.writes||[]).filter(x=>!/\/doc_tool\/(?:state|cp_trial_log|ai_cost)\//.test(decodeURIComponent(x.url))).length,0,'화면 = 쓰기 0 (메일 · COMPASS · PORTAL)'); ok(!(W.mailWrites||[]).length,'메일 下書き 0');
ok(!/[가-힣]/.test(HTML.match(/const V30 = \{[\s\S]*?\n  \};/)[0].replace(/\/\*[\s\S]*?\*\//g,'')),'V30 화면 글자 한글 0');

console.log((fail?'FAIL':'PASS')+' v30 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v30 예외',e&&e.stack||e); process.exit(1); });
