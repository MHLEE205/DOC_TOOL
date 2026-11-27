/* v0.36 시험 (지시서 THOR_35 · 형님 N67 · N67-a · N68 · 34-Q3) — 가짜 데이터 · 가짜 번호 · 가짜 거래처 (example.test · si_fx 의 가짜 L/C) · 네트워크 없음 · 메일 보내기 0.
   A 단위: L1 인식 · 제외 / L2 ① 이름 ② L/C 번호 ③ 중身 · 0 · 여럿 / L3 이름 · Amend · 문지기 / L6 要確認 · 根拠 / Part ③ 기다림 / Part ④ LG
   B ★ 같은 판독: 브라우저 lcReadNow 의 AI 요청 = lc_read_one.mjs 의 공식 (같은 글자) · _READ 에 쓴 기록 = Node 의 tools/lc_read_lib.mjs buildRecord (ESM 그대로) 와 같은 글자 · 같은 내용 = 안 씀 · 다른 내용 = _old + eTag
   C 입구 → 계약 고르기 → 古紙/LC/2026 (새 파일 · 읽어 해시) → 읽기 → S/I 추천 (2 회 읽기 재사용 = AI 3 번 아님 1 번 더) · 실제 계약 COMPASS 쓰기 0 */
const fs=require('fs'),path=require('path'),cp=require('child_process'),nodeCrypto=require('crypto'),{pathToFileURL}=require('url');
const X=require('./fake'), FX=require('./si_fx'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), BF=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const clone=o=>JSON.parse(JSON.stringify(o)), FVK='@OData.Community.Display.V1.FormattedValue', sha=b=>nodeCrypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const G=(p,n)=>(p+'00000000').slice(0,8)+'-0000-4000-8000-'+String(n).padStart(12,'0');
const REPO=process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND'), V=DOC.V36;
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.36<\/title>/.test(HTML)&&(HTML.match(/version:'0\.36'/g)||[]).length===1&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.36 · 푸터');

console.log('L1 인식 (1 頁目の文字 · 11/23 の語) · 제외');
{ const K=(n,t)=>DOC.lcKind(n,t).kind;
  eq([K('ADVICE.pdf','ADVICE OF COMMERCIAL LETTER OF CREDIT TO: LEENEAR'),K('x.pdf','700 ISSUE OF A DOCUMENTARY CREDIT SEQUENCE OF TOTAL :27 1/1'),K('x.pdf','MT700 ...'),K('x.pdf','SEQUENCE OF TOTAL :27 1/1 DOCUMENTARY CREDIT NUMBER :20 TEST001 '),K('x.pdf','수입신용장 개설 M/T번호 700'),K('x.pdf','신용장 통지')],
    ['LC','LC','LC','LC','LC','LC'],'L/C — ADVICE OF … LETTER OF CREDIT · ISSUE OF A DOCUMENTARY CREDIT · MT700 · :20 + :27 · M/T번호 700 · 신용장');
  eq([K('x.pdf','Advice of Amendment NUMBER OF AMENDMENT :26E 1'),K('x.pdf','MT707 AMENDMENT TO A DOCUMENTARY CREDIT'),K('x.pdf','M/T번호 707')],['AMEND','AMEND','AMEND'],'Amend — Advice of Amendment · MT707 · :26E · M/T번호 707');
  eq([K('PO TEST001.pdf','ISSUE OF A DOCUMENTARY CREDIT'),K('x.pdf','SALES CONTRACT NO. LRS-2699ZZ1 ... :20 X :27 1/1'),K('LC_DRAFT.pdf','ISSUE OF A DOCUMENTARY CREDIT'),K('x.pdf','DRAFT L/C ISSUE OF A DOCUMENTARY CREDIT'),K('x.pdf','COMMERCIAL INVOICE NO. NTE2699-01 L/C NO. TEST001 DRAFTS AT SIGHT')],[null,null,null,null,null],'제외 — 이름 PO · 販売契約 · L/C 案 (이름 · 本文) · 보통 서류 (L/C NO. · DRAFTS AT)');
  ok(DOC.lcKind('x.pdf','ISSUE OF A DOCUMENTARY CREDIT :42C DRAFTS AT 90 DAYS').kind==='LC','「DRAFTS AT」 (42C) 는 L/C 案이 아님');
  eq([DOC.lcNoOf('DOCUMENTARY CREDIT NUMBER :20 ILC0009 DATE'),DOC.lcNoOf(':20: TESTLC-001/A\n'),DOC.lcAmendNoOf('NUMBER OF AMENDMENT :26E 2 DATE'),DOC.lcAmendNoOf(':26E: 10 ')],['ILC0009','TESTLC-001A','2',10].map((x,i)=>i===2?2:x),'L/C 번호 (:20) · Amend 번호 (:26E · 본문에서 · 순서 추정 0)'); }

