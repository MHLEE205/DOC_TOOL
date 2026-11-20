/* 순수 로직 시험 (#1 ~ #5) — 가짜 폴더 목록 · 가짜 COMPASS. node core.js [html] */
const fs=require('fs'),path=require('path');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
DOC.useAclEngine(require('./engine').engine(HTML));   // v0.3: ACL の名前の規則 = 고정한 acl_bench v0.5 엔진
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,500));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const F=(...names)=>({files:names.map(n=>typeof n==='string'?{name:n,lastModified:'2026-11-10T00:00:00Z'}:n)});
const IV='NAA2611-01';
const base=o=>Object.assign({iv:IV,country:'VIETNAM',term:'CIF',premium:1000,etdPast:false,folder:F(),acl:null,mailRules:[]},o);
const J=o=>DOC.judgeIv(base(o));
const S=(o,k)=>J(o)[k].s;

/* ── #1 상태 규칙 표: 칸마다 済 · 確認 · 相違 · 待ち · — · ? ── */
// 通関
eq(S({folder:F(IV+'_ED.pdf')},'customs'),'done','通関 ED → 済');
eq(S({folder:F(IV+'_ED REV2.pdf')},'customs'),'done','通関 ED REV2 → 済');
eq(S({folder:F(IV+'_再輸入ED.pdf')},'customs'),'wait','通関 再輸入ED 는 輸出許可 아님 → 待ち');
eq(S({folder:F({name:IV+'_IV_PL_SI.pdf',sub:'通関'})},'customs'),'done','通関 通関/ 에 서류 → 済 (送付)');
ok(/輸出許可はまだ/.test(J({folder:F({name:IV+'_IV_PL_SI.pdf',sub:'通関'})}).customs.why),'通関 送付만 → 이유에 輸出許可はまだ');
eq(S({folder:F(IV+'_DRAFT.pdf')},'customs'),'wait','通関 서류 없음 → 待ち');
eq(S({folder:undefined},'customs'),'load','폴더 읽는 중 → …');
eq(S({folder:'missing',etdPast:false},'customs'),'wait','폴더 없음 · ETD 앞 → 待ち (未作成)');
eq(S({folder:'missing',etdPast:true},'customs'),'unk','폴더 없음 · ETD 지남 → ?');
eq(S({folder:{error:'Graph 500'}},'fd'),'unk','폴더 읽기 실패 → ?');
// ACL
const R=(verdict,file,mod)=>({result:{invoice:IV,verdict,file:'/x/'+(file||IV+'_ACL.pdf'),fileModified:mod||'2026-11-10T00:00:00Z',aclVersion:'初版',items:[]},runId:'ACL_20261120-000000'});
eq(S({folder:F(IV+'_DRAFT.pdf')},'acl'),'wait','ACL 없음 → 待ち');
/* v0.3 (형님 D3): 仮ACL = ACL · 済 = 本登録 메일 (rcp@ CC) 이 있을 때만 — 표 (待ち · 確認 · 相違 · 済) */
const HON=[{at:'2026-11-18T01:00:00Z', name:'山田', src:'mail'}];
eq([S({folder:F('仮ACL.pdf')},'acl'),J({folder:F('仮ACL.pdf')}).acl.label],['todo','仮'],'v0.3 仮ACL 만 → ACL 있음 (판 仮) · 本登録 없음 → 確認');
eq(S({folder:F(IV+'_ACL.pdf')},'acl'),'todo','ACL 있음 · 照合結果 없음 → 確認');
eq(S({folder:F(IV+'_ACL.pdf'),acl:R('相違あり')},'acl'),'diff','ACL 相違あり · 本登録 없음 → 相違');
eq(S({folder:F(IV+'_ACL.pdf'),acl:R('表記差のみ')},'acl'),'todo','v0.3 ACL 表記差のみ · 本登録 없음 → 確認 (v0.2 는 済)');
eq([S({folder:F(IV+'_ACL.pdf'),acl:R('完全一致')},'acl'),/本登録 まだ/.test(J({folder:F(IV+'_ACL.pdf'),acl:R('完全一致')}).acl.why)],['todo',true],'v0.3 ACL 完全一致 · 本登録 없음 → 確認 「本登録 まだ」');
eq(S({folder:F(IV+'_ACL.pdf'),acl:R('読取対象外')},'acl'),'todo','ACL 読取対象外 (스캔) → 確認');
eq(S({folder:F(IV+'_ACL.pdf',IV+'_ACL REV.pdf'),acl:R('相違あり')},'acl'),'todo','照合 뒤 REV 가 들어옴 → 確認');
eq(S({folder:F({name:IV+'_ACL.pdf',lastModified:'2026-11-15T00:00:00Z'}),acl:R('完全一致')},'acl'),'todo','照合 뒤 같은 이름 갱신 → 確認');
eq(S({folder:F(IV+'_ACL.pdf',IV+'_ACL REV.pdf'),acl:R('完全一致',IV+'_ACL REV.pdf'),hon:HON},'acl'),'done','REV 를 照合 + 本登録 → 済');
{ const a=J({folder:F(IV+'_ACL.pdf'),acl:R('完全一致'),hon:HON}).acl, b=J({folder:F(IV+'_ACL.pdf'),acl:R('相違あり'),hon:HON}).acl, c=J({folder:F(IV+'_ACL.pdf'),hon:HON}).acl, d=J({folder:F(IV+'_DRAFT.pdf'),hon:HON}).acl;
  eq([a.s,/^本登録 済 \(11\/18 山田\)/.test(a.why)],['done',true],'v0.3 本登록 메일 있음 → 済 「本登録 済 (11/18 山田)」 (UTC → 일본 날짜)');
  eq([b.s,/相違のまま本登録/.test(b.why),b.diffHon],['done',true,true],'v0.3 相違 + 本登録 → 済 + 「相違のまま本登録」');
  eq(c.s,'done','v0.3 照合 전이라도 本登録 메일 있음 → 済');
  eq([d.s,/ACL ファイルがフォルダにない/.test(d.why)],['todo',true],'v0.3 本登録 메일은 있는데 ACL 파일 없음 → 確認 (⚠️ 토르 판단)'); }
{ const D2=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined), q=o=>D2.judgeIv(base(o)).acl;
  eq([q({folder:F(IV+'_ACL.pdf')}).s,q({folder:F(IV+'_ACL.pdf'),engineErr:true}).s],['load','unk'],'v0.3 엔진 읽는 중 → … · 엔진 못 읽음 → ? (추측 안 함)'); }
