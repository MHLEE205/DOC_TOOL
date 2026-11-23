/* v0.15 시험 (지시서 MAC-THOR_5 D00 書類ツール v0.15 · 수정 묶음 v0.2) — 가짜 데이터만 · 네트워크 없음. node v15.js [html]
   A1 待ち 처음 접힘 · A2 対象外 기억 · B1 L/C 未着 (推薦 끔 · 안내 · D-01/a1_bench 문구 없음) · B2 待ち 이유 L/C 未着 + PO 着 · B3 仮 S/I (XXX · 仮 표시)
   B4 L/C 번호 XXX = 仮 S/I · B5 L/C 도착 → 다른 칸만 (L/C 칸 먼저) · ACL 再確認 · B6 L/C 着 · S/I 未更新 · B7 FD 메일 검색 · 기억 · B8 선적서류
   B10 파일 이름 번호 違い (参考 · この Invoice のファイル → FD) · B11 添付名が違う · 초안 검사 · B12 체크포인트 試験 줄 (관리자만) */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine'), PR=require('./acl_fx/pdfread');
const {PDFDocument, StandardFonts}=require('pdf-lib');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const qa=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const V=DOC.V15, R=DOC.TODO_RULES, at=DOC.at, WIP='古紙/-. 古紙書類/▲ 書類作成中', OUT=DOC.OUT_ROOT, FVK='@OData.Community.Display.V1.FormattedValue';
const file=(name,mod,size)=>({id:'i'+Math.random().toString(36).slice(2,9),name,file:{},size:size||10,lastModifiedDateTime:mod||'2026-11-10T00:00:00Z',webUrl:'https://example.test/sp/'+encodeURIComponent(name)});
const dir=name=>({id:'d'+name,name,folder:{childCount:1},webUrl:'https://example.test/sp/'+encodeURIComponent(name)});
const dec=x=>decodeURIComponent(x.url);
/* 가짜 세계 + v0.15 — 같은 바이어 (BUYER-C) 의 앞 계약 LRS-2610CC1 (S/I 있음 · L/C 번호 TESTLC009) · 지난 Invoice NAA2611-03 (파일 이름 번호 違い · FD 메일) */
function world15(){
  const W=X.world(), T=W.T, D=n=>X.addDays(T,n)+'T00:00:00Z';
  W.contracts.push({cr49f_sale_contractid:X.g('d',5),cr49f_sale_contract_no:'LRS-2610CC1',cr49f_pay_cls:1,['cr49f_pay_cls'+FVK]:'LC',cr49f_terms_conditions:'CIF',_cr49f_buyer_id_value:X.g('c',3),cr49f_sale_contract_date:X.addDays(T,-60)});
  W.sis.push({cr49f_s_iid:X.g('f',5),_cr49f_sale_contract_id_value:X.g('d',5),crcf9_sino:1,cr49f_lc_no:'TESTLC009',crcf9_consignee:'TO THE ORDER OF SAMPLE BANK',crcf9_notify_party:'SAMPLE NOTIFY CO',crcf9_po_vo:'PO TEST-5',crcf9_vo_no:null,
    crcf9_place_of_delivery_1:'SAMPLE PORT ID',crcf9_all:'L/C NO. TESTLC009 DATED ON 2026-09-01',crcf9_remark:'SAMPLE REMARK',crcf9_pod_bl1:null,modifiedon:'2026-10-01T00:00:00Z'});
  /* B2: バイヤーの ★LC フォルダに PO (契約番号入り) */
  W.sp['古紙/-. 古紙書類/★LC/BUYER-C']=[file('PO - LRS-2611CC1(TEST ANNEX).pdf','2026-11-19T01:00:00Z'),file('LRS-2610CC1(TESTLC009).pdf','2026-09-01T01:00:00Z')];
  W.sp['古紙/LC/'+T.slice(0,4)]=[file('LRS-2611AA1_TESTLC001.pdf')];
  /* B7 · B10 · B11: 지난 Invoice — FD 이름의 번호가 다름 · 그 Invoice 로 검색하면 담당이 보낸 FD 메일 (첨부 이름도 다름) */
  W.bookings.push(Object.assign({},W.bookings[0],{cr49f_bookingid:X.g('e',5),cr49f_invoice_no:'NAA2611-03',cr49f_booking_no:'TESTBK5',cr49f_bl_number:'TESTBL5',cr49f_etd:D(-6),crcf9_bl_etd:D(-6),crcf9_insurance_premiums:1000}));
  W.sp[WIP].push(dir('NAA2611-03'));
  W.sp[WIP+'/NAA2611-03']=[file('NAA2611-03_ED.pdf'),file('NAA2611-03_ACL.pdf'),file('NAA2610-03_FD.pdf','2026-11-12T01:00:00Z'),file('WHL DR FORM NAA2609-21.xls')];
  W.searchMessages=[{id:'fd1',subject:'[선적서류안내]#LRS-2611AA1_NAA2611-03_10MT',from:{emailAddress:{address:'tester@example.test',name:'TEST'}},toRecipients:[{emailAddress:{address:'buyer@buyer-a.test'}}],receivedDateTime:X.addDays(T,-4)+'T03:00:00Z',hasAttachments:true,bodyPreview:'',attachments:[{name:'NAA2610-03_FD.pdf',isInline:false},{name:'NAA2611-03_RR.pdf',isInline:false}]},
    {id:'x1',subject:'【通関書類送付_NAA2611-03】',from:{emailAddress:{address:'tester@example.test'}},receivedDateTime:X.addDays(T,-9)+'T03:00:00Z',hasAttachments:true,bodyPreview:'',attachments:[{name:'NAA2611-03_IV_PL_SI.pdf',isInline:false}]}];
  /* state/ を 가짜 SharePoint 에 쌓음 (PUT → 다음 열기에서 읽힘) */
  W.putFail=u=>{ const m=u.match(/root:\/(.*doc_tool\/state\/(fd|fname|si_lc))\/([^:]+):\/content/); if(m){ (W.sp[m[1]]=W.sp[m[1]]||[]).push({id:'s'+Math.random(),name:m[3],file:{}}); } return 0; };
  return W;
}
const flushState=async W=>{ for(const x of W.writes){ const m=dec(x).match(/root:\/(.*doc_tool\/state\/[^:]+):\/content/); if(m&&!W.content[m[1]]) W.content[m[1]]=typeof x.body==='string'?x.body:await x.body.text(); } };
async function simplePdf(t){ const d=await PDFDocument.create(), p=d.addPage([400,300]), f=await d.embedFont(StandardFonts.Helvetica); p.drawText(t,{x:40,y:200,size:14,font:f}); return Buffer.from(await d.save()); }

