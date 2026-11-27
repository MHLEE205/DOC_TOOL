/* v0.9 시험 (지시서 D00 書類ツール v0.9 保存の入口 · 자체 확인 1~11) — 가짜 데이터만 · 실제 거래처 · 메일함 이름 0. node v09.js [html]
   1 종류 (ACL 가족 · v0.12: B/L Draft 도 · 輸出許可 제외 · 나머지 「まだ対応していません」) · 2 Invoice 정하기 (Booking → 컨테이너 → 이름 · 제목 · 여러 개 = 고르기)
   3 중복 (해시) · 같은 내용 (글자) · 새 판 (다음 이름 · 옛 이름 = 1판) · 4 이름 규칙 · 5 저장 문지기 (시험 폴더 · Invoice 폴더 · 정해진 이름만)
   6 메일 입구 (읽기만 · 담당자 메일 · ED 제외 · 기록된 것 다시 안 냄) · 7 끌어다 놓기 (PDF 만 · ACL 탭 우선 · Booking 다름 경고)
   8 확인 → 저장 (새 파일만 · 409 → 다음 이름 다시 제안) · 9 저장 기록 (1 건 = 새 파일 1 개) · 10 자동 저장 스위치 = 기본 끔 (관리자만) · 11 쓰기 범위 grep */
const fs=require('fs'),path=require('path'),nodeCrypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), FX=require('./acl_fx/fixtures'), N=require('./acl_fx/fake_naccs'), R=require('./acl_fx/pdfread');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const sha=b=>nodeCrypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const WIP='古紙/-. 古紙書類/▲ 書類作成中', OUT=DOC.OUT_ROOT;

