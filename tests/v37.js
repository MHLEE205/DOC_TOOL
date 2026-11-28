/* v0.37 시험 (지시서 THOR_37 · 형님 N72 · N73 · R1 ~ R8) — 가짜 L/C · 가짜 거래처 (example.test) · 네트워크 없음 · 쓰기 0. node v37.js [html]
   N72 支払期限 = 「{AT }{n} DAYS {AFTER|FROM} {기준일 문구}」 (원문 낱말 · DATE 빼지 않음 · 割合 · 通数 · WILL BE PAID · 0 · DAYS DAYS 뺌) / N73 · R3 44B 후보 = 비우고 버튼 (SP-ITC 맨 뒤 · BKG の POD · 섞기 0)
   R7 1 港 = 원문 그대로 / R6 Notify 주소 빈칸 = :50 / L/C 원문 잘라내기 / 고정 a1 엔진 (커밋 · sha256) 안의 R1 ~ R8 · N72 문구 / siDeadlineApply = 패턴 */
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.3[789]<\/title>/.test(HTML)&&(HTML.match(/version:'0\.3[789]'/g)||[]).length===1&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.37 · 푸터');

/* 가짜 L/C (통지서 인쇄 모양) */
const LC=o=>[' DOCUMENTARY CREDIT NUMBER     :20  TESTLC0001',' APPLICANT                     :50',' SAMPLE BUYER CO., LTD.',' 1 TEST ROAD, SAMPLE DISTRICT','  SAMPLE CITY, VIETNAM',' DRAFTS AT ...                 :42C',
  '  '+(o.c42||'AT 090 DAYS AFTER B/L DATE'),'  FOR 100 PERCENT INVOICE VALUE',' DRAWEE                        :42A  TESTBANKXXX',
  ' PLACE OF FINAL DESTINATION/FOR TRANSPORTATION TO .../PLACE OF DELIVERY:44B','  '+(o.b44||'CAI MEP OR CAT LAI OR SP-ITC OR HO CHI MINH PORT IN VIETNAM'),
  ' LATEST DATE OF SHIPMENT       :44C  DEC 31, 2099',' DESCRIPTION OF GOODS AND/OR SERVICES:45A','  + COMMODITY: WASTE PAPER TEST','  + HS CODE: 4707.10.00','  + SPECIFICATION:','  OUTTHROW: 5% MAX',
  '  + TRADE TERM: CIF CAT LAI PORT, VIET NAM (INCOTERMS 2020) INCLUDE','  DTHC, CIC, LSS',' --- Page 3 ---',' DOCUMENTS REQUIRED            :46A','  1/ SIGNED COMMERCIAL INVOICE IN TRIPLICATE.',
  '  2/ FULL SET OF ORIGINAL B/L MADE OUT TO THE ORDER OF SAMPLE BANK, TEST BRANCH',' ADDITIONAL CONDITIONS         :47A','  1. ALL DOCUMENTS MUST INDICATE LC NUMBER.'].join('\n');
console.log('L/C 원문 잘라내기');
const S0=DOC.lcSections(LC({}));
eq(S0.map(s=>s.tag),['20','50','42C','42A','44B','44C','45A','46A','47A'],'통지서 인쇄 → 칸 (태그 순서)');
ok(DOC.lcSec(LC({}),'45A').indexOf('DTHC, CIC, LSS')>0&&!/Page 3/.test(DOC.lcSec(LC({}),'45A')),'45A 끝까지 (쪽 표시 뺌)');
ok(DOC.lcSec(LC({}),'50')==='SAMPLE BUYER CO., LTD.\n1 TEST ROAD, SAMPLE DISTRICT\nSAMPLE CITY, VIETNAM','50 = 이름 + 주소 줄');

console.log('N72 支払期限');
const P=DOC.payDeadline37;
eq([P('AT 090 DAYS AFTER B/L DATE FOR 100 PERCENT INVOICE VALUE'),P('90 DAYS AFTER BILL OF LADING DATE FOR 100PCT INVOICE VALUE'),P('100PCT OF INVOICE VALUE WILL BE PAID AT 90 DAYS DAYS AFTER BILL OF LADING DATE AGAINST THE PRESENTATION OF DOCUMENTS'),
    P('AT 90 DAYS FROM BILL OF LADING DATE'),P('60 DAYS AFTER SHIPMENT DATE IN DUPLICATE'),P('AT SIGHT'),P('')],
   ['AT 90 DAYS AFTER B/L DATE','90 DAYS AFTER BILL OF LADING DATE','AT 90 DAYS AFTER BILL OF LADING DATE','AT 90 DAYS FROM BILL OF LADING DATE','60 DAYS AFTER SHIPMENT DATE','',''],
   'N72 = 핵심만 · 원문 낱말 (B/L ↔ BILL OF LADING 그대로 · FROM 그대로 · DATE 있음) · 割合 · 通数 · WILL BE PAID · 呈示 · 앞 0 · DAYS DAYS 뺌 · AT SIGHT = 없음');