eq(S({folder:F('NBB2611-09_ACL.pdf')},'acl'),'wait','다른 Invoice 의 ACL 은 안 셈');
// B/L Draft
eq(S({folder:F(IV+'_ED.pdf')},'bl'),'wait','B/L 없음 → 待ち');
eq(S({folder:F(IV+'_DRAFT.pdf')},'bl'),'todo','DRAFT → 確認');
eq(S({folder:F(IV+'_FRT MEMO.pdf')},'bl'),'todo','FRT MEMO → 確認');
eq(S({folder:F(IV+'_DRAFT.pdf',IV+'_SWB.pdf')},'bl'),'done','SWB → 済');
eq(S({folder:F(IV+'_DRAFT.pdf',IV+'_FD.pdf')},'bl'),'done','FD 작성 → B/L 済');
eq(S({folder:F(IV+'_DRAFT DOC.pdf')},'bl'),'wait','DRAFT DOC 만 → 待ち');
// DEPO
eq(S({folder:F(IV+'_DRAFT.pdf')},'depo'),'wait','DEPO 初版만 → 待ち');
eq(S({folder:F(IV+'_DRAFT.pdf',IV+'_DRAFT REV.pdf')},'depo'),'done','DEPO REV → 済');
eq(S({folder:F(IV+'_DRAFT (1).pdf')},'depo'),'wait','DEPO 브라우저 복제 「(1)」 은 REV 아님');
eq(S({folder:F(IV+'_FRT MEMO REV.pdf')},'depo'),'wait','DEPO FRT MEMO REV 만 → 済 아님');
eq(S({folder:F(IV+'_IV_PL.pdf')},'customs'),'todo','通関 폴더 바로 아래 IV·PL 만 → 確認 (送付 미확인)');
eq(DOC.judgeCt({pay:'TT',lcFiles:[],sis:[{crcf9_sino:1,crcf9_consignee:'A',crcf9_notify_party:'N',crcf9_po_vo:'PO NO: XXXX',crcf9_place_of_delivery_1:'P'}]}).si.s,'todo','S/I PO NO: XXXX → 確認');
eq(S({folder:F(IV+'_DRAFT LG.pdf')},'depo'),'done','DEPO DRAFT LG → 済');
ok(/LG 作成済/.test(J({folder:F(IV+'_DRAFT.pdf','LG(TEST0000001).xlsx')}).depo.why),'DEPO LG xlsx 만 → 待ち (LG 作成済)');
eq(S({folder:F()},'depo'),'wait','DEPO B/L 없음 → 待ち');
// 保険
eq(S({premium:12000},'ins'),'done','保険料 있음 → 済');
eq(S({premium:null},'ins'),'wait','保険料 빈칸 → 待ち');
eq(S({premium:0},'ins'),'wait','保険料 0 → 待ち');
eq(S({premium:undefined},'ins'),'unk','保険料 못 읽음 → ?');
// RR
eq(S({country:'KOREA',folder:F(IV+'_RR.pdf')},'rr'),'done','RR pdf → 済');
eq(S({country:'KOREA',folder:F({name:'IMG_0001.JPG',sub:'_RR'})},'rr'),'todo','RR 사진만 → 確認');
eq(S({country:'KOREA',folder:F(IV+'_FD.pdf')},'rr'),'wait','RR 없음 → 待ち');
// FD
eq(S({folder:F(IV+'_FD.pdf')},'fd'),'done','FD → 済');
eq(S({folder:F(IV+'_FD2.pdf')},'fd'),'done','FD2 → 済');
eq(S({folder:F(IV+'_FD REV.pdf')},'fd'),'done','FD REV → 済');
eq(S({folder:F(IV+'_FRT MEMO.pdf')},'fd'),'wait','FRT MEMO 는 FD 아님');
// 計 6 상태가 다 나옴
const seen=new Set(); [{folder:F(IV+'_ED.pdf')},{folder:F(IV+'_ACL.pdf')},{folder:F(IV+'_ACL.pdf'),acl:R('相違あり')},{folder:F()},{country:'JAPAN'},{premium:undefined}].forEach(o=>Object.values(J(o)).forEach(c=>seen.add(c.s)));
ok(['done','todo','diff','wait','na','unk'].every(s=>seen.has(s)),'6 상태 (済 確認 相違 待ち — ?) 가 모두 나옴',[...seen]);
ok(Object.values(J({})).every(c=>typeof c.why==='string'),'칸마다 근거 (툴팁) 문자');

