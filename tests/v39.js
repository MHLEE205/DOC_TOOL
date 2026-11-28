/* v0.39 시험 (지시서 THOR_39 · N85 ~ N88) — B/L 「필수 문구 체크리스트」 (試験) · S/I Consignee = 46A — 가짜 L/C · 가짜 거래처 (example.test) · 네트워크 없음 · 쓰기 0. node v39.js [html]
   C1 ~ C5 만들기 · 느슨한 찾기 (끼어든 글자 · 줄바꿈 · 「**」 이어짐 · 붙은 낱말) · 엄격 (번호) · FL ≠ FLOOR · 금지 문구 · 위치 (칸) · AI 인용 기계 확인 · S/I 먼저 (N88 ②) · Part ⑤ · 화면 = 관리자만 · 쓰기 함수 v0.38 과 같음 */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V39;

console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.39<\/title>/.test(HTML)&&(HTML.match(/version:'0\.39'/g)||[]).length===1&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.39 · 푸터');

/* 가짜 L/C (lc_read/1 모양) · 가짜 COMPASS */
const ADDR='SAMPLE BUYER CO., 9TH FLOOR, TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY 12345, TEL: 11-22-333-4444 FAX: 11-22-333-5555, TAX ID NUMBER 0001 0002 0003 0004';
const LC={lc_no:'TESTLC0001', issue_date:'2026-11-06', latest_shipment:'2027-01-31', pol:{text:'JAPAN PORT(S)'}, pod:{text:'TEST PORT', list:['TEST PORT']},
  bl:{consignee_text:ADDR, consignee_bank:null, notify_text:ADDR, freight:'PREPAID'},
  docs_46A:[{doc_type:'B/L', loc:'46A-3', set_fraction:'2/3', quote:"3. 2/3 SETS OF ORIGINAL(S) CLEAN ''SHIPPED ON BOARD'' OCEAN BILL OF LADING SHOWING CONSIGNEE AND NOTIFY "+ADDR+" AND MARKED ''FREIGHT PREPAID''"}],
  conditions_47A:[{no:'47A-3', quote:"3. ALL DOCUMENTS MUST MENTION 'IMPORT LICENCE' NO.01.TEST-02.03 DATED ON DECEMBER 18, 2025."},{no:'47A-4', quote:'4. SHIPPED IN 45FT. CONTAINER IS UNACCEPTABLE.'},
    {no:'47A-9', quote:'9. SHIPPING DOCUMENTS (COMMERCIAL INVOICE, PACKING LIST, BILL OF LADING) MUST INDICATE OUR LETTER OF CREDIT NUMBER AND L/C ISSUANCE DATE.'},
    {no:'47A-11', quote:'11. PLEASE USE HS CODE 4707 30 00 FOR OMG AND ONP; HS CODE 4707 20 FOR SOP'},
    {no:'47A-16', quote:'16. COMMERCIAL INVOICE, PACKING LIST AND BILL OF LADING MUST MENTION HS CODE AND TAX ID NUMBER 0001 0002 0003 0004'}]};
const CP={booking:{cr49f_main_ship_name:'TEST STAR 0JT1S', cr49f_booking_no:'TESTBKG01', cr49f_bl_number:''}, pol:'TOKYO, JAPAN', pod:'TEST PORT',
  containers:[{crcf9_container_no:'TSTU1234567', crcf9_seal_no:'S0001', crcf9_quantity:20, crcf9_g_w:24000},{crcf9_container_no:'TSTU7654321', crcf9_seal_no:'S0002', crcf9_quantity:22, crcf9_g_w:25000.5}]};