(async()=>{
console.log('1 종류');
{ const k=n=>DOC.saveKind(n,'');
  eq([k('NAA2611-01_ACL.pdf').key,k('ACL_TESTBK1.pdf').ok,k('仮ACL TESTBK1.pdf').sub,k('TESTBK1 DR.pdf').sub,k('本登録 TESTBK1.pdf').key],['ACL',true,'仮ACL','DR','ACL'],'ACL 가족 (ACL · 仮 · DR · 本登録) = 저장 대상 · sub (仮/DR/ACL)');
  ok(k('NAA2611-01_ED.pdf').skip&&!k('NAA2611-01_ED.pdf').ok&&k('輸出許可通知書.pdf').skip,'輸出許可 (ED) = 이 입구에 안 냄 (C-01)');
  eq(['TEST_DRAFT.pdf','TEST_FD.pdf','TEST_SWB.pdf','TEST_RR.pdf','TEST IV.pdf','memo.pdf'].map(n=>k(n).ok?'ok':k(n).label),['ok','ok','B/L (SWB · 原本)','RR','ok','その他'],'나머지 = 저장 안 함 · 종류 이름 (「まだ対応していません（…）」) · v0.12: B/L Draft 는 保存 · v0.17 (B9): FD · IV 도 保存');
  ok(DOC.saveKind('scan001.pdf','NACCS').ok,'이름이 달라도 내용이 NACCS 양식이면 ACL'); }

console.log('2 Invoice 정하기');
{ const ships=[{iv:'TEST2699-01',bkg:'TESTBK901',bl:'TESTBL901',cntrs:['TSTU0000001']},{iv:'TEST2699-02',bkg:'TESTBK902',bl:'TESTBL902',cntrs:['TSTU0000002']},{iv:'TEST2699-03',bkg:'TESTBK902',bl:'',cntrs:[]}];
  eq(DOC.saveCands(ships,{booking:'TESTBK901-',cntrs:[],text:''},{}).cands,['TEST2699-01'],'PDF Booking No. (끝 - 무시) → Invoice 1 개');
  eq(DOC.saveCands(ships,{booking:'',cntrs:['TSTU0000002'],text:''},{}).cands,['TEST2699-02'],'Booking 없음 → 컨테이너 번호');
  eq(DOC.saveCands(ships,{booking:'',cntrs:[],text:''},{name:'TEST2699-03_ACL.pdf'}).cands,['TEST2699-03'],'→ 첨부 이름의 Invoice 번호');
  eq(DOC.saveCands(ships,{booking:'',cntrs:[],text:''},{name:'a.pdf',subject:'ACL TESTBK901'}).cands,['TEST2699-01'],'→ 메일 제목의 BKG');
  eq(DOC.saveCands(ships,{booking:'TESTBK902',cntrs:[],text:''},{}).cands.length,2,'Booking 하나에 Invoice 2 개 → 후보 2 (고르기)');
  eq(DOC.saveCands(ships,{booking:'',cntrs:[],text:''},{name:'x.pdf'}).cands,[],'단서 없음 → 0 (Invoice 不明)');
  const p=DOC.saveCands(ships,{booking:'TESTBK902',cntrs:[],text:''},{prefer:'TEST2699-01'}); ok(/この PDF の Booking No\. は TESTBK902 です（TEST2699-02 · TEST2699-03）/.test(p.note),'ACL 탭에 놓았는데 Booking 다름 → 경고',p);
  eq(DOC.saveCands(ships,{booking:'',cntrs:[],text:''},{prefer:'TEST2699-02'}).cands,['TEST2699-02'],'ACL 탭에 놓음 + 단서 없음 → 그 Invoice'); }

console.log('3 · 4 중복 · 같은 내용 · 새 판 · 이름');
{ eq([0,1,2,3].map(n=>DOC.SAVE_RULES.NAME('test2699-01',n)),['TEST2699-01_ACL.pdf','TEST2699-01_ACL REV.pdf','TEST2699-01_ACL REV2.pdf','TEST2699-01_ACL REV3.pdf'],'이름: {IV}_ACL.pdf · REV · REV2 …');
  const ex=[{name:'TEST2699-01 ACL TESTBK901.pdf',hash:'h1',tkey:'T1'}];
  eq(DOC.saveJudge('TEST2699-01',ex,['TEST2699-01 ACL TESTBK901.pdf'],'h1','Tx'),{res:'重複',same:'TEST2699-01 ACL TESTBK901.pdf'},'같은 해시 = 重複 (저장 안 함)');
  eq(DOC.saveJudge('TEST2699-01',ex,[],'h2','T1').res,'同じ内容','다른 파일 · 같은 글자 = 同じ内容');
  eq(DOC.saveJudge('TEST2699-01',ex,['TEST2699-01 ACL TESTBK901.pdf'],'h2','T2'),{res:'2版目',name:'TEST2699-01_ACL REV.pdf',n:1},'옛 이름 파일 = 1판 → 새 것 = 2版目 · REV');
  eq(DOC.saveJudge('TEST2699-01',[],[],'h','T'),{res:'新規',name:'TEST2699-01_ACL.pdf',n:0},'없음 → 新規');
  eq(DOC.saveJudge('TEST2699-01',ex,['TEST2699-01_ACL REV.pdf'],'h2','T2').name,'TEST2699-01_ACL REV2.pdf','다음 이름이 이미 있으면 건너뜀');
  eq(DOC.saveBump('TEST2699-01','TEST2699-01_ACL REV.pdf',['TEST2699-01_ACL.pdf']),'TEST2699-01_ACL REV2.pdf','409 → 다음 이름');
  eq(DOC.textKeyOf([{items:[{s:'Abc  d'},{s:'E'}]}]),DOC.textKeyOf([{items:[{s:'ab'},{s:'cdE'}]}]),'같은 내용 열쇠 = 공백 · 대소문자 무시'); }

console.log('5 저장 문지기');
{ const T=s=>{ try{ return DOC.guardSave(s.p,s.o); }catch(e){ return e.message; } };
  ok(T({p:OUT+'save_test/TEST2699-01/TEST2699-01_ACL REV.pdf',o:{iv:'TEST2699-01',test:true}})===true,'시험 = doc_tool/save_test/{IV}/ 정해진 이름 OK');
  ok(T({p:WIP+'/TEST2699-01/TEST2699-01_ACL REV.pdf',o:{iv:'TEST2699-01',test:true}})!==true,'시험 모드인데 Invoice 폴더 → 막음');
  ok(T({p:OUT+'save_test/TEST2699-02/TEST2699-01_ACL.pdf',o:{iv:'TEST2699-01',test:true}})!==true,'시험 폴더의 다른 Invoice → 막음');
  ok(T({p:WIP+'/TEST2699-01/TEST2699-01_ACL REV.pdf',o:{iv:'TEST2699-01',folder:WIP+'/TEST2699-01'}})===true,'본번 = 그 Invoice 폴더 · 정해진 이름 OK');
  ok(T({p:WIP+'/TEST2699-01/TEST2699-01_ED.pdf',o:{iv:'TEST2699-01',folder:WIP+'/TEST2699-01'}})!==true,'정해진 이름이 아니면 막음');
  ok(T({p:WIP+'/TEST2699-02/TEST2699-01_ACL.pdf',o:{iv:'TEST2699-01',folder:WIP+'/TEST2699-02'}})!==true,'폴더 이름 ≠ Invoice → 막음');
  ok(T({p:'古紙/其他/TEST2699-01/TEST2699-01_ACL.pdf',o:{iv:'TEST2699-01',folder:'古紙/其他/TEST2699-01'}})!==true,'書類作成中 · _OLD_DOC 밖 → 막음');
  ok(T({p:OUT+'save_test/../x/TEST2699-01_ACL.pdf',o:{iv:'TEST2699-01',test:true}})!==true,'.. → 막음');
  let thrown=''; try{ DOC.guardOut(WIP+'/TEST2699-01/TEST2699-01_ACL.pdf'); }catch(e){ thrown=e.message; } ok(!!thrown,'save 없는 쓰기는 지금처럼 doc_tool/ 아래만'); }

/* ── 화면 흐름 — 가짜 NACCS PDF ── */
const cp=FX.compass(1), spec=FX.perfectSpec(E,cp); spec.fields.booking=['TESTBK1']; spec.rows[0].container='TSTU0000001'; spec.rows=spec.rows.slice(0,1); FX.retotal(spec);
const PDF1=Buffer.from(await N.build(spec));
const spec2=JSON.parse(JSON.stringify(spec)); spec2.fields.consignee=['TO ORDER OF OTHER BANK']; const PDF2=Buffer.from(await N.build(spec2));
const spec3=JSON.parse(JSON.stringify(spec)); spec3.fields.booking=['TESTBK999']; spec3.rows[0].container='TSTU0000099'; const PDF3=Buffer.from(await N.build(spec3));
const OTHER=Buffer.from(await N.build({kind:'OTHER'}));
const spec4=JSON.parse(JSON.stringify(spec)); spec4.fields.notify=['OTHER NOTIFY CO']; const PDF3b=Buffer.from(await N.build(spec4));
/* 같은 글자 · 다른 바이트 (PDF 끝에 주석 한 줄 — 내용은 같음) */
const PDF1b=Buffer.concat([PDF1,Buffer.from('\n% same text\n')]);
ok(sha(PDF1)!==sha(PDF1b),'(준비) 같은 내용 · 다른 해시 PDF');

function mkWorld(){
  const W=X.world(); W.itemBytes={}; W.attBytes={};
  const f=W.sp[WIP+'/NAA2611-01'].find(x=>x.name==='NAA2611-01_ACL.pdf'); W.itemBytes[f.id]=PDF1;
  /* v0.14: 保存済みファイルを読めないと 再確認 — NBB2611-01 の ACL 家族にも中身を置く */
  W.sp[WIP+'/NBB2611-01'].filter(x=>/_ACL/.test(x.name)).forEach((x,i)=>{ W.itemBytes[x.id]=[PDF2,PDF3b][i]; });
  const T=W.T, D=(n,h)=>X.addDays(T,n)+'T0'+(h||1)+':00:00Z';
  const msg=(id,from,subject,atts,day)=>({id,subject,from:{emailAddress:{address:from}},receivedDateTime:D(day||0),sentDateTime:D(day||0),hasAttachments:true,bodyPreview:'',
    attachments:atts.map(([aid,name])=>({id:aid,name,contentType:'application/pdf',size:10,isInline:false}))});
  W.messages=W.messages.concat([
    msg('m1','otsu@forwarder.test','ACL TESTBK1',[['a1','ACL_TESTBK1.pdf'],['a2','NAA2611-01_ED.pdf']]),
    msg('m2','otsu@forwarder.test','RE: ACL',[['a3','ACL_0002.pdf']]),
    msg('m3','b@example.test','FW: ACL TESTBK1',[['a4','ACL_TESTBK1.pdf']]),
    msg('m4','otsu@forwarder.test','ACL old',[['a5','ACL_OLD.pdf']],-30)]);
  W.attBytes['m1|a1']=PDF2; W.attBytes['m1|a2']=OTHER; W.attBytes['m2|a3']=PDF1; W.attBytes['m3|a4']=PDF2; W.attBytes['m4|a5']=PDF2;
  return W;
}
const prep=w=>{ w.pdfjsLib=R.pdfjsForWindow(); };
const SV=w=>w.eval('SAVE'), SS=w=>w.eval('S'), INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
/* v0.14: 済み (重複 · 同じ内容 · 対象外 …) は 「済み n 件（開く）」 の下 — 시험은 열어서 본다 */
const rowsOf=w=>{ const sv=SV(w); if(!sv.showRest){ sv.showRest=true; w.renderInbox(); } return [...w.document.querySelectorAll('#dtInbox .sv-row')].map(r=>r.textContent); };
const bodyOf=async b=>typeof b==='string'?b:b&&b.text?await b.text():'';
const onlyRemember=async ws=>{ for(const x of ws){ if(!/doc_tool\/save_log\//.test(decodeURIComponent(x.url))) return false; const j=JSON.parse(await bodyOf(x.body)); if(['重複','同じ内容'].indexOf(j.result)<0) return false; } return true; };
const file=(name,b)=>({name, arrayBuffer:async()=>{ const u=new Uint8Array(b); return u.buffer.slice(u.byteOffset,u.byteOffset+u.length); }});

console.log('6 메일 입구');
{ const W=mkWorld(), w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all', doc_tool_save_test:'1'}});
  prep(w); const w0=W.writes.length;
  await X.until(()=>SV(w).mailSt==='ok'||SV(w).mailSt==='error',20000); await X.until(()=>rowsOf(w).length>=2&&rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  const rows=rowsOf(w), box=w.document.getElementById('dtInbox').textContent;
  ok(SV(w).mailSt==='ok','메일 확인 끝',SV(w).mailErr);
  ok(rows.length===2,'ACL 첨부 2 건 (ED 첨부 · 담당자 (회사 도메인) 메일 = 빠짐)',rows);
  ok(rows.some(t=>/2版目/.test(t)&&/NAA2611-01 の ACL（2版目）として保存します: NAA2611-01_ACL REV\.pdf/.test(t)),'새 판 → 「{IV} の ACL（2版目）として保存します: {이름}」',rows);
  ok(rows.some(t=>/重複/.test(t)&&/同じファイルが保存済み: NAA2611-01_ACL\.pdf/.test(t)),'폴더에 있는 것과 같은 파일 → 重複 (저장 버튼 없음)',rows);
  ok(/新しい書類 1 件/.test(box)&&/済み 1 件/.test(box)&&/すべて保存（新規・新しい版のみ 1）/.test(box)&&/試験モード/.test(box),'「新着 ACL（未保存）n 件」 · 「すべて保存」 · 시험 모드 표시',box.slice(0,300));
  const mailUrls=W.req.filter(r=>/\/me\/messages/.test(r));
  ok(mailUrls.length&&mailUrls.every(r=>/^GET /.test(r))&&W.writes.slice(w0).every(x=>!/messages/.test(x.url)),'메일 = GET 만 (보내기 · 읽음 · 이동 0)',W.writes.slice(w0).map(x=>x.url));
  ok(mailUrls.some(r=>/attachments\/a1\/\$value/.test(r))&&!mailUrls.some(r=>/attachments\/a2\/\$value/.test(r)),'ED 첨부는 받지도 않음');
  ok(await onlyRemember(W.writes.slice(w0))&&W.writes.length===w0+1,'확인만 → 쓰기 = 重複 기억 1 건 (save_log) 뿐 (v0.14 3-2)',W.writes.slice(w0).map(x=>x.url));
  const w1=W.writes.length;

  console.log('8 확인 → 저장 (시험 폴더)');
  const btn=w.document.querySelector('#dtInbox [data-svsave]'); btn.click();
  await X.until(()=>rowsOf(w).some(t=>/保存しました/.test(t)),20000);
  const puts=W.writes.slice(w1).map(x=>({m:x.method,u:decodeURIComponent(x.url),b:x.body}));
  ok(puts[0]&&puts[0].m==='PUT'&&puts[0].u.indexOf(OUT+'save_test/NAA2611-01/NAA2611-01_ACL REV.pdf:/content?@microsoft.graph.conflictBehavior=fail')>0,'시험 모드 → doc_tool/save_test/{IV}/ 에 새 파일 (conflictBehavior=fail)',puts.map(p=>p.u));
  ok(puts.every(p=>p.u.indexOf(WIP)<0),'Invoice 폴더 (書類作成中) 쓰기 0',puts.map(p=>p.u));
  const log=puts.find(p=>/doc_tool\/save_log\/\d{8}\/\d{8}-\d{6}_NAA2611-01_[a-z0-9]+\.json/.test(p.u)); ok(!!log,'저장 기록 = save_log/{날짜}/ 새 파일 1 개',puts.map(p=>p.u));
  const rec=log&&JSON.parse(typeof log.b==='string'?log.b:await log.b.text());
  ok(rec&&rec.invoice==='NAA2611-01'&&rec.saved==='NAA2611-01_ACL REV.pdf'&&rec.result==='保存'&&rec.kind==='ACL'&&rec.mailId==='m1'&&rec.att==='ACL_TESTBK1.pdf'&&rec.hash===sha(PDF2)&&rec.user==='boss@example.test'&&rec.test===true&&rec.src==='メール','기록 칸: 시각 · IV · 이름 · 종류 · 메일 id · 첨부 · 해시 · 누가 · 결과',rec);
  ok(puts.every(p=>p.m==='PUT'),'쓰기 = PUT (새 파일) 만 · DELETE · PATCH 0',puts.map(p=>p.m));

  console.log('9 기록된 것은 다시 안 냄');
  SV(w).rows=[]; w.saveMailScan(); await X.until(()=>SV(w).mailSt==='ok',20000); await X.sleep(50);
  ok(!rowsOf(w).some(t=>/ACL_TESTBK1/.test(t)),'같은 메일 + 첨부 = 기록에 있음 → 안 나옴',rowsOf(w)); }

{ const W=mkWorld(); W.sp[OUT+'save_log']=[{id:'dl',name:'20991231',folder:{childCount:1}}]; W.sp[OUT+'save_log/20991231']=[{id:'l1',name:'x.json',file:{}}];
  W.content[OUT+'save_log/20991231/x.json']=JSON.stringify({mailId:'m1',att:'ACL_TESTBK1.pdf',result:'保存'});
  const w=await X.page(W,{...INIT, html:HFILE, first:true, ls:{doc_tool_who:'all'}}); prep(w);
  await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  ok(!rowsOf(w).some(t=>/ACL_TESTBK1/.test(t))&&rowsOf(w).length===1,'save_log 에 있는 메일 id + 첨부 → 건너뜀',rowsOf(w)); }

console.log('7 끌어다 놓기');
{ const W=mkWorld(), w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all', doc_tool_save_test:'1'}}); prep(w);
  await X.until(()=>SV(w).mailSt==='ok'||SV(w).mailSt==='error',20000); await X.until(()=>rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  SV(w).rows=[]; const w0=W.writes.length;
  await w.saveDrop([file('memo.txt',Buffer.from('x')), file('TEST_RR.pdf',OTHER), file('scan.pdf',PDF1b), file('acl.pdf',PDF1), file('x.pdf',PDF3)]);
  const rows=rowsOf(w), fr=re=>rows.find(t=>re.test(t))||'';
  ok(/Invoice 不明/.test(rows[0]),'v0.14: やること (Invoice 不明) 가 맨 위 · 나머지는 済み 아래',rows);
  ok(/PDF だけ対応/.test(fr(/memo\.txt/)),'PDF 아님 → 「PDF だけ対応」',rows);
  ok(/この書類はまだ対応していません（RR）/.test(fr(/TEST_RR/)),'다른 서류 → 「この書類はまだ対応していません（{종류}）」',rows);
  ok(/同じ内容のファイルが保存済み: NAA2611-01_ACL\.pdf/.test(fr(/scan\.pdf/)),'같은 글자 · 다른 파일 → 同じ内容',rows);
  ok(/重複/.test(fr(/acl\.pdf/)),'같은 파일 → 重複',rows);
  ok(/Invoice 不明/.test(fr(/x\.pdf/))&&!!w.document.querySelectorAll('#dtInbox [data-svsel]').length,'Invoice 를 못 정함 → 不明 + 고르기',rows[4]);
  ok(W.writes.length===w0,'놓기만 → 쓰기 0 (놓은 PDF 는 메일이 아니라 기억하지 않음)');
  /* 고르기 → 판단 다시 */
  const sel=[...w.document.querySelectorAll('#dtInbox .sv-row')].find(r=>/x\.pdf/.test(r.textContent)).querySelector('[data-svsel]'); sel.value='NBB2611-01'; sel.dispatchEvent(new w.Event('change'));
  const fx=()=>rowsOf(w).find(t=>/x\.pdf/.test(t))||'';
  await X.until(()=>/NBB2611-01 の ACL（3版目）として保存します: NBB2611-01_ACL REV2\.pdf/.test(fx()),20000).catch(()=>{});
  ok(/NBB2611-01_ACL REV2\.pdf/.test(fx()),'Invoice 고름 → 그 폴더 기준 판단 (ACL · ACL REV 있음 → 3版目 REV2)',fx());
  /* ACL 탭에서 놓기 — Booking 다르면 경고 */
  SV(w).rows=[]; SS(w).view='iv'; SS(w).cur={type:'iv',iv:'NBB2611-01'}; SS(w).curTab='acl';
  await w.saveDrop([file('acl2.pdf',PDF2)]);
  ok(/この PDF の Booking No\. は TESTBK1 です（NAA2611-01）/.test(rowsOf(w)[0]),'ACL 탭 (다른 IV) 에 놓음 → 「この PDF の Booking No. は … です（…）」',rowsOf(w)[0]);
  SS(w).view='list'; }

console.log('8 같은 Invoice 의 여러 행 — 저장 후 다시 판단');
{ const W=mkWorld(); W.messages=W.messages.filter(m=>!/^m[1-4]$/.test(m.id||''));
  const T=W.T, D=X.addDays(T,0)+'T01:00:00Z', m=(id,aid,name)=>({id,subject:'ACL TESTBK1',from:{emailAddress:{address:'otsu@forwarder.test'}},receivedDateTime:D,sentDateTime:D,hasAttachments:true,bodyPreview:'',attachments:[{id:aid,name,contentType:'application/pdf',size:10,isInline:false}]});
  W.messages.push(m('n1','b1','ACL_A.pdf'),m('n2','b2','ACL_A.pdf'),m('n3','b3','ACL_B.pdf'));
  W.attBytes['n1|b1']=PDF2; W.attBytes['n2|b2']=PDF2; W.attBytes['n3|b3']=PDF3b;
  const w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all', doc_tool_save_test:'1'}}); prep(w);
  await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>rowsOf(w).length===3&&rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  { const R0=rowsOf(w), nm=R0.map(t=>(t.match(/NAA2611-01_ACL REV\d*\.pdf/)||[''])[0]).filter(Boolean); ok(JSON.stringify(nm.slice().sort())==='["NAA2611-01_ACL REV.pdf","NAA2611-01_ACL REV.pdf","NAA2611-01_ACL REV2.pdf"]'&&R0.every(t=>/同じまとまりで同じ名前/.test(t)),'저장 전 — v0.34 (N55 A2) 같은 묶음 = 받은 순 판 (같은 내용 2 = REV · 다른 내용 = REV2 · 전 = 모두 REV) · 자동 아님 표시',R0); }
  w.document.getElementById('dtSvAll').click();
  await X.until(()=>rowsOf(w).filter(t=>/保存しました/.test(t)).length===2,20000).catch(()=>{});
  const r=SV(w).rows.map(x=>x.res+' '+(x.target||x.same||'')); 
  ok(JSON.stringify(r.filter(x=>/^保存済/.test(x)).sort())==='["保存済 NAA2611-01_ACL REV.pdf","保存済 NAA2611-01_ACL REV2.pdf"]'&&r.filter(x=>/^重複 /.test(x)).length===1,'すべて保存 — 같은 파일 2 통 = 1 번만 (다른 하나 重複) · 다른 판 = REV2 · 409 0',r);
  { const tp=W.writes.map(x=>decodeURIComponent(x.url)).filter(u=>/save_test/.test(u)); ok(tp.length===2&&new Set(tp).size===2,'겹치는 이름으로 PUT 하지 않음 (save_test PUT 2 번 · 다른 이름)',tp); } }

console.log('8 409 → 다음 이름 다시 제안');
{ const W=mkWorld(); W.putFail=u=>/save_test\/NAA2611-01\/NAA2611-01_ACL REV\.pdf/.test(u)?409:0;
  const w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all', doc_tool_save_test:'1'}}); prep(w);
  await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>rowsOf(w).length>=2&&rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  w.document.querySelector('#dtInbox [data-svsave]').click();
  await X.until(()=>rowsOf(w).some(t=>/その名前はもう使われていました/.test(t)),20000).catch(()=>{});
  ok(rowsOf(w).some(t=>/その名前はもう使われていました — 次の名前で確認してください: NAA2611-01_ACL REV2\.pdf/.test(t)),'409 → 덮어쓰지 않고 다음 이름으로 다시 확인',rowsOf(w));
  { let saved=0; for(const x of W.writes.filter(x=>/save_log/.test(decodeURIComponent(x.url)))) if(JSON.parse(await bodyOf(x.body)).result==='保存') saved++; ok(!saved,'409 → 「保存」 기록 안 씀 (저장 안 됨)'); } }

console.log('10 자동 저장 · 관리자 · 補助');
{ const W=mkWorld(), w=await X.page(W,{...INIT, html:HFILE, first:true, ls:{doc_tool_who:'all', doc_tool_save_auto:'1', doc_tool_save_test:'1'}}); prep(w);
  await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  ok(!w.eval('saveAuto()')&&!w.eval('saveTest()')&&await onlyRemember(W.writes),'관리자 아님 → 자동 저장 · 시험 모드 스위치 안 먹음 (쓰기 0)',W.writes);
  w.openSettings(); ok(!w.document.getElementById('dtSvAuto'),'설정 — 관리자 아니면 스위치 없음'); }
{ const W=mkWorld(), w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all'}}); prep(w);
  await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>rowsOf(w).every(t=>!/判断中/.test(t)),20000);
  w.openSettings(); ok(w.document.getElementById('dtSvAuto')&&!w.document.getElementById('dtSvAuto').checked&&!w.document.getElementById('dtSvTest').checked,'관리자 설정 — 「確実なら確認なしで保存」 · 시험 모드 기본 끔');
  ok(await onlyRemember(W.writes),'기본 (확인 필요) → 메일 확인만으로는 저장 0 (重複 · 同じ内容 기억만)',W.writes.map(x=>x.url));
  ok(DOC.TODO_RULES.ASSIST_ROLE==='書類補助','補助 = master staff doc_role 「書類補助」 (v0.8 코드 · 마스터 값은 형님 확인)'); }

console.log('11 쓰기 범위 grep');
{ const app=HTML.split('<script id="doc-app">')[1]||'', sv=(t=>t.replace(/async function spMoveOld\([\s\S]*?\n(?=\/\*)/,''))(app.slice(app.indexOf('v0.9 保存の入口'), app.indexOf('function startPage')));   /* v0.34: 取り消し の移動 (spMoveOld · 門番 guardUndo) は除いて数える */
  ok(sv.length>3000,'保存の入口 코드 찾음');
  ok(!/sendMail|createReply|\/send\b|isRead|\/move\b|\/copy\b|method\s*:\s*['"](?:POST|PATCH|DELETE)/.test(sv),'保存の入口: 메일 쓰기 · 이동 · 복사 · PATCH · DELETE 0');
  ok(!/graphFetch\([^)]*method/.test(sv)&&(sv.match(/spPut\(/g)||[]).length>=2,'保存の入口: 쓰기는 spPut (문지기) 로만');
  ok((app.match(/method:'PUT'/g)||[]).length===1,'PUT 은 spPut 한 곳');
  ok(/conflictBehavior=fail/.test(app)&&!/conflictBehavior=(?:replace|rename)/.test(HTML),'replace · rename 0');
  ok(!/@[a-z0-9-]+\.(?:co\.jp|com|jp)\b/i.test(sv),'메일 주소 0'); }

console.log(fail?'FAIL v09 — pass '+pass+' fail '+fail:'PASS v09 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v09 — '+e.stack); process.exitCode=1; });
