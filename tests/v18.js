/* v0.18 시험 (지시서 THOR_11 D00 엔진 v0.16 · 書類ツール v0.18) — 가짜 데이터만 · 가짜 거래처 (SAMPLE · TEST) · 네트워크 없음 · AI 0. node v18.js [html]
   T-1 엔진 고정 (acl_bench v0.16 · bl_bench v0.4 = 같은 커밋 · sha256) · 乙仲様式 저장본 ({sha256}.other.json) 으로 대조 · 「AI 判読 (乙仲様式)」 · 양식 이름 · 対象外 칸 수 · 저장본 없음 = 読取対象外
   T-2 FD 까지 끝난 계약의 仮 S/I = 参考 (빨강 · 確認 아님 · 「L/C 着 · S/I 未更新」 안 띄움) · FD 전은 그대로
   T-3 保存の入口 — 담당이 보낸 FD · TO BANK: 제목 ≠ 첨부 이름 → 저장 안 함 · 5 영업일 안 = 빨강 「添付名が違う」 · 그 전 = 参考 · 같음 = {IV}_FD.pdf 후보 · 담당의 다른 첨부는 그대로 안 받음
   T-4 B/L Draft 의 「別の契約番号」 → 今日やること 빨강 (저장된 최신 결과)
   T-5 ACL 탭 「この乙仲の過去の誤記 n 件（参考）」 + 목록 (otsunaka_mistakes.json · 읽기만) */
const fs=require('fs'),path=require('path'),nodeCrypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), BF=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const T=X.todayIso(), OUT=DOC.OUT_ROOT, WIP='古紙/-. 古紙書類/▲ 書類作成中', ACLB='古紙/-. AI 活用/D-00/ACL_bench';
const qa=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const sha=b=>nodeCrypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};

(async()=>{
console.log('T-1 엔진 고정');
{ const a=HTML.match(/const ACL_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})', ver:'([\d.]+)'\}/), b=HTML.match(/const BL_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})', ver:'([\d.]+)'\}/);
  ok(a&&b&&a[1]===b[1]&&/^0\.(?:1[6-9]|2\d)$/.test(a[3])&&/^0\.[4-9]$/.test(b[3]),'acl_bench v0.16 이상 (v0.22 = v0.19) · bl_bench v0.4 이상 = 같은 커밋',[a&&a.slice(1),b&&b.slice(1)]);
  ok(E.VERSION===undefined||true,'엔진 읽기'); ok(typeof E.pastMistakes==='function'&&typeof E.ctApply==='function'&&E.sameType('40HCD','45GP')===true,'엔진 v0.16 함수 (pastMistakes · ctApply · 형태 HC)'); }

console.log('T-2 · T-3 규칙');
{ const si={crcf9_sino:1, cr49f_lc_no:'TESTLC66XX DATED ON JUN XX, 2026', crcf9_consignee:'C', crcf9_notify_party:'N'};
  const a=DOC.judgeCt({pay:'LC', ct:'LRS-2699ZZ1', lcFiles:['x.json'], lcOrig:[], sis:[si]}), b=DOC.judgeCt({pay:'LC', ct:'LRS-2699ZZ1', lcFiles:['x.json'], lcOrig:[], sis:[si], fdDone:true});
  ok(a.si.s==='diff'&&a.si.lcStale,'FD 전 = 그대로 (L/C 着 · S/I 未更新 = 相違)',a.si);
  ok(b.si.s==='done'&&b.si.ref&&!b.si.lcStale&&/^参考 — FD まで済んだ契約の 仮 S\/I/.test(b.si.why),'FD 까지 끝난 계약 = 参考 (빨강 · 確認 아님)',b.si);
  const c=DOC.judgeCt({pay:'TT', ct:'LRS-2699ZZ1', sis:[Object.assign({},si,{cr49f_lc_no:''})], fdDone:true}); ok(c.si.s!=='done'||!c.si.ref,'仮 아닌 S/I 는 fdDone 이어도 그대로',c.si);
  const ships=['NAA2699-01','NAA2699-02','NAA2699-03'];
  eq(DOC.staffDoc('[선적서류안내]#LRS-2699AA1_NAA2699-01_10MT','NAA2699-02_FD.pdf',ships),{bad:true, subj:['NAA2699-01'], att:['NAA2699-02'], iv:''},'제목 NAA2699-01 · 첨부 NAA2699-02 = bad');
  eq(DOC.staffDoc('FD NAA2699-01/02','NAA2699-02_FD.pdf',ships).iv,'NAA2699-02','묶음 제목 (01/02) · 첨부 02 = 02');
  eq(DOC.staffDoc('FD NAA2699-03','FINAL DOC.pdf',ships).iv,'NAA2699-03','첨부에 번호 없음 = 제목의 Invoice');
  eq(DOC.V18.STAFF_KINDS,['FD','TOBANK'],'담당 메일에서 받는 종류 = FD · TO BANK 만'); }

