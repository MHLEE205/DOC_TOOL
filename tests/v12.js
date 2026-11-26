/* v0.12 시험 (지시서 D00 B/L Draft 2단계 · CP-A01 보완 Step 3 · 5) — 가짜 데이터만 · 네트워크 없음 · 실제 거래처 · 은행 · 항구 0. node v12.js [html]
   1 규칙 — 保存の入口 B/L Draft (종류 · 이름 {IV}_FRT MEMO · N版目 · 문지기) · 메일 下書き 3 (船社 訂正 · Draft OK · バイヤー — 宛先 없으면 빈칸 · 보내기 0)
   2 엔진 고정 — ACL v0.12 · B/L Draft (bl_bench v0.2) 커밋 + sha256 · cmaps = jsdelivr
   3 화면 — B/L Draft 탭: 照合する → 結論 · 확인 항목 · 相違 · CP 번호 (BL_DRAFT 基本) · CP-A01 試験 = 관리자만 · Draft を開く · 메일 下書き · バイヤー用 確認 문구 (やめる) · 쓰기 0
   4 保存の入口 — B/L Draft 놓기 (이름에 DRAFT 없어도 B/L 쪽이면) → 2版目 {IV}_FRT MEMO REV.pdf → 시험 모드 저장 → 같은 파일 = 重複 */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), BF=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const WIP='古紙/-. 古紙書類/▲ 書類作成中';