/* ── #2 대상 외 ── */
eq(S({country:'INDONESIA'},'depo'),'na','VIETNAM 아니면 DEPO —');
eq(S({country:'VIETNAM'},'rr'),'na','KOREA 아니면 RR —');
eq(S({term:'CFR'},'ins'),'na','CIF 아니면 保険 —');
eq(S({term:'転売'},'ins'),'na','転売 → 保険 —');
eq(DOC.judgeCt({pay:'TT',lcFiles:[],sis:[]}).lc.s,'na','LC 아니면 LC —');
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[]}).lc.s,'wait','LC 인데 읽은 결과 없음 → 待ち');
eq(DOC.judgeCt({pay:'LC',lcFiles:['LRS-2611AA1_TESTLC001.json'],sis:[]}).lc.s,'done','LC JSON 있음 → 済');
// S/I
const si=o=>Object.assign({crcf9_sino:1,crcf9_consignee:'TO ORDER',crcf9_notify_party:'SAMPLE CO',crcf9_po_vo:'PO TEST-1',crcf9_place_of_delivery_1:'SAMPLE PORT',cr49f_lc_no:'TESTLC001',crcf9_vo_no:''},o);
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[]}).si.s,'wait','S/I 없음 → 待ち');
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[si()]}).si.s,'done','S/I 다 있음 → 済');
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[si({crcf9_po_vo:''})]}).si.s,'todo','PO/VO 빈칸 → 確認');
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[si({crcf9_vo_no:'VO NUMBER: XX'})]}).si.s,'todo','VO 번호 XX → 確認');
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[si({cr49f_lc_no:''})]}).si.s,'todo','LC 계약 · LC No 빈칸 → 確認');
eq(DOC.judgeCt({pay:'TT',lcFiles:[],sis:[si({cr49f_lc_no:''})]}).si.s,'done','TT 계약 · LC No 빈칸 → 済');
eq(DOC.judgeCt({pay:'LC',lcFiles:[],sis:[si({crcf9_bl_text1:'DEPOSIT NUMBER: XX'})]}).si.s,'done','B/L 문구의 XX (선적 때 확정) 는 미완성 아님');
eq(DOC.judgeCt({pay:'LC',lcFiles:undefined,sis:undefined}).lc.s,'load','LC 읽는 중 → …');

