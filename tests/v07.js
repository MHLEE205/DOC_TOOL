/* v0.7 시험 (지시서 D00 書類ツール v0.7 今日やること · 자체 확인 1 ~ 5 · 7 의 메일 쓰기 0) — 가짜 데이터만. node v07.js [html]
   1 단계 계산 (가장 뒤 신호 → 다음 단계 · 앞은 끝 · 같은 단계 합치기 · 베트남 Deposit 1번째 Draft 남음 / 2번째 끝)
   2 대상 외 (나라 · 인코텀즈 · 후불 · FOB)   3 기한 (CY_CUT 12/18 · 本船変更 · 14:30 · 15:00 · 18:00 · FD +2 / 후불 +1 · 공휴일 · 주말 · 영업시간)
   4 재촉 75% (상수 · SharePoint 값 3건 이상만 · 3건 미만 → 전체)   5 화면 (첫 화면 · 탭 순서 · 담당 · 補助 · 숫자 칸 · 묶음 접기 기억 · 버튼 이동 · asof 관리자만)
   + 메일 분류 (용도 · a/b/c · 보낸 쪽 · 건 연결) · 신호 (Draft 1시간 · asof · 앞날 지불일 · B/L 받음 추정 · PORTAL FD) · 메일 쓰기 0 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const qa=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>w.document.getElementById(id).textContent;
const R=DOC.TODO_RULES, at=DOC.at;
/* 신호 묶음 만들기 — 기본은 아무 신호 없음 */
const S0=o=>Object.assign({sub:null, subKnown:false, acl:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, bl:null, ins:null, rr:null, fd:null},o||{});
const X0=o=>Object.assign({iv:'NTE2699-01', country:'INDONESIA', term:'CFR', pay:'TT', carrier:'ONE', otsu:'', buyer:'', cut:'2026-11-18', cutAm:false, blDate:''},o||{});
const NOW=at('2026-11-20','09:00');   // 금 09:00
const row=(x,s,now)=>{ const r=DOC.todoRow(X0(x),S0(s),now||NOW,null); if(r){ r.group=DOC.todoGroup(r,now||NOW); r.when=DOC.whenLabel(r,now||NOW); } return r; };
(async()=>{
console.log('3 영업일 · 영업시간');
ok(DOC.bday('2026-11-20')&&!DOC.bday('2026-11-21')&&!DOC.bday('2026-11-22')&&!DOC.bday('2026-11-23')&&DOC.bday('2026-11-24'),'금 영업일 · 토 · 일 · 11/23 (근로감사의 날) 쉼');
eq([DOC.badd('2026-11-20',1),DOC.badd('2026-11-20',2),DOC.badd('2026-11-19',2)],['2026-11-24','2026-11-25','2026-11-24'],'영업일 더하기 (주말 · 공휴일 건너뜀)');
eq([DOC.bhours(at('2026-11-20','17:00'),at('2026-11-24','10:00')),DOC.bhours(at('2026-11-20','07:00'),at('2026-11-20','20:00')),DOC.bhours(at('2026-11-20','10:00'),at('2026-11-20','09:00'))],[2,9,-1],'영업시간 (9 ~ 18 · 주말 · 공휴일 0 · 거꾸로 = 음수)');
ok(R.HOLIDAYS.indexOf('2026-11-23')>=0&&R.HOLIDAYS.length>=16&&R.OPEN===9&&R.CLOSE===18,'상수 표 한 곳 (공휴일 2026 · 영업시간)');
eq(DOC.jst('2026-11-20T00:30:00Z'),at('2026-11-20','09:30'),'받은 시각 (UTC) → 일본 시각');

console.log('1 단계 계산 · 2 대상 외');
ok(row({}, {fd:at('2026-11-19','10:00'), bl:at('2026-11-18','18:00'), sub:1})===null,'FD 끝 → 목록에서 빠짐 (앞 신호가 있어도)');
ok(row({}, {})===null,'통관 서류 전 → 書類 담당 일 없음 (T1 = 통관 담당)');
{ const r=row({country:'VIETNAM'}, {sub:at('2026-11-19','10:00')});
  ok(r&&r.stage===1&&/^Deposit 依頼 ＋ ACL 待ち/.test(r.what)&&r.group==='late','베트남 통관 서류 뒤 → 「Deposit 依頼 ＋ ACL 待ち」 한 줄 (같은 단계 합침) · 그날 18:00 지남 = 期限切れ',r); }
ok(row({}, {sub:at('2026-11-19','17:00')})===null,'베트남 아님 → Deposit 없음 · ACL 아직 보통 시간 안 (1h < 4.9h) → 줄 없음');
{ const r=row({}, {sub:at('2026-11-18','10:00')}); ok(r&&r.group==='chase'&&r.stage===2&&r.what==='乙仲に ACL 催促'&&/^ACL \d+h \/ 5h$/.test(r.when),'ACL 재촉 (75% 지점 넘음)',r); }
{ const r=row({}, {sub:at('2026-11-18','10:00'), acl:at('2026-11-19','10:00'), cut:'2026-11-20'}); ok(r&&r.stage===2&&r.what==='ACL 確認 → 本登録依頼'&&r.action[1]==='acl','ACL 도착 → 「ACL 確認 → 本登録依頼」 (ACL 재촉은 끝) · 버튼 ACL 照合',r); }
{ const r=row({cut:'2026-11-20'}, {sub:1, acl:at('2026-11-19','10:00')}); ok(r.group==='t1800'&&r.when==='18:00 CY_CUT','CY_CUT 오늘 · cut_am 아님 → 18:00 (今日 18:00 まで)',r);
  const r2=row({cut:'2026-11-20', cutAm:true}, {sub:1, acl:at('2026-11-19','10:00')}); ok(r2.group==='t1430'&&r2.when==='12:00 CY_CUT','cut_am → 12:00 (오늘 고정 마감 앞쪽 묶음)',r2);
  const r3=row({cut:'2026-11-19'}, {sub:1, acl:at('2026-11-18','10:00')}); ok(r3.group==='late','CY_CUT 지남 → 期限切れ',r3);
  const r4=row({cut:'2026-11-19'}, {sub:1, acl:at('2026-11-18','10:00'), vchg:true}); ok(r4.group!=='late'&&/本船変更/.test(r4.why),'本船変更 건 → 늦음으로 안 셈 (참고 표시)',r4); }
{ const r=row({}, {sub:1, acl:1, hon:at('2026-11-17','10:00')}); ok(r&&r.group==='chase'&&r.stage===3&&r.what==='船社に Draft 催促','本登録 뒤 Draft 없음 → Draft 재촉 (ONE 21.6h 넘음)',r);
  ok(row({}, {sub:1, acl:1, hon:at('2026-11-19','15:00')})===null,'本登録 뒤 아직 보통 시간 안 → 줄 없음'); }
{ const r=row({country:'VIETNAM'}, {sub:at('2026-11-17','10:00'), acl:1, hon:at('2026-11-19','15:00')}); ok(r&&/^Deposit 依頼 ＋ Draft 待ち/.test(r.what)&&r.group==='late','베트남 本登録 뒤 Deposit 의뢰 없음 → 「Deposit 依頼 ＋ Draft 待ち」',r); }
/* ③ Draft */
{ const r=row({}, {sub:1, acl:1, hon:1, drafts:[at('2026-11-20','08:00')]}); ok(r.stage===3&&r.what==='B/L Draft 確認 → 運賃送金'&&r.group==='t1430'&&r.when==='14:30 → 15:00'&&r.action[1]==='bl','선불 Draft 도착 (오전) → 그날 14:30 → 15:00 · Draft 照合',r);
  const r2=row({}, {drafts:[at('2026-11-19','16:00')]}); ok(r2.group==='t1430','Draft 가 14:30 뒤 → 다음 영업일 14:30 (11/19 16:00 → 11/20)',r2);
  const r3=row({}, {drafts:[at('2026-11-18','10:00')]}); ok(r3.group==='late','어제 Draft → 15:00 지남 = 期限切れ',r3);
  const r4=row({}, {drafts:[at('2026-11-19','10:00'),at('2026-11-20','08:00')]}); ok(/（2回目）/.test(r4.what)&&r4.group==='t1430','다음 Draft = 새 Draft 기준 (2回目 · 대체됨)',r4); }
{ const r=row({country:'VIETNAM'}, {sub:1, depoReq:at('2026-11-17','10:00'), drafts:[at('2026-11-20','08:00')]}); ok(/＋ Deposit 催促（\d+h \/ 17h）/.test(r.what),'베트남 1번째 Draft → Deposit 재촉 남음 (75% 넘음)',r);
  const r2=row({country:'VIETNAM'}, {sub:1, depoReq:at('2026-11-19','17:00'), drafts:[at('2026-11-20','08:00')]}); ok(!/Deposit/.test(r2.what)&&/Deposit 回答待ち/.test(r2.why),'베트남 1번째 Draft · Deposit 아직 보통 시간 안 → 이유에 「回答待ち」 만',r2);
  const r3=row({country:'VIETNAM'}, {sub:1, depoReq:at('2026-11-10','10:00'), drafts:[at('2026-11-18','10:00'),at('2026-11-20','08:00')]}); ok(!/Deposit 催促|Deposit 依頼/.test(r3.what)&&/LG 済 = Deposit 済/.test(r3.why),'베트남 2번째 Draft (LG 뒤) → Deposit 끝',r3);
  const r4=row({country:'VIETNAM'}, {sub:1, depoReq:at('2026-11-10','10:00'), depoRep:at('2026-11-12','10:00'), drafts:[at('2026-11-20','08:00')]}); ok(!/Deposit/.test(r4.what+r4.why),'Deposit 회신 있음 → Deposit 없음',r4); }
{ const r=row({carrier:'SINOKOR'}, {drafts:[at('2026-11-19','10:00')]}); ok(r.group==='post'&&r.what==='B/L Draft 確認 → B/L 発行依頼'&&r.when==='期限なし','후불 선사 → 송금 없음 · Draft 뒤 바로 B/L 의뢰 · 後払い 묶음',r);
  const r2=row({term:'FOB'}, {drafts:[at('2026-11-19','10:00')], pay:at('2026-11-19','15:00')}); ok(r2.group==='post'&&/FOB/.test(r2.why)&&r2.stage===3,'FOB → 송금 없음 (지불일이 있어도 송금 단계 아님)',r2);
  ok(R.POSTPAID.length>=7&&['SINOKOR','HEUNG A','NAMSUNG','DONG YOUNG','OOCL','KMTC','PAN OCEAN'].every(c=>DOC.postpaid(c))&&!DOC.postpaid('MAERSK')&&DOC.postpaid('pan ocean'),'후불 7곳 (상수 표 · 대소문자 무관) · MAERSK 선불'); }
{ const r=row({}, {drafts:[at('2026-11-17','10:00')], cmail:at('2026-11-17','12:00')});
  ok(row({}, {drafts:[at('2026-11-18','10:00')], cmail:at('2026-11-18','12:00')})===null,'정정 의뢰 뒤 아직 보통 시간 안 (15h < 21.6h) → 줄 없음'); ok(r&&r.group==='chase'&&/訂正版 Draft/.test(r.what),'Draft 뒤 내용 정정 의뢰 → 정정판 Draft 재촉 (공이 선사에)',r); }
/* ④ 송금 · ⑤ B/L 의뢰 · ⑥ B/L */
{ const r=row({}, {drafts:[1], pay:at('2026-11-19','15:00')}); ok(r.stage===5&&r.what==='B/L 発行依頼（振込明細）'&&r.group==='late','송금 끝 → B/L 의뢰 (그날 18:00 지남 = 期限切れ) · 앞 Draft 확인은 끝',r);
  ok(row({}, {pay:at('2026-11-19','15:00'), bmail:at('2026-11-19','15:10')})===null,'B/L 의뢰 뒤 아직 보통 시간 안 → 줄 없음');
  const r2=row({}, {pay:1, bmail:at('2026-11-17','15:10')}); ok(r2&&r2.group==='chase'&&r2.stage===6&&r2.what==='船社に B/L 催促','B/L 의뢰 뒤 오래 → B/L 재촉',r2); }
{ const bl=at('2026-11-19','18:00');
  const r=row({blDate:'2026-11-19', term:'CIF', pay:'LC'}, {bl}); ok(r.stage===7&&r.what==='保険 → FD 送付（L/C 原本）'&&DOC.dayOf(r.due)==='2026-11-24'&&DOC.hmOf(r.due)==='18:00'&&r.action[1]==='fd','CIF · L/C → 「保険 → FD 送付（L/C 原本）」 · FD 기한 = B/L date + 영업일 2일 (주말 · 11/23 건너뜀) 18:00',r);
  const r2=row({blDate:'2026-11-19', term:'CIF'}, {bl, ins:'known'}); ok(r2.stage===8&&r2.what==='FD 送付','보험 끝 → FD 만',r2);
  const r3=row({blDate:'2026-11-19', country:'KOREA'}, {bl}); ok(r3.stage===7&&/RR 送付/.test(r3.what)&&r3.action[1]==='rr','한국 → RR · RR を開く',r3);
  const r4=row({blDate:'2026-11-19', carrier:'HEUNG A'}, {bl}); ok(DOC.dayOf(r4.due)==='2026-11-20'&&/後払い船社は 営業日1日/.test(r4.why),'후불 (베트남 아님) → FD = B/L date + 영업일 1일',r4);
  const r5=row({blDate:'2026-11-19', carrier:'HEUNG A', country:'VIETNAM'}, {bl}); ok(DOC.dayOf(r5.due)==='2026-11-24','후불이라도 베트남 → +2 일',r5);
  const r6=row({blDate:'2026-11-18', pay:'LC'}, {bl:at('2026-11-18','18:00')}); ok(r6.group==='fdtoday'&&r6.when==='11/18 B/L 受領'&&DOC.hmOf(r6.due)==='18:00','오늘이 FD 기한 · L/C → v0.8: B/L 받은 건은 「本日 FD」 묶음 (기한 18:00 은 그대로)',r6);
  const rb=row({}, {bl:at('2026-11-19','15:00')}); ok(rb&&rb.stage===8&&DOC.dayOf(rb.due)==='2026-11-24','B/L date 가 비어도 (선사 B/L 메일만) → 그날 기준 FD 기한',rb);
  ok(row({term:'CIF',country:'KOREA',blDate:'2026-11-19'}, {bl, ins:'known', rr:at('2026-11-19','10:00')}).stage===8,'보험 · RR 끝 → FD'); }
console.log('4 재촉 75%');
{ eq([DOC.nudgeH('draft','MAERSK',null),DOC.nudgeH('draft','UNKNOWN LINE',null),DOC.nudgeH('acl','TEST 乙仲',null)],[7.5,21.9,4.9],'상수 (선사별 · 없으면 전체)');
  const ext={acl:{'TEST 乙仲':[11.2,19],'TEST 小':[99,2]}, depo:{'TEST BUYER':[41.6,24]}};
  eq([DOC.nudgeH('acl','TEST 乙仲',ext),DOC.nudgeH('acl','TEST 小',ext),DOC.nudgeH('depo','TEST BUYER',ext)],[11.2,4.9,41.6],'SharePoint 값: 3건 이상만 · 3건 미만 → 전체');
  const r=DOC.todoRow(X0({otsu:'TEST 乙仲'}),S0({sub:at('2026-11-19','10:00')}),NOW,ext); ok(r===null,'乙仲별 값 (11.2h) 으로 보면 아직 → 줄 없음 (전체 4.9h 였다면 재촉)');
  ok(!['LO'+'TOS','SAI'+'GON','住'+'友','塩'+'竈'].some(n=>HTML.indexOf(n)>=0),'乙仲 · 바이어 이름은 코드에 없음 (SharePoint 파일에서 읽음 · 이 시험에도 이어 붙여 둠)');
  ok(/thresholds_75\.json/.test(R.NUDGE_FILE)&&/토르_2 thresholds_75\.json \(2026-11-22/.test(HTML),'출처 · 날짜 주석'); }
console.log('메일 분류 · 건 연결 · 신호');
{ const ctx={companyDom:'example.test', otsu:new Set(['otsu.example']), buyer:new Set(['buyer.example'])};
  eq(['a@example.test','x@otsu.example','y@one-line.com','z@buyer.example','w@ms-ins.com','v@other.example'].map(a=>DOC.senderKind(a,ctx)),['staff','otsu','carrier','buyer','ins','other'],'보낸 쪽 (회사 · 乙仲 · 선사 · 바이어 · 보험 · 그 밖)');
  eq(DOC.mailHead('RE: [本登録依頼] Re: [DR訂正依頼] Re: 「通関書類送付」'),'[本登録依頼]','제목 맨 앞 머리말');
  const u=m=>DOC.mailUses(Object.assign({att:[],body:'',hasAtt:false},m));
  eq(u({subj:'【ACL確認依頼】 TEST',skind:'otsu',hasAtt:true}),['ACL'],'ACL (乙仲 · 첨부)');
  eq(u({subj:'【ACL確認依頼】 TEST',skind:'otsu'}),[],'ACL 은 첨부 필수');
  eq(u({subj:'Re: TEST',skind:'staff',body:'本登録をお願いします'}),['HON'],'本登録 의뢰 (본문)');
  ok(u({subj:'[HEUNG A LINE] INFORMATION OF BILL',skind:'carrier'}).indexOf('BLDRAFT')>=0&&u({subj:'新規通関依頼:BKG#TEST',skind:'staff'}).indexOf('CUSTREQ')>=0,'Draft · 통관 의뢰');
  const k=(subj,o)=>DOC.mailKind(Object.assign({subj, att:[], body:''},o||{}));
  eq([k('[BL発行依頼/振込明細書送付]BK#TEST'),k('フレートメモご訂正のお願い'),k('[LG付き訂正依頼:TEST]'),k('[BL DRAFT/フレートメモ送付依頼]BKG#TEST')],['b','a','c','d'],'담당 → 선사 메일 a · b · c · d (토르_2 판단 낱말)');
  const I=DOC.linkIndex([{id:'B1', iv:'NTE2699-01', bkg:'TESTBK123456', bl:'TESTBL654321', ct:'LRS-2699TE1', cntrs:['TSTU0000001']},{id:'B2', iv:'NTE2699-02', bkg:'TESTBK777777'}]);
  eq([DOC.linkMail('[Deposit Request for NTE2699-01]',I),DOC.linkMail('BKG#TESTBK777777',I),DOC.linkMail('SWB ONEYTESTBL654321',I),DOC.linkMail('CNTR TSTU 0000001',I),DOC.linkMail('nothing',I)],[['B1'],['B2'],['B1'],['B1'],[]],'건 연결 (Invoice · BKG · 선사 접두 B/L · 컨테이너)'); }
{ const T=(d,hm)=>at(d,hm), M=(t,o)=>Object.assign({t, subj:'', att:[], hasAtt:false, body:'', skind:'other', uses:[], kind:''},o);
  const base={iv:'NTE2699-01', country:'INDONESIA', term:'CFR', carrier:'ONE', cut:'2026-11-18', files:[], portal:{}, hon:[], now:T('2026-11-20','09:00')};
  const mails=[M(T('2026-11-17','10:00'),{skind:'staff',uses:['CUSTREQ'],subj:'【通関書類送付_NTE2699-01】',hasAtt:true}),M(T('2026-11-17','12:00'),{skind:'otsu',uses:['ACL'],hasAtt:true}),
    M(T('2026-11-17','13:00'),{skind:'staff',uses:['HON']}),M(T('2026-11-18','10:00'),{skind:'carrier',uses:['BLDRAFT']}),M(T('2026-11-18','10:40'),{skind:'carrier',uses:['BLDRAFT']}),M(T('2026-11-19','10:00'),{skind:'carrier',uses:['BLDRAFT']})];
  const s=DOC.todoSignals(Object.assign({},base,{mails}));
  ok(s.sub===T('2026-11-17','10:00')&&s.acl===T('2026-11-17','12:00')&&s.hon===T('2026-11-17','13:00')&&s.drafts.length===2,'신호: 통관 → ACL → 本登録 → Draft (1시간 안의 Draft 메일 = 1번)',s);
  const s2=DOC.todoSignals(Object.assign({},base,{mails, asof:T('2026-11-18','10:30')})); ok(s2.drafts.length===1&&s2.hon!=null,'asof → 그 시각 전 신호만',s2);
  const s3=DOC.todoSignals(Object.assign({},base,{mails, payDate:'2026-11-24'})); ok(s3.pay===null,'앞날 지불일 (미리 입력) → 송금 신호 아님',s3);
  const s4=DOC.todoSignals(Object.assign({},base,{mails, blDate:'2026-11-19'})); ok(s4.bl===null,'B/L date 만 (송금 없음 · 선불) → B/L 받음 아님 (B/L date 는 미리 들어 있는 일이 많음)',s4);
  const s5=DOC.todoSignals(Object.assign({},base,{mails, blDate:'2026-11-19', payDate:'2026-11-19'})); ok(s5.bl===T('2026-11-19','18:00')&&/送金/.test(s5.blSrc),'B/L date 지남 + 송금 → B/L 받음 (B/L date 18:00)',s5);
  const s6=DOC.todoSignals(Object.assign({},base,{mails, carrier:'SINOKOR', blDate:'2026-11-19'})); ok(s6.bl!=null,'후불: B/L date 지남 + Draft → B/L 받음',s6);
  const s7=DOC.todoSignals(Object.assign({},base,{mails, blDate:'2026-11-19', portal:{fd_date:'2026-11-01'}})); ok(s7.fd===null,'PORTAL FD送付日 이 B/L date 보다 3일 넘게 앞 → 일괄 입력으로 보고 버림 (토르_2)');
  const s8=DOC.todoSignals(Object.assign({},base,{mails, files:[{name:'NTE2699-01_FD.pdf', lastModified:'2026-11-19T01:00:00Z'}]})); ok(s8.fd===T('2026-11-19','10:00')&&s8.fdSrc==='フォルダ FD','폴더 FD (v0.3 규칙) → FD 끝',s8);
  const s9=DOC.todoSignals(Object.assign({},base,{mails:[], files:[{name:'NTE2699-01_DRAFT.pdf', lastModified:'2026-11-19T01:00:00Z'},{name:'NTE2699-01_FRT MEMO.pdf', lastModified:'2026-11-19T01:20:00Z'}]})); ok(s9.drafts.length===1,'폴더 Draft · FRT MEMO (공유 메일함 대신)',s9);
  const s10=DOC.todoSignals(Object.assign({},base,{mails, blDate:'2026-11-20', payDate:'2026-11-19'})); ok(s10.bl===null,'B/L date 가 오늘 · 아직 18:00 전 → B/L 받음 아님 (지금보다 뒤 신호는 안 씀)',s10); }

console.log('5 화면');
{ const W=X.world(), T=W.T, D=n=>X.addDays(T,n)+'T00:00:00Z';
  /* 가짜 신호: NAA2611-01 (LC · CIF · 베트남 · 담당 STAFF_A) — 폴더 FD 없음 · 지불 · B/L date 어제 → FD 단계 */
  W.bookings[0].crcf9_bl_etd=D(-1); W.bookings[0].crcf9_maritime_freight_payment_date=X.addDays(T,-1); W.bookings[0].cr49f_cy_cut=D(-3);
  W.bookings[0]._cr49f_carrier_id_value=X.g('6',1); W.carriers=[{crcf9_carrierid:X.g('6',1), crcf9_carrier:'ONE'}];
  const OPEN={late:true,t1430:true,t1800:true,soon:true,post:true,chase:true};
  const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_who:'all', doc_tool_todo_open:JSON.stringify(OPEN)}});
  await X.until(()=>!!w.document.querySelector('.td-sum'));
  ok(w.document.getElementById('dtBTodo').classList.contains('on')&&w.document.getElementById('dtTodoBox').style.display==='flex'&&w.document.getElementById('dtTable').style.display==='none','5 첫 화면 = 今日やること (현황판 표 숨김)');
  eq(qa(w,'.dt-seg button').map(b=>b.textContent),['今日やること','契約別（LC · S/I）','Invoice 別（船積）'],'5 탭 순서 今日やること · 契約別 · Invoice 別');
  const who=qa(w,'#dtWho button').map(b=>b.textContent); ok(who[0].indexOf('自分の担当')===0&&who.indexOf(R.ASSIST_LABEL)>=0&&who.indexOf('全員')>who.indexOf(R.ASSIST_LABEL),'5 담당 버튼 (自分 · 담당자 · 補助 · 全員)',who);
  eq(qa(w,'.td-card .l:first-child').map(e=>e.textContent),['期限切れ','15:00 送金まで','本日 FD · 18:00 宅配','近日 · 後払い','催促'],'5 숫자 5칸 (v0.8: 3번째 = 本日 FD + 18:00 宅配)');
  ok(/今日の締切/.test(w.document.querySelector('.td-bar').textContent)&&qa(w,'.td-mk').length===5,'5 오늘 마감 줄 (지금 · 12:00 · 14:30 · 15:00 · 18:00)');
  const rowsN=()=>qa(w,'.td-row').length, iv=qa(w,'.td-row button.dt-link').map(b=>b.textContent);
  ok(iv.indexOf('NAA2611-01')>=0&&iv.length===new Set(iv).size,'5 1 Invoice = 1 줄 (같은 Invoice 두 줄 없음)',iv);
  ok(!iv.includes('NBB2611-01'),'FD 있는 NBB2611-01 은 목록에 없음 (FD 끝 → 사라짐)');
  const sec=qa(w,'.td-sh')[0], k=sec.dataset.tdtoggle, before=rowsN(); sec.click();
  ok(rowsN()<before&&JSON.parse(w.localStorage.getItem('doc_tool_todo_open'))[k]===false,'5 묶음 접기 → 기억 (localStorage)',[before,rowsN()]);
  w.document.querySelector('.td-sh[data-tdtoggle="'+k+'"]').click();
  /* 담당 · 補助 */
  w.document.querySelector('#dtWho button[data-who="STAFF_B"]').click(); const nB=rowsN(); w.document.querySelector('#dtWho button[data-who="assist"]').click(); const nA=rowsN(); w.document.querySelector('#dtWho button[data-who="all"]').click();
  ok(nA===rowsN()&&nA>=nB,'5 補助 = 書類 일 전체 (全員 과 같음)',[nB,nA,rowsN()]);
  /* 버튼 → 상세 탭 */
  const btn=qa(w,'.td-row').find(r=>/NAA2611-01/.test(r.textContent)).querySelector('.td-act button'); const tab=btn.dataset.tdtab; btn.click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button.on'));
  ok(w.document.querySelector('#dtIvTabs button.on').dataset.tab===(tab||w.document.querySelector('#dtIvTabs button.on').dataset.tab)&&/NAA2611-01/.test(txt(w,'dtIvSum')),'5 버튼 → 그 Invoice 상세 · 그 탭 ('+(tab||'いまここ')+')');
  w.document.querySelector('#dtIv [data-back]').click(); ok(w.document.getElementById('dtBTodo').classList.contains('on'),'← 一覧へ = 今日やること 로 돌아옴');
  ok(!W.writes.length,'쓰기 0 (메일 보내기 · 초안 · 읽음 표시 · SharePoint · COMPASS)',W.writes);
  ok(W.req.some(r=>/me\/messages\?\$filter=/.test(decodeURIComponent(r))&&/receivedDateTime ge/.test(decodeURIComponent(r))),'메일은 GET (receivedDateTime 범위) 만'); }
{ /* asof — 관리자만 */
  const W=X.world(), w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_who:'all'}, url:'?asof=2026-11-20T09:00'});
  await X.until(()=>!!w.document.querySelector('.td-sum'));
  ok(!w.document.querySelector('.td-asof'),'5 asof — 관리자 아님 → 무시 (지금 시각)');
  const W2=X.world(), w2=await X.page(W2,{html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all'}, url:'?asof=2026-11-20T09:00'});
  await X.until(()=>!!w2.document.querySelector('.td-sum'));
  ok(/asof 2026-11-20 09:00/.test(w2.document.querySelector('.td-asof')&&w2.document.querySelector('.td-asof').textContent),'5 asof — 관리자 → 그 시각으로 계산 · 표시');
  eq([DOC.parseAsof('2026-11-20T09:00'),DOC.parseAsof('2026-11-20 09:00'),DOC.parseAsof('x')],[at('2026-11-20','09:00'),null,null],'asof 모양'); }
console.log('7 메일 쓰기 0');
{ const app=HTML.split('<script id="doc-app">')[1]||''; const todo=app.slice(app.indexOf('v0.7 今日やること'), app.indexOf('function startPage'));
  ok(todo.length>1000&&!/method\s*:\s*['"](?:POST|PATCH|PUT|DELETE)/.test(todo)&&!/sendMail|createReply|\/send\b|isRead|\/move\b|spPut|dvWrite/.test(todo),'今日やること 코드: 메일 보내기 · 초안 · 읽음 · 이동 · SharePoint 쓰기 · COMPASS 쓰기 0');
  ok(HTML.toLowerCase().indexOf('photo'+'_rcp')<0,'공유 메일함 주소는 코드에 없음'); }
console.log((fail?'FAIL':'PASS')+' v07 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v07 예외',e.stack); process.exitCode=1; });