console.log('L1 실자료 모양 (가짜 값) — 「20: DOCUMENTARY CREDIT NUMBER」 양식 · 은행의 L/C 案 · 첨부 이름');
{ const vt='MAIN REF NO: 0999IL2699001 MESSAGE TYPE: MT700 27: SEQUENCE OF TOTAL 1/1 20: DOCUMENTARY CREDIT NUMBER 0999IL2699001 31C: DATE OF ISSUE 261123 50: APPLICANT SAMPLE PAPER JOINT STOCK COMPANY ADD: SAMPLE ROAD, SAMPLE PROVINCE 59: BENEFICIARY LEENEAR 32B: CURRENCY CODE, AMOUNT USD107500,00 44C: LATEST DATE OF SHIPMENT 261231';
  eq([DOC.lcKind('LC x.pdf',vt).kind,DOC.lcNoOf(vt),DOC.lcFieldsOf(vt)],['LC','0999IL2699001',{applicant:'SAMPLE PAPER JOINT STOCK COMPANY',amount:'107500.00',d44:'261231'}],'「TAG: LABEL 値」 양식 — L/C 번호 · 신청인 (이름만 · 주소 앞) · 금액 · 44C');
  eq(DOC.lcKind('MT700 x.pdf','** This draft is provided solely for reference and shall not be construed as a commitment ** MT ID : DRAFT Output message type : MT700 ISSUE OF A DOCUMENTARY CREDIT').kind,null,'은행의 L/C 案 (MT ID : DRAFT · This draft is provided…) = 제외');
  eq(['TEST001 BLCOPYINVOICE.pdf','HAPAG-HLCUTEST001.pdf','IP-LCXSD99 TEST.pdf','LC 0999IL2699001 - SAMPLE.pdf','MT700 SAMPLE.pdf','LRS-2699ZZ1(01-LC2026).pdf','ADVICE OF L/C.pdf','TEST_AMEND1.pdf'].map(n=>V.ATT_NAME.test(n)),[false,false,false,true,true,true,true,true],'메일 첨부 이름 — 「LC」 앞뒤가 영문자면 안 읽음 (BLCOPY · HLCU · IP-LCX)');
  const C=[{no:'LRS-2699ZZ1', pay:'LC', buyer:['SAMPLEA','SAMPLEA TRADING ONE MEMBER COMPANY LTD'], lines:[{price:213,qty:1000}], lcNos:[], hasLc:false},{no:'LRS-2699ZZ2', pay:'LC', buyer:['OTHER','OTHER HAI PAPER'], lines:[{price:200,qty:1000}], lcNos:[], hasLc:false}];
  eq(DOC.lcCands({name:'x.pdf', lcNo:'', applicant:'SAMPLEA TRADING ONE MEMBER CO LTD', text:'1000 MT USD 213/MT HAI PHONG'},{contracts:C}).cands.map(x=>x.no),['LRS-2699ZZ1'],'바이어 = 2 語 이상 또는 5 文字 이상 — 주소의 짧은 낱말 (HAI) 1 개로는 안 맞춤'); }

console.log('L3 이름 · 문지기 (古紙/LC/2026 새 파일만 · _READ = 그 계약만)');
{ eq([DOC.lcFileName('lrs-2699zz1','ILC0009',0),DOC.lcFileName('LRS-2699ZZ1','ILC0009',2)],['LRS-2699ZZ1_ILC0009.pdf','LRS-2699ZZ1_ILC0009_AMEND2.pdf'],'{契約}_{L/C番号}.pdf · _AMEND{n}');
  const g=(p,o)=>{ try{ return DOC.guardOut(p,o); }catch(e){ return e.message; } };
  eq([g(V.LC_DIR+'/LRS-2699ZZ1_ILC0009.pdf',{lc:'pdf',contract:'LRS-2699ZZ1'}),g(V.READ_DIR+'/LRS-2699ZZ1.json',{lc:'read',contract:'LRS-2699ZZ1'}),g(V.READ_DIR+'/_text/LRS-2699ZZ1.txt',{lc:'read',contract:'LRS-2699ZZ1'}),g(V.READ_DIR+'/_index.json',{lc:'read',contract:'LRS-2699ZZ1'}),g(V.READ_DIR+'/_old/LRS-2699ZZ1_v2.json',{lc:'read',contract:'LRS-2699ZZ1'})],[true,true,true,true,true],'문지기 OK — PDF · json · _text · _index · _old');
  ok([g(V.LC_DIR+'/LRS-2699ZZ2_ILC0009.pdf',{lc:'pdf',contract:'LRS-2699ZZ1'}),g(V.LC_DIR+'/sub/LRS-2699ZZ1_ILC0009.pdf',{lc:'pdf',contract:'LRS-2699ZZ1'}),g('古紙/LC/2025/LRS-2699ZZ1_ILC0009.pdf',{lc:'pdf',contract:'LRS-2699ZZ1'}),g(V.READ_DIR+'/LRS-2699ZZ2.json',{lc:'read',contract:'LRS-2699ZZ1'}),g('古紙/-. 古紙書類/★LC/LRS-2699ZZ1_ILC0009.pdf',{lc:'pdf',contract:'LRS-2699ZZ1'}),g(V.LC_DIR+'/LRS-2699ZZ1_ILC0009.pdf',{lc:'read',contract:'LRS-2699ZZ1'})].every(x=>/書き込み禁止/.test(x)),'문지기 막음 — 다른 계약 · 하위 폴더 · 2025 · 다른 계약 _READ · ★LC · 종류 다름');
  ok(/const pt=!!\(save&&\(save\.portal\|\|\(save\.lc==='read'&&save\.ifMatch\)\)\);/.test(HTML),'_READ 덮어쓰기 = eTag 조건만 (없으면 새 파일만)'); }