/* ── #3 담당 ── */
eq(DOC.ivCode('NMG2699-03'),'MG','기호 NMG2699-03 → MG (지시서 예의 모양 · 가짜 번호)');
eq(DOC.ivCode('NA2699-08'),'A','기호 NA2699-08 → A');
eq(DOC.ctCode('LRS-2699SG1'),'SG','기호 LRS-2699SG1 → SG');
eq(DOC.ctCode('LRS-2699A1'),'A','기호 LRS-2699A1 → A');
eq(DOC.ivCode('UNF2611-01'),'NF','U 로 시작 → NF');
eq(DOC.ctCode('LRS-26112AB1'),'AB','계약 숫자 5자리');
eq(DOC.ivCode('XYZ'),'','모양 다름 → 빈칸');
const M=DOC.docStaffMap([{iv_code:'mg',staff:'STAFF_A'},{iv_code:'A',staff:'STAFF_B'},{iv_code:'ZZ',staff:''}]);
eq([M.MG,M.A,M.ZZ,M.QQ],['STAFF_A','STAFF_B','',undefined],'doc_staff 맵 (대문자 · 미등록)');
const staff=[{code:'STAFF_A',email:'a@example.test',name_ja:'山田 太郎',portal_admin:false},{code:'BOSS',email:'boss@example.test',name_ja:'管理 者',portal_admin:true}];
const meA=DOC.meOf('A@Example.test',staff), boss=DOC.meOf('boss@example.test',staff), nobody=DOC.meOf('x@example.test',staff);
eq([meA.code,meA.admin,boss.admin,nobody.code],['STAFF_A',false,true,''],'로그인 메일 → 나 (대소문자 무시)');
ok(DOC.visible('STAFF_A','me',meA)&&!DOC.visible('STAFF_B','me',meA),'自分の担当 = 내 것만');
ok(DOC.visible('STAFF_B','me',boss)&&DOC.visible('','me',boss),'관리자 自分の担当 = 전원');
ok(!DOC.visible('STAFF_A','me',nobody),'등록 안 된 사람 自分の担当 = 없음');
ok(DOC.visible('STAFF_B','all',meA)&&DOC.visible('','all',meA),'全員');
ok(DOC.visible('STAFF_B','STAFF_B',meA)&&!DOC.visible('STAFF_A','STAFF_B',meA),'담당자별');
ok(DOC.visible('','_none',meA)&&!DOC.visible('STAFF_A','_none',meA),'担当未登録');
eq(DOC.shortName('山田 太郎'),'山田','이름 앞부분');

/* ── #4 정렬 · 要対応 · 범위 ── */
eq(DOC.sortIv([{iv:'B',etd:'2026-11-25'},{iv:'A',etd:'2026-11-25'},{iv:'C',etd:'2026-11-01'},{iv:'D',etd:''}]).map(r=>r.iv),['C','A','B','D'],'ETD 가까운 순 · 같으면 Invoice · ETD 없으면 끝');
eq(DOC.sortCt([{ct:'B',next:''},{ct:'A',next:'2026-12-01'},{ct:'C',next:'2026-11-22'}]).map(r=>r.ct),['C','A','B'],'계약 = 다음 ETD 순');
ok(DOC.needs({a:{s:'todo'}})&&DOC.needs({a:{s:'diff'}})&&!DOC.needs({a:{s:'wait'},b:{s:'unk'},c:{s:'done'},d:{s:'na'}}),'要対応 = 確認 · 相違 만');
eq(DOC.defaultRange('2026-11-20'),{from:'2026-10-21',to:'2027-01-04'},'기본 범위 −30 ~ +45');
eq(DOC.defaultRange('2026-11-20',7,10),{from:'2026-11-13',to:'2026-11-30'},'범위 바꿈');
ok(DOC.inRange('2026-11-20','2026-11-01','2026-11-30')&&!DOC.inRange('2026-12-01','2026-11-01','2026-11-30')&&!DOC.inRange('','2026-11-01','2026-11-30'),'범위 안/밖');
eq(DOC.etdOf({cr49f_etd:'2026-11-20T00:00:00Z',crcf9_bl_etd:'2026-11-22T09:00:00Z'}),'2026-11-22','ETD = B/L ETD 우선');
eq(DOC.etdOf({cr49f_etd:'2026-11-20T00:00:00Z'}),'2026-11-20','B/L ETD 없으면 계획');

