/* v0.32 시험 (지시서 THOR_30 · S1 ~ S4) — 가짜 데이터 · 가짜 번호 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0 · COMPASS 쓰기 0. node v32.js [html]
   S1 띄우는 조건 (LC 제외 · +24 시간 · S/I 있으면 안 띄움 · 다 나간 계약 제외 · 기한 = CY CUT 전날) / S2 3 건 같음 · 다름 · 1 · 2 건 · 계약 칸 그대로 /
   S3 PO 番号待ち 생김 · 사라짐 · PO = 계약번호 바이어는 아님 / S4 베트남 번호 늘 要確認 · 이력 · 다른 나라 아님 · DEPOSIT 아님 / L/C (仮 S/I) 결과 = v0.31 과 같음 */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const core=h=>new Function('module',h.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const DOC=core(HTML);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V32, at=DOC.at;
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.3[2-5](?:\.1)?<\/title>/.test(HTML)&&/version:'0\.3[2-5](?:\.1)?'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.32 · 푸터');

console.log('S1 자동으로 띄우기');
const NOW=at('2026-11-26','10:00'), T0=o=>Object.assign({no:'LRS-2699ZZ4', pay:'TT', created:'2026-11-24T23:00:00Z', sis:[], hist:3, poKind:'ctno', cut:'2026-12-03', allShipped:false},o||{});
const s1=DOC.ttTodo(T0(),NOW);
ok(s1&&s1.gkey==='sitt'&&s1.zone==='do'&&s1.what==='S/I 作成（T/T）— 確認して登録'&&DOC.dayOf(s1.due)==='2026-12-02'&&DOC.hmOf(s1.due)==='18:00'&&DOC.reqRow(s1),'S1 T/T · +24 시간 · S/I 없음 = 「S/I 作成（T/T）— 確認して登録」 · 要対応 · 기한 = CY CUT 전날',s1);
ok(DOC.ttTodo(T0({pay:'LC'}),NOW)===null,'S1 L/C 계약 = 안 띄움 (지금 「推薦を作る」 그대로)');
ok(DOC.ttTodo(T0({created:'2026-11-25T23:30:00Z'}),NOW)===null,'S1 입력 뒤 24 시간 전 = 안 띄움 (PO 를 나중에 넣는 바이어 · 형님 D1 「하루정도 지난후」)');
ok(DOC.ttTodo(T0({created:'2026-11-25T00:59:00Z'}),NOW)!==null,'S1 24 시간 지남 = 띄움 (일본 시간)');
ok(DOC.ttTodo(T0({sis:[{crcf9_sino:1, crcf9_po_vo:'X'}]}),NOW)===null,'S1 S/I 있음 = 안 띄움');
ok(DOC.ttTodo(T0({allShipped:true}),NOW)===null,'S1 다 나간 계약 = 안 띄움');
const s1n=DOC.ttTodo(T0({cut:''}),NOW); ok(s1n.due==null&&s1n.dueText==='—'&&DOC.todoGroup(s1n,NOW)==='today','S1 CY CUT 없음 = 기한 없음 (노랑)',s1n);
const s1d=DOC.ttTodo(T0({pay:'DP'}),NOW); ok(s1d.what==='S/I 作成（D/P）— 確認して登録','S1 D/P 도 같음',s1d.what);
const s1h=DOC.ttTodo(T0({hist:0}),NOW); ok(/前回の S\/I なし — 手で作成/.test(s1h.why)&&s1h.noHist,'S1 같은 바이어 이력 0 = 「前回の S/I なし — 手で作成」',s1h.why);
ok(DOC.todoGroup(DOC.ttTodo(T0({cut:'2026-11-26'}),NOW),NOW)==='late','S1 CY CUT 전날 지남 = 빨강');
ok(DOC.TODO_RULES.TGROUPS.some(g=>g[0]==='sitt'&&g[1]==='do'),'S1 묶음 sitt (やること)');

console.log('S2 직전 3 건 비교 (모든 머리 칸)');
const H=(n,o)=>Object.assign({crcf9_sino:1, crcf9_consignee:'SAMPLE BUYER CO., LTD.', crcf9_notify_party:'SAME AS CONSIGNEE', crcf9_bl_text1:'WASTE PAPER#HS CODE 47079000', crcf9_po_vo:'LRS-2699ZZ'+n, crcf9_vo_no:'', cr49f_payment_terms:'CFR', crcf9_payment_deadline:'T/T 100PCT', cr49f_lc_no:''},o||{});
const P=(n,o)=>({no:'LRS-2699ZZ'+n, date:'2026-0'+n+'-01', sis:[H(n,o&&o(n))]});
const r3=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(1),P(2),P(3)], sale:[], term:'CFR', pod:'', country:'KOREA'}), b3=r3.rec.basis[1];
ok(b3.crcf9_consignee.ok==='一致'&&b3.crcf9_consignee.basis===V.SAME3&&DOC.siFieldState({value:r3.rec.sinos[1].crcf9_consignee, basis:b3.crcf9_consignee}).s==='match','S2 3 건 같음 = 그대로 (一致 · 最近 3 件 同じ)',b3.crcf9_consignee);
const rd=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(1),P(2),P(3,()=>({crcf9_notify_party:'OTHER NOTIFY'}))], sale:[], term:'CFR', pod:'', country:'KOREA'}), bd=rd.rec.basis[1].crcf9_notify_party;
ok(rd.rec.sinos[1].crcf9_notify_party==='OTHER NOTIFY'&&/^要確認 · 最近 3 件で違う \(/.test(bd.flag)&&DOC.siFieldState({value:'OTHER NOTIFY', basis:bd}).s==='check','S2 다름 = 직전 값 + 要確認 · 最近 3 件で違う',bd);
const r1=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(3)], sale:[], term:'CFR', pod:'', country:'KOREA'}), r2=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(2),P(3)], sale:[], term:'CFR', pod:'', country:'KOREA'});
eq([r1.rec.basis[1].crcf9_consignee.flag, r2.rec.basis[1].crcf9_consignee.flag],['要確認 · 前回 1 件のみ','要確認 · 前回 2 件のみ'],'S2 1 · 2 건뿐 = 要確認 · 前回 n 件のみ');
ok(/^要確認 · Trade Term（前回: /.test(b3.cr49f_payment_terms.flag||'')&&!b3.crcf9_payment_deadline.flag&&r3.rec.sinos[1].cr49f_lc_no===''&&b3.cr49f_lc_no.ok==='一致','S2 계약에서 오는 칸 (支払 · L/C 공란) = 그대로 · Trade Term = v0.33 늘 要確認',[b3.cr49f_payment_terms,b3.cr49f_lc_no]);
ok(/PO = 契約番号/.test(b3.crcf9_po_vo.flag)&&r3.rec.sinos[1].crcf9_po_vo==='LRS-2699ZZ4','S2 PO · VO = 지금 규칙 (ctno)',b3.crcf9_po_vo);
const rt=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(1),P(2),P(3)], sale:[], term:'FOB', pod:'', country:'KOREA'}); ok(/今回の契約: FOB/.test(rt.rec.basis[1].cr49f_payment_terms.flag),'S2 Trade Term 다름 = 要確認 (v0.33 K2 · 이번 계약 조건 표시)');
ok(r3.tt.n3===3&&eq.length,'최근 3 건 수');