(async()=>{
console.log('B4 L/C 번호 XXX = 仮 S/I');
{ const si=(lc,o)=>Object.assign({crcf9_sino:1,cr49f_lc_no:lc,crcf9_consignee:'C',crcf9_notify_party:'N',crcf9_po_vo:'PO',crcf9_place_of_delivery_1:'P'},o||{});
  eq(['XXX',' x x x ','xxx','TESTLC825XXX DATED ON NOV 19, 2026','XXXX','XXX-1','XX','TESTLC66XX DATED ON JUN XX, 2026','TESTLC1',''].map(v=>DOC.siLcTent([si(v)])),[true,true,true,true,true,true,false,false,false,false],'XXX 가 들어 있으면 (일부만 · 공백 · 대소문자 무시) 仮 S/I — XX 만은 아님 (B4 추가 지시)');
  { const c2=DOC.judgeCt({pay:'LC', lcFiles:[], lcOrig:[], sis:[si('TESTLC825XXX DATED ON NOV 19, 2026')]}); ok(c2.si.tent&&c2.si.lcTent&&!/LC No 未確定/.test(c2.si.why),'일부 XXX → 仮 S/I (L/C 未着 이면 確認)',c2.si);
    const c3=DOC.judgeCt({pay:'LC', lcFiles:[], lcOrig:[], sis:[si('TESTLC66XX DATED ON JUN XX, 2026')]}); ok(!c3.si.tent&&/LC No 未確定 \(XX\)/.test(c3.si.why),'XX 만 → 전과 같음 (LC No 未確定 (XX))',c3.si); }
  ok(!DOC.siLcTent([si('TESTLC1',{crcf9_weight:'XX'})])&&!DOC.siLcTent([si('TESTLC1',{crcf9_remark:'XX BALES'})]),'중량 · Bales 의 XX 는 해당 없음');
  const c=DOC.judgeCt({pay:'LC', lcFiles:[], lcOrig:[], sis:[si('XXX')]});
  ok(c.si.s==='todo'&&c.si.tent&&c.si.lcTent&&/仮 S\/I（L\/C 番号 XXX）/.test(c.si.why)&&!/LC No 未確定/.test(c.si.why),'S/I 칸 = 確認 · 「仮 S/I（L/C 番号 XXX）」 (（仮） 와 같은 취급)',c.si);
  const x={iv:'NAA2699-01', country:'VIETNAM', term:'CIF', premium:1, etdPast:false, folder:{files:[{name:'NAA2699-01_ACL.pdf'}]}, acl:null, mailRules:[], hon:[], siTent:DOC.siTentAny([si('XXX')])};
  ok(/参考/.test(DOC.judgeIv(x).acl.why)&&DOC.judgeIv(x).acl.tent,'ACL = 「参考」 (S/I 未確定)',DOC.judgeIv(x).acl.why);
  ok(DOC.siTentAny([si('TESTLC1',{crcf9_consignee:'（仮）TO ORDER'})])&&!DOC.siTentAny([si('TESTLC1')]),'（仮） 도 그대로'); }

console.log('B1 · B2 L/C 未着');
{ eq([DOC.lcArrival({pay:'TT'}),DOC.lcArrival({pay:'LC',lcRead:[],lcOrig:[]}),DOC.lcArrival({pay:'LC',lcRead:['LRS-2699AA1.json'],lcOrig:[]}),DOC.lcArrival({pay:'LC',lcRead:[],lcOrig:['LRS-2699AA1_X.pdf']}),DOC.lcArrival({pay:'LC',lcRead:[],lcOrig:undefined})],['na','no','yes','yes','?'],'L/C 도착 = 보관소 (_READ) 또는 古紙/LC/{年} · 못 읽으면 ? (未着이라 하지 않음)');
  eq(DOC.lcOrigOf(['LRS-2699AA1_TESTLC.pdf','LRS-2699AA1_TESTLC_AMEND1.pdf','LRS-2699AA10_X.pdf','LRS-2699AB1_Y.pdf'],'LRS-2699AA1'),['LRS-2699AA1_TESTLC.pdf'],'古紙/LC 이름 → 이 계약 L/C (Amend · 다른 계약 제외)');
  eq(DOC.lcGuide('LRS-2699AA1'),'L/C が届いたら 古紙/LC/2026/ に保存してください（名前：LRS-2699AA1_{L/C番号}.pdf）','안내 한 줄 (연도 = 계약 번호 · 이름 규칙)');
  const po=DOC.poFile([{name:'PO - LRS-2699AA1(ANNEX).pdf',lastModified:'2026-11-19T01:00:00Z'},{name:'LRS-2699AA1(TESTLC).pdf',lastModified:'2026-11-10T00:00:00Z'},{name:'PO LRS-2698AA1.pdf',lastModified:'2026-10-01T00:00:00Z'},{name:'SPOT LRS-2699AA1.pdf'}],'LRS-2699AA1');
  ok(po&&po.name==='PO - LRS-2699AA1(ANNEX).pdf','PO 파일 = 이름이 PO 로 시작 · 계약 번호 포함',po);
  const c=DOC.judgeCt({pay:'LC', lcFiles:[], lcOrig:[], po, sis:[]});
  eq([c.lc.why,c.si.s,c.si.why],['L/C 未着','wait','L/C 未着 · PO 着 11/19'],'계약 LC 칸 · 待ち 이유 = 「L/C 未着 · PO 着 11/19」 (「COMPASS に S/I なし」 대신)');
  eq(DOC.judgeCt({pay:'LC', lcFiles:[], lcOrig:[], sis:[]}).si.why,'L/C 未着','PO 없으면 「L/C 未着」');
  eq(DOC.judgeCt({pay:'LC', lcFiles:['LRS-2699AA1.json'], lcOrig:[], sis:[]}).si.why,'COMPASS に S/I なし','L/C 있으면 전과 같음');
  eq(DOC.judgeCt({pay:'TT', sis:[]}).si.why,'COMPASS に S/I なし','T/T 는 전과 같음'); }

console.log('B3 仮 S/I (ttRecommend + lcTent)');
{ const prev=[{no:'LRS-2698CC1', date:'2026-09-01', sis:[{crcf9_sino:1,cr49f_lc_no:'TESTLC009',crcf9_consignee:'TO THE ORDER OF SAMPLE BANK',crcf9_notify_party:'SAMPLE NOTIFY CO',crcf9_all:'L/C NO. TESTLC009 DATED ON 2026-09-01',crcf9_remark:'SAMPLE REMARK',crcf9_po_vo:'PO 1'}], details:[]}];
  const o=DOC.ttRecommend({no:'LRS-2699CC1', prev, sale:[], term:'CIF', pod:'', lcTent:true}), s1=o.rec.sinos[1], b1=o.rec.basis[1];
  ok(s1.cr49f_lc_no==='XXX'&&b1.cr49f_lc_no.tent&&/仮 — L\/C 着で確認/.test(b1.cr49f_lc_no.flag),'L/C 칸 = XXX (비우지 않음)',b1.cr49f_lc_no);
  ok(s1.crcf9_consignee==='TO THE ORDER OF SAMPLE BANK'&&b1.crcf9_consignee.tent&&s1.crcf9_all==='L/C NO. TESTLC009 DATED ON 2026-09-01'&&b1.crcf9_all.tent,'L/C 로만 정해지는 문장 (은행 문 · L/C 번호 · DATED ON) = 그대로 + 「仮 — L/C 着で確認」');
  ok(!b1.crcf9_remark.tent&&!b1.crcf9_notify_party.tent,'다른 칸은 표시 없음');
  const st=DOC.siFieldState({col:'cr49f_lc_no', value:'XXX', hasCur:false, basis:b1.cr49f_lc_no}); eq([st.s,st.label],['check','仮'],'상태 = 「仮」 (要確認 쪽)');
  const tt=DOC.ttRecommend({no:'LRS-2699CC1', prev, sale:[], term:'CIF', pod:''}); ok(tt.rec.sinos[1].cr49f_lc_no===''&&!tt.tt.lcTent,'T/T 는 전과 같음 (L/C 칸 빈칸)');
  const ops=DOC.siPlan({sis:[]},{sinos:{1:s1},details:[]},[]); ok(ops.length===1&&ops[0].method==='POST'&&ops[0].body.cr49f_lc_no==='XXX','쓰기 계획 = S/I POST · LC No XXX',ops[0]&&ops[0].body);
  const ctx={contractId:'00000000-0000-0000-0000-000000000001',siIds:new Set(),detailIds:new Set(),created:new Set(),saleDetailIds:new Set(),itemIds:new Set(),sets:{contract:'cr49f_sale_contracts'},nav:{contract:'cr49f_sale_contract_id'}};
  ok(DOC.guardDv('POST','cr49f_s_is',null,Object.assign({},ops[0].body,{'cr49f_sale_contract_id@odata.bind':'/cr49f_sale_contracts(00000000-0000-0000-0000-000000000001)'}),ctx),'COMPASS 문지기 통과 (정해진 칸)'); }

console.log('B5 · B6 L/C 도착 → 仮 S/I 갱신');
{ const si=lc=>({crcf9_sino:1,cr49f_lc_no:lc,crcf9_consignee:'C',crcf9_notify_party:'N',crcf9_po_vo:'PO',crcf9_place_of_delivery_1:'P'});
  const c=DOC.judgeCt({pay:'LC', lcFiles:['LRS-2699AA1.json'], lcOrig:[], sis:[si('XXX')]}); ok(c.si.s==='diff'&&c.si.lcStale&&/L\/C 着 · S\/I 未更新/.test(c.si.why),'B6 L/C 있는데 XXX → 相違 「L/C 着 · S/I 未更新」',c.si);
  const rows=[{col:'crcf9_remark',s:'check'},{col:'crcf9_po_vo',s:'match'},{col:'crcf9_consignee',s:'check'},{col:'cr49f_lc_no',s:'check'},{col:'crcf9_notify_party',s:'match'}];
  eq(DOC.siLcOrder(rows).map(r=>r.col),['cr49f_lc_no','crcf9_consignee','crcf9_remark','crcf9_po_vo','crcf9_notify_party'],'B5 다른 칸 중 L/C 칸 (L/C 번호 · Consignee …) 을 맨 위');
  const now=at('2026-11-20','09:00'), ex=DOC.todoExtra({iv:'NAA2699-01', ct:'LRS-2699AA1', lcStale:true, aclRecheck:{t:at('2026-11-19','10:00')}}, now).map(r=>Object.assign(r,{group:DOC.todoGroup(r,now)}));
  ok(ex[0].gkey==='si'&&ex[0].zone==='do'&&ex[0].group==='late'&&ex[0].what==='L/C 着 · S/I 未更新'&&ex[0].action[1]==='ctsi','B6 今日やること 빨강 「L/C 着 · S/I 未更新」 → S/I を開く',ex[0]);
  ok(ex[1].gkey==='acl'&&ex[1].zone==='do'&&/^ACL 再確認/.test(ex[1].what)&&ex[1].action[1]==='acl','B5 「ACL 再確認」 (자기 차례 · ACL 그룹)',ex[1]); }

console.log('B8 FD 메일 낱말 선적서류');
{ const m={subj:'[선적서류안내]#LRS-2699AA1_NAA2699-01_10MT', att:[], body:'', skind:'staff'}; ok(DOC.mailUses(m).indexOf('FD')>=0,'제목 「선적서류」 = FD 메일');
  ok(DOC.mailUses({subj:'【通関書類送付_NAA2699-01】', att:[], body:'', skind:'staff'}).indexOf('FD')<0,'通関書類 은 FD 아님 (전과 같음)'); }

console.log('B10 파일 이름 번호 違い');
{ const F=[{name:'NAS2699-07_FD.pdf'},{name:'NA2699-07_ED.pdf'},{name:'NA2699-08 TO BANK.pdf'},{name:'WHL DR FORM NCL2699-03.pdf'},{name:'NA2699-07_IV_PL_SI.pdf',sub:'通関'},{name:'x NB2699-01.jpg',sub:'PHOTO'},{name:'ACL-NB2699-02.pdf'},{name:'TESTBK77 NB2699-05.pdf'},{name:'PHOTO.zip'}];
  const r=DOC.fnameCheck(F,'NA2699-07',{booking:'TESTBK77'});
  eq(r.map(x=>[x.name,x.ref]),[['NAS2699-07_FD.pdf',false],['NA2699-08 TO BANK.pdf',false],['WHL DR FORM NCL2699-03.pdf',true],['ACL-NB2699-02.pdf',true],['TESTBK77 NB2699-05.pdf',true]],'다른 번호 파일 · 선사 · 乙仲 이름 (DR FORM · WHL · ACL- · 부킹 번호) = 参考 · PHOTO 하위 · 자기 번호 · zip 제외');
  ok(DOC.fnameCheck(F,'NA2699-07',{booking:'TESTBK77',dec:{'NAS2699-07_FD.pdf':'this','NA2699-08 TO BANK.pdf':'other'}}).length===3,'판단한 파일은 다시 안 나옴');
  const fx=DOC.fnameFix(F,'NA2699-07',{'NAS2699-07_FD.pdf':'this'}); ok(DOC.fdFiles(fx,'NA2699-07').length===1&&DOC.fdFiles(F,'NA2699-07').length===0,'「この Invoice のファイル」 → FD 판단에 씀 (FD 済)');
  const ex=DOC.todoExtra({iv:'NA2699-07', fname:r}, at('2026-11-20','09:00'));
  ok(ex.length===5&&ex.every(e=>e.gkey==='fname'&&e.zone==='do')&&ex[0].red&&!ex[2].red&&/（参考）/.test(ex[2].what)&&ex[0].fn.kind==='file','今日やること 「ファイル名の番号違い」 (자기 차례 · 参考 는 빨강 아님)',ex.map(e=>[e.what,e.red]));
  const x={iv:'NA2699-07', country:'KOREA', term:'CFR', premium:1, etdPast:true, folder:{files:F.map(f=>Object.assign({},f))}, acl:null, mailRules:[], hon:[], fnameDec:{'NAS2699-07_FD.pdf':'this'}};
  const j=DOC.judgeIv(x); ok(j.fd.s==='done'&&j.fd.files[0]==='NAS2699-07_FD.pdf','현황판 FD = 済 (파일 이름은 원래 이름으로 표시)',j.fd); }

console.log('B11 FD 메일 첨부 이름');
{ const m={subj:'[선적서류안내]#LRS-2699AA1_NAS2699-07_65MT', att:['NA2699-07_FD.pdf','NAS2699-07_RR.pdf','LIST.xlsx'], skind:'staff'};
  eq(DOC.fdMailBad(m,'NAS2699-07'),['NA2699-07_FD.pdf'],'보낸 FD 메일 — 제목 번호 ≠ 첨부 이름 번호 → 그 첨부');
  eq(DOC.fdMailBad(Object.assign({},m,{skind:'buyer'}),'NAS2699-07'),[],'담당이 보낸 메일만');
  eq(DOC.subjIvs('[Shipping docs for  NA2699-03/04/06] · UNF2699-04/07 · NHK2699-03 & NHK2699-04').sort(),['NA2699-03','NA2699-04','NA2699-06','NHK2699-03','NHK2699-04','UNF2699-04','UNF2699-07'],'제목 번호 펼치기 (/04/06 · & )');
  eq(DOC.fdMailBad({subj:'[선적서류안내]#LRS-2699AS1_NAS2699-04_66MT/NAS2699-06_65MT', att:['NAS2699-06_FD.pdf','NAS2699-06_RR.pdf'], skind:'staff'},'NAS2699-04'),[],'여러 Invoice 를 한 메일로 → 제목에 있는 번호면 違い 아님 (실자료 헛경보 15 → 0)');
  eq(DOC.fdMailBad({subj:'[Shipping docs for NA2699-02/05]', att:['NA2699-05_FD.pdf','NA2698-05_FD.pdf'], skind:'staff'},'NA2699-02'),['NA2698-05_FD.pdf'],'줄임 번호 (/05) 도 펼쳐 비교 · 정말 다른 것만');
  eq(DOC.fdDraftCheck({subject:'[선적서류안내] NAS2699-07', atts:['NAS2699-07_FD.pdf'], folderIv:'NAS2699-07'}).ok,true,'초안 검사 — 셋 다 같으면 OK');
  const bad=DOC.fdDraftCheck({subject:'[선적서류안내] NAS2699-07', atts:['NAS2698-07_FD.pdf'], folderIv:'NAS2699-07'}); ok(!bad.ok&&/添付名/.test(bad.why[0]),'다르면 초안 안 만듦 + 이유',bad);
  ok(!DOC.fdDraftCheck({subject:'x NA2699-07', atts:[], folderIv:'NAS2699-07'}).ok,'제목 번호 ≠ 폴더 번호 → 안 만듦');
  const ex=DOC.todoExtra({iv:'NAS2699-07', fdBad:[{t:at('2026-10-26','13:15'), subject:m.subj, bad:['NA2699-07_FD.pdf'], id:'m1'}]}, at('2026-11-20','09:00'));
  ok(ex[0].what==='送付済み · 添付名が違う'&&ex[0].red&&ex[0].fn.kind==='mail'&&DOC.todoGroup(ex[0],at('2026-11-20','09:00'))==='late','今日やること 빨강 「送付済み · 添付名が違う」',ex[0]); }

console.log('B7 메일 검색 결과 → FD 済');
{ const ms=[{t:at('2026-10-26','13:15'), subj:'[선적서류안내]#LRS-2699AA1_NAS2699-07', att:['NA2699-07_FD.pdf'], body:'', skind:'staff', id:'a'},{t:at('2026-10-16','16:47'), subj:'【通関書類送付_NAS2699-07】', att:['NAS2699-07_IV_PL_SI.pdf'], body:'', skind:'staff', id:'b'},{t:at('2026-10-27','10:00'), subj:'RE: NAS2699-07 FD', att:[], body:'', skind:'buyer', id:'c'}];
  const f=DOC.fdMailFound(ms,'NAS2699-07'); ok(f&&f.t===at('2026-10-26','13:15')&&f.bad[0]==='NA2699-07_FD.pdf','담당이 보낸 FD 메일 (通関書類 · 바이어 메일 제외) · 첨부 이름 다름도 같이',f);
  const S=DOC.todoSignals({iv:'NAS2699-07', files:[], mails:[], hon:[], now:at('2026-11-20','09:00'), fdState:{at:'2026-10-26T04:15:00Z'}}); ok(S.fd===at('2026-10-26','13:15')&&S.fdSrc==='FD メール (検索)','기억한 FD 送付 → 신호 FD 済 (今日やること 에서 빠짐)',S.fd);
  ok(DOC.todoRow({iv:'NAS2699-07',country:'KOREA',term:'CFR',pay:'TT',carrier:'ONE'},Object.assign(S,{bl:at('2026-10-24','18:00')}),at('2026-11-20','09:00'),null)===null,'뒤 단계 끝 = 앞 단계 끝 (FD 済 → 줄 없음)');
  ok(V.STATE_RE.test('fd/NAS2699-07_20261120-000000.json')&&!V.STATE_RE.test('other/x.json')&&!V.STATE_RE.test('fd/../x.json'),'state/ 이름 규칙');
  let thrown=false; try{ DOC.guardOut(OUT+'state/other/x.json'); }catch(e){ thrown=true; } ok(thrown&&DOC.guardOut(DOC.statePath('fd','NAS2699-07',new Date('2026-11-20T00:00:00Z'))),'문지기 — state/ 는 정해진 이름만'); }

console.log('B12 체크포인트 試験 줄 — 관리자만');
{ const rows=[{id:'CP-B01',kind:'基本',state:'有効'},{id:'CP-A02',kind:'追加',state:'試験',stages:['FD'],row:{stage:'FD',title_ja:'FD · TO BANK のファイル名 = Invoice 番号'}}];
  eq(DOC.cpVisible(rows,false).map(r=>r.id),['CP-B01'],'직원 = 試験 줄 안 보임 (켜기 = 형님 승인 뒤)'); eq(DOC.cpVisible(rows,true).map(r=>r.id),['CP-B01','CP-A02'],'관리자 = 보임');
  ok(DOC.CP_STAGE_JA.FD==='FD','단계 FD 이름 있음'); }

console.log('화면 — A1 · B1 · B2 · B3 · B7 · B10 · B11');
{ const W=world15(), w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_who:'all'}});
  await X.until(()=>!!w.document.querySelector('.tl-zone'));
  /* A1 */
  ok(!w.document.querySelector('.tl-z-wait .tl-grp')&&/^▶ 待ち/.test(w.document.querySelector('.tl-z-wait .tl-zh').textContent),'A1 待ち 처음 = 접힘 (▶)');
  w.document.querySelector('[data-tdtoggle="zone_wait"]').click(); await X.sleep(10);
  ok(!!w.document.querySelector('.tl-z-wait .tl-grp')&&JSON.parse(w.localStorage.getItem('doc_tool_todo_open_v14')).zone_wait===true,'누르면 펼침 · 이 브라우저에 기억');
  const w1=await X.page(world15(),{html:HFILE, first:true, ls:{doc_tool_who:'all', doc_tool_todo_open_v14:w.localStorage.getItem('doc_tool_todo_open_v14')}}); await X.until(()=>!!w1.document.querySelector('.tl-zone'));
  ok(!!w1.document.querySelector('.tl-z-wait .tl-grp'),'다시 열어도 펼친 그대로');
  /* B7 · B10 · B11 */
  await X.until(()=>w.eval('TODO.fdSearch.st')==='ok',15000);
  ok((W.searches||[]).indexOf('NAA2611-03')>=0&&(W.searches||[]).indexOf('NAA2611-01')<0,'B7 ETD 지난 · FD 아직인 Invoice 만 검색 (앞날 ETD 는 안 함)',W.searches);
  const st=W.writes.filter(x=>/doc_tool\/state\/fd\/NAA2611-03_\d{8}-\d{6}\.json/.test(dec(x))&&/conflictBehavior=fail/.test(x.url));
  ok(st.length===1,'찾은 「済」 → doc_tool/state/fd/{IV}_{UTC}.json (새 파일)',W.writes.map(dec));
  const stj=JSON.parse(await st[0].body.text()); ok(stj.invoice==='NAA2611-03'&&stj.bad[0]==='NAA2610-03_FD.pdf'&&/선적서류/.test(stj.subject),'기억 내용 (Invoice · 메일 시각 · 제목 · 다른 첨부)',stj);
  await X.until(()=>/送付済み · 添付名が違う/.test(txt(w,'dtTodoBox')),5000);
  const rows=qa(w,'.tl-row').filter(r=>/NAA2611-03/.test(r.textContent)), whats=rows.map(r=>r.querySelector('.tl-what').textContent);
  ok(whats.indexOf('送付済み · 添付名が違う')>=0&&whats.indexOf('ファイル名の番号違い')>=0&&whats.indexOf('ファイル名の番号違い（参考）')>=0,'B10 · B11 줄 (번호 違い 빨강 · DR FORM 参考 · 添付名)',whats);
  ok(!whats.some(t=>/FD|保険|B\/L/.test(t)&&!/添付名/.test(t)),'FD 済 → 진행 줄 없음 (뒤 단계 끝)',whats);
  ok(rows.filter(r=>/送付済み · 添付名/.test(r.textContent)).every(r=>r.querySelector('.tl-d-late')),'添付名 줄 = 빨강');
  const r10=rows.find(r=>r.querySelector('.tl-what').textContent==='ファイル名の番号違い'), wr=W.writes.length;
  r10.querySelector('[data-tdfn="this"]').click(); await X.until(()=>W.writes.length>wr,5000); await X.sleep(20);
  const fn=W.writes.slice(wr).map(dec); ok(fn.length===1&&/doc_tool\/state\/fname\/NAA2611-03_\d{8}-\d{6}_[a-z0-9]+\.json/.test(fn[0]),'「この Invoice のファイル」 1 회 → state/fname 기억',fn);
  ok(!qa(w,'.tl-row').some(r=>r.querySelector('.tl-what').textContent==='ファイル名の番号違い'&&/NAA2611-03/.test(r.textContent)),'그 줄은 사라짐');
  ok(w.eval("DOC.judgeIv(ivRow(S.bk.find(b=>b.cr49f_invoice_no==='NAA2611-03')).x).fd.s")==='done','현황판 FD = 済');
  /* 다시 열기 — 기억 읽음 · 다시 검색 안 함 */
  await flushState(W); const W2=Object.assign(world15(),{sp:W.sp, content:W.content}); W2.writes=[]; W2.searches=[];
  const w2=await X.page(W2,{html:HFILE, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>w2.eval('TODO.fdSearch.st')==='ok',15000);
  ok(!(W2.searches||[]).filter(q=>/\d{4}-\d{2}/.test(q)).length&&w2.eval("!!TODO.fdState['NAA2611-03']")&&w2.eval("TODO.fnameDec['NAA2611-03']['NAA2610-03_FD.pdf']")==='this','다시 열면 기억을 읽음 · 다시 찾지 않음',W2.searches);
  ok(W2.writes.every(x=>!/doc_tool\/state\//.test(dec(x))),'두 번째는 state 쓰기 0');
  /* B1 · B2 · B3 — L/C 없는 계약 */
  const $=id=>w.document.getElementById(id);
  $('dtQ').value='LRS-2611CC1'; $('dtGo').click(); await X.until(()=>$('dtCt').style.display==='flex'&&/LRS-2611CC1/.test(txt(w,'dtCtSum')));
  ok(/L\/C が届いたら 古紙\/LC\/2026\//.test(txt(w,'dtCtBody')),'LC 탭에도 안내 한 줄');
  w.document.querySelector('#dtCtTabs button[data-tab="si"]').click();
  await X.until(()=>!!$('dtSiTent'),5000).catch(e=>{ console.log('DEBUG',txt(w,'dtCtSum'),'|',txt(w,'dtCtBody').slice(0,500), w.eval('JSON.stringify(S.lcOrigY)'), w.eval('JSON.stringify(Object.keys(S.lcFiles||{}))')); throw e; });
  const body=txt(w,'dtCtBody');
  ok(/L\/C 未着/.test(txt(w,'dtCtSum'))&&/L\/C 未着 · PO 着 11\/19/.test(body),'B1 · B2 계약 카드 LC = L/C 未着 · S/I = 「L/C 未着 · PO 着 11/19」',body.slice(0,200));
  ok(/L\/C が届いたら 古紙\/LC\/2026\/ に保存してください（名前：LRS-2611CC1_\{L\/C番号\}\.pdf）/.test(body),'B1 안내 한 줄');
  ok(!/D-01|a1_bench|推薦できません/.test(body)&&!w.document.querySelector('#dtCtBody [data-open="a1"]'),'B1 D-01 · a1_bench 문구 없음 (직원)',body.match(/.{0,60}(?:D-01|a1_bench|推薦できません).{0,60}/));
  ok($('dtSiRun').disabled&&/推薦を作る/.test($('dtSiRun').textContent)&&!$('dtSiTent').disabled,'B1 「推薦を作る」 끔 · B3 「仮 S/I を作る」 보임');
  w.eval('S.me.admin=true'); w.eval('renderCt()'); await X.sleep(20); ok(!!w.document.querySelector('#dtCtBody [data-open="a1"]'),'a1_bench を開く = 관리자만'); w.eval('S.me.admin=false'); w.eval('renderCt()'); await X.until(()=>$('dtSiTent')&&$('dtSiTent').onclick,3000).catch(e=>{ console.log('DEBUG3',!!$('dtSiTent'),w.eval('S.curTab'),w.eval('JSON.stringify(S.siRec)')); throw e; });
  const ai=W.req.filter(r=>/anthropic/.test(r)).length; $('dtSiTent').click(); await X.until(()=>/ほか \d+ 項目/.test(txt(w,'dtCtBody'))||/推薦できません/.test(txt(w,'dtCtBody')),8000).catch(e=>{ console.log('DEBUG2',txt(w,'dtCtBody').slice(0,800)); throw e; });
  const b2=txt(w,'dtCtBody'); ok(/仮 S\/I/.test(b2)&&/L\/C 番号 = XXX/.test(b2)&&W.req.filter(r=>/anthropic/.test(r)).length===ai,'B3 仮 S/I 추천 (AI 0)',b2.slice(0,300));
  const lcIn=w.document.querySelector('#dtCtBody [data-sn="1"][data-col="cr49f_lc_no"]'); ok(lcIn&&lcIn.value==='XXX','L/C 칸 = XXX');
  ok(/仮 — L\/C 着で確認/.test(b2),'L/C 로만 정해지는 문장 표시');
  w.eval("S.siMeta={sets:{contract:'cr49f_sale_contracts',si:'cr49f_s_is',saleDetail:'cr49f_sale_details',item:'cr49f_items'},nav:{contract:'cr49f_sale_contract_id',si:'crcf9_s_i_id',saleDetail:'crcf9_sale_detail_id',item:'crcf9_item_id'}}");   // 가짜 세계에 메타데이터가 없음 (si.js 와 같은 값)
  $('dtSiWrite').click(); await X.until(()=>!w.document.getElementById('dtModal').hidden,8000).catch(e=>{ console.log('DEBUG4',txt(w,'dtSiSt')); throw e; });
  ok(/新規 S\/I sino 1/.test(txt(w,'dtModalBox'))&&/XXX/.test(txt(w,'dtModalBox')),'쓰기 확인 화면 (S/I 새로 · LC No XXX) — 지금의 S/I 쓰기 경로',txt(w,'dtModalBox').slice(0,200));
  w.document.querySelector('#dtModalBox [data-close]').click(); }

console.log('B7 — 今日やること 는 메일로 FD 済 · 현황판 FD 칸은 未作成 (NAS2610-07 실례) → 그래도 검색 · 기억');
{ const W=world15(); const m=W.searchMessages[0]; W.messages=W.messages.concat([Object.assign({},m,{sentDateTime:m.receivedDateTime})]);
  const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>w.eval('TODO.fdSearch.st')==='ok',15000);
  ok((W.searches||[]).indexOf('NAA2611-03')>=0&&w.eval("!!TODO.fdState['NAA2611-03']"),'검색함 · 기억 (state/fd)',W.searches);
  ok(w.eval("ivRow(S.bk.find(b=>b.cr49f_invoice_no==='NAA2611-03')).cells.fd.s")==='done','현황판 FD 칸 = 済 (FD 送付メールあり)'); }

console.log('A2 対象外 기억');
{ ok(DOC.SAVE_RULES.REMEMBER.indexOf('対象外')>=0,'REMEMBER 에 対象外');
  const PDFN=await simplePdf('SAMPLE NOTE ONLY');
  const mk=()=>{ const W=X.world(); W.attBytes={}; const D=X.addDays(W.T,0)+'T01:00:00Z';
    W.messages=W.messages.concat([{id:'n1',subject:'ACL TESTBK1',from:{emailAddress:{address:'otsu@forwarder.test'}},receivedDateTime:D,hasAttachments:true,bodyPreview:'',attachments:[{id:'b1',name:'ACL DRAFT DOC.pdf',contentType:'application/pdf',size:77,isInline:false}]}]);
    W.attBytes['n1|b1']=PDFN;
    W.putFail=u=>{ const m=u.match(/root:\/(.*doc_tool\/save_log\/(\d{8}))\/([^:]+):\/content/); if(m){ (W.sp[OUT+'save_log']=W.sp[OUT+'save_log']||[]).some(x=>x.name===m[2])||W.sp[OUT+'save_log'].push({id:'d'+m[2],name:m[2],folder:{childCount:1}}); (W.sp[m[1]]=W.sp[m[1]]||[]).push({id:'l'+Math.random(),name:m[3],file:{}}); } return 0; };
    return W; };
  const INIT={init:w=>{ w.pdfjsLib=PR.pdfjsForWindow(); }}, SV=w=>w.eval('SAVE');
  const W=mk(), w=await X.page(W,{...INIT, html:HFILE, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>SV(w).rows.length===1&&SV(w).rows[0].res,20000);
  const logs=W.writes.filter(x=>/save_log/.test(dec(x)));
  ok(SV(w).rows[0].res==='対象外'&&logs.length===1&&/"result":"対象外"/.test(await logs[0].body.text()),'메일 첨부 対象外 → save_log 기억',SV(w).rows.map(r=>[r.res,r.msg]));
  for(const x of W.writes){ const m=dec(x).match(/root:\/(.*doc_tool\/save_log\/[^:]+):\/content/); if(m) W.content[m[1]]=await x.body.text(); }
  const W2=Object.assign(mk(),{sp:W.sp, content:W.content}); W2.req=[]; const w2=await X.page(W2,{...INIT, html:HFILE, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>SV(w2).mailSt==='ok',20000); await X.sleep(30);
  ok(SV(w2).rows.length===0&&!W2.req.some(r=>/attachments\/b1\/\$value/.test(r)),'다시 열면 안 나옴 · 첨부 안 내려받음'); }

console.log('직원 화면 한글 · 쓰기 범위');
{ const core=HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1];
  ok(/선적서류/.test(core.match(/\['FD',null,[^\n]*/)[0]),'한글은 FD 메일 낱말 (정규식) 뿐 — 화면 글자는 hangul.js'); }

console.log((fail?'FAIL':'PASS')+' v15 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v15 예외',e.stack); process.exitCode=1; });