/* ── #5 B/L 파일 고르기 (F6) ── */
const P=(...n)=>DOC.pickBl(n.map(x=>({name:x})),IV);
eq(P(IV+'_DRAFT.pdf',IV+'_DRAFT REV.pdf',IV+'_DRAFT REV2.pdf',IV+'_FRT MEMO.pdf').name,IV+'_DRAFT REV2.pdf','REV2 > REV > DRAFT > FRT MEMO');
eq(P(IV+'_DRAFT.pdf',IV+'_DRAFT REV.pdf').edition,'REV','REV > DRAFT');
eq(P(IV+'_DRAFT.pdf',IV+'_FRT MEMO.pdf').name,IV+'_DRAFT.pdf','DRAFT > FRT MEMO');
eq(P(IV+'_FRT MEMO.pdf').edition,'FRT MEMO','FRT MEMO 만');
eq(P(IV+'_DRAFT DOC.pdf',IV+'_DOC DRAFT.pdf',IV+'_DRAFT D0C.pdf').file,null,'DRAFT DOC · DOC DRAFT · D0C 제외');
eq(P(IV+'_FRT MEMO(旧).pdf').file,null,'(旧) 제외');
eq(P('NBB2611-02_DRAFT.pdf').file,null,'다른 Invoice 번호 제외');
eq(P(IV+'_DRAFT.xlsx').file,null,'PDF 아님 제외');
eq(P(IV+'_DRAFT(2).pdf',IV+'_DRAFT.pdf').edition,'REV2','끝의 (2) = 판 번호');
eq(P(IV+'_DRAFT LG.pdf').edition,'DRAFT LG','DRAFT LG');
ok(P(IV+'_DRAFT DOC.pdf',IV+'_DRAFT.pdf').excluded.some(x=>/DRAFT DOC/.test(x)),'제외한 파일 이유 남김');

/* ── 그 밖 ── */
eq(DOC.vesselChange({acl:R('相違あり'),mailRules:['本船変更'],folder:F(IV+'_船名変更.pdf')}).length,2,'本船変更: 메일 · 파일 (ACL detail 없음)');
eq(DOC.vesselChange({acl:{result:{items:[{detail:'X のあとにブッキング変更 (本船変更の可能性)'}]}},mailRules:[],folder:F()}).length,1,'本船変更: ACL 照合');
eq(DOC.mailRulesByIv('﻿件名,件名規則,Invoice番号\r\n"a,b",本船変更,"NAA2611-01; NAA2611-02"\r\nc,本登録依頼,naa2611-01\r\n'),{'NAA2611-01':['本船変更','本登録依頼'],'NAA2611-02':['本船変更']},'메일 CSV → Invoice 별 件名規則');
eq(DOC.queryKind(' naa2611-01 '),{type:'iv',q:'NAA2611-01'},'검색: Invoice');
eq(DOC.queryKind('lrs-2611aa1'),{type:'ct',q:'LRS-2611AA1'},'검색: 계약');
eq(DOC.queryKind('TESTLC0001').type,'lc','검색: LC 번호');
eq(DOC.queryKind('ab').type,'','검색: 너무 짧음');
ok(DOC.guardOut('古紙/-. AI 활용/D-00/doc_tool/log/x.json'.replace('활용','活用')),'문지기: doc_tool 아래 OK');
['古紙/-. AI 活用/MASTER/master_staff.json','古紙/-. AI 活用/D-00/doc_tool/../MASTER/x.json','古紙/-. 古紙書類/▲ 書類作成中/NAA2611-01/x.pdf',''].forEach(p=>{ let t=false; try{ DOC.guardOut(p); }catch(e){ t=true; } ok(t,'문지기: 막음 '+p); });
ok(/^古紙\/-\. AI 活用\/D-00\/doc_tool\/log\/NAA2611-01\/\d{8}-\d{6}_acl\.json$/.test(DOC.logPath('NAA2611-01','acl',new Date(2026,10,20,9,8,7))),'履歴 경로');