console.log('S3 PO 番号待ち');
const W=o=>DOC.ttTodo(T0(Object.assign({sis:[{crcf9_sino:1, crcf9_po_vo:''}], poKind:'changes'},o||{})),NOW);
const w=W(); ok(w&&w.what==='PO 番号待ち（バイヤーから）'&&w.zone==='wait'&&w.gkey==='w_buyer'&&w.due==null&&!w.nudge&&!DOC.reqRow(Object.assign({},w,{group:DOC.todoGroup(w,NOW)})),'S3 PO 매번 바뀜 · S/I 등록 · PO 빈칸 = ◐ PO 番号待ち (기한 · 催促 없음 · 要対応 아님)',w);
ok(W({sis:[{crcf9_sino:1, crcf9_po_vo:'9999/1126'}]})===null,'S3 PO 가 채워지면 사라짐');
ok(W({poKind:'ctno'})===null&&W({poKind:'blank'})===null&&W({poKind:'same'})===null,'S3 PO = 계약번호 · 늘 빈칸 · 늘 같음 = 아님');
ok(!/PO.{0,20}(mail|メール).{0,40}(検知|detect)/i.test(HTML.slice(HTML.indexOf('const V32 = {'),HTML.indexOf('function ttTodo('))),'S3 PO 메일 감지 = 하지 않음 (형님 D4)');