(async()=>{
console.log('1 규칙');
{ const k=n=>DOC.saveKind(n,'');
  eq([k('NAA2611-01_DRAFT.pdf').key,k('NAA2611-01_FRT MEMO.pdf').key,k('ONEY_TESTBK1_DRAFT_1.pdf').key,k('NAA2611-01_DRAFT DOC.pdf').key,k('NAA2611-01_FD DRAFT.pdf').key,DOC.saveKind('scan01.pdf','BLDRAFT').key,DOC.saveKind('x.pdf','NACCS').key],
     ['BL','BL','BL','X','X','BL','ACL'],'종류 — 이름 (DRAFT · FRT MEMO) · 중身 (B/L 쪽) = B/L Draft · DRAFT DOC · FD DRAFT = 当社書類 (저장 안 함) · NACCS = ACL');
  eq([DOC.SAVE_RULES.NAME_BL('naa2611-01',0),DOC.SAVE_RULES.NAME_BL('NAA2611-01',1),DOC.SAVE_RULES.NAME_BL('NAA2611-01',2)],['NAA2611-01_FRT MEMO.pdf','NAA2611-01_FRT MEMO REV.pdf','NAA2611-01_FRT MEMO REV2.pdf'],'이름 — {IV}_FRT MEMO · REV · REV2');
  const ex=[{name:'NAA2611-01_DRAFT.pdf',hash:'h1',tkey:'t1'}];
  eq(DOC.saveJudge('NAA2611-01',ex,['NAA2611-01_DRAFT.pdf','NAA2611-01_ACL.pdf'],'h9','t9','BL'),{res:'2版目',name:'NAA2611-01_FRT MEMO REV.pdf',n:1},'새 판 = 2版目 (폴더의 Draft 1 개 · 이름은 FRT MEMO REV)');
  eq([DOC.saveJudge('NAA2611-01',ex,[],'h1','x','BL').res,DOC.saveJudge('NAA2611-01',ex,[],'h2','t1','BL').res,DOC.saveJudge('NAA2611-01',[],[],'h','t','BL').name],['重複','同じ内容','NAA2611-01_FRT MEMO.pdf'],'重複 · 同じ内容 · 새로 = FRT MEMO');
  eq(DOC.saveJudge('NAA2611-01',[],['NAA2611-01_FRT MEMO.pdf'],'h','t','BL').name,'NAA2611-01_FRT MEMO REV.pdf','같은 이름이 이미 있으면 다음 이름');
  eq(DOC.saveBump('NAA2611-01','NAA2611-01_FRT MEMO.pdf',['NAA2611-01_FRT MEMO.pdf'],'BL'),'NAA2611-01_FRT MEMO REV.pdf','409 → 다음 이름 (B/L)');
  eq(DOC.saveJudge('NAA2611-01',[],[],'h','t').name,'NAA2611-01_ACL.pdf','ACL 은 그대로 (v0.9)');
  const F=WIP+'/NAA2611-01', g=(p,kind)=>{ try{ return DOC.guardSave(p,{iv:'NAA2611-01', folder:F, test:false, kind}); }catch(e){ return e.message; } };
  eq([g(F+'/NAA2611-01_FRT MEMO REV.pdf','BL'),/保存できない名前/.test(g(F+'/NAA2611-01_ACL.pdf','BL')),/保存できない名前/.test(g(F+'/NAA2611-01_FRT MEMO.pdf')),/保存できない名前/.test(g(F+'/NAA2611-01_DRAFT.pdf','BL'))],[true,true,true,true],'문지기 — B/L 은 FRT MEMO 이름만 · ACL 은 ACL 이름만');
  /* 메일 下書き */
  const res={iv:'NAA2611-01', A:[{field:'Consignee',class:'DIFF',draft:'TO THE ORDER OF OTHER BANK',si:'TO THE ORDER OF SAMPLE BANK'},{field:'Shipper',class:'SAME'},{field:'Notify',class:'UNKNOWN'}],
    B:[{item:'47A L/C No. in all docs',result:'DIFF',draft:'',lc_quote:'ALL DOCUMENTS MUST INDICATE THIS CREDIT NUMBER.'},{item:'FREIGHT PREPAID',result:'SAME'}],
    CP:[{label:'Consignee は L/C 46A の文言どおり',status:'DIFF',trial:false,actual:'X',expected:'Y'},{label:'試験',status:'INFO',trial:true,would:'DIFF',actual:'A',expected:'B'}]};
  const f=DOC.blMailDraft(res,'fix',{carrier:'SAMPLE LINE', person:'Taro Sample', to:'cs@carrier.test', blNo:'TESTBL1', subject:'RE: B/L Draft TESTBK1'});
  ok(f.subject==='[訂正依頼BL#TESTBL1] Re: B/L Draft TESTBK1'&&f.to==='cs@carrier.test'&&f.blocks===3,'訂正 — 件名 [訂正依頼BL#{B/L 番号}] Re: · 宛先 · 相違 3 (A · B · 有効 CP — 試験 CP · 같음 은 넣지 않음)',f);
  ok(/^いつもお世話になっております。/.test(f.body)&&!/様$/m.test(f.body.split('\n')[0])&&/■ Consignee\n（現在）TO THE ORDER OF OTHER BANK\n（訂正後）TO THE ORDER OF SAMPLE BANK/.test(f.body)&&/■ L\/C 番号の記載 \(L\/C 47A\)/.test(f.body)&&f.read===1,'訂正 — 본문 (欄 · 現在 · 訂正後) · 읽지 못한 곳 수',f.body);
  const o=DOC.blMailDraft(res,'ok',{subject:'FW: B/L Draft TESTBK1', person:'cs@carrier.test'}); ok(o.subject==='Re: B/L Draft TESTBK1'&&/^いつもお世話/.test(o.body)&&/問題ございません/.test(o.body)&&o.to==='','Draft OK — Re: 원 제목 · 이름 모르면 「ご担当者様」 · 宛先 없으면 빈칸',o);
  const b=DOC.blMailDraft(res,'buyer',{buyer:'BUYER A', vessel:'SAMPLE VESSEL 001', vietnam:true}), b2=DOC.blMailDraft(res,'buyer',{});
  ok(b.subject==='[B/L Draft for NAA2611-01]'&&/Dear BUYER A,/.test(b.body)&&/SAMPLE VESSEL 001/.test(b.body)&&/Deposit number/.test(b.body)&&!/Deposit/.test(b2.body)&&b2.to===''&&/Dear Sir or Madam/.test(b2.body),'バイヤー宛 — 件名 · 본선 · 베트남만 Deposit · 宛先 없으면 빈칸',[b,b2]); }

console.log('2 엔진 고정');
{ const P=ENG.pin(HTML), Q=ENG.blPin(HTML), E=ENG.engine(HTML), B=ENG.blEngine(HTML);
  ok(ENG.vnum(P.ver)>=ENG.vnum('0.12')&&typeof E.cpStageRows==='function'&&typeof E.cpAliasSame==='function'&&E.cpOp('same_text_ws:trim_end_punct').p==='trim_end_punct','ACL 엔진 v0.12 고정 (커밋 '+P.commit.slice(0,7)+' · sha256 확인 · trim_end_punct)');
  ok(ENG.vnum(Q.ver)>=ENG.vnum('0.2')&&B.VERSION===Q.ver&&typeof B.applyCp==='function'&&typeof B.maskPlan==='function','B/L Draft 엔진 = bl_bench v0.2 이상 고정 (커밋 '+Q.commit.slice(0,7)+' · sha256 확인)');
  ok(/const CMAPS = 'https:\/\/cdn\.jsdelivr\.net\/npm\/pdfjs-dist@3\.11\.174\/cmaps\/'/.test(HTML)&&!/cMapUrl:PDFJS\+'cmaps\/'/.test(HTML),'cmaps = jsdelivr 3.11.174 (cdnjs 403)');
  ok(new RegExp('source: CONTRACT_SEND/bl_bench\\.html @'+Q.commit.slice(0,7)).test(HTML),'바이어용 Draft 만들기 = bl_bench bl-app 의 사본 (출처 커밋 적음)'); }

/* 가짜 세계 — NAA2611-01 의 Draft (Consignee 은행이 L/C 와 다름) · 마스터 (BL_DRAFT 基本 2 · CP-A01 試験) */
const DRAFT=await BF.mkPdf([BF.draftItems({consignee:['TO THE ORDER OF OTHER BANK']})]);
const Bk=(id,key,st)=>({id, kind:'基本', stage:'BL_DRAFT', pay:/^bl:lc:/.test(key)?'LC':'ALL', scope_type:'all', scope:'ALL', engine_key:key, title_ja:'B/L 基本 '+id, why_ja:'なぜ '+id, example:'', status:st||'有効', approved_by:'BOSS', approved_at:'2026-11-01'});
const ROWS=[Bk('CP-B56','bl:consignee'),Bk('CP-B67','bl:lc:consignee'),Bk('CP-B74','bl:lc:47a'),
  {id:'CP-A01', kind:'追加', stage:'ACL,BL_DRAFT,BL', pay:'LC', scope_type:'all', scope:'ALL', left:'lc.bl.consignee_text', op:'same_text_ws:trim_end_punct', right:'acl.consignee', result:'相違', title_ja:'試験中のチェック', status:'試験', approved_by:''}];
function mk(){ const W=X.world(); W.itemBytes={};
  const f=W.sp[WIP+'/NAA2611-01'].find(x=>x.name==='NAA2611-01_DRAFT.pdf'); W.itemBytes[f.id]=DRAFT;
  W.masters={checkpoint:ROWS, port_alias:[]}; W.metaId={'古紙/-. AI 活用/MASTER/master_checkpoint.json':'MCP','古紙/-. AI 活用/MASTER/master_port_alias.json':'MPA'};
  W.versions={MCP:[{id:'1.0', by:'boss@example.test', items:ROWS}], MPA:[{id:'1.0', by:'boss@example.test', items:[]}]};
  W.messages=W.messages.concat([{id:'d1',subject:'B/L Draft TESTBK1',from:{emailAddress:{address:'desk@one-line.example.test',name:'Carrier Desk'}},receivedDateTime:X.addDays(W.T,-1)+'T01:00:00Z',sentDateTime:X.addDays(W.T,-1)+'T01:00:00Z',hasAttachments:true,bodyPreview:'TESTBK1',webLink:'https://example.test/mail/d1',attachments:[{name:'TESTBK1_DRAFT.pdf'}]}]);
  return W; }
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const openBl=async(w,iv)=>{ w.document.getElementById('dtQ').value=iv; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button[data-tab="bl"]'));
  w.document.querySelector('#dtIvTabs button[data-tab="bl"]').click(); await X.until(()=>!!w.document.getElementById('dtBlRun')); };
const txt=(w,id)=>w.document.getElementById(id).textContent;

console.log('3a 확인 창 — 공통 파일이 body 의 자식에 붙이는 display:none 을 시작할 때 뗌');
{ const W=mk(), w=await X.page(W,{...INIT, html:HFILE, init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); w.document.addEventListener('DOMContentLoaded',()=>{ [...w.document.body.children].forEach(el=>{ el.style.display='none'; }); }); }});
  ok(w.document.getElementById('dtModal').style.display==='','시작 뒤 #dtModal 의 인라인 display 없음 (hidden 만으로 열고 닫음)',w.document.getElementById('dtModal').style.display); }
