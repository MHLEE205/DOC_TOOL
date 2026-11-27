/* v0.24 시험 (지시서 THOR_22 · 수정 묶음 v0.8 N15 · N11 · N12) — 가짜 데이터 · 가짜 거래처 · 네트워크 없음 · 메일 보내기 0. node v24.js [html]
   N15 Deposit 依頼 = 메일로 판단하지 않음 — 시작 = PORTAL 「通関依頼済」 (tsukan_irai_at) · 기한 = 그날 + 1 영업일 (토 · 일 · 공휴일) · 날짜 없는 지난 체크 = CY_CUT · 체크 전 = 「通関待ち」 (기한 없음 · 빨강 0) · 영업 「新規通関依頼」 메일 = 送付 아님 · 通関 칸
   N11 42C 결제 조건 부분만 (엔진 payTerm) · N12 L/C 에서 오는 칸 = L/C 원문 · 「L/C と違います」 · 「L/C の文言に戻す」 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), R=require('./acl_fx/pdfread');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
DOC.useAclEngine(require('./engine').engine(HTML));
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const at=DOC.at, TR=DOC.TODO_RULES;
const X0=o=>Object.assign({iv:'NAA2699-01', country:'VIETNAM', term:'CIF', pay:'LC', carrier:'ONE', otsu:'', buyer:'', cut:'2026-11-27', cutAm:false, blDate:'', files:[], portal:{}, hon:[], mails:[]},o||{});
const go=(x,now)=>{ x=X0(Object.assign({},x,{now})); const S=DOC.todoSignals(x), r=DOC.todoRow(x,S,now,null); if(r){ r.group=DOC.todoGroup(r,now); r.when=DOC.whenLabel(r,now); } return {S,r}; };
(async()=>{
console.log('버전');
ok(/<title>LEENAI D-00 書類ツール v0\.(?:2[456789]|3[0-5](?:\.1)?)<\/title>/.test(HTML)&&/version:'0\.(?:2[456789]|3[0-5](?:\.1)?)'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.24 · 푸터');
ok(/const ACL_ENGINE = \{commit:'(cedc44849b025aef88f78de71552ae7c65cf391f|249317df8aaa5b48b63b75c59570168a57f9a923)'.*ver:'0\.2[12]'\}/.test(HTML),'엔진 = CONTRACT_SEND cedc448 (acl v0.21) · v0.27 = 249317d (acl v0.22)');

console.log('N15 Deposit 依頼 기한 = 通関依頼済 + 1 영업일');
{ const NOW=at('2026-11-20','09:00');   // 금
  const a=go({portal:{tsukan:true, tsukanAt:'2026-11-19T01:00:00Z'}}, NOW);   // 목 10:00 JST 체크
  ok(a.r&&a.r.gkey==='depo'&&a.r.due===at('2026-11-20','18:00')&&a.r.group==='today'&&/通関依頼済 11\/19/.test(a.r.why),'목 체크 → 기한 금 18:00 (今日 · 빨강 아님)',a.r);
  const b=go({portal:{tsukan:true, tsukanAt:'2026-11-20T02:00:00Z'}}, at('2026-11-20','12:00'));   // 금 체크
  ok(b.r&&b.r.due===at('2026-11-24','18:00'),'금 체크 → 토 · 일 · 11/23 (공휴일) 건너 화 11/24',b.r&&new Date(b.r.due).toISOString());
  const c=go({portal:{tsukan:true}, cut:'2026-11-18'}, NOW);   // 날짜 없는 지난 체크
  ok(c.r&&c.r.due===at('2026-11-19','18:00')&&c.r.group==='late'&&/日付なし · CY_CUT/.test(c.r.why),'날짜 없는 체크 = CY_CUT (11/18) + 1 영업일',c.r);
  const d=go({portal:{}, cut:'2026-11-27', mails:[{t:at('2026-11-18','09:32'), subj:'新規通関依頼:BKG#TESTBK1, CUT11/27', att:[], hasAtt:false, body:'', skind:'staff', uses:['CUSTREQ'], kind:''}]}, NOW);
  ok(d.S.sub==null&&!d.S.subKnown&&d.r&&d.r.what==='Deposit 依頼（通関待ち）'&&d.r.due==null&&d.r.group==='none'&&d.r.when==='通関待ち','영업 「新規通関依頼」 메일 = 送付 아님 → 「Deposit 依頼（通関待ち）」 · 기한 없음 · 빨강 0 (실례 모양)',d.r);
  const e=go({portal:{}, cut:'2026-12-20'}, NOW); ok(e.r===null,'CY_CUT 가 10 일보다 멀면 안 보임');
  const f=go({country:'INDONESIA', portal:{}, cut:'2026-11-27', mails:d.r?[]:[]}, NOW); ok(f.r===null,'베트남 밖 = Deposit 없음 · 체크 전 = 書類 일 없음');
  const g=go({portal:{tsukan:true, tsukanAt:'2026-11-19T01:00:00Z'}, mails:[{t:at('2026-11-19','15:00'), subj:'[Deposit Request for NAA2699-01]', att:[], hasAtt:true, body:'', skind:'staff', uses:['DEPO'], kind:''}]}, NOW);
  ok(g.r&&g.r.zone==='wait'&&/Deposit/.test(g.r.what),'依頼 메일이 있으면 = 待ち (기한 판단만 通関依頼済 · 依頼 확인은 지금처럼)',g.r);
  const h=go({portal:{tsukan:true, tsukanAt:'2026-11-19T01:00:00Z'}, asof:at('2026-11-18','12:00')}, at('2026-11-18','12:00')); ok(h.r===null||h.r.what==='Deposit 依頼（通関待ち）','asof (11/18) 보다 뒤의 체크는 안 씀',h.r);
  /* 통관 칸 (현황판) */
  const cells=DOC.judgeIv({iv:'NAA2699-01', country:'VIETNAM', term:'CIF', folder:{files:[{name:'NAA2699-01_IV_PL_SI.pdf', lastModified:'2026-11-10T00:00:00Z'}]}, tsukan:{at:'2026-11-19T01:00:00Z'}});
  ok(cells.customs.s==='done'&&/通関依頼済 11\/19/.test(cells.customs.why)&&cells.customs.sent===true,'現況板 通関 = 通関依頼済 11/19 (ACL = 待ち 乙仲)',cells.customs);
  const cells2=DOC.judgeIv({iv:'NAA2699-01', country:'VIETNAM', term:'CIF', folder:{files:[{name:'NAA2699-01_IV_PL_SI.pdf', lastModified:'2026-11-10T00:00:00Z'}]}});
  ok(cells2.customs.s==='todo','체크 없음 = 지금처럼 (作成済 · 送付は未確認)',cells2.customs);
  ok(!/TR\.SUB_HEAD\.test\(mailHead\(m\.subj\)\)\)\|\|first\(M,m=>m\.skind==='staff'&&m\.uses\.indexOf\('CUSTREQ'\)/.test(HTML),'todoSignals 에서 CUSTREQ 메일 = 送付 판단 삭제'); }