const items=DOC.blkList({lc:LC, lcText:'', goods:'WASTEPAPER (OMG)', kind:'draft', cp:CP}), ids=items.map(x=>x.id);
console.log('C1 ~ C5 만들기');
ok(['prepaid','consignee','notify','licence','lcno','lcdate','taxid','hs','hsno'].every(k=>ids.indexOf(k)>=0)&&ids.indexOf('onboard')<0,'C1 = PREPAID · Consignee · Notify (같은 글이라도 따로) · IMPORT LICENCE · L/C 번호 · 일자 · TAX ID · HS (ON BOARD = 원본만 · Draft 는 「Received」 양식)',ids);
ok(DOC.blkList({lc:LC, goods:'OMG', kind:'orig', cp:CP}).some(x=>x.id==='onboard'),'원본 = SHIPPED ON BOARD 항목');
ok(items.filter(x=>x.id==='hsno').length===1&&items.find(x=>x.id==='hsno').want==='4707 30 00','HS 번호 = 이번 품목 (OMG) 의 것 하나 (SOP 의 4707 20 아님)');
ok(['vessel','bkg','pol','pod','cn0','cn1','seal0','seal1','pkgs','gw','ncnt'].every(k=>ids.indexOf(k)>=0)&&items.find(x=>x.id==='vessel').want==='TEST STAR','C2 = 본선 (항차 뺌) · BKG · POL · POD · 컨테이너 · 씰 · 포장 수 · 중량 · 컨테이너 수');
ok(['fb0','fb1','fb2','f45'].every(k=>ids.indexOf(k)>=0),'C3 = FREIGHT COLLECT · ON DECK · 하자 문구 · 45ft (47A)');
ok(items.find(x=>x.id==='consignee').pos==='con'&&items.find(x=>x.id==='notify').pos==='ntf','C4 = Consignee · Notify 만 위치');
const io=DOC.blkList({lc:LC, goods:'OMG', kind:'orig', cp:CP}).map(x=>x.id); ok(io.indexOf('obdate')>=0&&io.indexOf('norig')>=0&&ids.indexOf('obdate')<0,'C5 = 원본만 (On Board · 날짜 · 통수)');
ok(items.every(x=>x.src),'항목마다 출처');