/* ── P2 ACL 도움 함수 ── */
eq(DOC.utcStamp(new Date('2026-11-20T06:25:35.123Z')),'20261120-062535','UTC 시각표 = acl_bench runId 모양');
eq(DOC.runStamp('ACL_20261120-062535'),'20261120-062535','run 시각');
eq(DOC.latestAcl(['NAA2611-01_20261120-010000.json','NAA2611-01_20261121-010000.json','naa2611-02_20261119-000000.json','x.txt']),{'NAA2611-01':{name:'NAA2611-01_20261121-010000.json',stamp:'20261121-010000'},'NAA2611-02':{name:'naa2611-02_20261119-000000.json',stamp:'20261119-000000'}},'Invoice 별 가장 새 결과');
ok(/^古紙\/-\. AI 活用\/D-00\/doc_tool\/acl\/NAA2611-01_\d{8}-\d{6}\.json$/.test(DOC.aclResultPath('naa2611-01')),'결과 경로');
const RES={invoice:'NAA2611-01',items:[{status:'DIFF',label:'Seal',actual:'SL1',expected:'SL2'},{status:'DROP',label:'Notify',actual:'A',expected:'A\nB'},{status:'NOTATION',label:'C'},{status:'MATCH',label:'D'},{status:'READ_CHECK',label:'E'},{status:'INFO',group:'NACCS 表示欄',label:'Way Bill'}]};
const G=DOC.aclGroups(RES); eq([G.diff.length,G.note.length,G.match.length,G.check.length,G.disp.length],[2,1,1,1,1],'ACL 묶음 (相違 · 表記差 · 一致 · 読取確認 · 表示欄)');
const MD=DOC.mailDraft(RES,{booking:'TESTBK1',company:'SAMPLE FWD',to:'a@example.test',cc:'b@example.test;c@example.test'});
ok(MD.subject==='[ACL訂正依頼] NAA2611-01 / BKG TESTBK1'&&/SAMPLE FWD ご担当者 様/.test(MD.body)&&/■ 1\. Seal 欄/.test(MD.body)&&/→ 正: SL2/.test(MD.body)&&/■ 2\. Notify 欄/.test(MD.body)&&!/■ 3/.test(MD.body)&&/✦ Powered by LEENAI Automation System$/.test(MD.body)&&MD.n===2,'訂正依頼メール (相違만 · 일본어 · 푸터)',MD);
const MU=DOC.mailtoUrl(MD); ok(!MU.cut&&/^mailto:a@example\.test\?subject=/.test(MU.url)&&/&cc=b%40example\.test%2Cc%40example\.test/.test(MU.url)&&/&body=/.test(MU.url),'mailto (To · Cc · 본문)',MU.url.slice(0,120));
const MU2=DOC.mailtoUrl(Object.assign({},MD,{body:'X'.repeat(5000)})); ok(MU2.cut&&MU2.url.length<600,'본문이 길면 잘라서 (복사 안내)');