console.log('N11 결제 조건 부분만');
{ eq([DOC.lc42({payment:{tenor_text:'100PCT OF INVOICE VALUE WILL BE PAID AT 90 DAYS DAYS AFTER BILL OF LADING DATE AGAINST THE PRESENTATION OF THE FOLLOWING DOCUMENTS'}}), DOC.lc42({payment:{tenor_text:'100PCT OF INVOICE VALUE WILL BE PAID AT 90 DAYS AFTER SHIPMENT DATE'}}), DOC.lc42({payment:{tenor_text:'AT SIGHT'}})],
     ['90 DAYS DAYS AFTER BILL OF LADING DATE','90 DAYS AFTER SHIPMENT DATE','AT SIGHT'],'DOC.lc42 = 엔진 payTerm (KC1 · DC1 모양 · AT SIGHT 그대로)'); }

console.log('N12 L/C 에서 오는 칸 = L/C 원문');
{ const lcText=':21 TESTLC12345\n:46A ...FULL SET OF CLEAN ON BOARD BILL OF LADING MADE OUT TO THE ORDER OF\nSAMPLE BANK HANOI BRANCH NOTIFY APPLICANT\n:47A INVOICE MUST SHOW 180 DAYS AFTER SIGHT AND PO NO. TEST-77', lc={lc_no:'TESTLC12345', payment:{tenor_text:'AT 180 DAYS AFTER SIGHT'}};
  const ctx={lc, lcText, lc42:DOC.lc42(lc)};
  eq([DOC.lcExpect('cr49f_lc_no','testlc12345',ctx), DOC.lcExpect('crcf9_payment_deadline','180DAYS AFTER SIGHT',ctx)],['TESTLC12345','AT 180 DAYS AFTER SIGHT'],'값이 정해진 칸 = L/C 번호 (:21) · 42C 결제 조건');
  eq(DOC.lcExpect('crcf9_consignee','to the order of sample bank  hanoi branch',ctx),'TO THE ORDER OF SAMPLE BANK HANOI BRANCH','글 칸 = 공백 · 대소문자만 다르면 L/C 글자로 (L/C 줄바꿈 = 공백 1 개)');
  eq(DOC.lcExpect('crcf9_invoicetext','PO NO. TEST-77#180DAYS AFTER SIGHT',ctx),'PO NO. TEST-77#180 DAYS AFTER SIGHT','# 줄마다 · 180DAYS → 180 DAYS (N12 실례 모양)');
  eq(DOC.lcExpect('crcf9_bencert_text','WE CERTIFY …',ctx),'WE CERTIFY …','L/C 에 없는 글 = 그대로 (바꾸지 않음)');
  eq(DOC.lcExpect('crcf9_po_vo','TEST-77',ctx),null,'L/C 칸이 아닌 칸 = 판단 안 함');
  const res={fieldHead:['crcf9_consignee','cr49f_lc_no','crcf9_invoicetext','crcf9_payment_deadline'], rec:{sinos:{1:{crcf9_consignee:'TO THE ORDER OF SAMPLE BANK HANOI  BRANCH', cr49f_lc_no:'testlc12345', crcf9_invoicetext:'180DAYS AFTER SIGHT', crcf9_payment_deadline:'X'}}}};
  const fx=DOC.siLcFix(res,ctx); eq([res.rec.sinos[1].crcf9_consignee, res.rec.sinos[1].cr49f_lc_no, res.rec.sinos[1].crcf9_invoicetext, res.rec.sinos[1].crcf9_payment_deadline, fx.length],['TO THE ORDER OF SAMPLE BANK HANOI BRANCH','TESTLC12345','180 DAYS AFTER SIGHT','X',3],'추천 (siLcFix) = L/C 원문으로 (결제 조건은 siDeadlineFix 따로) · 고친 칸 기록');
  ok(/if\(L&&L\.lc\)\{ const lcText=await lcTextOf\(L\.lc\)\.catch\(\(\)=>''\); DOC\.siLcFix\(res,\{lc:L\.lc, lcText, lc42:t\}\); \}/.test(HTML),'推薦 · 前回 · 仮 S/I · 저장한 추천 = siDeadlineApply 에서 siLcFix');
  ok(/L\/C と違います（'\+lcw\.length\+' 欄）/.test(HTML)&&/data-lcback=/.test(HTML),'COMPASS 쓰기 확인 창 = 「L/C と違います」 + 「L/C の文言に戻す」'); }