/* 가짜 Draft (CNC 모양: 오른쪽 칸 글자 끼어듦 · 「**」 이어짐) */
const L=(rows)=>rows.map(([t,y,x,p])=>({p:p||1, y, x:x||10, t}));
const good=[['SHIPPER',10],['LEENEAR TEST',20],['CONSIGNEE',40],['SAMPLE BUYER CO.',50],['9TH FLOOR, TEST TOWER,',60],['CARRIER: TEST LINE PTE LTD HEAD OFFICE 1 TEST ROAD SINGAPORE 000000 TEL 99',60,330],['JL. SAMPLE KAV. 1, TEST CITY **',70],
  ['NOTIFY PARTY',100],['SAMPLE BUYER CO.',110],['9TH FLOOR, TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY 12345,',120],['TAX ID NUMBER 0001 0002 0003 0004',130],['TEL: 11-22-333-4444 FAX: 11-22-333-5555',140],
  ['PRE CARRIAGE BY',170],['VESSEL',180],['TEST STAR 0JT1S',190],['PORT OF LOADING',200],['TOKYO, JAPAN',210],['TEST PORT',220],['MARKS',240],
  ['WASTEPAPER (OMG) HS CODE 4707.30.00',250],['L/C NO. TESTLC0001 DATED NOV 06, 2026',260],["IMPORT LICENCE NO.01.TEST-02.03 DATED ON DECEMBER 18, 2025.",270],
  ['**12345, TEL: 11-22-333-4444 FAX: 11-22-333-5555, TAX IDNUMBER 0001 0002 0003 0004',280],['TSTU1234567 / S0001 20 BALES 24,000.000 KGS',300],['TSTU7654321 / S0002 22 BALES 25,000.500 KGS',310],
  ['TOTAL: 2 CONTAINERS 42 BALES 49,000.500 KGS',320],['BKG NO. TESTBKG01',330],['FREIGHT PREPAID AS ARRANGED',340],['SHIPPED ON BOARD',350]];
{ const d=DOC.blkDoc([{p:1,y:1,x:1,t:'1 X 40HC TSTU1234567 TSTU7654321 (if carried on deck at Merchant\'s risk)'}]); const r=DOC.blkRun(DOC.blkList({lc:LC, goods:'OMG', kind:'draft', cp:CP}).filter(x=>/^cn|ncnt|fb1/.test(x.id)), d).items; ok(r.find(x=>x.id==='ncnt').ok===true&&r.find(x=>x.id==='fb1').ok===true,'컨테이너 번호가 다 있으면 수 = ✓ · 「if carried on deck at Merchant\'s risk」 = 약관'); }
const D=DOC.blkDoc(L(good)), R=DOC.blkRun(items, D);
console.log('찾기');
ok(R.ng===0&&R.n===items.length,'맞는 Draft = 必須 n 中 n ✓ (오른쪽 칸 끼어듦 · 「**」 이어짐 · 붙은 낱말 IDNUMBER · 4707.30.00 = 4707 30 00)',R.items.filter(x=>x.ok===false).map(x=>[x.id,x.why]));
ok(DOC.blkFindAll(DOC.blkDocText('A B\nX Y Z\nC D'),'A B C D').all.length===1,'느슨한 찾기 — 줄바꿈 · 끼어든 낱말 건너뜀');
ok(DOC.blkFindAll(DOC.blkDocText('A B **\nQ\n**C D'),'A B C D').all.length===1,'「**」 이어짐을 따라감');
ok(DOC.blkFindStrict(DOC.blkDocText('NO. TESTLC0001'),'TESTLC 0001').all.length===1&&DOC.blkFindStrict(DOC.blkDocText('TESTLC0001'),'TESTLC0002').all.length===0,'엄격 = 영숫자만 이어서 (공백 · 기호 무시 · 숫자 하나라도 다르면 ✗)');
/* 틀린 Draft — 11TH FL · HS 4707 30 · Notify TAX ID 끝 빠짐 · FREIGHT COLLECT · 45G1 · 다른 컨테이너 */
const bad=good.map(r=>r.slice()); bad[4][0]='9TH FL TEST TOWER,'; bad[19][0]='WASTEPAPER (OMG) HS CODE 4707 30'; bad[10][0]='TAX ID NUMBER 0001 0002 0003'; bad[26][0]='FREIGHT COLLECT'; bad.push(['1 X 45G1',360]); bad[23][0]='TSTU9999999 / S0001 20 BALES 24,000.000 KGS';
const R2=DOC.blkRun(items, DOC.blkDoc(L(bad))), ng=Object.fromEntries(R2.items.filter(x=>x.ok===false).map(x=>[x.id,x]));
ok(ng.consignee&&/9TH FLOOR/.test(ng.consignee.why)&&/9TH FL TEST/.test(ng.consignee.near),'FL ≠ FLOOR (UCP600 14(j)) — Consignee 칸 · 가장 가까운 B/L 글',ng.consignee);
ok(ng.hsno&&/4707 30/.test(ng.hsno.near),'HS 4707 30 ≠ 4707 30 00 (47A)',ng.hsno);
ok(ng.notify&&/0004/.test(ng.notify.why),'Notify 칸의 TAX ID 끝 빠짐 = ✗ (다른 칸에 있어도)',ng.notify);
ok(ng.fb0&&ng.f45,'금지 문구 FREIGHT COLLECT · 45G1 = ✗',Object.keys(ng));
ok(ng.cn0&&!ng.cn1,'컨테이너 번호 다름 = ✗ (그 컨테이너만)');
ok(R2.ng===Object.keys(ng).length&&R2.ok+R2.ng===R2.n,'「必須 n 中 n ✓ · ✗ k」 셈');
{ const d=DOC.blkDoc(L([['MAY BE CARRIED ON DECK OR UNDER DECK WITHOUT NOTICE',10]])); ok(DOC.blkRun(items.filter(x=>x.id==='fb1'), d).items[0].ok===true,'ON DECK — 약관 일반 조항 (MAY BE CARRIED · UNDER DECK) 은 제외'); }
console.log('위치 (C4)');
{ const sk=[['NOTIFY PARTY',10],['SAMPLE BUYER CO., 9TH FLOOR, TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY 12345, *2',20],['*2',200],['TEL: 11-22-333-4444 FAX: 11-22-333-5555, TAX ID NUMBER 0001 0002 0003 0004',210]]; ok(DOC.blkRun(items.filter(x=>x.id==='notify'), DOC.blkDoc(L(sk))).items[0].ok===true,'번호 붙은 이어짐 「*2」 (SINOKOR) 따라감'); }
{ const on=[['CONSIGNEE',10],['SAMPLE BUYER CO., 9TH FLOOR, TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY 12345, CN>',20],['NOTIFY PARTY (It is agreed that no responsibility shall be attached to the Carrier for failure to notify)',40],['CN>',200],['TEL: 11-22-333-4444 FAX: 11-22-333-5555, TAX ID NUMBER 0001 0002 0003 0004',210]]; ok(DOC.blkRun(items.filter(x=>x.id==='consignee'), DOC.blkDoc(L(on))).items[0].ok===true,'「CN>」 이어짐 (ONE) · 긴 NOTIFY PARTY 제목 = 칸 끝'); }
ok(DOC.blkBlPages([{p:1,y:1,x:1,t:'B/L INSTRUCTIONS'},{p:1,y:2,x:1,t:'CONSIGNEE'},{p:1,y:3,x:1,t:'NOTIFY PARTY'},{p:1,y:4,x:1,t:'BILL OF LADING'}]).pages.length===0,'B/L Instructions (우리 지시서) 쪽 = B/L 아님');
{ const sw=good.map(r=>r.slice()); sw[3][0]='OTHER COMPANY'; sw[4][0]='OTHER ROAD'; sw[6][0]='OTHER CITY'; const r=DOC.blkRun(items, DOC.blkDoc(L(sw))).items; ok(r.find(x=>x.id==='consignee').ok===false&&r.find(x=>x.id==='notify').ok===true,'Notify 칸에만 있는 글 = Consignee ✗ (Notify ✓)'); }
{ const order=good.map(r=>r.slice()); order[10][0]='TEL: 11-22-333-4444 FAX: 11-22-333-5555'; order[11][0]='TAX ID NUMBER 0001 0002 0003 0004'; const r=DOC.blkRun(items, DOC.blkDoc(L(order))).items.find(x=>x.id==='notify'); ok(r.ok===true,'칸 안의 순서만 다름 = ✓ (+ 메모)',r); }
console.log('원본 (C5)');
{ const o=DOC.blkList({lc:LC, goods:'OMG', kind:'orig', cp:CP}), og=good.concat([['SHIPPED ON BOARD DATE: 05 DEC 2026',360],['NUMBER OF ORIGINAL B/L: THREE (3)',370]]); const r=DOC.blkRun(o, DOC.blkDoc(L(og))); ok(r.items.find(x=>x.id==='obdate').ok===true&&r.items.find(x=>x.id==='norig').ok===true,'On Board 날짜 ≤ 44C · 원본 3 통');
  const late=DOC.blkRun(o, DOC.blkDoc(L(good.concat([['SHIPPED ON BOARD DATE: 05 FEB 2027',360]])))); ok(late.items.find(x=>x.id==='obdate').ok===false,'On Board 날짜 > 44C = ✗');
  const fin=DOC.blkRun(items, D), chg=DOC.blkRun(o, DOC.blkDoc(L(bad)), {final:fin.items}); ok(/最終 Draft と違う/.test(chg.items.find(x=>x.id==='consignee').why),'최종 OK Draft 와 달라진 곳 = 표시'); }