/* ── P3 S/I 쓰기 계획 · 문지기 · 확인 (#7) ── */
const GU=(p,n)=>(p+'00000000').slice(0,8)+'-0000-4000-8000-'+String(n).padStart(12,'0');
const CID=GU('c',1), SI1=GU('a',1), D1=GU('d',1), SD1=GU('e',1), IT=GU('f',1), OTHER=GU('c',2);
const curS={sis:[{cr49f_s_iid:SI1,crcf9_sino:1,crcf9_consignee:'A',crcf9_notify_party:'N',crcf9_po_vo:'PO1',_details:[{crcf9_s_i_detailid:D1,_crcf9_sale_detail_id_value:SD1,crcf9_productname:'OCC',crcf9_hs_code:'4707'}]}],details:[]};
curS.details=curS.sis[0]._details;
const sale=[{cr49f_sale_detailid:SD1,_cr49f_item_id_value:IT,cr49f_quantity:500,cr49f_price:200}];
eq(DOC.siPlan(curS,{sinos:{1:{crcf9_consignee:'A',crcf9_notify_party:'N',crcf9_po_vo:''}},details:[]},sale),[],'추천이 빈칸이어도 고치지 않은 칸은 COMPASS 값을 남김');
eq(DOC.siPlan(curS,{sinos:{1:{crcf9_consignee:'A ',crcf9_notify_party:' N'}},details:[]},sale),[],'공백만 다르면 쓰지 않음');
eq(DOC.siPlan({sis:[Object.assign({},curS.sis[0],{_details:[{crcf9_s_i_detailid:D1,crcf9_productname:'OCC'}]})]},{sinos:{1:{}},details:[{crcf9_productname:'OCC'}]},sale),[],'판매 명세에 안 이어진 옛 명세가 있으면 새 명세를 만들지 않음 (중복 방지)');
const ops=DOC.siPlan(curS,{sinos:{1:{crcf9_consignee:'A',crcf9_notify_party:'N2',crcf9_po_vo:'',crcf9_unknown:'x'},2:{crcf9_consignee:'B',crcf9_notify_party:''}},details:[{crcf9_productname:'OCC',crcf9_hs_code:'4707.10'}],edited:{'1|crcf9_po_vo':1}},sale);
eq(ops.map(o=>o.method+' '+o.set+' '+o.sino),['PATCH cr49f_s_is 1','PATCH crcf9_s_i_details 1','POST cr49f_s_is 2','POST crcf9_s_i_details 2'],'계획: 있는 sino = 바뀐 칸 PATCH · 없는 sino = POST · 명세');
eq(ops[0].body,{crcf9_notify_party:'N2',crcf9_po_vo:null},'PATCH 본문 = 바뀐 칸만 · 담당자가 지운 칸은 null · 모르는 칸 제외');
eq(ops[1].body,{crcf9_hs_code:'4707.10'},'명세 PATCH = 바뀐 칸만');
eq(ops[2].body,{crcf9_sino:2,crcf9_consignee:'B'},'새 S/I = sino + 값 있는 칸');
eq([ops[3].siRef,ops[3].saleDetail,ops[3].item,ops[3].body.crcf9_weight,ops[3].body.crcf9_price],['new:2',SD1,IT,500,200],'새 명세 = 새 S/I · 판매 명세 · 품목 · 수량 · 단가');
eq(DOC.siPlan(curS,{sinos:{1:{crcf9_consignee:'A',crcf9_notify_party:'N',crcf9_po_vo:'PO1'}},details:[{crcf9_productname:'OCC',crcf9_hs_code:'4707'}]},sale),[],'같으면 계획 없음');
eq(DOC.siPlan(curS,{sinos:{1:{crcf9_consignee:'A\r\nB'}}},sale)[0].body,{crcf9_consignee:'A\nB'},'줄바꿈 CRLF → LF');
const ctx={contractId:CID, siIds:new Set([SI1]), detailIds:new Set([D1]), created:new Set(), saleDetailIds:new Set([SD1]), itemIds:new Set([IT]),
  sets:{contract:'cr49f_sale_contracts',si:'cr49f_s_is',detail:'crcf9_s_i_details',saleDetail:'cr49f_sale_details',item:'cr49f_items'}, nav:{contract:'cr49f_sale_contract_id',si:'crcf9_s_i_id',saleDetail:'crcf9_sale_detail_id',item:'crcf9_item_id'}};