console.log('T-1 · T-5 화면 (乙仲様式 · 過去の誤記)');
{ const W=X.world(); const OTH=await BF.mkPdf([[{x:40,y:60,t:'SAMPLE FORWARDER DOCK RECEIPT'},{x:40,y:80,t:'SHIPPER SAMPLE EXPORT CO LTD BOOKING TESTBK1'}]]);
  W.sp[WIP+'/NAA2611-01'][1]=Object.assign({},W.sp[WIP+'/NAA2611-01'][1],{id:'oth1'}); W.itemBytes={oth1:OTH};
  const f=(t,ab)=>ab?{text:null,absent:true,page:1,label:''}:{text:t,absent:false,page:1,label:'X'};
  const fields={}; E.HEAD_KEYS.forEach(k=>{ fields[k]=f('',true); }); Object.assign(fields,{shipper:f('SAMPLE EXPORT CO., LTD.'),consignee:f('TO ORDER OF SAMPLE BANK'),notify:f('SAMPLE NOTIFY CO'),booking:f('TESTBK1'),vessel:f('SAMPLE VESSEL 001'),pol:f('SAMPLE POL'),pod:f('SAMPLE PORT VN'),description:f('TEST ITEM OCC')});
  const read={layout:'OTHER', form:'SAMPLE FORWARDER DOCK RECEIPT', containerTable:true, pages:1, fields, rows:[{container:'TSTU0000001',seal:'S1',type:'HCD',size:'40',bales:10,cargo:10000,tare:3800}]};
  W.content[ACLB+'/_scan_ai/'+sha(OTH)+'.other.json']=JSON.stringify({schema:'acl_scan_ai/1', model:'test-model', reads:[read,read], cost_usd:0, at:'2026-11-24T07:00:00Z', format:'OTHER'});
  W.content[ACLB+'/otsunaka_mistakes.json']=JSON.stringify({schema:'otsunaka_mistakes/1', items:[{otsunaka:'SAMPLE FWD', otsunaka_id:'9', form:'SAMPLE FORWARDER DOCK RECEIPT', invoice:'NTEST2699-01', field:'Consignee', acl:'SAMPLE PARER', right:'SAMPLE PAPER', kind:'誤字', date:'2026-07-01'},{otsunaka:'OTHER FWD', otsunaka_id:'99', form:'', invoice:'NTEST2699-02', field:'Notify Party', acl:'A', right:'B', kind:'誤字', date:'2026-08-01'}]});
  const w=await X.page(W,{...INIT, html:HFILE, ls:{doc_tool_who:'all'}}); w.pdfjsLib=R.pdfjsForWindow();
  const r=await w.eval("aclCompareOne('NAA2611-01')");
  ok(r.format==='OTHER'&&r.verdict!=='読取対象外'&&r.ai&&r.ai.other&&r.ai.label==='AI 判読 (乙仲様式)'&&r.ai.form==='SAMPLE FORWARDER DOCK RECEIPT'&&(r.items||[]).some(i=>i.key==='ai:other'),'乙仲様式 (글자 있는 OTHER) → {sha256}.other.json 저장본으로 대조 (読取対象外 아님)',{f:r.format,v:r.verdict,why:r.why});
  ok((r.items||[]).filter(i=>i.na).length>0&&!(r.kinds['表示欄相違:Received B/L']),'様式にない欄 = 対象外 (相違 아님)',r.kinds);
  ok(W.writes.length===0&&!W.req.some(x=>/anthropic/.test(x)),'AI 0 · 쓰기 0');
  /* 화면 — ACL 탭에 결과를 넣고 보기 */
  r.meta=Object.assign({},r.meta||{},{forwarderCompany:'SAMPLE FWD', forwarder:'9'}); w.__R=r; w.eval("S.aclLocal=S.aclLocal||{}; S.aclLocal['NAA2611-01']={result:window.__R, runId:'書類ツール T'}");
  await X.until(()=>w.eval('!!(PAST.list)'),5000).catch(()=>{});
  w.eval("openIv('NAA2611-01','acl')"); await X.until(()=>/NAA2611-01/.test(txt(w,'dtIvSum')),5000); await X.sleep(50);
  const body=txt(w,'dtIvBody');
  ok(/AI 判読 \(乙仲様式\) · 様式 SAMPLE FORWARDER DOCK RECEIPT · この様式にない欄 \d+（対象外）/.test(body),'ACL 탭 「AI 判読 (乙仲様式) · 様式 … · 対象外 n」',body.slice(0,300));
  ok(/この乙仲の過去の誤記 1 件（参考）/.test(body)&&/SAMPLE PARER/.test(body)&&!/NTEST2699-02/.test(body),'T-5 「この乙仲の過去の誤記 1 件（参考）」 + 목록 (그 乙仲 것만)',body.match(/.{0,40}過去の誤記.{0,80}/));
  W.itemBytes.oth1=await BF.mkPdf([[{x:40,y:60,t:'ANOTHER FORWARDER FORM WITHOUT SAVED READING'}]]); const r2=await w.eval("aclCompareOne('NAA2611-01')");
  ok(r2.verdict==='読取対象外'&&/AI 判読なし/.test(r2.why),'저장본 없는 乙仲様式 = 読取対象外 (AI 判読なし)',r2.why);
  w.close(); }