console.log('AI 인용 기계 확인');
{ const it=items.find(x=>x.id==='lcno'); ok(DOC.blkAiCheck(D,it,'L/C NO. TESTLC0001').ok===true,'AI 인용이 B/L 에 있고 같음 = ✓'); const f=DOC.blkAiCheck(D,it,'L/C NO. TESTLC0009'); ok(f.ok===false&&f.fake===true,'AI 인용이 B/L 에 없음 (지어냄) = ✗'); }
console.log('S/I 먼저 (N88 ②)');
{ const si={crcf9_consignee:'SAMPLE BUYER CO.\n9TH FL TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY **', crcf9_notify_party:'SAMPLE BUYER CO.', crcf9_address:ADDR.replace('SAMPLE BUYER CO., ',''), crcf9_bl_text2:'**12345, TEL: 11-22-333-4444 FAX: 11-22-333-5555, TAX ID NUMBER 0001 0002 0003 0004', crcf9_all:"IMPORT LICENCE NO.01.TEST-02.03 DATED ON DECEMBER 18, 2025.", cr49f_lc_no:'TESTLC0001 DATED NOV 06, 2026'};
  const r=DOC.blkRunSi(DOC.blkList({lc:LC, goods:'OMG', kind:'si'}), si, [{crcf9_productname:'WASTEPAPER (OMG)', crcf9_hs_code:'4707 30 00'}]), g=Object.fromEntries(r.items.map(x=>[x.id,x]));
  ok(!g.onboard&&!g.prepaid,'S/I = 선사가 찍는 ON BOARD · PREPAID 는 안 봄'); ok(g.consignee.ok===false&&/9TH FLOOR/.test(g.consignee.why),'S/I Consignee 9TH FL = ✗ (「**」 이어짐 포함해서 봄)',g.consignee); ok(g.notify.ok===true&&g.lcno.ok===true&&g.hsno.ok===true&&g.licence.ok===true,'S/I Notify · L/C 번호 · HS (명세) · 라이선스 = ✓'); }