const pass_=(m,s,i,b)=>{ let e=null; try{ DOC.guardDv(m,s,i,b,ctx); }catch(x){ e=x.message; } return e; };
ok(pass_('PATCH','cr49f_s_is',SI1,{crcf9_notify_party:'X'})===null,'문지기 통과: 이 계약 S/I PATCH');
ok(pass_('POST','cr49f_s_is',null,{crcf9_sino:2,crcf9_consignee:'B','cr49f_sale_contract_id@odata.bind':'/cr49f_sale_contracts('+CID+')'})===null,'문지기 통과: 이 계약에 S/I POST');
ok(pass_('POST','crcf9_s_i_details',null,{crcf9_productname:'OCC',crcf9_weight:500,'crcf9_s_i_id@odata.bind':'/cr49f_s_is('+SI1+')','crcf9_sale_detail_id@odata.bind':'/cr49f_sale_details('+SD1+')','crcf9_item_id@odata.bind':'/cr49f_items('+IT+')'})===null,'문지기 통과: 명세 POST');
[['DELETE','cr49f_s_is',SI1,{},'DELETE'],['PATCH','cr49f_sale_contracts',CID,{cr49f_pay_cls:1},'다른 표'],['PATCH','cr49f_s_is',GU('a',9),{crcf9_consignee:'X'},'다른 계약 S/I'],['PATCH','cr49f_s_is',SI1,{crcf9_sino:3},'sino 바꾸기'],
 ['PATCH','cr49f_s_is',SI1,{ownerid:'x'},'정하지 않은 칸'],['PATCH','crcf9_s_i_details',GU('d',9),{crcf9_hs_code:'1'},'다른 명세'],
 ['POST','cr49f_s_is',null,{crcf9_sino:2,'cr49f_sale_contract_id@odata.bind':'/cr49f_sale_contracts('+OTHER+')'},'다른 계약에 POST'],['POST','cr49f_s_is',null,{crcf9_sino:5,'cr49f_sale_contract_id@odata.bind':'/cr49f_sale_contracts('+CID+')'},'sino 5'],
 ['POST','cr49f_s_is',null,{crcf9_sino:2},'연결 없음'],['POST','crcf9_s_i_details',null,{'crcf9_s_i_id@odata.bind':'/cr49f_s_is('+GU('a',9)+')','crcf9_sale_detail_id@odata.bind':'/cr49f_sale_details('+SD1+')'},'남의 S/I 에 명세'],
 ['POST','crcf9_s_i_details',null,{'crcf9_s_i_id@odata.bind':'/cr49f_s_is('+SI1+')','crcf9_sale_detail_id@odata.bind':'/cr49f_sale_details('+GU('e',9)+')'},'다른 판매 명세'],
 ['PATCH','cr49f_s_is',SI1,{'cr49f_sale_contract_id@odata.bind':'/cr49f_sale_contracts('+OTHER+')'},'PATCH 로 연결 바꾸기']].forEach(([m,s,i,b,why])=>ok(pass_(m,s,i,b)!==null,'문지기 막음: '+why));
let bad=null; try{ DOC.guardDv('PATCH','cr49f_s_is',SI1,{crcf9_consignee:'x'},Object.assign({},ctx,{contractId:'x'})); }catch(e){ bad=e; } ok(!!bad,'문지기 막음: 계약 ID 모양 다름');
const ver=DOC.siVerify([ops[0]],{sis:[Object.assign({},curS.sis[0],{crcf9_notify_party:'N2',crcf9_po_vo:null})],details:[]}); ok(ver.ok&&ver.rows.length===2,'다시 읽기 일치',ver);
ok(!DOC.siVerify([ops[0]],{sis:[curS.sis[0]],details:[]}).ok,'다시 읽기 다름 → 확인 실패');
eq(DOC.siFieldState({col:'crcf9_po_vo',value:'VO NUMBER: XX',hasCur:false}).label,'未完成','상태: 번호 XX → 未完成');
eq([DOC.siFieldState({col:'crcf9_consignee',value:'A ',cur:'A',hasCur:true}).label,DOC.siFieldState({col:'crcf9_consignee',value:'B',cur:'A',hasCur:true}).label],['一致','要確認'],'상태: COMPASS 와 같음 / 다름');
eq([DOC.siFieldState({col:'crcf9_consignee',value:'A',hasCur:false,basis:{source:'LC(46A)',format_check:'CONTENT_UPDATED'}}).label,DOC.siFieldState({col:'crcf9_consignee',value:'A',hasCur:false,basis:{source_check:'出典不一致'}}).label],['根拠あり','要確認'],'상태: S/I 없음 → 근거 검사');
eq(DOC.siEdits({sinos:{1:{crcf9_consignee:'A',crcf9_notify_party:'N'}},details:[{crcf9_hs_code:'1'}]},{sinos:{1:{crcf9_consignee:'A ',crcf9_notify_party:'M'}},details:[{crcf9_hs_code:'2'}]}).map(e=>e.col),['crcf9_notify_party','crcf9_hs_code'],'고친 칸 (推薦 ↔ 最終)');

console.log((fail?'FAIL':'PASS')+' core — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