console.log('L2 계약 찾기 ① 이름 ② L/C 번호 ③ 中身 (N67-a) · 0 · 여럿');
{ const C=[{no:'LRS-2699ZZ1', pay:'LC', buyer:['DELTA','DELTA PAPER CORPORATION'], latest:'2026-12-15', lines:[{price:185,qty:500}], lcNos:[], hasLc:false},
    {no:'LRS-2699ZZ2', pay:'LC', buyer:['DELTA','DELTA PAPER CORPORATION'], latest:'2026-12-31', lines:[{price:190,qty:300}], lcNos:['TESTLC77 DATED ON NOV 01, 2026'], hasLc:true},
    {no:'LRS-2699YY1', pay:'LC', buyer:['EPSILON','EPSILON MILL CO'], latest:'2026-12-15', lines:[{price:185,qty:500}], lcNos:[], hasLc:false},
    {no:'LRS-2699TT1', pay:'TT', buyer:['DELTA','DELTA PAPER CORPORATION'], latest:'2026-12-15', lines:[{price:185,qty:500}], lcNos:[], hasLc:false}];
  const ctx={contracts:C, readIdx:[{contract:'LRS-2699XX1', lc_no:'TESTLC55'}], lcFiles:['LRS-2699WW1_TESTLC66.pdf']};
  const lc=o=>Object.assign({name:'advice.pdf', lcNo:'TESTLC99', applicant:'DELTA PAPER CORPORATION', amount:'92,500.00', latest:'2026-12-15', text:'45A WASTE PAPER OCC 500 MT USD 185.00/MT'},o);
  const c=o=>{ const r=DOC.lcCands(lc(o),ctx); return [r.how, r.cands.map(x=>x.no)]; };
  eq(c({name:'LRS-2699ZZ1 LC.pdf'}),['name',['LRS-2699ZZ1']],'① 파일 이름 LRS-…');
  eq(c({lcNo:'TESTLC77'}),['lcno',['LRS-2699ZZ2']],'② L/C 번호 → COMPASS S/I cr49f_lc_no (앞부분)'); eq(c({lcNo:'TESTLC55'}),['lcno',['LRS-2699XX1']],'② → _READ _index'); eq(c({lcNo:'TESTLC66'}),['lcno',['LRS-2699WW1']],'② → LC/2026 이름');
  eq(c({}),['content',['LRS-2699ZZ1']],'③ 中身 — Applicant ↔ 바이어 · 단가 · 수량 · 금액 → 하나 (L/C 이미 있는 ZZ2 · 다른 바이어 YY1 · T/T 제외)');
  const r3=DOC.lcCands(lc(),ctx).cands[0]; ok(r3.hit.some(h=>/バイヤー/.test(h))&&r3.hit.indexOf('単価')>=0&&r3.hit.indexOf('数量')>=0&&r3.hit.indexOf('金額')>=0&&r3.hit.indexOf('最終船積日')>=0,'③ 맞은 칸 (バイヤー · 単価 · 数量 · 金額 · 最終船積日) 표시',r3);
  eq(c({applicant:'UNKNOWN TRADING'}),['',[]],'③ 0 → 「どの契約？」');
  const C2=C.concat([{no:'LRS-2699ZZ3', pay:'LC', buyer:['DELTA'], latest:'2026-12-15', lines:[{price:185,qty:500}], lcNos:[], hasLc:false}]); eq(DOC.lcCands(lc(),{contracts:C2}).cands.map(x=>x.no),['LRS-2699ZZ1','LRS-2699ZZ3'],'③ 여럿 → 둘 다 후보 (물음)');
  eq(c({amend:1, lcNo:'NOPE1234'}),['',[]],'Amend = L/C 번호로 못 찾으면 中身로 정하지 않음 (물음)'); }

console.log('L6 정확도 — 2 회 읽기 다름 = 要確認 · 根拠 없는 칸 一致 0 · 前回 S/I 다름 = 黄');
{ const S=o=>DOC.siFieldState(Object.assign({col:'crcf9_consignee', value:'TO ORDER OF SAMPLE BANK', cur:'', hasCur:false, basis:{source:'LC(46A)'}, lc:true},o));
  eq(S({}).s,'match','근거 있음 = 一致 (根拠あり)'); eq([S({basis:{source:''}}).s,S({basis:{source:''}}).why],['check',V.NOSRC],'L/C 계약 · 근거 없음 = 要確認');
  eq(S({basis:{source:'LC',r2diff:['bl_consignee']}}).why,V.R2DIFF.replace('{f}','bl_consignee'),'2 회 판독 다름 = 要確認 (COMPASS 와 같아도)');
  ok(S({basis:{source:'LC',r2diff:['bl_consignee']}, hasCur:true, cur:'TO ORDER OF SAMPLE BANK'}).s==='check','2 회 판독 다름 + COMPASS 같음 = 그래도 要確認');
  eq(S({basis:{source:'LC',lcWarn:'前回 S/I（LRS-2699ZZ0）と違う'}}).s,'check','前回 S/I 와 다름 = 黄 (要確認)'); eq(S({basis:{source:'LC',lcWarn:'x'}, hasCur:true, cur:'TO ORDER OF SAMPLE BANK'}).s,'match','前回 다름이어도 COMPASS 에 같은 값 = 一致');
  eq(S({basis:{source:''}, lc:false}).s,'match','T/T (L/C 아님) 은 그대로');
  const rec={fields:{bl_consignee:{value:null, loc:'46A-2', quote:'B/L MADE OUT TO ORDER OF SAMPLE BANK'}, lc_no:{value:'ILC0009', loc:':20', quote:':20 ILC0009'}}, checks:[{field:'bl_consignee'}]};
  eq(DOC.lcBasisOf(rec,'crcf9_consignee'),{quote:[{field:'bl_consignee',loc:'46A-2',quote:'B/L MADE OUT TO ORDER OF SAMPLE BANK'}],r2diff:['bl_consignee']},'S/I 칸 ↔ L/C 원문 근거 (칸 · 인용) · 2 회 다름');
  eq(DOC.lcBasisOf(rec,'crcf9_tel'),{quote:[],r2diff:[]},'L/C 와 관계없는 칸 = 근거 없음 (前回 S/I 등)'); }

