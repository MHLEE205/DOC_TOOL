/* v0.19 시험 (지시서 THOR_12 D00 書類ツール v0.19 「업체 메일 下書き」) — 가짜 데이터 · 가짜 거래처 · 네트워크 없음 · 메일 보내기 0. node v19.js [html]
   1 틀 (大場 방식) — 本登録 · ACL 訂正 · Deposit Request · Shipping docs (en · ko · ja) · 오타 바로잡음 (DRAFT D0C · for for) · 本登録 문장 = 大場 원문
   2 받는 사람 — 마스터 (master_sales_mail) → 없으면 지난 메일 (候補 · 「確認してください」) · CC rcp@ 늘 · 모르면 「宛先が分かりません」
   3 첨부 — {IV}_DRAFT DOC (D0C 도 · 이름은 바로잡아 붙임) · {IV}_FD · {IV}_RR · 다른 Invoice 번호 파일만 = 下書き 안 만듦 (빨강) · 없음 = 안 만듦
   4 문지기 — 下書き 만들기 · 고치기 · 첨부만 · send · sendMail · forward · move · reply · DELETE = 거부
   5 화면 — 今日やること 줄 · 탭의 「下書きを作る」 → 확인 창 → Outlook 下書き (가짜) · 기록 · 「下書き作成済」 / 권한 없음 = 「コピー」 안내 / 보내기 호출 0 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine'), BF=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const thr=(f,m)=>{ let t=false; try{ f(); }catch(e){ t=true; } ok(t,m); };
const OUT=DOC.OUT_ROOT, WIP='古紙/-. 古紙書類/▲ 書類作成中', txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const F=(...n)=>n.map((x,i)=>({id:'f'+i, name:x, size:1000, lastModified:'2026-11-1'+i+'T00:00:00Z'}));
const base={iv:'NAA2699-01', ct:'LRS-2699AA1', po:'2699/1126', buyer:'BUYER-A', name:'SAMPLE BUYER A', bl:'TESTBL1', etd:'2026-11-20', mt:'91.96', rcpDom:'example.test'};

(async()=>{
console.log('1 틀');
{ const d=DOC.mailDraft19('depo', Object.assign({}, base, {files:F('NAA2699-01_DRAFT D0C.pdf'), to:['a@buyer-a.example.test'], cc:['b@buyer-a.example.test'], toSrc:'master'}));
  ok(d.subject==='[Deposit Request for NAA2699-01] #2699/1126_BUYER-A'&&/Please kindly find attached file and let us know the deposit number for this shipment\./.test(d.body)&&/IV# NAA2699-01\nBL# TESTBL1/.test(d.body),'Deposit Request — 제목 · 본문 = 大場 원문 틀',d);
  ok(d.att.length===1&&d.att[0].as==='NAA2699-01_DRAFT DOC.pdf'&&d.att[0].name==='NAA2699-01_DRAFT D0C.pdf'&&!d.block,'오타 바로잡음 — 파일 「DRAFT D0C」 → 첨부 이름 「DRAFT DOC」',d.att);
  const n=DOC.mailDraft19('depo', Object.assign({}, base, {bl:'', files:F('NAA2699-01_DRAFT DOC.pdf'), to:['a@x.test'], toSrc:'master'})); ok(/\(ETD 11\/20\)/.test(n.body),'B/L 번호 없으면 (ETD 11/20)',n.body); }
{ const S=l=>DOC.mailDraft19('ship', Object.assign({}, base, {lang:l, files:F('NAA2699-01_FD.pdf','NAA2699-01_RR.pdf'), to:['a@x.test'], toSrc:'master'}));
  const en=S('en'), ko=S('ko'), ja=S('ja'), xx=S('');
  ok(en.subject==='[Shipping docs for NAA2699-01]'&&!/for for/.test(en.subject)&&/shipping documents of NAA2699-01 for order #2699\/1126\./.test(en.body),'en — [Shipping docs for {IV}] (for for 없음)',en);
  ok(ko.subject==='[선적서류안내]#LRS-2699AA1_NAA2699-01_91.96MT'&&/1건 출항완료되어 선적서류 첨부로 안내드립니다\./.test(ko.body),'ko — [선적서류안내]#{계약}_{IV}_{MT}MT · 大場 원문',ko);
  ok(ja.subject==='船積書類送付_NAA2699-01'&&/船積書類を添付にて送付いたします/.test(ja.body),'ja — 船積書類送付_{IV} (v0.20: 본문 = 실제 원문)',ja);
  ok(xx.subject===en.subject,'언어 없음 = en');
  eq(en.att.map(a=>a.as),['NAA2699-01_FD.pdf','NAA2699-01_RR.pdf'],'첨부 = {IV}_FD · {IV}_RR (있으면)'); }
{ const res={invoice:'NAA2699-01', items:[{group:'当事者',key:'consignee',label:'Consignee',status:'MATCH'}]}, h=DOC.mailDraft19('acl', Object.assign({}, base, {aclRes:res, srcSubj:'【通関書類送付_NAA2699-01】Re: 新規通関依頼', srcId:'m1', toSrc:'thread'}));
  ok(h.type==='hon'&&h.subject==='[本登録依頼] Re: 【通関書類送付_NAA2699-01】Re: 新規通関依頼'&&/許可書とACLのご送付ありがとうございます。\n内容相違ございませんので、こちらで本登録をお願いいたします。/.test(h.body),'本登録依頼 — [本登録依頼] Re: {원 스레드} · 大場 원문 2 줄',h);
  const res2={invoice:'NAA2699-01', items:[{group:'当事者',key:'notify',label:'Notify Party',status:'DIFF',actual:'SAMPLE PARER',expected:'SAMPLE PAPER'}]}, f=DOC.mailDraft19('acl', Object.assign({}, base, {aclRes:res2, srcSubj:'RE: [本登録依頼] Re: X', srcId:'m1', toSrc:'thread'}));
  ok(f.type==='fix'&&f.subject==='[ACL訂正依頼] Re: X'&&/ACL Notify Party欄\nSAMPLE PARER\n→SAMPLE PAPER/.test(f.body),'ACL訂正依頼 — 相違 목록 (칸 · ACL 글자 → 맞는 글자)',f); }

console.log('2 받는 사람');
{ const m=DOC.mailDraft19('ship', Object.assign({}, base, {lang:'en', files:F('NAA2699-01_FD.pdf'), to:['A@x.test'], cc:['c@x.test','rcp@example.test'], toSrc:'master'}));
  eq([m.to, m.cc],[['a@x.test'],['c@x.test','rcp@example.test']],'마스터 To · CC (작은 글자) · rcp@ 하나만');
  const c=DOC.mailDraft19('ship', Object.assign({}, base, {lang:'en', files:F('NAA2699-01_FD.pdf'), to:['p@x.test'], toSrc:'mail'})); ok(c.warn.indexOf(DOC.MAIL19.CHECK)<0&&c.cc.indexOf('rcp@example.test')>=0,'v0.20: 候補 「確認してください」 없앰 (R4) · CC rcp@',c.warn);
  const n=DOC.mailDraft19('ship', Object.assign({}, base, {lang:'en', files:F('NAA2699-01_FD.pdf'), to:[], toSrc:''})); ok(n.warn.indexOf(DOC.MAIL19.NO_TO)>=0,'모르면 「宛先が分かりません」'); }

console.log('3 첨부 검사');
{ const b=DOC.mailDraft19('ship', Object.assign({}, base, {lang:'en', files:F('NAA2698-07_FD.pdf'), to:['a@x.test'], toSrc:'master'}));
  ok(/^添付名が違う: NAA2698-07_FD\.pdf/.test(b.block)&&!b.att.length,'폴더에 다른 Invoice 번호 FD 만 → 下書き 안 만듦 (빨강 「添付名が違う」)',b);
  const m=DOC.mailDraft19('depo', Object.assign({}, base, {files:F('NAA2699-01_FD.pdf'), to:['a@x.test'], toSrc:'master'})); ok(/^添付がありません: NAA2699-01_DRAFT DOC\.pdf/.test(m.block),'DRAFT DOC 없음 → 안 만듦',m.block);
  const r=DOC.mailDraft19('ship', Object.assign({}, base, {lang:'en', files:F('NAA2699-01_FD.pdf','NAA2699-01_FD REV.pdf'), to:['a@x.test'], toSrc:'master'})); ok(r.att[0].name==='NAA2699-01_FD REV.pdf','같은 종류 여럿 = 가장 새 것',r.att);
  const big=DOC.mailDraft19('ship', Object.assign({}, base, {lang:'en', files:[{id:'b',name:'NAA2699-01_FD.pdf',size:5e6}], to:['a@x.test'], toSrc:'master'})); ok(!big.att.length&&big.attBig.length&&big.warn.some(w=>/3 MB/.test(w)),'3 MB 넘는 첨부 = 붙이지 않고 안내'); }

console.log('4 문지기');
{ const G='https://graph.microsoft.com/v1.0/';
  ok(DOC.guardMail('POST',G+'me/messages')&&DOC.guardMail('POST',G+'me/messages/x/createReplyAll')&&DOC.guardMail('POST',G+'me/messages/x/createReply')&&DOC.guardMail('PATCH',G+'me/messages/x')&&DOC.guardMail('POST',G+'me/messages/x/attachments'),'下書き 만들기 · 고치기 · 첨부 = OK');
  for(const [m,u] of [['POST','me/messages/x/send'],['POST','me/sendMail'],['POST','me/messages/x/forward'],['POST','me/messages/x/move'],['POST','me/messages/x/reply'],['POST','me/messages/x/replyAll'],['DELETE','me/messages/x'],['PATCH','me/mailFolders/x'],['POST','me/messages/x/copy']]) thr(()=>DOC.guardMail(m,G+u),'거부: '+m+' '+u);
  const app=HTML.match(/<script id="doc-app">([\s\S]*?)<\/script>/)[1];
  ok(!/\/send['"]|sendMail['"]|\/send\?/.test(app),'화면 코드에 send · sendMail 0'); }

console.log('5 화면');
function world19(){ const W=X.world();
  W.masters={sales_mail:[{agent:'', buyer:'BUYER-A', to:'a@buyer-a.example.test', cc:'b@buyer-a.example.test', lang:'en'}]};
  W.sp[WIP+'/NAA2611-01'].push({id:'dd1',name:'NAA2611-01_DRAFT D0C.pdf',file:{},size:900,lastModifiedDateTime:'2026-11-20T00:00:00Z'},{id:'fd1',name:'NAA2611-01_FD.pdf',file:{},size:900,lastModifiedDateTime:'2026-11-20T00:00:00Z'});
  W.sis[0].crcf9_po_vo='2699/1126'; return W; }
{ const W=world19(); W.itemBytes={dd1:Buffer.from('%PDF-1.4 dd'), fd1:Buffer.from('%PDF-1.4 fd')};
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}});
  w.eval("openIv('NAA2611-01','depo')"); await X.until(()=>/NAA2611-01/.test(txt(w,'dtIvSum')),5000); await X.sleep(30);
  const bt=w.document.querySelector('#dtIvBody [data-mail="depo"]'); ok(bt&&bt.textContent==='下書きを作る','DEPO 탭 「下書きを作る」');
  bt.click(); await X.until(()=>!w.document.getElementById('dtModal').hidden&&!!w.document.getElementById('dtMdSubj'),5000);
  ok(w.document.getElementById('dtMdSubj').value==='[Deposit Request for NAA2611-01] #2699/1126_BUYER-A'&&/To: a@buyer-a\.example\.test/.test(txt(w,'dtMdTo'))&&/rcp@example\.test/.test(txt(w,'dtMdTo'))&&/NAA2611-01_DRAFT DOC\.pdf（ファイル NAA2611-01_DRAFT D0C\.pdf）/.test(txt(w,'dtMdAtt')),'확인 창 — 제목 · 받는 사람 (마스터 + rcp@) · 첨부 (이름 바로잡음)',[txt(w,'dtMdTo'),txt(w,'dtMdAtt')]);
  w.document.getElementById('dtMdMake').click(); await X.until(()=>/作りました/.test(txt(w,'dtMdSt'))||/作れません|権限/.test(txt(w,'dtMdSt')),5000);
  const D=Object.values(W.drafts||{})[0]; ok(D&&D.subject==='[Deposit Request for NAA2611-01] #2699/1126_BUYER-A'&&D.attachments.length===1&&D.attachments[0].name==='NAA2611-01_DRAFT DOC.pdf'&&D.toRecipients[0].emailAddress.address==='a@buyer-a.example.test','Outlook 下書き 1 통 (가짜) — 제목 · 받는 사람 · 첨부',D);
  ok((W.mailWrites||[]).every(x=>!/\/send|sendMail|forward|\/move/.test(x.url))&&(W.mailWrites||[]).length>=2,'보내기 호출 0 (만들기 · 첨부만)',(W.mailWrites||[]).map(x=>x.method+' '+x.url.slice(37)));
  const rec=W.writes.find(x=>/doc_tool\/mail_draft\/NAA2611-01_depo_\d{8}-\d{6}\.json/.test(decodeURIComponent(x.url))); ok(!!rec,'기록 = doc_tool/mail_draft/{IV}_depo_{UTC}.json (새 파일)',W.writes.map(x=>decodeURIComponent(x.url)));
  w.eval('closeModal()'); w.eval("S.curTab='depo'; renderIv()"); await X.sleep(20); ok(/下書き作成済 \d\d:\d\d/.test(txt(w,'dtIvBody')),'「下書き作成済 HH:MM」');
  /* FD 탭 · 今日やること 줄 */
  w.eval("S.curTab='fd'; renderIv()"); ok(!!w.document.querySelector('#dtIvBody [data-mail="ship"]'),'FD 탭 「下書きを作る」');
  w.close(); }
{ const W=world19(); W.mailDeny=true; W.itemBytes={dd1:Buffer.from('%PDF-1.4 dd')};
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); w.eval("mailDraftModal('NAA2611-01','depo')"); await X.until(()=>!!w.document.getElementById('dtMdMake'),5000);
  w.document.getElementById('dtMdMake').click(); await X.until(()=>/権限|作れません/.test(txt(w,'dtMdSt')),5000);
  ok(/Outlook に下書きを作る権限がありません — 「コピー」 を使ってください/.test(txt(w,'dtMdSt'))&&!!w.document.getElementById('dtMdCopy'),'권한 없음 → 「コピー」 안내',txt(w,'dtMdSt'));
  ok(!W.writes.some(x=>/mail_draft/.test(decodeURIComponent(x.url))),'못 만들면 기록 없음'); w.close(); }
{ const W=world19(); W.sp[WIP+'/NAA2611-01']=W.sp[WIP+'/NAA2611-01'].filter(f=>f.id!=='fd1').concat([{id:'fx',name:'NAA2698-07_FD.pdf',file:{},size:900}]);
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); w.eval("mailDraftModal('NAA2611-01','ship')"); await X.until(()=>!!w.document.getElementById('dtMdSubj'),5000);
  ok(/添付名が違う: NAA2698-07_FD\.pdf — 下書きを作りません/.test(txt(w,'dtMdBlock'))&&!w.document.getElementById('dtMdMake'),'다른 번호 FD → 빨강 · 「下書きを作る」 없음'); w.close(); }
{ const W=X.world(); const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>!!w.document.querySelector('.tl-row [data-mail]'),10000).catch(()=>0); await X.sleep(50);
  const rows=[...w.document.querySelectorAll('.tl-row')].filter(r=>r.querySelector('[data-mail]')); ok(rows.length>0&&rows.every(r=>/下書きを作る/.test(r.textContent)),'今日やること 줄에 「下書きを作る」',rows.length); w.close(); }

console.log((fail?'FAIL':'PASS')+' v19 — pass '+pass+' fail '+fail);
process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v19 예외',e&&e.stack||e); console.log('FAIL v19 — pass '+pass+' fail '+(fail+1)); process.exit(1); });