console.log('3 화면 — 직원');
{ const W=mk(), w=await X.page(W,{...INIT, html:HFILE, first:true}); await X.until(()=>w.eval('CPS.state')==='ok'&&w.eval('TODO.mailSt')==='ok',20000);
  await openBl(w,'NAA2611-01'); const w0=W.writes.length;
  ok(/B\/L Draft 照合/.test(txt(w,'dtIvBody'))&&/まだ照合していません/.test(txt(w,'dtIvBody')),'B/L Draft 탭 — 照合 전 「まだ照合していません」');
  w.document.getElementById('dtBlRun').click(); await X.until(()=>/照合しました|照合できません|今は使えません/.test(txt(w,'dtIvBody')),30000);
  const body=w.document.getElementById('dtIvBody'), t=body.textContent;
  ok(/照合しました \(相違\)/.test(t),'照合 → 相違',t.slice(0,400));
  ok(/確認した項目/.test(t)&&/A\. COMPASS/.test(t)&&/B\. L\/C 保管所/.test(t)&&/相違 \d+ か所/.test(t),'結論 → 확인 항목 (A · B) → 相違');
  ok(!!body.querySelector('button.av-cp[data-cp="CP-B67"]')&&!!body.querySelector('button.av-cp[data-cp="CP-B56"]'),'CP 번호 (BL_DRAFT 基本)');
  ok(!/試験中のチェック/.test(t),'직원 = CP-A01 試験 줄 안 보임');
  ok(!!body.querySelector('[data-url="https://example.test/sp/NAA2611-01_DRAFT.pdf"]'),'「Draft を開く」');
  ok(!!w.document.getElementById('dtBlFix')&&!w.document.getElementById('dtBlOk')&&!!w.document.getElementById('dtBlBuyerMail')&&!!w.document.getElementById('dtBlBuyer'),'相違 → 訂正依頼 · バイヤー宛 · バイヤー用 버튼 (Draft OK 없음)');
  w.document.getElementById('dtBlFix').click(); await X.until(()=>!!w.document.getElementById('dtMdBody'));
  const ins=[w.document.getElementById('dtMdToIn').value, w.document.getElementById('dtMdSubj').value], ta=w.document.getElementById('dtMdBody').value;
  ok(ins[0]==='desk@one-line.example.test'&&/^\[訂正依頼BL#TESTBL1\] Re: B\/L Draft TESTBK1$/.test(ins[1])&&/Consignee/.test(ta)&&/OTHER BANK/.test(ta),'訂正依頼 下書き — 宛先 = Draft メールの送り手 · 件名 · 본문',{ins,ta:ta.slice(0,300)});
  ok(/全員に返信/.test(w.document.getElementById('dtModalBox').textContent),'元の Draft メールに 全員に返信 の下書き (v0.27)');
  w.document.getElementById('dtBlBuyerMail').click(); await X.until(()=>!!w.document.getElementById('dtMdSubj')&&/\[B\/L Draft for NAA2611-01\]/.test(w.document.getElementById('dtMdSubj').value));
  const bi=[w.document.getElementById('dtMdToIn').value, w.document.getElementById('dtMdSubj').value], bt=w.document.getElementById('dtMdBody').value;
  ok(bi[0]===''&&/Deposit number/.test(bt)&&/SAMPLE VESSEL 001/.test(bt),'バイヤー宛 — 宛先 없음 = 빈칸 · 베트남 = Deposit 한 줄',{bi,bt});
  w.document.getElementById('dtBlBuyer').click(); await X.until(()=>!w.document.getElementById('dtModal').hidden);
  const mt=w.document.getElementById('dtModalBox').textContent; ok(/強い依頼/.test(mt)&&/ベトナム向け Deposit 依頼/.test(mt)&&/当社書類の頁/.test(mt)&&/画像の PDF/.test(mt),'バイヤー用 — 확인 문구 (① 강한 요청 ② 베트남 Deposit · 当社書類 뺌)',mt);
  w.document.getElementById('dtBlAskNo').click(); await X.until(()=>/やめました/.test(txt(w,'dtBlBuyerSt')));
  ok(true,'やめる → 만들지 않음');
  const ws=W.writes.slice(w0); const wu=ws.map(x=>x.method+' '+decodeURIComponent(x.url).replace(/^https:\/\/graph\.microsoft\.com\/v1\.0\/drives\/DRV/,''));
  ok(wu.length===1&&/^PUT \/root:\/古紙\/-\. AI 活用\/D-00\/doc_tool\/bl\/NAA2611-01_\d{8}-\d{6}\.json:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(wu[0]),'照合 · 下書き · 확인 = 쓰기 1 (v0.13: 照合 結果 doc_tool/bl/ 새 파일만)',wu);
  ok(W.req.some(r=>/raw\.githubusercontent\.com\/MHLEE205\/CONTRACT_SEND\/[0-9a-f]{40}\/bl_bench\.html$/.test(r)),'B/L 엔진 = 고정 커밋의 bl_bench.html');
  /* 版 선택 · 「Draft OK」 (같은 Draft → 一致) */
  /* T/T の件 (NBB2611-01) に S/I どおりの Draft → 相違なし → 「Draft OK」 */
  const W2=mk(); W2.sp[WIP+'/NBB2611-01'].push({id:'dnb',name:'NBB2611-01_DRAFT.pdf',file:{},size:10,lastModifiedDateTime:'2026-11-10T00:00:00Z',webUrl:'https://example.test/sp/NBB2611-01_DRAFT.pdf'});
  W2.itemBytes.dnb=await BF.mkPdf([BF.draftItems({booking:'TESTBK3',vessel:'SAMPLE VESSEL 003',consignee:['TO ORDER OF SAMPLE BANK'],desc:['TEST ITEM OCC'],freight:false})]);
  W2.messages=W2.messages.concat([{id:'d3',subject:'B/L Draft TESTBK3',from:{emailAddress:{address:'desk@one-line.example.test',name:'Carrier Desk'}},receivedDateTime:X.addDays(W2.T,-1)+'T02:00:00Z',sentDateTime:X.addDays(W2.T,-1)+'T02:00:00Z',hasAttachments:true,bodyPreview:'TESTBK3',webLink:'https://example.test/mail/d3',attachments:[{name:'TESTBK3_DRAFT.pdf'}]}]);
  const w2=await X.page(W2,{...INIT, html:HFILE, first:true}); await X.until(()=>w2.eval('CPS.state')==='ok'&&w2.eval('TODO.mailSt')!=='load',20000); await openBl(w2,'NBB2611-01');
  w2.document.getElementById('dtBlRun').click(); await X.until(()=>/照合しました|照合できません|読めない所があります/.test(txt(w2,'dtIvBody')),30000);
  const v2=(w2.eval("S.blRes&&S.blRes['NBB2611-01']")||{res:{verdict:txt(w2,'dtIvBody').slice(0,300)}}).res.verdict; ok(v2!=='相違','L/C 와 같은 Draft → 相違 아님 ('+v2+')',txt(w2,'dtIvBody').slice(0,300));
  if(w2.document.getElementById('dtBlOk')){ w2.document.getElementById('dtBlOk').click(); await X.until(()=>!!w2.document.getElementById('dtMdBody'));
    ok(/^Re: B\/L Draft TESTBK3$/.test(w2.document.getElementById('dtMdSubj').value)&&/問題ございません/.test(w2.document.getElementById('dtMdBody').value),'「Draft OK」 返信 — Re: 원 제목'); }
  else ok(false,'「Draft OK」 버튼 없음',v2); }

console.log('4 화면 — 관리자 (試験 줄)');
{ const W=mk(), w=await X.page(W,{...INIT, html:HFILE, email:'boss@example.test'}); await X.until(()=>w.eval('CPS.state')==='ok',20000);
  await openBl(w,'NAA2611-01'); w.document.getElementById('dtBlRun').click(); await X.until(()=>/照合しました|照合できません/.test(txt(w,'dtIvBody')),30000);
  const t=txt(w,'dtIvBody'); ok(/試験中のチェック/.test(t)&&/試験 \(/.test(t),'관리자 = CP-A01 試験 줄 보임 (Draft 의 Consignee 로 실행)',t.slice(0,600));
  ok(!!w.document.querySelector('#dtIvBody [data-open="blb"]'),'관리자 — bl_bench を開く'); }

console.log('5 保存の入口 — B/L Draft');
{ const W=mk(), w=await X.page(W,{...INIT, html:HFILE, email:'boss@example.test', ls:{doc_tool_save_test:'1'}}); const S=()=>w.eval('SAVE');
  const file=(name,b)=>({name, arrayBuffer:async()=>{ const u=new Uint8Array(b); return u.buffer.slice(u.byteOffset,u.byteOffset+u.length); }});
  const NEW=await BF.mkPdf([BF.draftItems({onboard:'15 NOV 2026'})]);
  await openBl(w,'NAA2611-01'); await w.saveDrop([file('download.pdf',NEW)]); await X.until(()=>S().rows.length===1&&S().rows[0].res&&S().rows[0].res!=='',20000);
  const r=S().rows[0]; ok(r.kind&&r.kind.key==='BL'&&r.iv==='NAA2611-01'&&r.res==='2版目'&&r.target==='NAA2611-01_FRT MEMO REV.pdf','이름에 DRAFT 없어도 B/L 쪽 = B/L Draft · B/L Draft 탭의 Invoice · 2版目 → {IV}_FRT MEMO REV.pdf',{kind:r.kind,iv:r.iv,res:r.res,target:r.target,msg:r.msg});
  ok(/NAA2611-01 の B\/L Draft（2版目）として保存します: NAA2611-01_FRT MEMO REV\.pdf/.test(r.msg),'문구',r.msg);
  const w0=W.writes.length; await w.saveDo(r); await X.until(()=>S().rows[0].res==='保存済',20000);
  const ws=W.writes.slice(w0).map(x=>decodeURIComponent(x.url));
  ok(ws.some(u=>/doc_tool\/save_test\/NAA2611-01\/NAA2611-01_FRT MEMO REV\.pdf:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(u))&&ws.every(u=>/D-00\/doc_tool\//.test(u)),'시험 모드 저장 = doc_tool/save_test/{IV}/{IV}_FRT MEMO REV.pdf (새 파일만) · 그 밖 쓰기 = doc_tool/ (기록) 만',ws);
  await w.saveDrop([file('again.pdf',NEW)]); await X.until(()=>S().rows.length===2&&S().rows[1].res&&S().rows[1].res!=='',20000);
  eq(S().rows[1].res,'重複','같은 파일을 또 놓음 = 重複');
  const DD=await BF.mkPdf([[{x:30,y:30,t:'DRAFT DOC'},{x:30,y:60,t:'COMMERCIAL INVOICE'}]]); await w.saveDrop([file('NAA2611-01_DRAFT DOC.pdf',DD)]); await X.until(()=>S().rows.length===3&&S().rows[2].res,20000);
  ok(S().rows[2].res==='対象外'&&/当社書類/.test(S().rows[2].msg),'DRAFT DOC (当社書類) = 対象外',S().rows[2].msg); }

console.log('v12 pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL exception',e.stack); process.exitCode=1; });
