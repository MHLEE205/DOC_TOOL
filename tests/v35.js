/* v0.35 시험 (지시서 THOR_34 · 형님 N66 「빈칸은 만들지 말고 " _ " 이걸 붙이면 어떨까? 통일을 시키면 좋겠지.」 · 리나이 R1) — 가짜 데이터 · 가짜 번호 · 가짜 거래처 (example.test) · 네트워크 없음.
   S1 저장 = 새 이름만 · S2 판 번호 = 옛 이름 + 새 이름 · S3 BL_DRAFT / FRT_MEMO / 모름 · R-1 둘 다 읽기 · R-2 BL_DRAFT + FRT_MEMO 둘 다 · R-3 이름 검사 · Part ④ 取り消した 것 자동 0 · 엔진 bl v0.8 · fd v0.4 */
const fs=require('fs'),path=require('path'),nodeCrypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), FX=require('./acl_fx/fixtures'), N=require('./acl_fx/fake_naccs'), R=require('./acl_fx/pdfread');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const sha=b=>nodeCrypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const SR=DOC.SAVE_RULES, IV='NTE2699-01', WIP='古紙/-. 古紙書類/▲ 書類作成中', OUT=DOC.OUT_ROOT;
(async()=>{
console.log('버전 · 푸터 · 엔진');
ok(/<title>LEENAI D-00 書類ツール v0\.3[56]<\/title>/.test(HTML)&&(HTML.match(/version:'0\.3[56]'/g)||[]).length===1&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.35 (title · CFG 1 곳) · 푸터');
ok(/const BL_ENGINE = \{commit:'(?:1744bec6367d4a6e8c97eac17fe3275f7bce9684'.*ver:'0\.8|2324aea35eba5c02454e4fb9a686f715db8be010'.*ver:'0\.9)'\}/.test(HTML)&&/const FD_ENGINE = \{commit:'2cc68da1abee0a8be35e852ba097bb30372e690a'.*ver:'0\.4'\}/.test(HTML),'엔진 = bl v0.8 (1744bec) · fd v0.4 (2cc68da) · 「_」 이름');
const B=ENG.blEngine?ENG.blEngine(HTML):null, F=ENG.fdEngine(HTML);
if(B) eq([B.draftName(IV+'_FRT_MEMO.pdf',IV),B.draftName(IV+'_BL_DRAFT_REV.pdf',IV),B.draftName(IV+'_FD_DRAFT.pdf',IV).excl],[{kind:'MEMO',rev:0},{kind:'DRAFT',rev:1},'FD/DHL/FREE TIME'],'bl-core v0.8 — _FRT_MEMO · _BL_DRAFT_REV · _FD_DRAFT 제외');
eq([IV+'_TO_BANK.pdf',IV+'_FRT_MEMO.pdf',IV+'_FD_DATA.pdf'].map(n=>F.fileTier(n,IV).tier),[0,0,1],'fd-core v0.4 — _TO_BANK · _FRT_MEMO = 부품 아님 · _FD_DATA = 1');
eq(F.fileTier(IV+'_BL_DRAFT.pdf',IV),F.fileTier(IV+'_BL DRAFT.pdf',IV),'fd-core v0.4 — _BL_DRAFT = 옛 _BL DRAFT 와 같은 판정');

console.log('S1 저장 = 새 이름만 (「_」)');
eq([0,1,2].map(n=>SR.NAME(IV,n)),[IV+'_ACL.pdf',IV+'_ACL_REV.pdf',IV+'_ACL_REV2.pdf'],'ACL = _ACL · _ACL_REV · _ACL_REV2');
eq([0,1,2].map(n=>SR.NAME_BL(IV,n)),[IV+'_FRT_MEMO.pdf',IV+'_FRT_MEMO_REV.pdf',IV+'_FRT_MEMO_REV2.pdf'],'FRT MEMO = _FRT_MEMO · _REV · _REV2');
eq([0,1,2].map(n=>SR.NAME_BLD(IV,n)),[IV+'_BL_DRAFT.pdf',IV+'_BL_DRAFT_REV.pdf',IV+'_BL_DRAFT_REV2.pdf'],'B/L Draft 따로 = _BL_DRAFT · _REV · _REV2');
eq([SR.NAME_DOC(IV,SR.DOCS.TOBANK,0),SR.NAME_DOC(IV,SR.DOCS.TOBANK,1),SR.NAME_DOC(IV,'FD',1),SR.NAME_DOC(IV,'FD',2),SR.NAME_DOC(IV,'IV',0),SR.NAME_DOC(IV,'PL',1)],
  [IV+'_TO_BANK.pdf',IV+'_TO_BANK_REV.pdf',IV+'_FD_REV.pdf',IV+'_FD_REV2.pdf',IV+'_IV.pdf',IV+'_PL_REV.pdf'],'TO_BANK · FD · IV · PL');
ok([0,1,2].every(n=>!/ /.test(SR.NAME(IV,n)+SR.NAME_BL(IV,n)+SR.NAME_BLD(IV,n)+SR.NAME_DOC(IV,'TO BANK',n))),'저장 이름에 띄어쓰기 0');

console.log('S2 판 번호 = 옛 이름 + 새 이름');
{ const ex=[{name:IV+'_ACL.pdf',hash:'h1',tkey:'t1'},{name:IV+'_ACL REV.pdf',hash:'h2',tkey:'t2'}];
  eq(DOC.saveJudge(IV,ex,[IV+'_ACL.pdf',IV+'_ACL REV.pdf'],'h3','t3'),{res:'3版目',name:IV+'_ACL_REV2.pdf',n:2},'폴더 _ACL · _ACL REV (옛) → 다음 = _ACL_REV2');
  eq(DOC.saveJudge(IV,ex,[IV+'_ACL.pdf',IV+'_ACL REV.pdf',IV+'_ACL REV2.pdf'],'h3','t3').name,IV+'_ACL_REV3.pdf','옛 _ACL REV2 가 있으면 _ACL_REV2 = 같은 이름 → 건너뜀 (_REV3)');
  eq(DOC.saveJudge(IV,[{name:IV+'_ACL.pdf',hash:'h1',tkey:'t1'},{name:IV+'_ACL_REV.pdf',hash:'h2',tkey:'t2'}],[IV+'_ACL.pdf',IV+'_ACL_REV.pdf'],'h3','t3').name,IV+'_ACL_REV2.pdf','새 이름 _ACL_REV 다음 = _ACL_REV2');
  eq(DOC.saveJudge(IV,ex,[],'h2','tx').res,'重複','같은 파일 (해시) = 重複 (옛 이름 파일과도)');
  eq(DOC.saveBump(IV,IV+'_ACL_REV.pdf',[IV+'_ACL.pdf',IV+'_ACL REV.pdf']),IV+'_ACL_REV2.pdf','409 → 다음 이름 (옛 _ACL REV = 같은 이름으로 셈)');
  eq(DOC.saveJudge(IV,[{name:IV+'_TO BANK.pdf',hash:'a',tkey:'a'}],[IV+'_TO BANK.pdf'],'b','b','TOBANK'),{res:'2版目',name:IV+'_TO_BANK_REV.pdf',n:1},'옛 _TO BANK → 다음 = _TO_BANK_REV');
  eq(DOC.saveJudge(IV,[{name:IV+'_FRT MEMO.pdf',hash:'a',tkey:'a'},{name:IV+'_DRAFT.pdf',hash:'c',tkey:'c',other:true}],[IV+'_FRT MEMO.pdf',IV+'_DRAFT.pdf'],'b','b','BL'),{res:'2版目',name:IV+'_FRT_MEMO_REV.pdf',n:1},'FRT_MEMO 판 = FRT MEMO 가족만 셈 (Draft = 다른 가족 · 중복만 봄)');
  eq(DOC.saveJudge(IV,[{name:IV+'_FRT MEMO.pdf',hash:'a',tkey:'a',other:true}],[IV+'_FRT MEMO.pdf'],'a','x','BLD').res,'重複','BL_DRAFT 가 FRT MEMO 와 같은 파일 = 重複');
  eq(DOC.saveJudge(IV,[{name:IV+'_FRT MEMO.pdf',hash:'a',tkey:'a',other:true}],[IV+'_FRT MEMO.pdf'],'b','b','BLD'),{res:'新規',name:IV+'_BL_DRAFT.pdf',n:0},'FRT MEMO 만 있을 때 B/L Draft 따로 = _BL_DRAFT (新規)'); }

console.log('S3 B/L Draft 와 FRT MEMO 가르기');
{ const k=n=>DOC.saveKind(n,''), bl=n=>{ const x=k(n); return x.key==='BL'?x.bl:x.key; };
  eq(['B/L DRAFT.pdf','NTE2699-01_BL_DRAFT.pdf','DRAFT_TESTBK1.pdf','FRT MEMO.pdf','NTE2699-01_FRT_MEMO.pdf','Freight Memo TESTBK1.pdf','Draft BL & Freight.pdf','フレートメモ.pdf'].map(bl),['D','D','D','M','M','M','M','M'],'이름 — DRAFT 만 = D · MEMO / FREIGHT = M · 둘 다 (한 파일) = M');
  eq(DOC.saveKind('scan01.pdf','BLDRAFT').bl,'?','이름에 둘 다 없음 (중身 B/L) = 모름');
  eq([DOC.blMemoOf('Draft BL & Freight memo'),DOC.blMemoOf('B/L Draft for TESTBK1'),DOC.blMemoOf('書類送付')],['M','D','?'],'메일 제목 — 이름으로 모를 때만');
  const R0=o=>Object.assign({res:'新規', iv:IV, target:IV+'_BL_DRAFT.pdf', cands:[IV], name:IV+'_BL_DRAFT.pdf', subject:'', kind:k(IV+'_BL_DRAFT.pdf')},o||{});
  ok(DOC.autoOk(R0()),'이름 _BL_DRAFT = 자동');
  ok(!DOC.autoOk(R0({name:IV+' scan.pdf', kind:DOC.saveKind('scan.pdf','BLDRAFT')})),'모름 (중身만) = 자동 0');
  ok(!DOC.autoOk(R0({kind:Object.assign({},k(IV+'_BL_DRAFT.pdf'),{bl:'?'})})),'bl = ? = 자동 0');
  ok(!DOC.autoOk(R0({blChosen:true})),'사람이 「BL_DRAFT にする / FRT_MEMO にする」 로 고른 줄 = 자동 0 (保存する 로)'); }

console.log('R-1 읽기 = 옛 이름 + 새 이름');
{ const g=(p,kind)=>{ try{ return DOC.guardSave(WIP+'/'+IV+'/'+p,{iv:IV,folder:WIP+'/'+IV,kind}); }catch(e){ return e.message; } };
  eq([g(IV+'_ACL REV.pdf'),g(IV+'_ACL_REV2.pdf'),g(IV+'_FRT MEMO REV.pdf','BL'),g(IV+'_FRT_MEMO.pdf','BL'),g(IV+'_BL_DRAFT_REV.pdf','BLD'),g(IV+'_TO BANK.pdf','TOBANK'),g(IV+'_TO_BANK_REV.pdf','TOBANK')],[true,true,true,true,true,true,true],'문지기 = 옛 이름 · 새 이름 둘 다 「정해진 이름」');
  ok(/保存できない名前/.test(g(IV+'_BL_DRAFT.pdf','BL'))&&/保存できない名前/.test(g(IV+'_FRT_MEMO.pdf','BLD')),'가족이 다르면 막음 (FRT_MEMO ↔ BL_DRAFT)');
  const kk=n=>DOC.saveKind(n,'').key;
  eq([kk(IV+'_TO_BANK.pdf'),kk(IV+'_TO BANK.pdf'),kk(IV+'_FD_REV.pdf'),kk(IV+'_IV_REV.pdf'),kk(IV+'_PL.pdf'),kk(IV+'_FRT_MEMO.pdf'),kk(IV+'_ACL_REV.pdf')],['TOBANK','TOBANK','FD','IV','PL','BL','ACL'],'종류 = 옛 · 새 이름 같게');
  eq([DOC.blKind(IV+'_FRT_MEMO_REV2.pdf',IV),DOC.blKind(IV+'_FRT MEMO REV2.pdf',IV),DOC.blKind(IV+'_BL_DRAFT.pdf',IV).k],[{k:'M',rev:2,lg:false},{k:'M',rev:2,lg:false},'D'],'B/L 파일 고르기 (blKind) = 옛 · 새 같게');
  const sc=n=>DOC.aclScan([{name:n}],IV,{}).formal.map(x=>x.version);
  eq([sc(IV+'_ACL_REV2.pdf'),sc(IV+'_ACL REV2.pdf'),sc(IV+'_ACL_REV.pdf')],[['REV2'],['REV2'],['REV']],'ACL 칸 (acl-core aclScan) = _ACL_REV2 · _ACL REV2 같게'); }

console.log('R-2 BL_DRAFT + FRT_MEMO 따로 = 둘 다');
{ const p=DOC.pickBl([{name:IV+'_BL_DRAFT.pdf'},{name:IV+'_FRT_MEMO.pdf'}],IV);
  ok(p.kind==='D'&&p.name===IV+'_BL_DRAFT.pdf'&&p.also===IV+'_FRT_MEMO.pdf','_BL_DRAFT 와 _FRT_MEMO = Draft 로 판정 · FRT MEMO 도 보임',p);
  const q=DOC.pickBl([{name:IV+'_DRAFT.pdf'},{name:IV+'_FRT MEMO.pdf'}],IV); ok(q.kind==='D'&&!q.also,'옛 이름 (선사 _DRAFT + _FRT MEMO) = 전과 같음 (also 없음)',q);
  const m=DOC.pickBl([{name:IV+'_FRT_MEMO_REV.pdf'}],IV); ok(m.kind==='M'&&m.rev===1&&m.edition==='FRT MEMO REV','_FRT_MEMO_REV 만 = FRT MEMO REV (Draft 도착)',m); }

console.log('R-3 이름 검사');
{ const f=[IV+'_ACL_REV.pdf',IV+'_FRT_MEMO.pdf',IV+'_BL_DRAFT.pdf',IV+'_TO_BANK.pdf',IV+'_FD_REV.pdf',IV+'_IV_REV.pdf'].map(name=>({name}));
  eq(DOC.fnameCheck(f,IV,{booking:'TESTBK1'}),[],'새 이름 = 「ファイル名の番号違い」 0'); }

console.log('Part ④ 取り消した 것 자동 0 (기억 = 메일 id + 해시)');
{ const U=[{hash:'hx',mid:'m1'},{hash:'hy',mid:''}];
  eq([DOC.undoneHit({hash:'hx',mailId:'m1'},U),DOC.undoneHit({hash:'hx',mailId:'m2'},U),DOC.undoneHit({hash:'hy',mailId:'m3'},U),DOC.undoneHit({hash:'hz',mailId:'m1'},U),DOC.undoneHit({hash:'hx'},U)],[true,false,true,false,true],'같은 메일 · 같은 해시 = 취소한 것 · 다른 메일 = 아님 · 기록에 mid 없음 (v0.34) = 해시만');
  ok(!DOC.autoOk({res:'2版目',iv:IV,target:IV+'_ACL_REV.pdf',cands:[IV],name:IV+'_ACL.pdf',subject:IV,kind:DOC.saveKind(IV+'_ACL.pdf',''),undone:true}),'취소한 것 = 자동 0');
  ok(/mid:row\.mailId\|\|''/.test(HTML),'자동 저장 기록에 메일 id (mid)'); }

/* ── 화면 — 가짜 메일 1 통 (제목에 Invoice · 이름 = ACL本登録) · 자동 저장 入 · 시험 모드 ── */
const cp=FX.compass(1), spec=FX.perfectSpec(E,cp); spec.fields.booking=['TESTBK1']; spec.rows[0].container='TSTU0000001'; spec.rows=spec.rows.slice(0,1); FX.retotal(spec);
const PDF1=Buffer.from(await N.build(spec)); const s2=JSON.parse(JSON.stringify(spec)); s2.fields.consignee=['TO ORDER OF OTHER BANK']; const PDF2=Buffer.from(await N.build(s2));
const world=undo=>{ const W=X.world(); W.itemBytes={}; W.attBytes={};
  const f=W.sp[WIP+'/NAA2611-01'].find(x=>x.name==='NAA2611-01_ACL.pdf'); W.itemBytes[f.id]=PDF1;
  W.messages=[{id:'m9',subject:'【通関書類送付_NAA2611-01】ACL',from:{emailAddress:{address:'otsu@forwarder.test'}},receivedDateTime:W.T+'T01:00:00Z',sentDateTime:W.T+'T01:00:00Z',hasAttachments:true,bodyPreview:'',
    attachments:[{id:'a9',name:'NAA2611-01_ACL本登録.pdf',contentType:'application/pdf',size:10,isInline:false}]}];
  W.attBytes['m9|a9']=PDF2;
  if(undo){ const dir=OUT+'autosave/99991231'; W.sp[OUT+'autosave']=[{id:'dd1',name:'99991231',folder:{}}]; W.sp[dir]=[{id:'ff1',name:'x_NAA2611-01.json',file:{},size:10}];
    W.content[dir+'/x_NAA2611-01.json']=JSON.stringify({schema:'doc_tool_autosave/1',iv:'NAA2611-01',path:WIP+'/NAA2611-01/NAA2611-01_ACL REV.pdf',hash:sha(PDF2),mid:undo,undo:true}); }
  return W; };
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const run=async undo=>{ const W=world(undo), w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_who:'all', doc_tool_save_test:'1', doc_tool_autosave_v34:'1'}});
  await X.until(()=>w.eval('SAVE').mailSt==='ok'||w.eval('SAVE').mailSt==='error',30000);
  await X.until(()=>{ const r=w.eval('SAVE').rows; return r.length>=1&&r.every(x=>x.res&&!x.busy); },30000).catch(()=>{}); await new Promise(r=>setTimeout(r,300));
  return {W, w, r:w.eval('SAVE').rows[0], puts:W.writes.map(x=>decodeURIComponent(x.url)).filter(u=>/save_test\/NAA2611-01\//.test(u))}; };
{ const {r,puts}=await run(null);
  ok(r&&r.res==='保存済'&&r.auto&&/NAA2611-01_ACL_REV\.pdf$/.test(r.saved||''),'자동 저장 = 새 이름 {IV}_ACL_REV.pdf (폴더의 옛 _ACL = 1 판)',r&&{res:r.res,saved:r.saved,msg:r.msg});
  ok(puts.length===1&&/NAA2611-01_ACL_REV\.pdf:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(puts[0]),'PUT 1 (새 파일만)',puts); }
{ const {r,puts}=await run('m9');
  ok(r&&r.res==='2版目'&&r.undone&&r.msg2===DOC.V35.UNDONE&&!puts.length,'취소 기록 (같은 메일 · 같은 해시) = 자동 0 · 「取り消し済み」 · 保存する 남음',r&&{res:r.res,undone:r.undone,msg2:r.msg2,puts}); }
{ const {r}=await run('m-other');
  ok(r&&r.res==='保存済'&&r.auto,'다른 메일의 같은 해시 = 취소한 것 아님 → 자동',r&&{res:r.res,msg2:r.msg2}); }

console.log('화면 글자 · 쓰기');
{ const app=HTML.split('<script id="doc-app">')[1]||''; const strip=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,''), core=HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1];
  ok(!/'[^'\n]*[가-힣][^'\n]*'/.test(strip(core))&&!/'[^'\n]*[가-힣][^'\n]*'/.test(strip(app)),'화면 글자 (따옴표 문자열) 한글 0 — 메일을 읽는 정규식의 한국어 (선적서류 · 방사능 등) 는 전부터 있음'); }

console.log((fail?'FAIL':'PASS')+' v35 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v35 예외',e&&e.stack||e); process.exit(1); });