ok(!/DAYS DAYS/.test(P('90 DAYS DAYS AFTER B/L DATE'))&&P('090 DAYS AFTER B/L DATE')==='90 DAYS AFTER B/L DATE','N72 오기 0 · 0 뺌');
eq(DOC.payDeadlineOf(LC({})),{value:'AT 90 DAYS AFTER B/L DATE', tag:'42C'},'N72 출처 = 42C');
eq(DOC.payDeadlineOf(LC({c42:'SIGHT'}).replace(':47A',':47A').replace('ALL DOCUMENTS MUST INDICATE LC NUMBER.','DRAFTS PAYABLE AT 120 DAYS AFTER SHIPMENT DATE.')),{value:'AT 120 DAYS AFTER SHIPMENT DATE', tag:'47A'},'N72 42C 에 없으면 47A 의 지불 문구 (원문 AT 그대로)');
ok(DOC.dlSame('AT 90 DAYS AFTER B/L DATE','90 DAYS AFTER B/L DATE')&&!DOC.dlSame('90 DAYS AFTER B/L FOR 100PCT','90 DAYS AFTER B/L DATE')&&DOC.dlSame('AT 90 DAYS FROM BILL OF LADING DATE','AT 90 DAYS FROM BILL OF LADING DATE FOR 100 PCT'),'M2 판정 = AT 유무 같음 · DATE 빠짐 = 다름 (N72 ①)');

console.log('N73 · R3 · R7 항구');
const pc=DOC.lcPodCands37(LC({}));
eq(pc,{tag:'44B', cands:['CAI MEP PORT IN VIETNAM','CAT LAI PORT IN VIETNAM','HO CHI MINH PORT IN VIETNAM','SP-ITC PORT IN VIETNAM'], raw:'CAI MEP OR CAT LAI OR SP-ITC OR HO CHI MINH PORT IN VIETNAM'},'후보 = 하나씩 (뒤 공통 낱말 붙임) · SP-ITC 맨 뒤');
eq(DOC.lcPodCands37(LC({b44:'CAT LAI PORT, HO CHI MINH CITY, VIETNAM'})).cands,['CAT LAI PORT, HO CHI MINH CITY, VIETNAM'],'R7 1 港 = 원문 그대로 (도시명 줄이지 않음)');
const R=(o)=>({fieldHead:null, rec:{sinos:{1:Object.assign({crcf9_place_of_delivery_1:'CAT LAI PORT IN VIETNAM', crcf9_place_of_delivery_2:'CAI MEP PORT IN VIETNAM', crcf9_place_of_delivery_3:'HO CHI MINH CAI MEP PORT IN VIETNAM', crcf9_port_of_discharge:'', crcf9_payment_deadline:'AT 090 DAYS AFTER B/L DATE FOR 100 PERCENT INVOICE VALUE', crcf9_address:''},o||{})}, basis:{1:{}}}});
const r1=R(); DOC.siLc37(r1,{raw:LC({}), bkgPods:['CAT LAI']}); const o1=r1.rec.sinos[1], b1=r1.rec.basis[1];
ok(['crcf9_place_of_delivery_1','crcf9_place_of_delivery_2','crcf9_place_of_delivery_3'].every(c=>o1[c]===''&&b1[c].pick&&/港を選んでください/.test(b1[c].flag)),'N73 후보 여럿 = 자동으로 고르지 않음 (빈칸 · 「港を選んでください」)',b1.crcf9_place_of_delivery_3);
eq(b1.crcf9_place_of_delivery_1.cands,[{v:'CAI MEP PORT IN VIETNAM',bkg:false},{v:'CAT LAI PORT IN VIETNAM',bkg:true},{v:'HO CHI MINH PORT IN VIETNAM',bkg:false},{v:'SP-ITC PORT IN VIETNAM',bkg:false}],'N73 버튼 = L/C 원문 이름 · 「BKG の POD」 표시 · SP-ITC 맨 뒤');
ok(DOC.siFieldState({value:'', basis:b1.crcf9_place_of_delivery_1}).s==='check','N73 状態 = 要確認');
ok(!Object.values(o1).some(v=>/HO CHI MINH CAI MEP/.test(v)),'R3 두 항구 섞기 0 (토르_36 실례 「HO CHI MINH CAI MEP PORT」 없어짐)');
ok(o1.crcf9_payment_deadline==='AT 90 DAYS AFTER B/L DATE'&&/N72/.test(b1.crcf9_payment_deadline.basis),'N72 추천 직후에 패턴',o1.crcf9_payment_deadline);
ok(!(o1.crcf9_address||'').trim()&&!/:50/.test((b1.crcf9_address||{}).basis||''),'R6 (v0.38 N76): siLc37 은 Notify 주소를 안 건드림 (siNotify38 = 46A · 시험 v38.js)');
const r2=R({crcf9_place_of_delivery_1:'CAT LAI PORT, VIETNAM', crcf9_place_of_delivery_2:'', crcf9_place_of_delivery_3:'', crcf9_address:'KEEP'}); DOC.siLc37(r2,{raw:LC({b44:'CAT LAI PORT, HO CHI MINH CITY, VIETNAM'})});
ok(r2.rec.sinos[1].crcf9_place_of_delivery_1==='CAT LAI PORT, HO CHI MINH CITY, VIETNAM'&&r2.rec.sinos[1].crcf9_address==='KEEP','R7 줄인 항구 → L/C 원문 · R6 값 있으면 그대로');
const r3=R(); DOC.siLc37(r3,{raw:''}); ok(r3.rec.sinos[1].crcf9_place_of_delivery_3==='HO CHI MINH CAI MEP PORT IN VIETNAM','이미지 L/C (글자 없음) = 손대지 않음');
ok(DOC.podInCands('CAT LAI PORT IN VIETNAM',pc.cands)&&!DOC.podInCands('HO CHI MINH CAI MEP PORT IN VIETNAM',pc.cands),'M2 후보 안 = 일치 · 섞은 이름 = 아님');