console.log('Part ④ LG 이름 (34-Q3)');
eq([DOC.lgName('TST2699-01',[]),DOC.lgName('TST2699-01',['TST2699-01_LG.xlsx']),DOC.lgName('TST2699-01',['TST2699-01_LG.xlsx','TST2699-01_LG REV.xlsx'])],['TST2699-01_LG.xlsx','TST2699-01_LG_REV.xlsx','TST2699-01_LG_REV2.xlsx'],'_LG_REV · 옛 _LG REV 를 같은 이름으로 셈');
ok(DOC.NAME.LG.test('TST2699-01_LG_REV2.xlsx')&&DOC.NAME.LG.test('TST2699-01_LG REV2.xlsx'),'읽기 = 둘 다');

console.log('Part ② 44B ↔ Place of Delivery (N69 · bl_bench v0.9)');
{ ok(/const BL_ENGINE = \{commit:'2324aea35eba5c02454e4fb9a686f715db8be010'.*ver:'0\.9'\}/.test(HTML),'B/L 엔진 = bl_bench v0.9 (2324aea)');
  const B=ENG.blEngine(HTML); ok(B.VERSION==='0.9'&&typeof B.judgeInvoice==='function','bl-core v0.9 (sha256 일치)');
  const res={iv:'NTE2699-01',A:[],B:[{item:V.FD44B_ITEM,result:'DIFF',draft:'(空欄)',lc_quote:'HO CHI MINH OR CAT LAI PORT, VIETNAM',si:'S/I CAT LAI PORT, VIETNAM',note:'44B 最終仕向地がない（Place of Delivery 空欄）'}],CP:[]};
  const m=DOC.blMailDraft(res,'fix',{iv:'NTE2699-01',blNo:'TESTBL1'});
  ok(/■ Place of Delivery \(L\/C 44B 最終仕向地\)\n（現在）\(空欄\)\n（訂正後）HO CHI MINH OR CAT LAI PORT, VIETNAM\nPlace of Delivery に CAT LAI PORT, VIETNAM を記載してください\n/.test(m.body)&&m.blocks===1,'선사 訂正依頼 下書き — 44B 欄 + 「Place of Delivery に {S/I 値} を記載してください」',m.body);
  const r2=JSON.parse(JSON.stringify(res)); r2.B[0].si='S/I 空欄'; ok(/Place of Delivery に HO CHI MINH OR CAT LAI PORT, VIETNAM を記載してください/.test(DOC.blMailDraft(r2,'fix',{iv:'NTE2699-01'}).body),'S/I 빈칸 = 44B 값');
  const o=DOC.blMailDraft({iv:'NTE2699-01',A:[{class:'DIFF',field:'Vessel/Voyage',draft:'A',si:'B'}],B:[],CP:[]},'fix',{iv:'NTE2699-01'}); ok(!/Place of Delivery に/.test(o.body),'44B 없음 = 下書き 그대로 (그 줄 0)');
  const T=DOC.todoExtra?DOC.todoExtra({iv:'NTE2699-01', ct:'LRS-2699ZZ1', bl44b:'44B 最終仕向地がない（Place of Delivery 空欄）'}, Date.now()):null;
  ok(!T||T.some(r=>r.what===V.FD44B_TODO&&/Place of Delivery 空欄/.test(r.why)&&r.red),'今日やること — 「B/L Draft 訂正依頼 — Place of Delivery（L/C 44B 最終仕向地）」 (빨강)',T&&T.map(r=>r.what)); }

