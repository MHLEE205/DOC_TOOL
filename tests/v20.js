/* v0.20 시험 (지시서 THOR_14 D00 書類ツール v0.20 「메일 下書き 고치기」) — 가짜 데이터 · 가짜 거래처 · 네트워크 없음 · 메일 보내기 0. node v20.js [html]
   R4 받는 사람 — 마스터 書類メール To / CC (doc_to · doc_cc) → 비면 to · cc → 없으면 「宛先が分かりません」 · 前のメール 候補 없음
   R2 제목 — 그 바이어에게 같은 종류로 보낸 가장 최근 제목의 형 (Invoice · 계약 · PO · B/L · MT 를 이번 값으로) · 못 쓰면 기본 + 「件名を確認してください」
   R3 zip — FD 가 없으면 {IV} 가 든 zip · 다른 번호 zip = 안 만듦 · 3 MB
   R5 일본어 본문 — 실제 원문 (짧은 형 / 목록 형 = 지난 메일 본문으로 고름) · 빈 칸 = 「本文の空欄を確認してください」 · {ORDER} 같은 글자가 남지 않음 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
DOC.useAclEngine(ENG.engine(HTML));
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const WIP='古紙/-. 古紙書類/▲ 書類作成中', txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const F=(...n)=>n.map((x,i)=>({id:'f'+i, name:x, size:1000, lastModified:'2026-11-1'+i+'T00:00:00Z'}));
const T=DOC.MAIL20.TAG, M20=DOC.MAIL20;
const base={iv:'NAA2699-01', ct:'LRS-2699AA1', po:'2699/1126', buyer:'BUYER-A', name:'SAMPLE BUYER A', bl:'TESTBL1', etd:'2026-11-20', mt:'91.96', rcpDom:'example.test', to:['a@x.test'], toSrc:'doc'};
const D=(kind,o)=>DOC.mailDraft19(kind, Object.assign({}, base, o||{}));

(async()=>{
console.log('R2 제목의 형 (mailSubjTpl)');
eq(DOC.mailSubjTpl('[Deposit Request for NAA2601-01] #LRS-2601AA1_06/SAMPLE-LC/2026', T.depo, {IV:'NAA2601-01', CT:'LRS-2601AA1', PO:'06/SAMPLE-LC/2026'}), '[Deposit Request for {IV}] #{CT}_{PO}', '계약_PO 모양 (KOA 같은 바이어)');
eq(DOC.mailSubjTpl('Re: [Deposit Request for NAA2601-01] #2025XX_ABC', T.depo, {IV:'NAA2601-01', CT:'LRS-2601AA1', PO:'2025XX-ABC'}), '[Deposit Request for {IV}] #{PO_}', 'Re: 뗌 · PO 의 - → _ 모양도 찾음');
eq(DOC.mailSubjTpl('[Shipping docs for NAA2601-01]Re: [Deposit Request for NAA2601-01] 2601/1026_SAMPLE', T.en, {IV:'NAA2601-01', PO:'2601/1026'}), '[Shipping docs for {IV}]', '끝의 다른 스레드 제목 뗌');
eq(DOC.mailSubjTpl('[RE][선적서류안내]#LRS-2601AA1_NAA2601-01_133.20MT', T.ko, {IV:'NAA2601-01', CT:'LRS-2601AA1'}), '[선적서류안내]#{CT}_{IV}_{MT}MT', 'ko — [RE] 뗌 · MT');
eq(DOC.mailSubjTpl('  船積書類送付_NAA2601-01: 株式会社サンプル】', T.ja, {IV:'NAA2601-01'}), '船積書類送付_{IV}: 株式会社サンプル】', 'ja — 실제 모양 그대로');
eq(DOC.mailSubjTpl('[Shipping docs for for NAA2601-01]', T.en, {IV:'NAA2601-01'}), '[Shipping docs for {IV}]', '오타 for for 바로잡음');
eq(DOC.mailSubjTpl('[船積書類送付_NAA2601-01  #80981', T.ja, {IV:'NAA2601-01', PO:'11111'}), null, '모르는 번호가 남음 → null');
eq(DOC.mailSubjTpl('[Shipping docs for NAA2601-01 & NAA2601-02]', T.en, {IV:'NAA2601-01'}), null, '다른 Invoice 가 남음 → null');
eq(DOC.mailSubjTpl('REQ EXTRA FREETIME [Shipping docs for NAA2601-01]', T.en, {IV:'NAA2601-01'}), null, '종류 표시가 맨 앞이 아님 → null');
eq(DOC.mailSubjTpl('[Deposit Request for NAA2601-01]', T.en, {IV:'NAA2601-01'}), null, '종류가 다름 → null');

console.log('R2 제목 만들기');
{ const d=D('depo',{files:F('NAA2699-01_DRAFT DOC.pdf'), subjTpl:'[Deposit Request for {IV}] #{CT}_{PO}', subjFrom:'[Deposit Request for NAA2601-01] #LRS-2601AA1_06/X'});
  ok(d.subject==='[Deposit Request for NAA2699-01] #LRS-2699AA1_2699/1126'&&d.warn.indexOf(M20.SUBJ_CHECK)<0&&/LRS-2601AA1/.test(d.subjFrom),'형 → 이번 값 · 확인 안내 없음 · 前回 제목 표시',d);
  const p=D('depo',{po:'', files:F('NAA2699-01_DRAFT DOC.pdf'), subjTpl:'[Deposit Request for {IV}] #{CT}_{PO}'}); ok(p.subject==='[Deposit Request for NAA2699-01] #BUYER-A'&&p.warn.indexOf(M20.SUBJ_CHECK)>=0&&!p.subjFrom,'값을 못 채움 → 기본 + 「件名を確認してください」',p);
  const n=D('ship',{lang:'en', files:F('NAA2699-01_FD.pdf')}); ok(n.subject==='[Shipping docs for NAA2699-01]'&&n.warn.indexOf(M20.SUBJ_CHECK)>=0,'지난 메일 없음 → 기본 + 확인',n.warn);
  const u=D('ship',{lang:'en', files:F('NAA2699-01_FD.pdf'), subjTpl:'[Shipping docs for {IV}] #{PO_}'}); ok(u.subject==='[Shipping docs for NAA2699-01] #2699/1126','PO_ (- 없는 PO = 그대로)',u.subject); }

console.log('R4 받는 사람');
{ const d=D('ship',{lang:'en', files:F('NAA2699-01_FD.pdf'), to:['Doc@x.test'], cc:['c@x.test'], toSrc:'doc'}); eq([d.to,d.cc,d.toSrc],[['doc@x.test'],['c@x.test','rcp@example.test'],'doc'],'doc_to · doc_cc 그대로 · CC rcp@');
  const m=D('ship',{lang:'en', files:F('NAA2699-01_FD.pdf'), toSrc:'mail'}); ok(m.warn.every(w=>!/前のメールの宛先/.test(w)),'候補 「確認してください（前のメールの宛先）」 없음');
  const z=D('ship',{lang:'en', files:F('NAA2699-01_FD.pdf'), to:[], toSrc:''}); ok(z.warn.indexOf(DOC.MAIL19.NO_TO)>=0,'없으면 「宛先が分かりません」'); }

console.log('R3 zip');
{ const z=D('ship',{lang:'ja', files:F('NAA2699-01.zip')}); ok(!z.block&&z.att.length===1&&z.att[0].as==='NAA2699-01.zip','FD 없음 → {IV}.zip 붙음',z);
  const r=D('ship',{lang:'ja', files:F('NAA2699-01_FD.pdf','NAA2699-01.zip')}); eq(r.att.map(a=>a.as),['NAA2699-01_FD.pdf'],'FD 있으면 FD (zip 아님)');
  const b=D('ship',{lang:'ja', files:F('NAA2698-05.zip')}); ok(/^添付名が違う: NAA2698-05\.zip/.test(b.block)&&!b.att.length,'다른 번호 zip → 안 만듦 (빨강)',b.block);
  const m=D('ship',{lang:'ja', files:F('NAA2699-01_NAA2698-05.zip')}); ok(/^添付名が違う/.test(m.block),'다른 번호가 섞인 zip → 안 만듦',m.block);
  const x=D('ship',{lang:'ja', files:F('NAA2698-05_FD.pdf','NAA2699-01.zip')}); ok(/^添付名が違う/.test(x.block),'다른 번호 FD 가 폴더에 있으면 zip 이 있어도 안 만듦 (안전 쪽)',x.block);
  const big=D('ship',{lang:'ja', files:[{id:'z',name:'NAA2699-01.zip',size:4e6}]}); ok(!big.att.length&&big.attBig.length===1&&!big.block,'3 MB 넘는 zip = 붙이지 않고 안내');
  const dp=D('depo',{files:F('NAA2699-01.zip')}); ok(/^添付がありません/.test(dp.block),'Deposit 은 zip 아님 (DRAFT DOC 필요)'); }

console.log('R5 일본어 본문');
{ const s=D('ship',{lang:'ja', files:F('NAA2699-01_FD.pdf'), jaStyle:'short'}); eq(s.body.split('\n'),['いつも大変お世話になっております。','本件、出港確認できましたので、船積書類を添付にて送付いたします。','NAA2699-01','ご確認のほどよろしくお願いいたします。'],'짧은 형 = 실제 원문');
  const l=D('ship',{lang:'ja', files:F('NAA2699-01_FD.pdf'), jaStyle:'list', vessel:'SAMPLE VESSEL 001S', eta:'2026-12-05', pod:'SAMPLE PORT', vol:'40FT*1Container'});
  ok(/^添付にて出港しました1件の書類をご送付致します。\n=+\n-Invoice# : NAA2699-01\n-B\/L# :TESTBL1\n-Vessel :SAMPLE VESSEL 001S\n-ATD-ETA :11\/20-12\/05\(SAMPLE PORT\)\n-Volume :40FT\*1Container\n-Contract :LRS-2699AA1（）\n宜しくお願い致します。$/.test(l.body)&&l.warn.indexOf(M20.BODY_CHECK)>=0,'목록 형 = 실제 원문 · （仕入先） 빈 칸 → 「本文の空欄を確認してください」',l.body);
  ok(!/土産|お世話になっております。\n\n/.test(s.body)&&HTML.indexOf('の船積書類を添付いたしますので')<0,'토르_12 가 지은 문장 지움');
  const e=D('ship',{lang:'en', po:'', bl:'', etd:'', files:F('NAA2699-01_FD.pdf')}), dd=D('depo',{bl:'', etd:'', files:F('NAA2699-01_DRAFT DOC.pdf')});
  ok(!/\{[A-Z_]+\}/.test(e.body+dd.body)&&e.warn.indexOf(M20.BODY_CHECK)<0,'빈 {ORDER} · {BLLINE} 가 본문에 남지 않음 (v0.19 버그)',[e.body,dd.body]); }

console.log('문지기 · 보내기 0');
{ let t=0; for(const u of ['me/messages/x/send','me/sendMail','me/messages/x/forward','me/messages/x/reply']){ try{ DOC.guardMail('POST','https://graph.microsoft.com/v1.0/'+u); }catch(e){ t++; } } ok(t===4,'send · sendMail · forward · reply = 거부');
  const app=HTML.match(/<script id="doc-app">([\s\S]*?)<\/script>/)[1]; ok(!/\/send['"]|sendMail['"]|\/send\?/.test(app)&&!/blBuyerTo\(b\); x\.to/.test(app),'화면 코드 send 0 · 候補 경로 없음'); }

console.log('화면');
function world20(docTo){ const W=X.world();
  W.masters={sales_mail:[Object.assign({agent:'', buyer:'BUYER-A', to:'a@buyer-a.example.test', cc:'b@buyer-a.example.test', lang:'en'}, docTo?{doc_to:'d1@buyer-a.example.test;d2@buyer-a.example.test', doc_cc:'d3@buyer-a.example.test'}:{})]};
  W.sp[WIP+'/NAA2611-01'].push({id:'dd1',name:'NAA2611-01_DRAFT DOC.pdf',file:{},size:900,lastModifiedDateTime:'2026-11-20T00:00:00Z'},{id:'zz1',name:'NAA2611-01.zip',file:{},size:900,lastModifiedDateTime:'2026-11-20T00:00:00Z'});
  W.sis[0].crcf9_po_vo='2699/1126'; W.itemBytes={dd1:Buffer.from('%PDF-1.4 dd'), zz1:Buffer.from('PK zip')}; return W; }
const PAST="(()=>{ const b=S.bk.find(x=>x.cr49f_invoice_no==='NAA2611-01'); TODO.byBk=TODO.byBk||{}; const c=S.ct[b._cr49f_sale_contract_id_value];"+
  " TODO.byBk[b.cr49f_bookingid]=(TODO.byBk[b.cr49f_bookingid]||[]).concat([{t:Date.now()-86400000, subj:'Re: [Deposit Request for NAA2611-01] #'+c.cr49f_sale_contract_no+'_2699/1126', skind:'staff', uses:['DEPO'], att:[], body:'Dear'},"+
  " {t:Date.now()-2*86400000, subj:'[Deposit Request for NAA2611-01] #OLD', skind:'staff', uses:['DEPO'], att:[], body:''}]); return c.cr49f_sale_contract_no; })()";
{ const W=world20(true); const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); await X.until(()=>w.eval('typeof TODO!=="undefined"&&TODO.mailSt&&TODO.mailSt!=="load"'),10000).catch(()=>0);
  const ct=w.eval(PAST); w.eval("mailDraftModal('NAA2611-01','depo')"); await X.until(()=>!!w.document.getElementById('dtMdSubj'),5000);
  ok(w.document.getElementById('dtMdSubj').value==='[Deposit Request for NAA2611-01] #'+ct+'_2699/1126','제목 = 가장 최근 지난 제목의 형 (Re: 뗌 · 오래된 것 아님)',w.document.getElementById('dtMdSubj').value);
  ok(/前回の件名の形: Re: \[Deposit Request for NAA2611-01\]/.test(w.document.body.textContent),'확인 창에 「前回の件名の形」');
  ok(/To: d1@buyer-a\.example\.test; d2@buyer-a\.example\.test/.test(txt(w,'dtMdTo'))&&/d3@buyer-a\.example\.test/.test(txt(w,'dtMdTo'))&&/rcp@example\.test/.test(txt(w,'dtMdTo'))&&!/a@buyer-a/.test(txt(w,'dtMdTo'))&&/書類メール To/.test(w.document.body.textContent),'받는 사람 = doc_to · doc_cc (+ rcp@) · to 아님',txt(w,'dtMdTo'));
  w.eval('closeModal()'); w.eval("mailDraftModal('NAA2611-01','ship')"); await X.until(()=>!!w.document.getElementById('dtMdMake'),5000);
  ok(/NAA2611-01\.zip/.test(txt(w,'dtMdAtt'))&&/件名を確認してください/.test(w.document.body.textContent),'Shipping docs — zip 첨부 · 지난 메일 없음 = 확인 안내',txt(w,'dtMdAtt'));
  w.document.getElementById('dtMdMake').click(); await X.until(()=>/作りました|作れません|権限/.test(txt(w,'dtMdSt')),5000);
  const A=(W.mailWrites||[]).filter(x=>/attachments$/.test(x.url)).map(x=>JSON.parse(x.body)); ok(A.length===1&&A[0].name==='NAA2611-01.zip'&&A[0].contentType==='application/zip','zip = application/zip 로 첨부 (가짜 Outlook)',A.map(a=>a.name+' '+a.contentType));
  ok((W.mailWrites||[]).every(x=>!/\/send|sendMail|forward|\/move/.test(x.url)),'보내기 호출 0'); w.close(); }
{ const W=world20(false); const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); w.eval("mailDraftModal('NAA2611-01','depo')"); await X.until(()=>!!w.document.getElementById('dtMdSubj'),5000);
  ok(/To: a@buyer-a\.example\.test/.test(txt(w,'dtMdTo'))&&/b@buyer-a\.example\.test/.test(txt(w,'dtMdTo'))&&/マスター To \/ CC/.test(w.document.body.textContent),'doc_to 비면 to · cc',txt(w,'dtMdTo')); w.close(); }

{ /* 마스터 줄 찾기 = Shipping Schedule 과 같음 — 계약의 AGENT → AGENT:: (AGENT::BUYER 없으면) · AGENT 가 숫자 = 없음 → ::BUYER */
  for(const [ag,want,m] of [['AGENT-X','ag@agent-x.example.test','AGENT 있음 → AGENT:: 줄 (BUYER 줄 아님)'],['0','a@buyer-a.example.test','AGENT 가 숫자 (0) → ::BUYER 줄']]){
    const W=world20(false); W.masters.sales_mail.push({agent:'AGENT-X', buyer:'', to:'ag@agent-x.example.test', cc:'', lang:'en'});
    const b=W.bookings.find(x=>x.cr49f_invoice_no==='NAA2611-01'), c=W.contracts.find(x=>x.cr49f_sale_contractid===b._cr49f_sale_contract_id_value); c.cr49f_agent_id={cr49f_agent:ag};
    const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); w.eval("mailDraftModal('NAA2611-01','depo')"); await X.until(()=>!!w.document.getElementById('dtMdSubj'),5000);
    ok(new RegExp('To: '+want.replace(/\./g,'\.')).test(txt(w,'dtMdTo')),m,txt(w,'dtMdTo')); w.close(); } }

console.log((fail?'FAIL':'PASS')+' v20 — pass '+pass+' fail '+fail);
process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v20 예외',e&&e.stack||e); console.log('FAIL v20 — pass '+pass+' fail '+(fail+1)); process.exit(1); });