console.log('S4 베트남 라이선스 번호');
eq(DOC.licLines('SAMPLE CO.#TAX CODE: 0000000001#ADD: TEST ROAD'),['TAX CODE: 0000000001'],'licLines TAX CODE');
eq(DOC.licLines('IMPORT LINECE NUMBER.:999/GPMT-BTNMT DATED ON JUL 1, 2099\nENVIRONMENTAL LICENSE NUMBER: 998/GPMT-BTNMT'),['IMPORT LINECE NUMBER.:999/GPMT-BTNMT DATED ON JUL 1, 2099','ENVIRONMENTAL LICENSE NUMBER: 998/GPMT-BTNMT'],'licLines 오타 LINECE · ENVIRONMENTAL LICENSE');
eq(DOC.licLines('DEPOSIT NUMBER: 999999#TAX ID 0000000002#HS CODE 47079000'),['TAX ID 0000000002'],'licLines DEPOSIT · HS CODE = 아님');
const VN=n=>({crcf9_bl_text2:'IMPORT LICENSE NO.: '+n+'/GPMT-BTNMT DATE 01/01/2099'});
const v3=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(1,()=>VN(111)),P(2,()=>VN(111)),P(3,()=>VN(111))], sale:[], term:'CFR', pod:'', country:'VIETNAM'}), vb=v3.rec.basis[1].crcf9_bl_text2;
ok(/^要確認 · ライセンス番号（前回 IMPORT LICENSE NO\.: 111\/GPMT/.test(vb.flag)&&!/履歴/.test(vb.flag)&&DOC.siFieldState({value:v3.rec.sinos[1].crcf9_bl_text2, basis:vb}).s==='check','S4 베트남 = 3 건 같아도 番号 = 要確認 (번호 보여 줌)',vb);
const vh=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(1,()=>VN(105)),P(2,()=>VN(111)),P(3,()=>VN(111))], sale:[], term:'CFR', pod:'', country:'VIETNAM'}).rec.basis[1].crcf9_bl_text2;
ok(/履歴: IMPORT LICENSE NO\.: 105\/GPMT.* → IMPORT LICENSE NO\.: 111\/GPMT/.test(vh.flag),'S4 3 건 안에서 바뀜 = 이력 (옛 → 새)',vh.flag);
const vk=DOC.ttRecommend({no:'LRS-2699ZZ4', prev:[P(1,()=>VN(111)),P(2,()=>VN(111)),P(3,()=>VN(111))], sale:[], term:'CFR', pod:'', country:'KOREA'}).rec.basis[1].crcf9_bl_text2;
ok(vk.ok==='一致'&&!vk.flag,'S4 베트남 밖 = 3 건 같으면 一致',vk);
ok(v3.rec.basis[1].crcf9_consignee.ok==='一致','S4 번호 없는 칸 = S2 그대로',v3.rec.basis[1].crcf9_consignee);

console.log('L/C 계약 · 仮 S/I = v0.31 과 같음');
let old=''; try{ old=cp.execFileSync('git',['show','b5d286b:index.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:64e6}); }catch(e){}
if(old){ const O=core(old); const inp={no:'LRS-2699ZZ4', prev:[P(1),P(2),P(3,()=>({crcf9_notify_party:'OTHER', cr49f_lc_no:'TESTLC9'}))], sale:[{_cr49f_item_id_value:'g1', item:'TEST ITEM'}], term:'CFR', pod:'', lcTent:true, country:'VIETNAM'};
  eq(JSON.stringify(DOC.ttRecommend(Object.assign({},inp)).rec),JSON.stringify(O.ttRecommend(Object.assign({},inp)).rec),'仮 S/I (L/C 未着) 결과 = v0.31 과 문자 단위 같음 (S2 · S4 는 T/T 만)');
  const fn=(h,n)=>{ const i=h.indexOf('async function '+n+'('); return i<0?'':h.slice(i,h.indexOf('\n}\n',i)); };
  ['siRecommend','siWrite','dvWrite'].forEach(n=>ok(fn(HTML,n)&&fn(HTML,n)===fn(old,n),'L/C 추천 · 쓰기 경로 '+n+' = v0.31 과 같음'));
  ['MAIL30','ACL_MAIL','MAIL19'].forEach(k=>{ /* v0.35: 괄호 단위로 그 객체만 (전 = 다음 「  };」 까지 — 뒤의 SAVE_RULES 까지 잘렸음) */ const obj=S=>{ const i=S.indexOf('const '+k+' = {'); if(i<0) return ''; let d=0; for(let p=S.indexOf('{',i);p<S.length;p++){ if(S[p]==='{') d++; else if(S[p]==='}'&&!--d) return S.slice(i,p+1); } return ''; }; const x=obj(HTML), y=obj(old); ok(x&&x===y,'문구 '+k+' 문자 단위 같음'); }); }
else console.log('  (b5d286b 없음 — 비교 생략)');

console.log('쓰기 0');
const tf=HTML.slice(HTML.indexOf('function ttTodoRows('), HTML.indexOf('\n  return out; }', HTML.indexOf('function ttTodoRows(')));
ok(tf.length>100&&!/dvWrite|spPut|graphMail|stateWrite|dvAll|dvIn|fetch\(/.test(tf),'ttTodoRows = 읽은 것만 (COMPASS · SharePoint 새로 읽기 · 쓰기 0)');
ok(/out\.push\(\.\.\.ttTodoRows\(\)\)/.test(HTML),'todoRows 에 계약 줄');
ok(/!S\.siRec\[id\]&&!S\.siBusy\[id\]&&!isLcCt\(id\)&&!\(S\.sis\[id\]\|\|\[\]\)\.length&&!S\.siAuto\[id\]\)\{ S\.siAuto\[id\]=true; siRun\(id\); \}/.test(HTML),'S1 S/I 탭 = T/T · S/I 없음이면 자동 계산 (쓰기는 「COMPASS に書き込む」 뒤만)');

console.log(`\nv32 pass ${pass} fail ${fail}`); process.exitCode=fail?1:0;