console.log('화면 · 쓰기 경로');
ok(/data-pick="'\+esc\(c\.v\)\+'"/.test(HTML)&&/el\.value=b\.dataset\.pick; el\.dispatchEvent\(new Event\('input'/.test(HTML),'S/I 탭 후보 버튼 → 그 칸에 그대로 (입력 이벤트 · 쓰기는 「COMPASS に書き込む」 뒤)');
ok(/DOC\.siLc37\(out,\{raw:out\.lcSecRaw, bkgPods:/.test(HTML),'siRecommend 끝에 v0.37 규칙');
ok(/t0=DOC\.lc42\(L&&L\.lc\), t=DOC\.payDeadline37\(t0\)\|\|t0;/.test(HTML),'siDeadlineApply (推薦 · 前回 · 仮 S/I) = N72 패턴');
const fn=(h,n)=>{ const i=h.indexOf('async function '+n+'('); return i<0?'':h.slice(i,h.indexOf('\n}\n',i)); };
let old=''; try{ old=cp.execFileSync('git',['show','8eba72a:index.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:64e6}); }catch(e){}
if(old){ ['siWrite','dvWrite','siWrite0'].forEach(n=>ok(fn(HTML,n)===fn(old,n),'바꾸지 않음 = '+n+' (v0.36.1 과 같음)'));
  ['MAIL30','ACL_MAIL','MAIL19'].forEach(k=>{ const re=new RegExp('const '+k+' *= *\\{[\\s\\S]*?\\n  \\};'); const x=(HTML.match(re)||[''])[0], y=(old.match(re)||[''])[0]; ok(x&&x===y,'문구 '+k+' 같음'); }); }

console.log('a1 엔진 v0.13 (커밋 고정 · sha256)');
const m=HTML.match(/const A1_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})', ver:'0\.1[34]'\}/); ok(!!m,'A1_ENGINE = v0.13 이상 (v0.38 = v0.14) · 40 자리 커밋 · sha256');
let ENG=null; const repo=process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND');
if(m){ try{ ENG=cp.execFileSync('git',['-C',repo,'show',m[1]+':a1_bench.html'],{maxBuffer:1<<27}); }catch(e){} }
if(ENG){ ok(crypto.createHash('sha256').update(ENG).digest('hex')===m[2],'sha256 = 커밋의 a1_bench.html'); const T=ENG.toString('utf8');
  ['R1 crcf9_invoicetext','R2 crcf9_bencert_text','R3 crcf9_place_of_delivery','R4 cr49f_payment_terms','R5 crcf9_consignee','R6 crcf9_notify_party · crcf9_address','R7 港の文言','R8 銀行名','crcf9_payment_deadline (支払期限'].forEach(k=>ok(T.indexOf('- '+k)>=0,'조립 규칙 '+k));
  ok(/【L\/C 原文の欄 \(コードで切り出し/.test(T)&&/lcSec:lcp\.image\?'':A1C\.lcSectionText\(r2RawForCheck\(lcp\)\)/.test(T),'조립 입력에 L/C 원문의 칸 (画像 L/C = なし)');
  const A1C=new Function(T.match(/<script id="a1-core">([\s\S]*?)<\/script>/)[1]+';return A1C;')(); eq(A1C.lcSections(LC({})).map(s=>s.tag),S0.map(s=>s.tag),'a1 lcSections = DOC.lcSections (같은 자르기)'); }
else console.log('  (CONTRACT_SEND 클론 없음 — 엔진 안 문구 확인 생략)');
console.log(`\nv37 pass ${pass} fail ${fail}`); process.exitCode=fail?1:0;
