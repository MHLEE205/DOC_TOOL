/* v0.33 시험 (지시서 THOR_31 · D1 ~ D6 · R1 ~ R4) — 가짜 데이터 · 가짜 번호 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0 · COMPASS 쓰기 0. node v33.js [html]
   V2 베트남 공장 하나 (POD) · 못 정함 (후보 버튼) · 공장 1 개 = v0.32 그대로 / M1 ~ M3 MAERSK / K1 접두어 떼고 잇기 · 잘못 잇기 0 / K2 Trade Term 늘 要確認 / P1 송금 메일 = 依頼 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V33, at=DOC.at;
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.3[356](?:\.1)?<\/title>/.test(HTML)&&/version:'0\.3[356](?:\.1)?'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.33 · 푸터');

console.log('V2 베트남 라이선스 = 공장별');
/* 가짜 바이어 · 가짜 MST (10 자리) · 가짜 GPMT 번호 — 공장 A (1111111111 · 801 · DA NANG) · 공장 B (2222222222 · 802 · CAT LAI) */
const A=n=>({crcf9_sino:1, crcf9_consignee:'1111111111#801/GPMT-BTNMT#DEPOSIT#SAMPLE FACTORY ALPHA CO., LTD', crcf9_notify_party:'1111111111#801/GPMT-BTNMT#DEPOSIT', crcf9_po_vo:'', crcf9_vo_no:'', cr49f_payment_terms:'CFR', cr49f_lc_no:'', crcf9_place_of_delivery_1:'DA NANG PORT, VIET NAM', crcf9_port_of_discharge:'DA NANG'});
const Bf=n=>({crcf9_sino:1, crcf9_consignee:'2222222222#802/GPMT-BNNMT#DEPOSIT#SAMPLE FACTORY BETA CO., LTD', crcf9_notify_party:'2222222222#802/GPMT-BNNMT#DEPOSIT', crcf9_po_vo:'', crcf9_vo_no:'', cr49f_payment_terms:'CFR', cr49f_lc_no:'', crcf9_place_of_delivery_1:'CAT LAI PORT, VIETNAM', crcf9_port_of_discharge:'CAT LAI'});
const P=(n,h)=>({no:'LRS-2699VN'+n, date:'2026-0'+n+'-01', sis:[h]});
const prev=[P(4,A()),P(3,Bf()),P(2,A()),P(1,A())];
const F=DOC.licFactories(prev,1); eq(F.map(f=>[f.tax,f.nums.join(),f.p.no,f.name]),[['1111111111','801','LRS-2699VN4','SAMPLE FACTORY ALPHA CO., LTD'],['2222222222','802','LRS-2699VN3','SAMPLE FACTORY BETA CO., LTD']],'공장 = 라이선스 칸의 10 자리 번호 · 그 공장의 가장 최근 계약 · 이름');
const rB=DOC.ttRecommend({no:'LRS-2699VN5', prev, sale:[], term:'CFR', pod:'', pods:['CAT LAI'], country:'VIETNAM'}), bB=rB.rec.basis[1].crcf9_consignee;
ok(/2222222222#802/.test(rB.rec.sinos[1].crcf9_consignee)&&bB.fac&&bB.fac.pick==='2222222222'&&/^要確認 · ライセンス番号（SAMPLE FACTORY BETA CO\., LTD · 802\/GPMT · 前回 LRS-2699VN3）$/.test(bB.flag),'V2 POD 가 한 공장에만 맞음 = 그 공장 번호 (직전 값 아님) + 「要確認 · ライセンス番号（○○ · 前回 …）」',bB);
ok(DOC.siFieldState({value:rB.rec.sinos[1].crcf9_consignee, basis:bB}).s==='check','V2 공장 번호도 늘 要確認');
const rU=DOC.ttRecommend({no:'LRS-2699VN5', prev, sale:[], term:'CFR', pod:'', pods:[], country:'VIETNAM'}), bU=rU.rec.basis[1].crcf9_consignee;
ok(/1111111111#801/.test(rU.rec.sinos[1].crcf9_consignee)&&bU.fac&&bU.fac.cands.length===2&&bU.flag.indexOf(V.LIC_PICK.replace('{n}','2'))===0,'V2 못 정함 (POD 없음) = 「要確認 · 工場を選んでください」 + 후보 2 (칸 = 직전 값)',bU);
eq(bU.fac.cands.map(c=>[c.tax,c.no,/#80[12]\//.test(c.val)]),[['1111111111','LRS-2699VN4',true],['2222222222','LRS-2699VN3',true]],'V2 후보 = 공장마다 그 공장 최근 문 (누르면 이 문으로)');
const rS=DOC.ttRecommend({no:'LRS-2699VN5', prev:[P(4,Object.assign(A(),{crcf9_port_of_discharge:'CAT LAI', crcf9_place_of_delivery_1:'CAT LAI'})),P(3,Bf())], sale:[], term:'CFR', pod:'', pods:['CAT LAI'], country:'VIETNAM'});
ok(rS.rec.basis[1].crcf9_consignee.fac&&rS.rec.basis[1].crcf9_consignee.fac.cands,'V2 POD 가 두 공장 다 맞음 = 못 정함 (후보)');
const one=[P(3,A()),P(2,Object.assign(A(),{crcf9_consignee:'1111111111#799/GPMT-BTNMT#DEPOSIT'})),P(1,A())];
const r1=DOC.ttRecommend({no:'LRS-2699VN5', prev:one, sale:[], term:'CFR', pod:'', pods:['DA NANG'], country:'VIETNAM'}), b1=r1.rec.basis[1].crcf9_consignee;
ok(!b1.fac&&/^要確認 · ライセンス番号（前回 /.test(b1.flag),'V3 공장 1 개 (같은 MST · 번호만 갱신) = v0.32 그대로 (늘 要確認 · 이력)',b1);
const rK=DOC.ttRecommend({no:'LRS-2699VN5', prev, sale:[], term:'CFR', pod:'', pods:['CAT LAI'], country:'KOREA'}); ok(!rK.rec.basis[1].crcf9_consignee.fac,'베트남 아닌 나라 = 공장 없음');
ok(/function siFacBtns\(x\)/.test(HTML)&&/data-sifac=/.test(HTML)&&/\(E\.sinos\[sn\]=E\.sinos\[sn\]\|\|\{\}\)\[col\]=cand\.val/.test(HTML),'V2 후보 버튼 = 누르면 그 칸만 채움 (S.siEdit · 쓰기는 「COMPASS に書き込む」 뒤)');

console.log('K2 Trade Term = 늘 要確認');
const rt=DOC.ttRecommend({no:'LRS-2699VN5', prev:[P(1,A())], sale:[], term:'CFR', pod:'', country:'KOREA'}), bt=rt.rec.basis[1].cr49f_payment_terms;
ok(bt.flag==='要確認 · Trade Term（前回: CFR · 今回の契約: CFR）'&&DOC.siFieldState({value:'CFR', basis:bt}).s==='check','K2 같아도 要確認 · 前回 글 · 이번 계약 조건 둘 다',bt);
const rtt=DOC.ttRecommend({no:'LRS-2699VN5', prev:[P(1,A())], sale:[], term:'CFR', pod:'', country:'KOREA', lcTent:true}); ok(!/Trade Term（/.test(rtt.rec.basis[1].cr49f_payment_terms.flag||''),'仮 S/I (L/C) = v0.32 그대로');

console.log('M1 ~ M3 MAERSK');
const rc=DOC.blRcvLink;
eq(rc({subj:'Proof of payment accepted', skind:'carrier', fromDom:'maersk.example.test', body:''}),{rcv:true, req:true, ticket:'', maersk:true},'M1 Proof of payment accepted (선사) = B/L 依頼 済');
eq(rc({subj:'Payer details verification for Tpdoc number 999999999', skind:'carrier', fromDom:'maersk.example.test', body:''}).rcv,false,'M4 Payer details = 依頼 아님 (그대로)');
eq(rc({subj:'Proof of payment accepted', skind:'other', fromDom:'example.test', body:''}).rcv,false,'선사 아닌 곳 = 아님');
const NOW=at('2026-11-27','10:00');
const S0=o=>Object.assign({sub:null, subKnown:false, acl:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, payPlan:false, bl:null, ins:null, rr:null, fd:null},o||{});
const X0=o=>Object.assign({iv:'NTE2699-01', country:'INDONESIA', term:'CFR', pay:'TT', carrier:'MAERSK', otsu:'', buyer:'', cut:'2026-11-20', cutAm:false, blDate:'', etd:'2026-11-30'},o||{});
const row=(x,s)=>{ const r=DOC.todoRow(X0(x),S0(s),NOW,null); if(r){ r.group=DOC.todoGroup(r,NOW); r.when=DOC.whenLabel(r,NOW); } return r; };
const sg={drafts:[at('2026-11-18','10:00')], pay:at('2026-11-20','15:00'), bmail:at('2026-11-21','15:35'), bmailSrc:'maersk'};
const m1=row({},sg); ok(m1&&m1.what===V.MK_PRE&&m1.zone==='wait'&&m1.due==null&&m1.when==='出港後に印刷'&&!DOC.reqRow(m1)&&!m1.nudge,'M2 ETD 전 = ◐ 「出港後に印刷」 (要対応 아님 · 재촉 없음)',m1);
const m2=row({etd:'2026-11-27'},sg); ok(m2&&m2.what===V.MK_DO&&m2.zone==='do'&&m2.group==='today'&&m2.due==null&&DOC.reqRow(m2)&&!m2.nudge&&/Maersk Proof of payment 11\/21/.test(m2.why),'M2 ETD 당일부터 = 「B/L 印刷（Maersk サイトからダウンロード）」 要対応 (노랑 · 기한 없음 · 재촉 아님)',m2);
const m3=row({etd:'2026-11-25'},Object.assign({},sg,{bl:at('2026-11-26','10:00')})); ok(m3&&m3.gkey!=='blreq'&&!/印刷/.test(m3.what),'M3 인쇄본 (B/L 受領) 있으면 = 다음 단계 (FD)',m3);
const m4=row({carrier:'SAMPLE LINE'},Object.assign({},sg,{bmailSrc:'mail'})); ok(m4&&m4.what!==V.MK_DO&&m4.what!==V.MK_PRE,'MAERSK 아닌 선사 = 그대로 (B/L 待ち)',m4);
const base={iv:'NTE2699-01', carrier:'MAERSK', term:'CFR', pay:'TT', files:[], hon:[], payDate:'2026-11-20', now:NOW};
const M=(t,o)=>Object.assign({t, subj:'', att:[], hasAtt:false, body:'', skind:'carrier', uses:[], kind:''},o);
const ss=DOC.todoSignals(Object.assign({},base,{mails:[M(at('2026-11-21','15:35'),{subj:'Proof of payment accepted', uses:['BLISSUE'], rcv:true, rcvReq:true, maersk:true})]}));
ok(ss.bmail===at('2026-11-21','15:35')&&ss.bmailSrc==='maersk'&&ss.bl==null,'M1 신호 = B/L 依頼 済 (B/L 受領 으로 안 셈)',ss);

console.log('K1 COMPASS B/L 접두어 떼고 잇기');
const I=DOC.linkIndex([{id:'S1', iv:'NTE2699-01', bkg:'TESTBK001', bl:'KMTCTST0012345'},{id:'S2', iv:'NTE2699-02', bkg:'TESTBK002', bl:'TST9990001'}]);
eq(DOC.linkMail('[KMTC] Your B/L Issue Request Has Been Pending. (B/L No.TST0012345)',I),['S1'],'K1 KMTC 접두어 뗀 번호 (TST0012345) 로 이음');
eq(DOC.linkMail('B/L No. KMTCTST0012345',I),['S1'],'원래 번호도 그대로');
eq(DOC.linkMail('B/L No. TST9990001',I),['S2'],'다른 배 = 그 배만 (잘못 잇기 0)');
eq(DOC.linkMail('ref 0012345',I),[],'짧은 조각 (6 자 미만 · 숫자만 일부) = 잇지 않음');

console.log('P1 송금 메일 = B/L 依頼 (지금 규칙)');
ok(DOC.mailKind({subj:'<振込明細書送付>Re: Draft B/L from SAMPLE LINE - BL TESTBL001', att:['remit.pdf'], body:'出港次第SWB発行をお願いします'})==='b','P1 담당 → 선사 「<振込明細書送付>…」 = b (B/L 依頼 · 송금 같은 시각)');
ok(DOC.mailKind({subj:'＜振込明細書送付>SAMPLE-TESTBK001', att:[], body:'OBLのアプロードをお願いします'})==='b','P1 전각 ＜ 도 같음');
const sp=DOC.todoSignals(Object.assign({},base,{carrier:'SAMPLE LINE', payDate:'', mails:[M(at('2026-11-25','15:03'),{subj:'<振込明細書送付>BL TESTBL001', skind:'staff', kind:'b', uses:['BLISSUE']})]}));
ok(sp.bmail===at('2026-11-25','15:03'),'P1 그 메일 시각 = B/L 依頼 済',sp);

console.log('한글 0');
ok(!/[가-힣]/.test(HTML.match(/const V33 = \{[\s\S]*?\n  \};/)[0].replace(/\/\*[\s\S]*?\*\//g,'')),'V33 화면 글자 한글 0');

console.log((fail?'FAIL':'PASS')+' v33 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v33 예외',e&&e.stack||e); process.exit(1); });
