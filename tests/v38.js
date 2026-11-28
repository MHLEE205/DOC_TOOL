/* v0.38 시험 (지시서 THOR_38 · N74 ~ N79 · 37-Q1/Q3/Q4/Q6) — 가짜 L/C · 가짜 거래처 (example.test) · 네트워크 없음 · 쓰기 0. node v38.js [html]
   U1 ~ U6 C 안 (項目 | 前回 | 今回の推薦 | 状態 · 줄바꿈 · 높이 · 행 자세히 · 不明 위 · 접기 · 「不明 n」) / 状態 表 (確定 · 不明) / N76 Notify = 46A / N77 HS = GRADE → 마스터 / N78 · 37-Q1 · 37-Q3 (a1 v0.14 문구)
   37-Q4 「L/C の文言で直す」 = N72 / 37-Q6 画像 L/C 書き写し / L1 ~ L6 학습 / v0.37 ↔ v0.38 바뀐 함수 = S/I 영역만 · 쓰기 함수 같음 */
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V38;

console.log('버전 · 푸터 · 엔진');
ok(/<title>LEENAI D-00 書類ツール v0\.3[89]<\/title>/.test(HTML)&&(HTML.match(/version:'0\.3[89]'/g)||[]).length===1&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.38 · 푸터');
const m1=HTML.match(/const A1_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})', ver:'0\.14'\}/); ok(!!m1,'A1_ENGINE = a1 v0.14 · 40 자리 커밋 · sha256');
let ENG=''; try{ ENG=cp.execFileSync('git',['-C',process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND'),'show',m1[1]+':a1_bench.html'],{maxBuffer:1<<25}); }catch(e){}
if(ENG.length){ ok(crypto.createHash('sha256').update(ENG).digest('hex')===m1[2],'a1 원문 sha256 = 도구에 적은 값'); const T=ENG.toString('utf8');
  ok(/version:'0\.14'/.test(T),'a1 v0.14');
  ok(/R6 crcf9_notify_party · crcf9_address \(Notify · v0\.14 N76\): 46A の B\/L 条項の Notify の文/.test(T)&&/:50 の住所を 46A の Notify の代わりに使わない/.test(T),'a1 R6 = N76 (46A 그대로 · :50 = NOTIFY APPLICANT 때만)');
  ok(/R2 crcf9_bencert_text \(v0\.14 · N78\)/.test(T)&&/「CONTRACT NUMBER \(今回の契約番号\)」 だけ/.test(T),'a1 R2 = N78 CONTRACT NUMBER (契約番号)');
  ok(/R1 の置き場所 \(v0\.14 · 37-Q1\)/.test(T)&&/初めてのバイヤー \(同じバイヤーの S\/I なし\) = crcf9_invoicetext/.test(T),'a1 37-Q1 = 같은 바이어 S/I 칸 · 처음 = invoicetext + 「初めてのバイヤー」');
  ok(/同じバイヤーの直前 S\/I の値だけ \(参考 S\/I = 別のバイヤー からは取らない\)/.test(T),'a1 37-Q3 = 번호는 같은 바이어만');
  ok(/【過去の修正 \(担当が推薦を直して登録した値/.test(T)&&/L\/C 原文が優先/.test(T),'a1 L4 = 過去の修正 (L/C 원문 우선)');
  ok(/async function transcribeImageLc\(t, lcp, opts, rep\)/.test(T)&&/d01TranscribePromptText\(\)/.test(T),'a1 37-Q6 = 画像 L/C 書き写し (D-01 의 転記 지시)'); }
else ok(false,'a1 커밋을 git 에서 못 읽음 (CONTRACT_SEND)');
ok(/transcribeImageLc:\(typeof transcribeImageLc===\\?"function\\?"\?transcribeImageLc:null\)/.test(HTML),'엔진 꺼내기에 transcribeImageLc');

/* ── 가짜 L/C ── */
const LC=o=>[' DOCUMENTARY CREDIT NUMBER     :20  TESTLC0001',' APPLICANT                     :50',' SAMPLE BUYER CO., LTD.',' 1 TEST ROAD, SAMPLE DISTRICT','  SAMPLE CITY, VIETNAM',
  ' DESCRIPTION OF GOODS AND/OR SERVICES:45A','  + COMMODITY: WASTE PAPER TEST','  + HS CODE: '+(o.hs||'4707.10.00'),
  ' DOCUMENTS REQUIRED            :46A','  1/ SIGNED COMMERCIAL INVOICE IN TRIPLICATE.','  2/ FULL SET OF ORIGINAL BILLS OF LADING MADE OUT TO THE ORDER OF SAMPLE BANK '+(o.bl||'MARKED FREIGHT PREPAID NOTIFY APPLICANT'),
  '  3/ PACKING LIST IN TRIPLICATE.',' ADDITIONAL CONDITIONS         :47A','  1. ALL DOCUMENTS MUST INDICATE LC NUMBER.'].join('\n');

console.log('N76 Notify = 46A');
eq(DOC.notify46(LC({})).kind,'applicant','NOTIFY APPLICANT → applicant (:50)');
const NX=DOC.notify46(LC({bl:'MARKED FREIGHT PREPAID NOTIFY SAMPLE BUYER CO., LTD., 9 OTHER STREET, SAMPLE CITY, VIETNAM, TEL: 84-28-1234-5678'}));
ok(NX.kind==='explicit'&&/^SAMPLE BUYER CO\., LTD\.?$/.test(NX.name)&&NX.address==='9 OTHER STREET, SAMPLE CITY, VIETNAM'&&NX.tel==='84-28-1234-5678','46A 에 이름 + 주소 → explicit · 주소 = 46A 그대로 · TEL 따로',NX);
eq(DOC.notify46(LC({bl:'NOTIFY APPLICANT AS FOLLOWING FORMAT: NAME, ADDRESS'})).kind,'format','APPLICANT AS FOLLOWING FORMAT → format (AI 값 그대로)');
eq(DOC.notify46(LC({bl:'MARKED FREIGHT PREPAID'})).kind,'none','46A 에 NOTIFY 없음 → none');
const R=(addr)=>({rec:{sinos:{1:{crcf9_notify_party:'SAMPLE BUYER CO., LTD.', crcf9_address:addr}}, basis:{}}});
{ const r=R('1 TEST ROAD, SAMPLE DISTRICT\nSAMPLE CITY, VIETNAM'); DOC.siNotify38(r,{raw:LC({bl:'MARKED FREIGHT PREPAID NOTIFY SAMPLE BUYER CO., LTD., 9 OTHER STREET, SAMPLE CITY, VIETNAM'})});
  ok(r.rec.sinos[1].crcf9_address==='9 OTHER STREET, SAMPLE CITY, VIETNAM'&&r.rec.basis[1].crcf9_address.source==='LC','explicit: :50 주소 → 46A 주소로 바꿈 (:50 안 씀)',r.rec); }
{ const r=R('9 OTHER STREET,\nSAMPLE CITY, VIETNAM'); const f=DOC.siNotify38(r,{raw:LC({bl:'MARKED FREIGHT PREPAID NOTIFY SAMPLE BUYER CO., LTD., 9 OTHER STREET, SAMPLE CITY, VIETNAM'})}); ok(!f.length,'explicit: 이미 46A 주소 (줄바꿈만 다름) = 그대로'); }
{ const r=R(''); DOC.siNotify38(r,{raw:LC({})}); ok(r.rec.sinos[1].crcf9_address==='1 TEST ROAD, SAMPLE DISTRICT\nSAMPLE CITY, VIETNAM','NOTIFY APPLICANT + 빈칸 = :50 주소'); }
{ const r=R(''); DOC.siNotify38(r,{raw:LC({bl:'MARKED FREIGHT PREPAID'}), prev:{1:{crcf9_address:'PREV ADDRESS 1'}}}); ok(r.rec.sinos[1].crcf9_address==='PREV ADDRESS 1'&&/前回/.test(r.rec.basis[1].crcf9_address.basis),'46A 지시 없음 + 빈칸 = 前回 값'); }
{ const r=R(''); DOC.siNotify38(r,{raw:LC({bl:'MARKED FREIGHT PREPAID'})}); ok(r.rec.basis[1].crcf9_address.unk===true&&DOC.siState38({col:'crcf9_address', value:'', basis:r.rec.basis[1].crcf9_address}).s==='unk','46A 지시 없음 · 前回 없음 = 不明'); }

console.log('N77 HS = GRADE → 마스터');
const M=[{item_code:'JOCC',hs_code:'4707.10-000'},{item_code:'JONP',hs_code:'4707.30-000'},{item_code:'JHMP',hs_code:''}];
eq([DOC.hsOfGrade('jocc',M).hs6, DOC.hsOfGrade('JHMP',M).ok, DOC.hsOfGrade('ZZZ',M).ok, DOC.hsOfGrade('',M).ok],['4707.10',false,false,false],'GRADE → 6 자리 분류 · 마스터 빈칸 / 없음 / GRADE 없음 = 실패');
eq(['47071000','4707.10.0000','HS CODE: 4707 1000','4707.10',''].map(s=>DOC.hsFmt('4707.30',s)),['47073000','4707.30.0000','HS CODE: 4707 3000','4707.30','4707.30'],'형식 = 견본의 모양 그대로 · 숫자만 분류');
const SG=()=>({rec:{sinos:{1:{crcf9_bl_text1:'WASTE PAPER#47072000#XXKGS#XXBALES', crcf9_invoicetext:'HS CODE: 4707.10'}}, basis:{}, details:[{crcf9_productname:'JOCC', crcf9_hs_code:'47072000'}]}});
{ const r=SG(); DOC.siHs38(r,{master:M, sale:[{item:'JOCC'}], raw:''}); ok(r.rec.details[0].crcf9_hs_code==='47071000'&&r.rec.sinos[1].crcf9_bl_text1==='WASTE PAPER#47071000#XXKGS#XXBALES'&&r.rec.sinos[1].crcf9_invoicetext==='HS CODE: 4707.10','SG2 사례: 다른 품목 HS 47072000 → 이 GRADE 의 4707.10 (모양 그대로) · 맞는 숫자는 그대로',r.rec);
  ok(DOC.siState38({col:'crcf9_bl_text1', value:r.rec.sinos[1].crcf9_bl_text1, basis:r.rec.basis[1].crcf9_bl_text1}).label===V.S_MASTER,'고친 칸 = 確定 · 「マスター」'); }
{ const r=SG(); DOC.siHs38(r,{master:M, sale:[{item:'JOCC'}], raw:LC({hs:'4707.30.00'})}); ok(r.rec.details[0].crcf9_hs_code__unk===true&&/合わない/.test(r.rec.details[0].crcf9_hs_code__flag),'L/C HS ≠ GRADE 분류 = 不明',r.rec.details[0]); }
{ const r=SG(); DOC.siHs38(r,{master:M, sale:[{item:'JOCC'}], raw:LC({hs:'4707.10.00'})}); ok(r.rec.details[0].crcf9_hs_code==='4707.10.00','L/C 의 모양 우선 (4707.10.00)',r.rec.details[0]); }
{ const r=SG(); DOC.siHs38(r,{master:M, sale:[{item:'JHMP'}], raw:''}); ok(r.rec.details[0].crcf9_hs_code__unk&&/マスターにない/.test(r.rec.details[0].crcf9_hs_code__flag)&&r.rec.details[0].crcf9_hs_code==='47072000','마스터 빈칸 = 不明 (값 안 바꿈)'); }
{ const r=SG(); DOC.siHs38(r,{master:M, sale:[{item:'ZZZ'}], raw:''}); ok(r.rec.details[0].crcf9_hs_code__unk,'GRADE 모름 = 不明'); }
{ const r={rec:{sinos:{1:{crcf9_invoicetext:'47072000'}}, basis:{}, details:[{crcf9_hs_code:'47071000'},{crcf9_hs_code:'47071000'}]}}; DOC.siHs38(r,{master:M, sale:[{item:'JOCC'},{item:'JONP'}], prevHs:{JOCC:'47071000'}});
  ok(r.rec.details[0].crcf9_hs_code==='47071000'&&r.rec.details[1].crcf9_hs_code==='47073000','품목 2 개 = 각자 자기 GRADE 의 HS (다른 품목 HS 복사 0)',r.rec.details);
  ok(r.rec.sinos[1].crcf9_invoicetext==='47072000'&&r.rec.basis[1].crcf9_invoicetext.unk,'GRADE 여러 개 · 맞지 않는 본문 숫자 = 그대로 + 不明'); }

console.log('状態 표 (N75)');
const st=(o)=>DOC.siState38(o);
const cases=[
  [{col:'crcf9_consignee', value:'TO ORDER', prev:'TO ORDER', basis:{source:'前回 S/I: X'}},'ok','前回'],
  [{col:'crcf9_po_vo', value:'LRS-2699TT2', prev:'LRS-2699TT1', basis:{flag:'要確認 · PO = 契約番号 (前回 X → 今回の番号)'}},'ok','規則'],
  [{col:'crcf9_po_vo', value:'', prev:'PO123', basis:{flag:'要確認 · 毎回変わる (前回: PO123)'}},'unk'],
  [{col:'crcf9_place_of_delivery_1', value:'BUSAN', prev:'PUSAN', basis:{quote:[{loc:'44B'}]}, lc:true},'ok','L/C 44B'],
  [{col:'crcf9_place_of_delivery_1', value:'', prev:'X', basis:{pick:true, flag:'候補'}, lc:true},'unk'],
  [{col:'crcf9_consignee', value:'A', prev:'B', basis:{r2diff:[{v1:'A',v2:'B'}]}, lc:true},'unk'],
  [{col:'crcf9_consignee', value:'NEW', prev:'OLD', basis:{}, lc:true},'unk'],
  [{col:'crcf9_consignee', value:'', prev:'OLD', basis:{}},'unk'],
  [{col:'crcf9_consignee', value:'', prev:'', basis:{}},'ok'],
  [{col:'cr49f_lc_no', value:'', prev:'LC1', basis:{flag:'要確認 · T/T なので空欄 (前回: LC1)'}},'ok','規則'],
  [{col:'cr49f_payment_terms', value:'CFR', prev:'CFR', basis:{ok:'一致', basis:'前回と同じ（今回の契約: CFR）'}},'ok'],
  [{col:'cr49f_payment_terms', value:'CFR', prev:'CFR', basis:{flag:'要確認 · 今回の契約は FOB'}},'unk'],
  [{col:'crcf9_address', value:'X', basis:{learn:true, source:'学習'}},'ok','学習'],
  [{col:'crcf9_hs_code', value:'', basis:{unk:true, flag:'HS: JHMP の HS がマスターにない（マスター入力必要）'}},'unk'],
  [{col:'crcf9_consignee', value:'A', prev:'B', basis:{flag:'要確認 · 最近 3 件で違う (A / B)'}},'ok','前回'],
  [{col:'crcf9_bl_text1', value:'MST 0101', prev:'MST 0101', basis:{lic:['MST 0101'], flag:'要確認 · ライセンス番号（前回 MST 0101）'}},'unk'],
  [{col:'crcf9_bl_text1', value:'X', basis:{fac:{cands:[{label:'A'},{label:'B'}]}, flag:'要確認 · 工場を選んでください（2 工場）'}},'unk']];
cases.forEach(([o,s,lab],i)=>{ const r=st(o); ok(r.s===s&&(!lab||r.label===lab)&&(s!=='unk'||(r.label===V.UNK&&r.why&&!/^要確認/.test(r.why))),'状態 '+(i+1)+' '+o.col+' → '+s+(lab?' '+lab:''),r); });
ok(Object.keys(st({col:'x', value:'a'})).sort().join()==='label,s,why'&&['一致','要確認','前回と違う'].every(w=>!new RegExp('^'+w+'$').test(st({col:'crcf9_consignee', value:'a', prev:'b'}).label)),'배지 = 確定 (짧은 출처) / 不明 두 가지 뿐 (要確認 · 一致 · 前回と違う 없음)');

console.log('U1 ~ U6 화면 (C 안)');
const fnSrc=n=>{ const i=HTML.indexOf('function '+n+'('); return i<0?'':HTML.slice(i,HTML.indexOf('\n}\n',i)); };
const TAB=fnSrc('siTabHtml'), AFT=fnSrc('siTabAfter'), ROWS=fnSrc('siRows');
ok(/V\.ITEM_H/.test(TAB)&&/prevH/.test(TAB)&&/V\.NOW_H/.test(TAB)&&/V\.STATE_H/.test(TAB)&&V.ITEM_H==='項目'&&V.PREV_H==='前回'&&V.NOW_H==='今回の推薦'&&V.STATE_H==='状態','U1 열 = 項目 | 前回 | 今回の推薦 | 状態');
ok(/<textarea'\+attrs\+' class="dt-in si38-in/.test(TAB)&&!/<input'\+attrs/.test(TAB)&&/white-space:pre-wrap/.test(TAB)&&/scrollHeight/.test(AFT),'U2 긴 글 = 전부 줄바꿈 (잘림 없음 · 입력칸 높이 = 내용)');
ok(/data-si38d/.test(TAB)&&/hidden/.test(TAB)&&/tr\.si38-r/.test(AFT)&&/closest\('textarea,button,input,a'\)/.test(AFT)&&/V\.CUR/.test(TAB),'U3 행 누르면 자세히 (회색 · 根拠 · 今の COMPASS)');
ok(/V\.FIRST_BANK/.test(TAB)&&V.FIRST_BANK==='この銀行は初めて'&&/res\.prevSi\.no/.test(TAB),'U4 前回 머리 = 계약 번호 · L/C 처음 은행 = 「この銀行は初めて」');
ok(/unk\.concat\(chg\)/.test(TAB)&&/V\.FOLD/.test(TAB)&&/sameP/.test(TAB),'U6 不明 위 · 前回와 같은 確定 은 접기');
ok(/V38\.UNK_N/.test(fnSrc('siPills'))&&!/一致 |要確認 |根拠あり /.test(fnSrc('siPills')),'위 요약 = 「不明 n」 만');
ok(/DOC\.siState38\(/.test(ROWS)&&!/siFieldState/.test(ROWS)&&/res\.prevSi/.test(ROWS)&&/res\.prevDet/.test(ROWS),'행 = 前回 + siState38');
ok(/DOC\.SI_HEAD_COLS\.forEach/.test(fnSrc('lcPrevSi')),'L/C 前回 = 같은 바이어 · 같은 은행 S/I 의 모든 칸');
ok(/u5Items\(miss, mine, more\)/.test(HTML)&&/createdon ge \$\{since\}/.test(fnSrc('u5Items'))&&/90\*864e5/.test(fnSrc('u5Items'))&&/mine\.has/.test(fnSrc('u5Items')),'U5 품명 · HS = 최근 3 개월 S/I (같은 바이어 → 다른 바이어)');
{ const r=DOC.ttRecommend({no:'LRS-2699TT2', prev:[{no:'LRS-2699TT1', date:'2026-01-01', sis:[{crcf9_sino:1, cr49f_payment_terms:'CFR'}], details:[]}], sale:[{_cr49f_item_id_value:'g9', item:'JOCC'}], term:'CFR', more:{g9:{name:'WASTE PAPER JOCC', hs:'47071000', src:V.U5_SAME}}});
  ok(r.rec.details[0].crcf9_productname==='WASTE PAPER JOCC'&&r.rec.details[0].crcf9_productname__source===V.U5_SAME&&!r.rec.details[0].crcf9_productname__flag,'U5 前回 S/I 에 없는 품목 = 3 개월 S/I 의 품명 (確定)',r.rec.details[0]); }

console.log('37-Q4 · 37-Q6');
ok(/siFixDeadline\(id, it\.fixSi, DOC\.payDeadline37\(it\.fixTo\)\|\|it\.fixTo\)/.test(HTML),'37-Q4 「L/C の文言で直す」 = N72 핵심 모양');
const LRN=fnSrc('lcReadNow');
ok(/A\.transcribeImageLc\(t,lcp,opts,1\)/.test(LRN)&&/A\.transcribeImageLc\(t,lcp,opts,2\)/.test(LRN)&&/image_text=\{reads:2, same:/.test(LRN),'37-Q6 画像 L/C = AI 書き写し 2 회 · _text 에 · 같음 표시');
ok(/lcImageText\(no\)/.test(fnSrc('siRecommend'))&&(L=>/_text\//.test(L)&&!/spPut/.test(L))(fnSrc('lcImageText').split('\n')[0]),'S/I 추천 = 画像 L/C 의 _text 읽기만');

console.log('L1 ~ L6 학습');
const rec0={sinos:{1:{crcf9_address:'1 TEST ROAD', crcf9_consignee:'TO ORDER', crcf9_remark:'A'}}, basis:{1:{crcf9_address:{source:'LC'}}}};
const fin0={sinos:{1:{crcf9_address:'9 OTHER STREET', crcf9_consignee:'TO  ORDER', crcf9_remark:'A'}}};
const d0=DOC.learnDiff(rec0, fin0, {contract:'LRS-2699AA1', buyer:'SAMPLE', bank:'BANK1', kind:'lc', at:'2026-11-01T00:00:00Z', user:'tester@example.test'});
ok(d0.total===3&&d0.kept===2&&d0.diffs.length===1&&d0.diffs[0].col==='crcf9_address'&&d0.diffs[0].cls==='learn'&&d0.schema==='si_learn/1','L1 기록 = 추천 ≠ 등록 칸 · 계약 · 바이어 · 은행 · 담당 · 시각 (空白 차이 = 같음)',d0);
eq([DOC.learnClass('SAMPLE CO., LTD','SAMPLE CO LTD',''), DOC.learnClass('9 OTHER STREET','1 TEST ROAD','... NOTIFY 9 OTHER STREET ...'), DOC.learnClass('1 TEST ROAD','9 OTHER STREET','... 9 OTHER STREET ...')],['notation','lc','learn'],'L2 표기 차이 = 안 배움 · L/C 원문 값을 L/C 에 없는 값으로 = 안 배움 (lc)');
const d1=Object.assign({},d0,{contract:'LRS-2699AA2', at:'2026-11-05T00:00:00Z'});
eq(DOC.learnRules([d0],{}).length,0,'L3 1 회 = 규칙 아님');
const RL=DOC.learnRules([d0,d1],{}); ok(RL.length===1&&RL[0].n===2&&RL[0].to==='9 OTHER STREET','L3 같은 바이어 · 같은 은행 · 같은 칸 · 같은 방향 2 회 = 규칙',RL);
eq(DOC.learnRules([d0,Object.assign({},d0)],{}).length,0,'L3 같은 계약 2 번 = 규칙 아님');
eq(DOC.learnRules([d0,Object.assign({},d1,{bank:'BANK2'})],{}).length,0,'L3 L/C = 은행이 다르면 규칙 아님');
eq(DOC.learnRules([d0,d1],{[RL[0].key]:1}).length,0,'L5 切 = 안 씀');
{ const r={rec:{sinos:{1:{crcf9_address:'1 TEST ROAD'}}, basis:{}}}; DOC.learnApply(r, RL, {buyer:'SAMPLE', bank:'BANK1', kind:'lc'});
  ok(r.rec.sinos[1].crcf9_address==='9 OTHER STREET'&&r.rec.basis[1].crcf9_address.basis===V.LEARN_WHY.replace('{n}',2)&&DOC.siState38({col:'crcf9_address', value:'9 OTHER STREET', basis:r.rec.basis[1].crcf9_address}).label===V.S_LEARN,'L3 다음 추천 = 그 값 · 確定 · 「学習（前回 2 回 直した）」',r.rec); }
{ const r={rec:{sinos:{1:{crcf9_address:'1 TEST ROAD'}}, basis:{}}}; DOC.learnApply(r, RL, {buyer:'OTHER', bank:'BANK1', kind:'lc'}); ok(r.rec.sinos[1].crcf9_address==='1 TEST ROAD','다른 바이어 = 안 씀'); }
{ const dl={contract:'LRS-2699AA3', buyer:'SAMPLE', bank:'BANK1', kind:'lc', at:'2026-11-06T00:00:00Z', diffs:[{sino:1, col:'crcf9_consignee', from:'TO ORDER OF BANK', to:'TO ORDER', cls:'lc'}]};
  const r={rec:{sinos:{1:{crcf9_consignee:'TO ORDER OF BANK'}}, basis:{}}}; DOC.learnApply(r, [], {buyer:'SAMPLE', bank:'BANK1', kind:'lc', records:[dl]});
  ok(r.rec.sinos[1].crcf9_consignee==='TO ORDER OF BANK'&&r.rec.basis[1].crcf9_consignee.unk&&/前回 L\/C と違う値に直された（TO ORDER）/.test(r.rec.basis[1].crcf9_consignee.flag),'L2 L/C 와 다른 값으로 고친 기록 = 배우지 않고 다음엔 不明 + 이유'); }
{ const recs=[0,1,2,3,4,5,6].map(i=>({buyer:'SAMPLE', bank:'BANK1', at:'2026-11-0'+(i+1), diffs:[{sino:1, col:'crcf9_remark', from:'a'+i, to:'b'+i, cls:'learn'}]}));
  const ex=DOC.learnExamples(recs,{buyer:'SAMPLE', bank:'BANK1', kind:'lc'}); ok(ex.length===5&&ex[0].to==='b6','L4 AI 에 「過去の修正」 = 같은 바이어 · 은행 · 새 순 · 5 개',ex); }
{ const S=DOC.learnStats([d0,d1,{at:'2026-12-01T00:00:00Z', total:10, kept:10, diffs:[]},{at:'2026-12-02T00:00:00Z', post:true, diffs:[{}]}]);
  ok(S.length===2&&S[0].month==='2026-11'&&Math.abs(S[0].rate-4/6)<1e-9&&S[1].rate===1&&S[1].post===1,'L6 월별 「推薦そのまま登録された欄の割合」 · 登録後の直し 따로',S); }
ok(/const _siExec0=siExecute; siExecute=async function/.test(HTML)&&/learnAfterWrite\(id, snap, fin\)/.test(HTML),'L1 기록 = 「COMPASS に書き込む」 실행 뒤 (쓰기 함수는 밖에서 감쌈)');
ok(/learnPostCheck\(id, S\.siCur\[id\]\)/.test(HTML)&&/post:true/.test(fnSrc('learnPostCheck')),'L1 등록 뒤 COMPASS 에서 고친 칸 = 다시 읽을 때 기록 (post)');
ok(/learnPanel\(\)/.test(fnSrc('openSettings'))&&/data-act/.test(fnSrc('learnPanel'))&&/S\.me\.admin/.test(fnSrc('learnPanel'))&&/learnStats/.test(fnSrc('learnPanel')),'L5 ⚙ 「学習した規則」 (切 · 削除 · 記録) · L6 관리자만');
ok(/input\.r2Extra\.learn=DOC\.learnExamples/.test(fnSrc('siRecommend'))&&/DOC\.learnApply/.test(fnSrc('siRecommend'))&&/DOC\.learnApply/.test(fnSrc('siTtRecommend')),'L3 · L4 = L/C · T/T 추천에 연결');
ok(DOC.guardOut(DOC.OUT_ROOT+'si_learn/202611/LRS-2699AA1_20261128T000000Z.json')===true&&DOC.guardOut(DOC.OUT_ROOT+'si_learn/_off/x.json')===true,'学習 기록 경로 = doc_tool/si_learn/ (문지기 통과 · 새 파일만)');
let bad=null; try{ DOC.guardOut('古紙/LC/_READ/x.json'); }catch(e){ bad=e; } ok(!!bad,'문지기: _READ 쓰기 막음 (그대로)');

console.log('v0.37 ↔ v0.38 — 바뀐 함수 = S/I 영역만 · 쓰기 함수 같음');
let old=''; try{ old=cp.execFileSync('git',['show','60b32ed:index.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:64e6}); }catch(e){}
if(old){ const acorn=require('acorn'); const fns=h=>{ const o={}; [...h.matchAll(/<script(?: id="([^"]+)")?>([\s\S]*?)<\/script>/g)].forEach(m=>{ let ast; try{ ast=acorn.parse(m[2],{ecmaVersion:'latest',allowReturnOutsideFunction:true}); }catch(e){ return; }
    const walk=n=>{ if(!n||typeof n.type!=='string') return; if(n.type==='FunctionDeclaration'&&n.id) o[(m[1]||'x')+':'+n.id.name]=m[2].slice(n.start,n.end); for(const k in n){ const v=n[k]; if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v.type==='string') walk(v); } }; walk(ast); }); return o; };
  const a=fns(old), b=fns(HTML), changed=Object.keys(b).filter(k=>a[k]!==undefined&&a[k]!==b[k]), gone=Object.keys(a).filter(k=>b[k]===undefined);
  const ALLOW=['doc-core:siLc37','doc-core:ttRecommend','doc-app:openSettings','doc-app:siTrialAppend','doc-app:loadA1Engine0','doc-app:siRecommend','doc-app:siRows','doc-app:siTtRecommend','doc-app:siTabHtml','doc-app:siPills','doc-app:siTabAfter','doc-app:lcReadNow','doc-app:lcPrevSi', /* v0.39: B/L タブに 試験 の欄 */ 'doc-app:ivTabHtml','doc-app:blTabAfter'];
  ok(changed.every(k=>ALLOW.indexOf(k)>=0)&&!gone.length,'바뀐 함수 = S/I 추천 · 화면 · 설정 · 37-Q4 · 37-Q6 · 엔진 꺼내기 만 ('+changed.length+')',{changed,gone});
  ['siWrite','siWrite0','dvWrite','siExecute','siEditField','siFixDeadline','siMeta','siReadNow','lcSaveDo','lcAfterSave','siDeadlineApply'].forEach(n=>ok(b['doc-app:'+n]&&b['doc-app:'+n]===a['doc-app:'+n],'같음 = '+n));
  ['siPlan','guardDv','guardOut','payDeadline37','lcPodCands37'].forEach(n=>ok(b['doc-core:'+n]&&b['doc-core:'+n]===a['doc-core:'+n],'같음 = '+n));
  const strip=s=>s.split('\n').filter(l=>!/v0\.38 \(37-Q6\)|let imgText=null|imgText=\{text:/.test(l)).join('\n').replace('(imgText?imgText.text:lcp.rawRestored)','lcp.rawRestored').replace(" if(imgText) rec.source.image_text={reads:2, same:imgText.same, chars:imgText.text.length};",'');
  ok(strip(b['doc-app:lcReadNow'])===a['doc-app:lcReadNow'],'lcReadNow = v0.37 + 画像 L/C 줄만 (문자 단위)'); }
else ok(false,'60b32ed 없음 — 비교 못 함');

console.log('쓰기 0 · 가짜 주소');
ok(!/@(?!example\.test)[a-z0-9-]+\.(?:com|jp|co\.kr|vn)/i.test(fs.readFileSync(__filename,'utf8').replace(/@example\.test/g,'')),'이 시험의 메일 주소 = example.test 만');
console.log((fail?'FAIL':'PASS')+' v38 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
