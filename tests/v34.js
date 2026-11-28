/* v0.34 시험 (지시서 THOR_32 · 형님 N55 ~ N61) — 가짜 데이터 · 가짜 번호 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0 · COMPASS 쓰기 0. node v34.js [html]
   A1 자동 저장 조건 · A2 같은 묶음 · A3 取り消す 문지기 / B1 ~ B8 / 띠 / D1 ~ D4 / Part ⑤ NAMSUNG · PAN OCEAN / Part ⑥ L/C 공장 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V34, at=DOC.at;
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.3(?:4\.1|5|6|6\.1|7|8|9)<\/title>/.test(HTML)&&/version:'0\.3(?:4\.1|5|6|6\.1|7|8|9)'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.34 · 푸터');

console.log('A1 · A2 · A3 保存の入口 자동 저장 (N55)');
const R=o=>Object.assign({res:'新規', iv:'NTE2699-01', target:'NTE2699-01_ACL.pdf', cands:['NTE2699-01'], name:'NTE2699-01 仮ACL.pdf', subject:'ACL', kind:DOC.saveKind('NTE2699-01 仮ACL.pdf','NACCS')},o||{});
ok(DOC.autoOk(R()),'A1 Invoice 가 파일 이름에 · 후보 1 · 종류가 이름으로 · 새 파일 = 자동');
ok(DOC.autoOk(R({name:'仮ACL.pdf', subject:'[ACL] NTE2699-01 TESTBK1'})),'A1 Invoice 가 메일 제목에 = 자동');
ok(!DOC.autoOk(R({name:'scan001.pdf', subject:'NTE2699-01'})),'A1 종류가 이름으로 안 보임 (중身만) = 물음');
ok(!DOC.autoOk(R({cands:['NTE2699-01','NTE2699-02']})),'A1 Invoice 여럿 = 물음');
ok(!DOC.autoOk(R({name:'仮ACL.pdf', subject:'ACL TESTBK1'})),'A1 Invoice 가 이름 · 제목에 없음 (PDF 의 Booking 으로만) = 물음');
ok(!DOC.autoOk(R({res:'重複'}))&&!DOC.autoOk(R({res:'同じ内容'})),'A1 같은 내용 (해시) 이미 있음 = 저장 안 함');
ok(!DOC.autoOk(R({dup:true})),'A2 같은 묶음 · 같은 이름 겹침 = 물음');
ok(DOC.autoOk(R({res:'2版目', target:'NTE2699-01_ACL REV.pdf'})),'A1 새 판 (REV) = 자동 (덮어쓰기 0)');
ok(/^古紙\/-\. AI 活用\/D-00\/doc_tool\/autosave\/\d{8}\/\d{8}-\d{6}_NTE2699-01\.json$/.test(DOC.autoLogPath('NTE2699-01')),'A3 기록 = doc_tool/autosave/{日}/',DOC.autoLogPath('NTE2699-01'));
const T=[{path:'古紙/-. 古紙書類/▲ 書類作成中/NTE2699-01/NTE2699-01_ACL.pdf'}];
ok(DOC.guardUndo(T[0].path,T)===true,'A3 取り消す = 오늘 자동 저장한 파일만');
let thr=null; try{ DOC.guardUndo('古紙/-. 古紙書類/▲ 書類作成中/NTE2699-01/NTE2699-01_FD.pdf',T); }catch(e){ thr=e.message; } ok(/今日の自動保存ではありません/.test(thr||''),'A3 다른 파일 = 막음',thr);
thr=null; try{ DOC.guardUndo(T[0].path,[{path:T[0].path, undone:true}]); }catch(e){ thr=e.message; } ok(!!thr,'A3 이미 취소한 것 = 막음');
ok(/const saveAuto = \(\) => lsGet\(DOC\.V34\.AUTO_KEY,'1'\)==='1'/.test(HTML)&&/on=lsGet\(DOC\.V34\.PT_AUTO_KEY,'1'\)==='1'/.test(HTML),'A1 · D3 자동 쓰기 = v0.34.1 기본 入 (형님 Q1 · 관리자 설정으로 切)');
ok(/async function saveAutoPass\(\)/.test(HTML)&&/if\(saveAuto\(\)&&!SAVE\.scanning&&(?:SAVE\.undoneOk&&)?DOC\.autoOk\(row\)\) await saveDo\(row,\{auto:true\}\)/.test(HTML),'A2 메일을 다 읽은 뒤 묶음을 받은 순으로 다시 판단 → 자동');
ok(/if\(auto&&\/409\|nameAlreadyExists\|already exists\/i\.test\(e\.message\)\)\{ row\.res='再確認'/.test(HTML),'A4 같은 이름 (다른 사람이 먼저) = 건너뜀 · 겹쳐 쓰지 않음');

console.log('B1 ~ B3 契約 화면 (N56-1 · 11 · 12)');
ok(!/T\.filter\(r=>r\.ctRow\)\.forEach\(r=>all\.push/.test(HTML)&&/if\(r\.ctRow\) return; const b=bOf\(r\);/.test(HTML),'B2 계약 할 일 (S/I 作成 · PO 番号待ち) = Invoice 화면에서 뺌');
ok(/\|\|\(byCt\[r\.id\]\|\|\[\]\)\.some\(DOC\.reqRow\)\|\|\(byCt\[r\.id\]\|\|\[\]\)\.some\(t=>t\.poWait\)/.test(HTML),'B1 契約 要対応 = S/I 作成 · PO 番号待ち 포함');
ok(!DOC.V28.CT_COLS.some(c=>c[0]==='etd'),'B3 契約 화면 ETD 칸 없음');
const rows=[{ct:'LRS-2699ZZ1', date:'2026-10-01', latest:'2026-12-20', buyer:'B'},{ct:'LRS-2699ZZ2', date:'2026-11-01', latest:'2026-12-10', buyer:'A'},{ct:'LRS-2699ZZ3', date:'2026-09-01', latest:'', buyer:'C'}];
eq(DOC.sortCt34(rows,'date').map(r=>r.ct),['LRS-2699ZZ2','LRS-2699ZZ1','LRS-2699ZZ3'],'B3 기본 = 契約日 새것 위');
eq(DOC.sortCt34(rows,'latest').map(r=>r.ct),['LRS-2699ZZ2','LRS-2699ZZ1','LRS-2699ZZ3'],'B3 最終船積日 (빈칸 뒤)');
eq(DOC.sortCt34(rows,'buyer').map(r=>r.ct),['LRS-2699ZZ2','LRS-2699ZZ1','LRS-2699ZZ3'],'B3 バイヤー');
eq(V.CT_SORTS.map(x=>x[0]),['date','latest','buyer'],'B3 「並び」 = 契約日 · 最終船積日 · バイヤー');

console.log('B4 Invoice 번호 다름 (N56-4)');
const M=(subj,t)=>({subj, t:t||at('2026-11-24','10:00')});
const mi=DOC.ivMismatch({iv:'NTE2699-09', bkg:'TESTBK130', bl:'', mails:[M('【通関書類送付_NTE2699-07】Re: 新規通関依頼:BKG#TESTBK130, CUT11/25')], ownIvs:['NTE2699-09']});
ok(mi&&mi.other==='NTE2699-07'&&mi.key==='TESTBK130','B4 같은 BKG# 메일의 Invoice ≠ COMPASS = 찾음',mi);
ok(!DOC.ivMismatch({iv:'NTE2699-09', bkg:'TESTBK130', mails:[M('[Deposit Request for NTE2699-09 & NTE2699-07] TESTBK130')], ownIvs:['NTE2699-09']}),'B4 자기 Invoice 도 적힌 메일 = 아님');
ok(!DOC.ivMismatch({iv:'NTE2699-09', bkg:'TESTBK130', mails:[M('[선적서류안내]#LRS-2699ZZ1_NTE2699-01')], ownIvs:['NTE2699-09']}),'B4 BKG# 없는 메일 = 아님');
ok(!DOC.ivMismatch({iv:'NTE2699-09', bkg:'TESTBK130', mails:[M('BKG#TESTBK130 NTE2699-08')], ownIvs:['NTE2699-09','NTE2699-08']}),'B4 그 번호의 船積이 표에 있음 = 아님');
const ex=DOC.todoExtra({iv:'NTE2699-09', ivMis:mi}, at('2026-11-27','10:00')).find(r=>r.ivMis);
ok(ex&&ex.what==='⚠ Invoice 番号が違う（COMPASS NTE2699-09 · メール NTE2699-07）'&&DOC.reqRow(ex),'B4 要対応 「⚠ Invoice 番号が違う（COMPASS … · メール …）」',ex);

console.log('B5 · B6 단계 칸 ↔ 次にやること (N56-5 · 6)');
const am=DOC.aclMailIn([{uses:['ACL'], skind:'otsu', att:['許可書.pdf','仮ACL.pdf'], t:at('2026-11-13','11:36')},{uses:['ACL'], skind:'otsu', att:['TESTBK1 請求書.pdf'], t:at('2026-11-18','14:01')}]);
ok(am&&am.att==='仮ACL.pdf'&&am.t===at('2026-11-13','11:36'),'B5 乙仲 ACL 첨부 메일 = 찾음 (請求書 는 아님)',am);
ok(!DOC.aclMailIn([{uses:['ACL'], skind:'other', att:['仮ACL.pdf'], t:1}]),'B5 乙仲 · 船社 아닌 곳 = 아님');
const C=(o)=>Object.fromEntries(Object.entries(o).map(([k,s])=>[k,{s}]));
eq(DOC.cellPlus(C({customs:'done', acl:'todo', bl:'todo'}),[{gkey:'draft', what:'B/L Draft 確認 → 運賃送金'}]),['ACL'],'B6 ACL ● 인데 할 일은 B/L Draft = 「＋ACL」');
eq(DOC.cellPlus(C({acl:'todo'}),[{gkey:'acl', what:'ACL 確認 → 本登録依頼'}]),[],'B6 할 일에 있는 단계 = 안 붙임');
eq(DOC.cellPlus(C({ins:'todo', rr:'todo'}),[{gkey:'insrr', what:'保険'}]),['RR'],'B6 保険 · RR 중 할 일에 없는 쪽만');
ok(/'\+\(p\.gkey==='fd'\?fdTodoBadge\(iv\):''\)\+more\+v8Plus\(o\)\+btn/.test(HTML),'B6 次にやること 에 「＋…」');

console.log('B7 · D1 · D2 · D3 振込 · DEP (N56-7 · N58)');
const sg=o=>Object.assign({bmail:null, bmailSrc:'', depoReq:null, depoRep:null},o||{});
eq(DOC.autoPay({carrier:'NAMSUNG'},sg(),'2026-11-27').txt,'後払い','B7 후불 = 「後払い」');
eq(DOC.autoPay({carrier:'SAMPLE LINE', term:'FOB'},sg(),'2026-11-27').txt,'後払い','FOB = 「後払い」');
const p1=DOC.autoPay({carrier:'SAMPLE LINE', payDate:'2026-11-24'},sg(),'2026-11-27'); ok(p1.txt==='✓ 11/24（COMPASS）'&&p1.val==='確認済'&&p1.by==='COMPASS','D1 COMPASS 支払日 = 「✓ MM/DD（COMPASS）」',p1);
const p2=DOC.autoPay({carrier:'SAMPLE LINE'},sg({bmail:at('2026-11-25','15:03'), bmailSrc:'mail'}),'2026-11-27'); ok(p2.txt==='✓ 11/25（メール）'&&p2.by==='mail','D1 振込明細 메일 = 「✓ MM/DD（メール）」',p2);
const p3=DOC.autoPay({carrier:'SAMPLE LINE', payDate:'2026-12-01'},sg(),'2026-11-27'); ok(p3.val==null&&/予定/.test(p3.txt),'D1 앞날 支払日 = 予定 (값 안 씀)',p3);
eq(DOC.autoPay({carrier:'SAMPLE LINE'},sg(),'2026-11-27').txt,'—','D1 없음 = 「—」');
eq(DOC.autoDep({country:'KOREA'},sg()),null,'D2 베트남 아님 = 칸 없음');
eq(DOC.autoDep({country:'VIETNAM'},sg({depoReq:at('2026-11-20','10:00')})).txt,'依頼中 11/20','D2 Deposit 依頼 = 「依頼中 MM/DD」');
eq(DOC.autoDep({country:'VIETNAM'},sg({depoReq:at('2026-11-20','10:00'), depoRep:at('2026-11-21','10:00')})).val,'確認','D2 회신 = 「確認」');
eq([DOC.autoAhead('furikomi','未','確認済'),DOC.autoAhead('furikomi','確認済','確認済'),DOC.autoAhead('dep','確認','依頼中'),DOC.autoAhead('dep','依頼中','確認'),DOC.autoAhead('dep',undefined,'依頼中')],[true,false,false,true,true],'D3 앞 단계로만 (사람이 넣은 확인을 내리지 않음)');
ok(/async function ptAutoRun\(\)/.test(HTML)&&/DOC\.ptMerge\(t, c\.iv, c\.field, c\.value, c\.by, now\)/.test(HTML)&&/\{portal:true, ifMatch:meta\.eTag\}/.test(HTML),'D3 PORTAL = ptMerge · eTag · 그 Invoice 그 칸만 · updated_by = 自動（…）');
ok(/doc_tool_pt_auto_max/.test(HTML),'D3 관리자 상한 (시험용 · 처음 1 주)');

console.log('B8 날짜 · 띠 (N56-9 · N57)');
eq([DOC.ptDateS('2026-12-01','2026-11-27'),DOC.ptDateS('2027-01-15','2026-11-27')],['12/01','2027/01/15'],'B8 올해 MM/DD · 다른 해 2027/01/15');
eq(DOC.V28.BAND,{late:'late'},'띠 = 빨강 (期限切れ) 하나');
eq([DOC.bandOf('late'),DOC.bandOf('today'),DOC.bandOf('later'),DOC.bandOf('chase')],['late','','',''],'주황 · 파랑 띠 없음');
ok(V.BAND_NOTE==='左の赤 = 期限切れ'&&/esc\(DOC\.V34\.BAND_NOTE\)/.test(HTML),'「左の赤 = 期限切れ」 한 줄');

console.log('Part ⑤ NAMSUNG · PAN OCEAN (N59)');
const NOW=at('2026-11-27','10:00');
const S0=o=>Object.assign({sub:null, subKnown:false, acl:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, payPlan:false, bl:null, ins:null, rr:null, fd:null},o||{});
const X0=o=>Object.assign({iv:'NTE2699-01', country:'KOREA', term:'CFR', pay:'TT', carrier:'NAMSUNG', otsu:'', buyer:'', cut:'2026-11-20', cutAm:false, blDate:'', etd:'2026-11-30'},o||{});
const row=(x,s)=>{ const r=DOC.todoRow(X0(x),S0(s),NOW,null); if(r){ r.group=DOC.todoGroup(r,NOW); r.when=DOC.whenLabel(r,NOW); } return r; };
const n1=row({},{drafts:[at('2026-11-20','10:00')]}); ok(n1&&n1.what==='B/L ダウンロード（出港後に NAMSUNG サイトから）'&&n1.zone==='wait'&&!DOC.reqRow(n1)&&n1.when==='出港後','⑤ ETD 전 = ◐ 「出港後にダウンロード」',n1);
const n2=row({etd:'2026-11-27'},{drafts:[at('2026-11-20','10:00')]}); ok(n2&&n2.what==='B/L ダウンロード（NAMSUNG サイト）'&&n2.zone==='do'&&n2.group==='today'&&DOC.reqRow(n2)&&!n2.nudge,'⑤ ETD 당일부터 = 要対応 「B/L ダウンロード（NAMSUNG サイト）」 (재촉 아님)',n2);
const n3=row({carrier:'PAN OCEAN', etd:'2026-11-26'},{drafts:[at('2026-11-20','10:00')]}); ok(n3&&/PAN OCEAN サイト/.test(n3.what),'⑤ PAN OCEAN 도 같음',n3);
const n4=row({etd:'2026-11-26'},{drafts:[at('2026-11-20','10:00')], bl:at('2026-11-27','09:00'), blDate:'2026-11-26'}); ok(n4&&!/ダウンロード/.test(n4.what),'⑤ B/L PDF (受領) = 다음 단계',n4);
const n5=row({carrier:'SINOKOR', etd:'2026-11-26'},{drafts:[at('2026-11-20','10:00')]}); ok(n5&&!/ダウンロード/.test(n5.what),'⑤ 다른 후불 선사 = 그대로',n5);

console.log('Part ⑥ Thuan An 공장 = L/C (N60)');
const A=()=>({crcf9_sino:1, crcf9_consignee:'1111111111#801/GPMT-BTNMT#DEPOSIT#SAMPLE FACTORY ALPHA CO., LTD', crcf9_notify_party:'', crcf9_po_vo:'', crcf9_vo_no:'', cr49f_payment_terms:'CIF', cr49f_lc_no:'', crcf9_place_of_delivery_1:'CAT LAI PORT, VIETNAM', crcf9_port_of_discharge:'CAT LAI'});
const B=()=>Object.assign(A(),{crcf9_consignee:'2222222222#802/GPMT-BNNMT#DEPOSIT#SAMPLE FACTORY BETA CO., LTD'});
const P=(n,h)=>({no:'LRS-2699VN'+n, date:'2026-0'+n+'-01', sis:[h]}), prev=[P(4,A()),P(3,B()),P(2,A())];
const r1=DOC.ttRecommend({no:'LRS-2699VN5', prev, sale:[], term:'CIF', pod:'', pods:['CAT LAI'], country:'VIETNAM', lcText:'{"applicant":"SAMPLE FACTORY BETA CO., LTD MST 2222222222 BINH DUONG"}'}), b1=r1.rec.basis[1].crcf9_consignee;
ok(/2222222222#802/.test(r1.rec.sinos[1].crcf9_consignee)&&b1.fac.lc==='2222222222'&&/L\/C で確定/.test(b1.flag),'⑥ POD 로 못 정함 + L/C = L/C 의 MST 로 공장 자동',b1);
const r2=DOC.ttRecommend({no:'LRS-2699VN5', prev, sale:[], term:'CIF', pod:'', pods:['CAT LAI'], country:'VIETNAM', lcText:''}), b2=r2.rec.basis[1].crcf9_consignee;
ok(b2.fac&&b2.fac.cands&&/L\/C 着で確定$/.test(b2.flag),'⑥ L/C 전 = 공장 버튼 + 「L/C 着で確定」',b2.flag);
const prevD=[P(4,Object.assign(A(),{crcf9_place_of_delivery_1:'DA NANG', crcf9_port_of_discharge:'DA NANG'})),P(3,B())];
const r3=DOC.ttRecommend({no:'LRS-2699VN5', prev:prevD, sale:[], term:'CIF', pod:'', pods:['DA NANG'], country:'VIETNAM', lcText:'APPLICANT SAMPLE 2222222222'}), b3=r3.rec.basis[1].crcf9_consignee;
ok(/2222222222/.test(r3.rec.sinos[1].crcf9_consignee)&&/L\/C の工場と違う（POD では SAMPLE FACTORY ALPHA/.test(b3.flag),'⑥ POD 공장 ≠ L/C 공장 = L/C 쪽 + 「L/C の工場と違う」',b3.flag);

console.log('Part ⑦ T/T 첫 건 기록 (N61)');
ok(/await spPut\(bp, JSON\.stringify\(\{contract:no, contract_id:id, at, user:log\.user, current:cur, plan:ops\}\)\)/.test(HTML)&&/log\.verify=ver;/.test(HTML)&&/await spPut\(DOC\.logPath\(no,'si',d\), JSON\.stringify\(log\)\)/.test(HTML),'⑦ 「確認して登録」 전 (控え) · 쓴 것 · 다시 읽기 (verify) = doc_tool/si_backup · log 에 남음 (변경 0)');

console.log('화면 (가짜 세계)');
const W=X.world();
const w=await X.page(W,{first:true, ls:{doc_tool_who:'all'}}); const d=w.document, ev=s=>w.eval(s);
await X.until(()=>ev('TODO.mailSt')==='ok'||ev('TODO.mailSt')==='error',20000).catch(()=>{}); await X.until(()=>/読み込み完了/.test(ev('S.doneMsg')||''),20000).catch(()=>{}); await X.sleep(400); ev('render()'); await X.sleep(100);
ok(!d.querySelector('#dtTable select[data-f=furikomi]')&&!!d.querySelector('#dtTable .v34-auto'),'D1 振込 = 고르는 칸 없이 글자');
ok(!d.querySelector('#dtTable tr.v8-r[data-row=ct]'),'B2 Invoice 화면에 계약 줄 없음');
ok(!d.querySelector('#dtTable td.v8-bd.b-today, #dtTable td.v8-bd.b-soon'),'띠 = 주황 · 파랑 없음');
ok(/左の赤 = 期限切れ/.test(d.body.textContent),'「左の赤 = 期限切れ」 보임');
d.getElementById('dtBCt').click(); await X.sleep(200);
ok([...d.querySelectorAll('#dtTable thead th')].map(t=>t.textContent).indexOf('ETDC')<0&&[...d.querySelectorAll('#dtSort option')].map(o=>o.value).join()==='date,latest,buyer','B3 契約 화면 = ETD 없음 · 並び = 契約日 · 最終船積日 · バイヤー');
ok(!/[가-힣]/.test(HTML.match(/const V34 = \{[\s\S]*?\n  \};/)[0].replace(/\/\*[\s\S]*?\*\//g,'')),'V34 화면 글자 한글 0');

console.log((fail?'FAIL':'PASS')+' v34 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v34 예외',e&&e.stack||e); process.exit(1); });