console.log('Part ③ 자동 갱신 15 분 (기다림)');
ok(V.REFRESH_MS===15*60e3&&/function arBlocked\(\)/.test(HTML)&&/async function autoRefresh\(force\)/.test(HTML)&&/setInterval\(\(\)=>\{ renderToday\(\); autoRefresh\(false\); \}, 60e3\)/.test(HTML),'15 분 · 1 분마다 확인 · 창으로 돌아올 때');
ok(/if\(m&&!m\.hidden\) return 'modal'/.test(HTML)&&/return 'input'/.test(HTML)&&/S\.siWriting\|\|Object\.values\(S\.siBusy/.test(HTML)&&/async function siWrite\(id\)\{ S\.siWriting=true;/.test(HTML),'입력 중 · 확인 창 · S/I 등록 중 = 기다림');

/* ══════════ B · C — 가짜 세계 (si.js 와 같은 a1_bench 가짜 L/C · 가짜 Claude) ══════════ */
const A1M=HTML.match(/const A1_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})'/), LCM=HTML.match(/const LC_LIB = \{commit:'([0-9a-f]{40})', path:'([^']+)', sha256:'([0-9a-f]{64})'/);
const show=(c,f)=>cp.execFileSync('git',['-C',REPO,'show',c+':'+f],{maxBuffer:1<<26});
const ENGB=show(A1M[1],'a1_bench.html'), LIBB=show(LCM[1],LCM[2]); ok(sha(LIBB)===LCM[3],'lc_read_lib.mjs 원문 sha256 = 도구에 적은 값 (CONTRACT_SEND @'+LCM[1].slice(0,7)+')');
const ENGT=ENGB.toString('utf8'), A1C=new Function(ENGT.match(/<script id="a1-core">([\s\S]*?)<\/script>/)[1]+';return A1C;')(), R2SYS=ENGT.match(/const R2_EXTRACT_SYSTEM=`([\s\S]*?)`;/)[1];
const LIBF=path.join(require('os').tmpdir(),'dt_v36_lc_read_lib_'+process.pid+'.mjs'); fs.writeFileSync(LIBF,LIBB.toString('utf8').replace(/^import fs from 'node:fs';$/m,"import fs from 'node:fs';"));
const LIB=await import(pathToFileURL(LIBF).href); const ACLN=ENG.engine(HTML);
const mkWorld=()=>{ const W=X.world(); W.contracts=[]; W.buyers=[]; W.sis=[];
  const cid={}, sdid={}, item=G('17e0',1); FX.NOS.forEach((no,i)=>{ cid[no]=G('5c00',i+1); sdid[no]=G('5d00',i+1); }); const bid={'b-sg':G('b500',1),'b-ca':G('b500',2)};
  FX.BUYERS.forEach(b=>W.buyers.push(Object.assign({},b,{cr49f_buyerid:bid[b.cr49f_buyerid],['crcf9_country'+FVK]:b.crcf9_country})));
  FX.SC.forEach(c=>W.contracts.push(Object.assign({},c,{cr49f_sale_contractid:cid[c.cr49f_sale_contract_no],_cr49f_buyer_id_value:bid[c._cr49f_buyer_id_value],['cr49f_pay_cls'+FVK]:'LC',_cr49f_pod1_value:null,cr49f_sale_contract_date:W.T})));
  W.sale=FX.NOS.map(no=>({cr49f_sale_detailid:sdid[no],_cr49f_sale_contract_id_value:cid[no],cr49f_price:185,cr49f_quantity:500,_cr49f_item_id_value:item,['_cr49f_item_id_value'+FVK]:'13'})); W.items=[{cr49f_itemid:item,cr49f_item:'OCC'}];
  let k=0; FX.NOS.filter(no=>no!=='LRS-2605SG1').forEach(no=>FX.siOf(no).forEach(h=>{ W.sis.push(Object.assign({},h,{cr49f_s_iid:G('51'+String(h.crcf9_sino),++k),_cr49f_sale_contract_id_value:cid[no]})); }));
  W.lcFiles=FX.NOS.map(no=>({id:'lc'+no,name:no+'_'+FX.LCS[no].lcNo+'.pdf',size:1000,file:{}})); W.sp[V.LC_DIR]=W.lcFiles; W.sp[V.READ_DIR]=[];
  W.aiBodies=[]; W.aiReplies=[]; W.lcPut={}; W.cid=cid; return W; };
const wrap=(w,W)=>{ const inner=w.fetch, R0=(st,body)=>({ok:st>=200&&st<300,status:st,statusText:String(st),headers:{get:()=>null},json:async()=>clone(body),text:async()=>JSON.stringify(body)});
  w.fetch=async(url,init)=>{ url=String(url); init=init||{}; const method=(init.method||'GET').toUpperCase(), u=decodeURIComponent(url);
    if(url.indexOf('https://api.anthropic.com/')===0){ const b=JSON.parse(init.body); W.aiBodies.push(b); const rep=FX.claudeReply(b); W.aiReplies.push(rep); return FX.sse(JSON.stringify(rep)); }
    if(url.indexOf('https://raw.githubusercontent.com/')===0&&/a1_bench\.html$/.test(url)) return {ok:true,status:200,arrayBuffer:async()=>ENGB.buffer.slice(ENGB.byteOffset,ENGB.byteOffset+ENGB.length)};
    if(url.indexOf('https://raw.githubusercontent.com/')===0&&/lc_read_lib\.mjs$/.test(url)) return {ok:true,status:200,arrayBuffer:async()=>LIBB.buffer.slice(LIBB.byteOffset,LIBB.byteOffset+LIBB.length)};
    if(url.indexOf(X.DV)===0&&method==='GET'){ const p=u.slice(X.DV.length); let m;
      if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\/Attributes/))) return R0(200,{value:(m[1]==='cr49f_s_i'?DOC.SI_HEAD_COLS.concat(['crcf9_sino','cr49f_s_iid']):['crcf9_productname','crcf9_hs_code','crcf9_s_i_detailid','crcf9_price','crcf9_weight']).map(x=>({LogicalName:x}))});
      if(/^EntityDefinitions\(LogicalName='(\w+)'\)\/ManyToOneRelationships/.test(p)) return R0(200,{value:[]});
      if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\?\$select=EntitySetName/))) return R0(200,{EntitySetName:{cr49f_s_i:'cr49f_s_is',crcf9_s_i_detail:'crcf9_s_i_details'}[m[1]]||m[1]+'s'});
      if(/^cr49f_sale_contracts\?\$filter=startswith/.test(p)) return R0(200,{value:clone(W.contracts.filter(c=>/^LRS-2[56]/.test(c.cr49f_sale_contract_no)))});
      if(/^cr49f_buyers\?\$select=/.test(p)) return R0(200,{value:clone(W.buyers)});
      if(/^crcf9_s_i_details\?\$filter=_crcf9_s_i_id_value eq/.test(p)) return R0(200,{value:[]});
      if((m=p.match(/^cr49f_sale_details\?\$filter=_cr49f_sale_contract_id_value eq ([\w\-]+)/))) return R0(200,{value:clone(W.sale.filter(d=>d._cr49f_sale_contract_id_value===m[1]))}); }
    if(url.indexOf(X.GR)===0&&/LC\/2026:\/children/.test(u)) return R0(200,{value:clone(W.sp[V.LC_DIR])});
    { const m=u.match(/\/root:\/(古紙\/LC\/2026\/[^:]+):\/content/); if(m){ if(method==='PUT'){ W.writes.push({method,url,body:init.body}); if(W.lcPut[m[1]]) return R0(409,{error:{code:'nameAlreadyExists',message:'already exists'}}); const b=Buffer.from(await init.body.arrayBuffer()); W.lcPut[m[1]]=b; const nid='n'+Object.keys(W.lcPut).length; W.itemBytes=W.itemBytes||{}; W.itemBytes[nid]=b; W.sp[V.LC_DIR].push({id:nid,name:m[1].split('/').pop(),size:b.length,file:{}}); return R0(201,{size:b.length}); }
      const b=W.lcPut[m[1]]; return b?{ok:true,status:200,headers:{get:()=>null},arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}:R0(404,{}); } }
    return inner(url,init); }; };