console.log('Part ⑤ S/I Consignee = 46A (N88 ①)');
const RAW=' DOCUMENTS REQUIRED            :46A\n  1/ SIGNED COMMERCIAL INVOICE.\n  2/ FULL SET OF CLEAN SHIPPED ON BOARD OCEAN BILL OF LADING SHOWING CONSIGNEE AND NOTIFY '+ADDR+' AND MARKED FREIGHT PREPAID\n ADDITIONAL CONDITIONS         :47A\n  1. TEST.';
eq(DOC.lcConsignee46(RAW),{kind:'same', text:ADDR},'46A 「CONSIGNEE AND NOTIFY …」 → 그 글');
ok(DOC.lcConsignee46(RAW.replace('SHOWING CONSIGNEE AND NOTIFY '+ADDR,'MADE OUT TO THE ORDER OF TEST BANK, TEST BRANCH NOTIFY APPLICANT')).text==='TO THE ORDER OF TEST BANK, TEST BRANCH','46A 「MADE OUT TO THE ORDER OF {BANK}」 → 그 글');
{ const res={rec:{sinos:{1:{crcf9_consignee:'SAMPLE BUYER CO.\n9TH FL  TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY **'}}, basis:{}}}; DOC.siConsignee39(res,{raw:RAW});
  ok(/9TH FLOOR/.test(res.rec.sinos[1].crcf9_consignee)&&/\*\*$/.test(res.rec.sinos[1].crcf9_consignee)&&/\n/.test(res.rec.sinos[1].crcf9_consignee),'前回 「9TH FL」 → L/C 「9TH FLOOR」 (낱말만 · 줄 · 「**」 그대로)',res.rec.sinos[1]);
  ok(DOC.siState38({col:'crcf9_consignee', value:res.rec.sinos[1].crcf9_consignee, prev:'X', basis:res.rec.basis[1].crcf9_consignee, lc:true}).label==='L/C 46A','고친 칸 = 確定 「L/C 46A」 (前回와 달라도)'); }
{ const res={rec:{sinos:{1:{crcf9_consignee:'SAMPLE BUYER CO.\n9TH FLOOR, TEST TOWER, JL. SAMPLE KAV. 1, TEST CITY **'}}, basis:{}}}; const f=DOC.siConsignee39(res,{raw:RAW}); ok(!f.length&&res.rec.basis[1].crcf9_consignee.source==='LC 46A','이미 L/C 글 (「**」 로 나눔) = 그대로 · 確定'); }
{ const res={rec:{sinos:{1:{crcf9_consignee:'TOTALLY OTHER NAME\nOTHER ADDRESS'}}, basis:{}}}; DOC.siConsignee39(res,{raw:RAW}); ok(res.rec.sinos[1].crcf9_consignee==='TOTALLY OTHER NAME\nOTHER ADDRESS'&&res.rec.basis[1].crcf9_consignee.unk===true&&res.rec.basis[1].crcf9_consignee.cands[0].v===ADDR,'모양이 아주 다름 = 안 바꿈 · 不明 + L/C 글 후보'); }
{ const res={rec:{sinos:{1:{crcf9_consignee:'TO ORDER OF SAMPLE BUYER CO.'}}, basis:{}}}; DOC.siConsignee39(res,{raw:RAW.replace('SHOWING CONSIGNEE AND NOTIFY '+ADDR,'MADE OUT TO ORDER OF APPLICANT')}); ok(res.rec.sinos[1].crcf9_consignee==='TO ORDER OF SAMPLE BUYER CO.'&&!res.rec.basis[1],'「TO ORDER OF APPLICANT」 · 「APPLICANT AS FOLLOWING FORMAT」 = 그대로 (형식 지시)'); }
{ const res={rec:{sinos:{1:{crcf9_address:'9TH FL TEST TOWER'}}, basis:{}}}; const raw=' APPLICANT                     :50\n SAMPLE BUYER CO.\n 1 TEST ROAD\n'+RAW.replace('SHOWING CONSIGNEE AND NOTIFY '+ADDR+' AND MARKED','MARKED').replace('FREIGHT PREPAID','FREIGHT PREPAID NOTIFY SAMPLE BUYER CO., 9TH FLOOR TEST TOWER'); DOC.siNotify38(res,{raw}); ok(/9TH FLOOR/.test(res.rec.sinos[1].crcf9_address),'Notify 주소도 FL ≠ FLOOR (v0.38 은 같다고 봤음)',res.rec.sinos[1]); }
ok(/DOC\.siConsignee39\(out,\{raw:raw38\}\)/.test(HTML),'L/C S/I 추천에 연결');