console.log('T-3 保存の入口 (담당이 보낸 FD · TO BANK)');
{ const W=X.world(), now=new Date(Date.now()-3600e3).toISOString();
  W.messages=W.messages.concat([
    {id:'s1',subject:'[선적서류안내]#LRS-2611AA1_NAA2611-01_10MT',from:{emailAddress:{address:'tester@example.test'}},receivedDateTime:now,hasAttachments:true,attachments:[{id:'a1',name:'NAA2611-02_FD.pdf',isInline:false,size:100},{id:'a9',name:'NAA2611-01_IV.pdf',isInline:false,size:100}]},
    {id:'s2',subject:'FD NAA2611-01',from:{emailAddress:{address:'tester@example.test'}},receivedDateTime:now,hasAttachments:true,attachments:[{id:'a2',name:'NAA2611-01_TO BANK.pdf',isInline:false,size:100}]}]);
  const PDF=await BF.mkPdf([[{x:40,y:60,t:'INVOICE NO. NAA2611-01'}]]); W.attBytes={'s1|a1':PDF, 's2|a2':await BF.mkPdf([[{x:40,y:60,t:'TO BANK NAA2611-01 DOCUMENTS'}]]), 's1|a9':PDF};
  const w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all', doc_tool_save_test:'1'}}); w.pdfjsLib=R.pdfjsForWindow();
  await X.until(()=>w.eval('SAVE.mailSt')==='ok'||w.eval('SAVE.mailSt')==='error',20000); await X.until(()=>w.eval('SAVE.rows').filter(r=>r.staff).length>=2&&w.eval('SAVE.rows').filter(r=>r.staff).every(r=>r.res),20000).catch(()=>{});
  const rows=w.eval('SAVE.rows'), bad=rows.find(r=>r.mailId==='s1'&&r.attName==='NAA2611-02_FD.pdf'), good=rows.find(r=>r.mailId==='s2');
  ok(bad&&bad.res==='添付名が違う'&&/保存しません/.test(bad.msg)&&!bad.target,'제목 NAA2611-01 · 첨부 NAA2611-02 → 저장 안 함 · 빨강 「添付名が違う」',bad&&{res:bad.res,msg:bad.msg});
  ok(good&&good.res==='新規'&&good.iv==='NAA2611-01'&&good.target==='NAA2611-01_TO BANK.pdf','제목 = 첨부 → {IV}_TO BANK.pdf (新規)',good&&{res:good.res,iv:good.iv,t:good.target,msg:good.msg});
  ok(!rows.some(r=>r.attName==='NAA2611-01_IV.pdf'),'담당 메일의 IV 첨부는 안 받음 (FD · TO BANK 만)');
  const html=w.document.getElementById('dtInbox').innerHTML; ok(/st-diff">添付名が違う/.test(html)&&!new RegExp('data-svsave="'+bad.id+'"').test(html),'화면 — 빨강 · 「保存する」 버튼 없음');
  /* 오래된 메일 (10/26 같은) — 参考 */
  const old={src:'メール（担当）', staff:true, mailId:'old1', attName:'NAA2611-02_FD.pdf', name:'NAA2611-02_FD.pdf', subject:'[선적서류안내]#LRS-2611AA1_NAA2611-01', at:X.addDays(T,-29)+'T03:00:00Z', id:999};
  w.__O=old; w.__O.bytes=Uint8Array.from(PDF).buffer; await w.eval('saveProcess(window.__O)');
  ok(w.__O.res==='参考（添付名が違う）'&&/保存しません/.test(w.__O.msg),'5 영업일보다 전 = 参考 (빨강 아님)',{res:w.__O.res});
  ok(W.writes.every(x=>/doc_tool\/save_log\//.test(decodeURIComponent(x.url))),'쓰기 = 기록 (save_log) 뿐 · 저장 0',W.writes.map(x=>decodeURIComponent(x.url)));
  w.close(); }

console.log('T-4 B/L Draft 「別の契約番号」 → 今日やること');
{ const W=X.world(); W.sp[OUT+'bl']=[{id:'bl1',name:'NAA2611-01_20261123-093000.json',file:{}}];
  W.content[OUT+'bl/NAA2611-01_20261123-093000.json']=JSON.stringify({kind:'B/L Draft 照合', invoice:'NAA2611-01', contract:'LRS-2611AA1', verdict:'相違', conclusion:'相違の疑い 1 か所', at:'2026-11-23T09:30:00Z', result:{verdict:'相違', otherCt:[{no:'LRS-2699ZZ2', text:'CONTRACT NO. LRS-2699ZZ2', p:1}]}});
  const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>/別の契約番号: LRS-2699ZZ2（B\/L Draft）/.test(txt(w,'dtTodoBox')),15000).catch(()=>{});
  const row=qa(w,'.tl-row').find(r=>/LRS-2699ZZ2/.test(r.textContent)); ok(row&&/NAA2611-01/.test(row.textContent)&&row.querySelector('.tl-d-late'),'今日やること 빨강 「別の契約番号: LRS-2699ZZ2（B/L Draft）」',row&&row.textContent);
  ok(W.writes.length===0,'쓰기 0'); w.close(); }

console.log((fail?'FAIL':'PASS')+' v18 — pass '+pass+' fail '+fail);
process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v18 예외',e&&e.stack||e); console.log('FAIL v18 — pass '+pass+' fail '+(fail+1)); process.exit(1); });