const prep=async(W,ls)=>{ const w=await X.page(W,{html:HFILE, first:true, email:'boss@example.test', ls:Object.assign({doc_tool_who:'all', leenai_apikey_v1:'TEST-KEY'},ls||{}), init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }});
  wrap(w,W); w.TextDecoder=TextDecoder; w.TextEncoder=TextEncoder; w.__lc=FX.lcText;
  w.LEENAI.master.get=async n=>clone(n==='staff'?W.staff:n==='doc_staff'?W.docStaff:n==='si_rule'?[]:n==='hscode'?[{item:'OCC',hs:'4707.10'}]:{AT_SIGHT:'AT SIGHT'});
  await X.until(()=>w.eval('S.doneMsg')!=='',30000).catch(()=>{}); await w.eval('loadA1Engine()');
  w.eval("A1X._testSetReadLc(async function(name){ var no=name.split('_')[0]; var t=window.__lc(no); return {name:name,file:null,size:t.length,restore:{ok:true,text:t,textLen:t.length},text:t,image:false,zeros:0,failed:0,pages:1}; })"); return w; };

console.log('B ★ 같은 판독 — 브라우저 (書類ツール) ↔ lc_read_one.mjs (CONTRACT_SEND)');
{ const W=mkWorld(), w=await prep(W), no='LRS-2604SG1', name=no+'_'+FX.LCS[no].lcNo+'.pdf', text=FX.lcText(no), w0=W.writes.length;
  const R1=await w.eval("lcReadNow('"+no+"')");
  /* lc_read_one.mjs readOne 의 요청 (같은 글자 · 같은 순서) */
  const lcp=A1C.analyzeLcTexts([{name,text}],[]), body={model:'claude-opus-5-5',max_tokens:32000,system:R2SYS,thinking:{type:'adaptive'},output_config:{effort:'high'},messages:[{role:'user',content:[{type:'text',text:A1C.r2ExtractPrompt({view:lcp.view, files:[{text}], amends:[]}),cache_control:{type:'ephemeral'}}]}]};
  const sent=W.aiBodies.filter(b=>/判読担当/.test(String(b.system)));
  ok(sent.length===2&&sent.every(b=>{ const x=clone(b); delete x.stream; return JSON.stringify(x)===JSON.stringify(body); }),'AI 요청 2 번 = lc_read_one.mjs 와 문자 단위 같음 (모델 claude-opus-5-5 · high · 32000 · 같은 system · 같은 질문 · 같은 캐시 표시)',sent.length);
  ok(sent.every(b=>b.stream===true),'스트리밍 (a1_bench · lc_read_one 와 같음)');
  /* lc_read_one.mjs 의 기록 = lc_read_lib.mjs buildRecord (ESM 그대로 import) */
  const j=W.aiReplies.filter((r,i)=>/判読担当/.test(String(W.aiBodies[i].system))), lcText='﻿'+lcp.view+'\n\n'+'='.repeat(60)+'\n'+'=== '+name+' ===\n'+text;
  const ws=W.writes.slice(w0).map(x=>({u:decodeURIComponent(x.url), b:x.body})), put=p=>ws.find(x=>x.u.indexOf('/root:/'+V.READ_DIR+'/'+p+':/content')>=0);
  const wrote=put(no+'.json'); const got=wrote&&JSON.parse(typeof wrote.b==='string'?wrote.b:await wrote.b.text());
  const r2={no, image:false, retried:[false,false], extract:[j[0],j[1]], checks:A1C.r2Check(j[0],j[1],text,false)};
  const want=got&&LIB.buildRecord(r2, lcText, {A1:A1C, ACL:ACLN, run:got.source.run, now:got.created_at}); if(want) want.source.lc_text=V.READ_DIR+'/_text/'+no+'.txt';
  ok(got&&got.schema==='lc_read/1'&&JSON.stringify(got,null,1)===JSON.stringify(want,null,1),'_READ/{契約}.json = Node lc_read_lib buildRecord 와 문자 단위 같음 (lc_read/1)',got&&{got:Object.keys(got),v:got.version});
  ok(/^書類ツール v0\.36 \d{4}-\d{2}-\d{2} \(claude-opus-5-5 · high · 2 回\)$/.test(got&&got.source.run||''),'source.run = 書類ツール v0.36 (모델 · high · 2 回)',got&&got.source.run);
  const md=put(no+'.md'), tx=put('_text/'+no+'.txt'), ix=put('_index.json'); const bt=async x=>typeof x.b==='string'?x.b:Buffer.from(await x.b.arrayBuffer()).toString('utf8');   // Blob.text() は BOM を落とすので バイトで
  const mdT=md&&await bt(md), txT=tx&&await bt(tx), ixT=ix&&await bt(ix);
  ok(mdT===LIB.renderMd(got)&&txT===lcText&&ixT&&JSON.parse(ixT).items.some(r=>r.contract===no),'.md = renderMd · _text = lc_text · _index 한 줄',{md:!!md,mdSame:mdT===LIB.renderMd(got),tx:!!tx,txSame:txT===lcText,txLen:[txT&&txT.length,lcText.length],ix:!!ix});
  ok(ws.filter(x=>/\/root:\/古紙\/LC\/_READ\//.test(x.u)).every(x=>/conflictBehavior=fail/.test(x.u)),'처음 = 새 파일만 (conflictBehavior=fail)');
  ok(ws.filter(x=>x.u.indexOf('/root:/')>=0&&!/古紙\/LC\/_READ\/|D-00\/doc_tool\/ai_cost\//.test(x.u)).length===0,'쓰기 = _READ (그 계약) · 비용 기록 만',ws.map(x=>x.u.replace(/^.*root:\//,'')).slice(0,8));
  ok(R1.rec.version===1&&!R1.same&&R1.pre&&R1.pre.no===no,'결과 — 판 1 · pre (S/I 추천에 쓸 2 회 읽기)');
  /* 같은 내용 다시 = 쓰지 않음 · 다른 내용 = _old/{契約}_v{n} + eTag 덮어쓰기 */
  W.content[V.READ_DIR+'/'+no+'.json']=JSON.stringify(got,null,1); W.etag=W.etag||{}; W.etag[V.READ_DIR+'/'+no+'.json']='"e7"';
  const w1=W.writes.length; const R2=await w.eval("lcReadNow('"+no+"')"); const ws2=W.writes.slice(w1).map(x=>decodeURIComponent(x.url)).filter(u=>/_READ/.test(u));
  ok(R2.same&&ws2.length===0,'같은 내용 = _READ 안 씀 (판 그대로)',ws2);
  const old=clone(got); old.lc_no='TESTOLD'; old.fields.lc_no.value='TESTOLD'; W.content[V.READ_DIR+'/'+no+'.json']=JSON.stringify(old,null,1);
  W.content[V.READ_DIR+'/'+no+'.md']='old'; W.content[V.READ_DIR+'/_text/'+no+'.txt']='old'; W.content[V.READ_DIR+'/_index.json']=JSON.stringify({schema:'lc_read_index/1',items:[{contract:no,version:1}]});
  ['.md','_text','_index'].forEach(()=>{}); W.etag[V.READ_DIR+'/'+no+'.md']='"m1"'; W.etag[V.READ_DIR+'/_text/'+no+'.txt']='"t1"'; W.etag[V.READ_DIR+'/_index.json']='"i1"';
  const w2=W.writes.length; const R3=await w.eval("lcReadNow('"+no+"')"); const ws3=W.writes.slice(w2).map(x=>({u:decodeURIComponent(x.url)})).filter(x=>/_READ/.test(x.u));
  ok(!R3.same&&R3.rec.version===2&&ws3.some(x=>/_READ\/_old\/LRS-2604SG1_v1\.json:\/content\?@microsoft\.graph\.conflictBehavior=fail$/.test(x.u)),'다른 내용 = 이전 판 _old/{契約}_v1.json (새 파일) · 판 2',ws3.map(x=>x.u.replace(/^.*root:\//,'')));
  ok(JSON.parse(W.content[V.READ_DIR+'/'+no+'.json']).version===2&&W.puts412===undefined,'덮어쓰기 = 읽은 eTag 로만 (If-Match) · 다시 읽으면 판 2');
  w.close(); }

console.log('C 입구 → 계약 고르기 → 古紙/LC/2026 → 읽기 → S/I 추천 (AI 재사용)');
{ const W=mkWorld(), no='LRS-2605SG1', lcNo='ILC0099', text=FX.lcText(no).replace(FX.LCS[no].lcNo,lcNo);
  const LCPDF=await BF.mkPdf([text.split('\n').map((t,i)=>({x:30,y:40+i*14,t:t.trim()}))]);
  const w=await prep(W), w0=W.writes.length, dv0=W.writes.filter(x=>x.url.indexOf(X.DV)===0).length;
  w.eval("A1X._testSetReadLc(async function(name){ var no=name.split('_')[0]; var t=name.indexOf('"+lcNo+"')>=0?"+JSON.stringify(text)+":window.__lc(no); return {name:name,file:null,size:t.length,restore:{ok:true,text:t,textLen:t.length},text:t,image:false,zeros:0,failed:0,pages:1}; })");
  const file=(name,b)=>({name, arrayBuffer:async()=>{ const u=new Uint8Array(b); return u.buffer.slice(u.byteOffset,u.byteOffset+u.length); }});
  await w.saveDrop([file('ADVICE OF LC.pdf',LCPDF)]); await X.until(()=>{ const r=w.eval('SAVE.rows'); return r.length&&r[0].res&&r[0].res!==''; },30000).catch(()=>{});
  const r=w.eval('SAVE.rows')[0];
  ok(r&&r.kind&&r.kind.key==='LC'&&r.lc.lcNo===lcNo,'입구 — 1 頁目の文字 = L/C · L/C 번호 :20',r&&{kind:r.kind,lc:r.lc&&{lcNo:r.lc.lcNo}});
  ok(r&&r.res===V.ASK&&/data-svct="/.test(w.document.getElementById('dtInbox').innerHTML)&&r.ct==='','모든 L/C 계약에 L/C 가 있음 → 「どの契約？」 + 고르기 (자동 0)',r&&{res:r.res,msg:r.msg,c:r.cands});
  const sel=w.document.querySelector('#dtInbox [data-svct]'); sel.value=no; sel.onchange(); await X.until(()=>w.eval('SAVE.rows')[0].res==='新規',20000).catch(()=>{});
  const r2=w.eval('SAVE.rows')[0]; ok(r2.res==='新規'&&r2.target===no+'_'+lcNo+'.pdf'&&r2.ctHow==='担当が選んだ','고른 계약 → 新規 · {契約}_{L/C番号}.pdf',{res:r2.res,t:r2.target,msg:r2.msg});
  const lg=W.writes.slice(w0).filter(x=>/doc_tool\/save_log\//.test(decodeURIComponent(x.url))), lgB=lg.length?JSON.parse(typeof lg[lg.length-1].body==='string'?lg[lg.length-1].body:await lg[lg.length-1].body.text()):{}; ok(lgB.result==='契約を選んだ'&&lgB.contract===no,'고른 것 = 기록 (save_log · contract)',lgB);
  ok(!W.writes.slice(w0).some(x=>/LC\/2026/.test(decodeURIComponent(x.url))),'고르기까지 = L/C 실파일 쓰기 0');
  const ai0=W.aiBodies.length; await w.eval('lcSaveDo(SAVE.rows[0])'); await X.until(()=>/ほか \d+ 項目|推薦できません/.test((w.document.getElementById('dtCtBody')||{}).textContent||''),60000).catch(()=>{});
  const lcw=W.writes.slice(w0).map(x=>decodeURIComponent(x.url)).filter(u=>/LC\/2026/.test(u));
  ok(lcw.length===1&&lcw[0].indexOf('/root:/'+V.LC_DIR+'/'+no+'_'+lcNo+'.pdf:/content?@microsoft.graph.conflictBehavior=fail')>0&&sha(W.lcPut[V.LC_DIR+'/'+no+'_'+lcNo+'.pdf'])===sha(LCPDF),'古紙/LC/2026/{契約}_{L/C番号}.pdf 새 파일 1 개 · 같은 바이트',lcw);
  ok(/読み直し = 同じ/.test(w.eval('SAVE.rows')[0].msg),'다시 받아 해시 대조 = 같음',w.eval('SAVE.rows')[0].msg);
  const kinds=W.aiBodies.slice(ai0).map(b=>/判読担当/.test(String(b.system))?'x':/ベテラン/.test(String(b.system))?'a':'o');
  ok(kinds.filter(k=>k==='x').length===2&&kinds.filter(k=>k==='a').length===1,'AI = L/C 2 회 읽기 (_READ) + S/I 조립 1 — S/I 추천은 그 2 회 읽기를 다시 쓰지 않음',kinds);
  ok(W.writes.slice(w0).some(x=>decodeURIComponent(x.url).indexOf('/root:/'+V.READ_DIR+'/'+no+'.json')>=0),'_READ/{契約}.json 갱신');
  const body=(w.document.getElementById('dtCtBody')||{}).textContent||''; ok(/ほか \d+ 項目/.test(body)&&w.eval('S.siRec[W_ID]'.replace('W_ID',"'"+W.cid[no]+"'"))&&w.eval("S.siRec['"+W.cid[no]+"'].lcRead")!==undefined,'그 자리에서 S/I 탭 · 推薦 결과 (L6 자료 lcRead)',body.slice(0,200));
  ok(W.writes.filter(x=>x.url.indexOf(X.DV)===0).length===dv0,'COMPASS 쓰기 0 (「確認して登録」 은 담당이 누를 때만)');
  ok(!W.writes.some(x=>/sendMail|\/send$|createReply/.test(x.url)),'메일 보내기 0');
  /* 같은 L/C 를 또 놓음 = 重複 (저장 안 함) */
  await w.saveDrop([file('ADVICE2.pdf',LCPDF)]); await X.until(()=>w.eval('SAVE.rows').length>=2&&w.eval('SAVE.rows')[1].res,20000).catch(()=>{});
  const r3=w.eval('SAVE.rows')[1]; ok(r3&&(r3.res==='重複'||r3.res===V.ASK),'같은 L/C 다시 → 重複 (또는 계약 고르기 전)',r3&&{res:r3.res,msg:r3.msg});
  w.close(); }
try{ fs.unlinkSync(LIBF); }catch(e){}
console.log((fail?'FAIL':'PASS')+' v36 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v36 예외',e&&e.stack||e); process.exit(1); });