console.log('N12 ✏ 直す = 「L/C と違います」 → 「L/C の文言に戻す」');
{ const W=X.world(), id='00000000-0000-4000-8000-000000000d01', siId='00000000-0000-4000-8000-000000000f01';
  Object.keys(W).forEach(k=>{ if(Array.isArray(W[k])) W[k]=JSON.parse(JSON.stringify(W[k]).split(X.g('d',1)).join(id).split(X.g('f',1)).join(siId)); });
  W.sis[0].crcf9_consignee='TO ORDER OF SAMPLE BANK';
  W.putFail=u=>{ const last=W.writes[W.writes.length-1]; if(last&&last.method==='PATCH'&&/cr49f_s_is\(/.test(u)){ const b=JSON.parse(last.body); Object.assign(W.sis.find(x=>x.cr49f_s_iid===siId),b,{modifiedon:'2026-11-25T09:00:00Z'}); } return 0; };
  const w=await X.page(W,{...INIT}); await X.until(()=>/読み込み完了/.test((w.document.getElementById('dtProg')||{}).textContent||''),30000);
  w.eval('siLcCtx=async()=>({lc:{lc_no:"TESTLC001"}, lcText:":46A MADE OUT TO THE ORDER OF\\nSAMPLE BANK HANOI BRANCH", lc42:"AT 90 DAYS AFTER B/L DATE"})');
  w.eval('S.cur={type:"ct", id:"'+id+'"}; S.siCur["'+id+'"]={sis:__W.sis.filter(s=>s._cr49f_sale_contract_id_value==="'+id+'")}');
  const sst=w.document.createElement('div'); sst.id='dtSiSt'; w.document.body.appendChild(sst);
  const n0=W.writes.length; w.eval('siEditField("'+id+'","'+siId+'","crcf9_consignee")'); await X.until(()=>!!w.document.getElementById('dtSiEdV'),10000);
  w.document.getElementById('dtSiEdV').value='to the order of sample bank hanoi  branch'; w.document.getElementById('dtSiEdNext').click(); await X.until(()=>!!w.document.getElementById('dtSiFixGo'),5000);
  const mt=w.document.getElementById('dtModalBox').textContent; ok(/L\/C と違います/.test(mt)&&/TO THE ORDER OF SAMPLE BANK HANOI BRANCH/.test(mt)&&!!w.document.getElementById('dtSiLcBack')&&W.writes.length===n0,'바꾼 값이 L/C 와 공백 · 대소문자 다름 → 「L/C と違います」 · 쓰기 0',mt.slice(0,300));
  w.document.getElementById('dtSiLcBack').click(); await X.sleep(30);
  const mt2=w.document.getElementById('dtModalBox').textContent; ok(!/L\/C と違います/.test(mt2)&&/直した値TO THE ORDER OF SAMPLE BANK HANOI BRANCH/.test(mt2),'「L/C の文言に戻す」 → 직은 값 = L/C 원문 · 경고 사라짐',mt2.slice(0,300));
  const cb=w.document.getElementById('dtSiFixOk'); cb.checked=true; cb.onchange(); w.document.getElementById('dtSiFixGo').click();
  await X.until(()=>W.writes.length>=n0+3,10000); await X.sleep(100);
  const pt=W.writes.slice(n0).find(x=>x.method==='PATCH'); ok(pt&&JSON.stringify(JSON.parse(pt.body))===JSON.stringify({crcf9_consignee:'TO THE ORDER OF SAMPLE BANK HANOI BRANCH'}),'PATCH = 그 칸만 · L/C 원문',pt&&pt.body); }

console.log((fail?'FAIL':'PASS')+' v24 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v24 예외',e.stack); process.exitCode=1; });