console.log('화면 · 쓰기');
const fnSrc=n=>{ const i=HTML.indexOf('function '+n+'('); if(i<0) return ''; const r=HTML.slice(i+10).search(/\n(?:async )?function |\n\/\*|\nconst |\nS\./); return HTML.slice(i, r<0?undefined:i+10+r); };
ok(/if\(!S\.me\.admin\) return '';/.test(fnSrc('blChkPanel'))&&/if\(!S\.me\.admin\) return;/.test(fnSrc('blChkAfter')),'B/L チェック（試験） = 관리자만');
ok(/case 'bl': return blChkPanel\(r\.iv\)\+blTabHtml\(r\);/.test(HTML),'B/L 탭 위 · 지금 照合 화면 그대로 아래');
ok(DOC.guardOut(DOC.OUT_ROOT+'blcheck/NA2699-01_20261128T000000Z.json')===true,'결과 = doc_tool/blcheck/ (문지기 · 새 파일)');
ok(!/spPut|dvWrite|graphMail/.test(fnSrc('blCheckIv'))&&!/spPut|dvWrite|graphMail/.test(fnSrc('blChkAi')),'체크 · AI = 읽기만 (저장은 blChkSave 하나)');
let old=''; try{ old=cp.execFileSync('git',['show','cd44605:index.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:64e6}); }catch(e){}
if(old){ const acorn=require('acorn'); const fns=h=>{ const o={}; [...h.matchAll(/<script(?: id="([^"]+)")?>([\s\S]*?)<\/script>/g)].forEach(m=>{ let ast; try{ ast=acorn.parse(m[2],{ecmaVersion:'latest',allowReturnOutsideFunction:true}); }catch(e){ return; }
    const walk=n=>{ if(!n||typeof n.type!=='string') return; if(n.type==='FunctionDeclaration'&&n.id) o[(m[1]||'x')+':'+n.id.name]=m[2].slice(n.start,n.end); for(const k in n){ const v=n[k]; if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v.type==='string') walk(v); } }; walk(ast); }); return o; };
  const a=fns(old), b=fns(HTML), changed=Object.keys(b).filter(k=>a[k]!==undefined&&a[k]!==b[k]), gone=Object.keys(a).filter(k=>b[k]===undefined);
  const ALLOW=['doc-core:siNotify38','doc-app:siRecommend','doc-app:blTabAfter','doc-app:ivTabHtml','doc-app:ivTabBody','doc-app:tabBody'];
  ok(changed.every(k=>ALLOW.indexOf(k)>=0)&&!gone.length,'v0.38 ↔ v0.39 바뀐 함수 = Notify 비교 · S/I 추천 1 줄 · B/L 탭 연결 만 ('+changed.length+')',{changed,gone});
  ['siWrite','siWrite0','dvWrite','siExecute','blCompareOne','blRun','blSave','blMail','lgOpen','aclFetchCompass','saveDo','spPut'].forEach(n=>ok(b['doc-app:'+n]&&b['doc-app:'+n]===a['doc-app:'+n],'같음 = '+n));
  ['guardOut','guardDv','guardMail','todoRow','judgeIv','blMailDraft'].forEach(n=>ok(!a['doc-core:'+n]||b['doc-core:'+n]===a['doc-core:'+n],'같음 = '+n)); }
else ok(false,'cd44605 없음');
ok(!/@(?!example\.test)[a-z0-9-]+\.(?:com|jp|co\.kr|vn|id)\b/i.test(fs.readFileSync(__filename,'utf8').replace(/@example\.test/g,'')),'이 시험 = 가짜 값 (example.test)');
console.log((fail?'FAIL':'PASS')+' v39 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
