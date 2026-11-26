/* v0.17 시험 (지시서 THOR_9 D00 書類ツール v0.17) — 가짜 데이터만 · 가짜 거래처 이름 (SAMPLE · TEST) · 네트워크 없음. node v17.js [html]
   H1 通関依頼済 만 · H2 「✓ 保存」 · H4 nextLink · G3 FD 済 = 参考 · G4 XX = 仮 · E1 別の契約番号 · G10 엔진 6d57a01 + 스캔 ACL 저장본
   B9 保存の入口 FD · TO BANK · IV · PL · F1 待ち / 未 · F2 保険 · F4 일본 시간 · F6 L/C 요약 · F8 実例 · 1-2 문구 표 각 줄 */
const fs=require('fs'),path=require('path'),nodeCrypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), BF=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const thr=(f,m)=>{ let t=false; try{ f(); }catch(e){ t=true; } ok(t,m); };
const T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z', V=DOC.V17, PT=DOC.PT, OUT=DOC.OUT_ROOT, WIP='古紙/-. 古紙書類/▲ 書類作成中';
const qa=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const sha=b=>nodeCrypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const JSP=/[　-ヿ㐀-鿿！-＊，-｠] +[　-ヿ㐀-鿿！-＊，-｠]/;   // ＋ (U+FF0B) = 区切りの記号 — 前後の空白はそのまま

(async()=>{
console.log('1 규칙 (doc-core)');
/* H1 */
{ const bk=(iv,etd,cut)=>({cr49f_invoice_no:iv, cr49f_etd:etd, crcf9_bl_etd:etd, cr49f_cy_cut:cut});
  const B=[bk('NAA2611-01',D(3),D(1)),bk('NAA2611-02',D(4),D(2)),bk('NAA2608-03',D(-20),'2026-08-10T00:00:00Z'),bk('LAA2611-01',D(3),D(1))];
  eq(DOC.ptRows(B,{},T,{'NAA2611-01':{tsukan_irai:true},'NAA2611-02':{tsukan_irai:false}}).map(b=>b.cr49f_invoice_no),['NAA2608-03','NAA2611-01'],'H1 records → 通関依頼済 (tsukan_irai) · CY_CUT ≤ 2026-08-17 옛 건만 · L 빼기 그대로');
  eq(DOC.ptRows(B,{},T).map(b=>b.cr49f_invoice_no).length,3,'H1 records 없이 부르면 v0.16 과 같음 (PORTAL 조건)');
  ok(PT.TOP===undefined,'H4 500 상한 없음 (PT.TOP 없음)'); }
/* G4 */
{ const si=v=>({cr49f_lc_no:v});
  eq(['TESTLC66XX DATED ON JUN XX, 2026','TESTLC825XXX DATED ON NOV 19, 2026','XX','x x','TESTLC1','MAX X'].map(v=>DOC.siLcTent([si(v)])),[true,true,true,false,false,false],'G4 L/C 번호에 X 2 개 이상 연속 = 仮 S/I (XXX 포함 · 공백 무시는 XXX 만 → 「x x」 아님) · 「MAX X」 아님');
  const c=DOC.judgeCt({pay:'LC', ct:'LRS-2607ZZ1', lcFiles:[], lcOrig:[], sis:[Object.assign(si('TESTLC66XX DATED ON JUN XX, 2026'),{crcf9_sino:1, crcf9_po_vo:'P1', crcf9_vo_no:'XX'})]});
  ok(c.si.tent&&c.si.lcTent&&!/LC No 未確定/.test(c.si.why)&&/仮 S\/I（L\/C 番号 XX）/.test(c.si.why),'G4 「LC No 未確定 (XX)」 표시는 仮 S/I 로 합침 · 중량 · Bales 의 XX 는 상관없음',c.si); }
/* E1 */
{ eq(DOC.otherCts('BENE CERT … CONTRACT NUMBER (LRS-2699XS2) … LRS-2699XS1 · LRS-2699XS2','LRS-2699XS1'),['LRS-2699XS2'],'E1 다른 계약번호만 (같은 번호 · 중복 빼기)');
  eq(DOC.otherCts('NO CONTRACT HERE · XLRS-2699XS2 · LRS-2699XS22','LRS-2699XS2'),['LRS-2699XS22'],'E1 앞뒤가 영숫자면 다른 번호 (LRS-2699XS22 ≠ LRS-2699XS2)');
  const si={crcf9_sino:1, cr49f_lc_no:'TESTLC1', crcf9_consignee:'C', crcf9_notify_party:'N', crcf9_bencert_text:'WE CERTIFY … CONTRACT NUMBER (LRS-2699XS2)'};
  const c=DOC.judgeCt({pay:'TT', ct:'LRS-2699XS1', sis:[si]}); ok(c.si.s==='diff'&&/^別の契約番号: LRS-2699XS2/.test(c.si.why)&&c.si.otherCt[0]==='LRS-2699XS2','E1 S/I 칸 = 相違 「別の契約番号: LRS-2699XS2」',c.si);
  ok(DOC.judgeCt({pay:'TT', ct:'LRS-2699XS2', sis:[si]}).si.s!=='diff','E1 같은 계약번호 = 문제 없음');
  const x=DOC.todoExtra({iv:'NAA2699-02', ct:'LRS-2699XS1', otherCt:['LRS-2699XS2']}, DOC.at(T,'09:00')); ok(x.length===1&&x[0].red&&x[0].gkey==='sichk'&&x[0].what==='別の契約番号: LRS-2699XS2','E1 今日やること 빨강 (S/I 確認（相違） 그룹 · v0.23 N4)',x); }
/* F1 · F2 */
{ const F=(...n)=>({files:n.map(x=>({name:x, lastModified:'2026-11-10T00:00:00Z'}))}), IV='NAA2699-01';
  const J=(o)=>DOC.judgeIv(Object.assign({iv:IV, country:'VIETNAM', term:'CIF', premium:null, etdPast:false, folder:F(), acl:null, hon:[], bookingNo:'TESTBK1', otherBookings:[]},o));
  const a=J({}); eq([a.customs.s,a.acl.s,a.bl.s,a.depo.s,a.ins.s,a.fd.s],['not','not','not','not','not','not'],'F1 아무것도 없음 = 모두 未 (자기 차례 · 아직)');
  const b=J({folder:F(IV+'_ED.pdf')}); eq([b.customs.s,b.acl.s],['done','wait'],'F1 通関 済 (輸出許可) → ACL = 待ち (乙仲)');
  const c=J({folder:F(IV+'_ED.pdf',IV+'_DRAFT.pdf'), premium:null}); eq([c.depo.s,/Deposit 番号待ち/.test(c.depo.why)],['wait',true],'F1 DEPO 번호 기다림 = 待ち (バイヤー)');
  ok(c.ins.s==='not'&&c.ins.why===V.INS_NOT,'F2 保険 — B/L 받기 전 = 「未（B/L 受領後に申込）」',c.ins);
  const d=J({folder:F(IV+'_ED.pdf',IV+'_BL.pdf',IV+'_SWB.pdf'), premium:0}); ok(d.ins.s!=='not','F2 保険 — B/L 받은 뒤 = 未 아님 (確認)',[d.bl,d.ins]);
  eq(DOC.ST.not,'未','F1 「未」 글자'); }
/* D4 · D5 · D6 · D7 · D8 (今日やること) */
{ const at=DOC.at, NOW=at('2026-11-20','09:00'), S0=o=>Object.assign({sub:null, subKnown:false, acl:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, bl:null, ins:null, rr:null, fd:null},o||{});
  const X0=o=>Object.assign({iv:'NAA2699-01', country:'INDONESIA', term:'CFR', pay:'TT', carrier:'TEST LINE', otsu:'SAMPLE FWD', buyer:'SAMPLE BUYER', cut:'', cutAm:false, blDate:''},o||{});
  const row=(x,s)=>{ const r=DOC.todoRow(X0(x),S0(s),NOW,null); r.group=DOC.todoGroup(r,NOW); r.when=DOC.whenLabel(r,NOW); r.whenSub=DOC.whenSub(r,NOW); return r; };
  const r1=row({blDate:'2026-11-19', term:'CIF'},{bl:at('2026-11-19','18:00')}); ok(r1.when==='期限切れ 11/20'||/^期限 \d+\/\d+$/.test(r1.when),'D4 왼쪽 칸 = 「期限 …」',r1.when);
  ok(/^B\/L 受領 11\/19/.test(r1.whenSub),'D4 사건 날짜 (B/L 受領 11/19) = 둘째 줄',r1.whenSub);
  ok(r1.gkey==='insrr'&&r1.what==='保険','D8 保険 · RR 남음 = 「保険・RR 準備」 (보험만)',r1);
  const r2=row({blDate:'2026-11-19'},{bl:at('2026-11-19','18:00')}); ok(r2.gkey==='fd','D8 FD 단계 = 「FD 作成・送付」 그룹',r2);
  const r3=row({blDate:'2026-11-19', carrier:'HEUNG A'},{bl:at('2026-11-19','18:00')}); ok(/FD 期限：B\/L date の翌営業日（後払い船社）/.test(r3.why),'D5 「FD 期限：B/L date の翌営業日（後払い船社）」',r3.why);
  const r4=row({},{sub:at('2026-11-18','10:00')}); ok(/^\d+ 時間待ち（いつもは \d+ 時間）$/.test(r4.when),'D6 「70 時間待ち（いつもは 2 時間）」 모양',r4.when);
  const r5=row({country:'VIETNAM'},{sub:1, depoReq:at('2026-11-10','10:00'), drafts:[at('2026-11-18','10:00'),at('2026-11-20','08:00')]}); ok(/^2 回目の Draft（Deposit 番号 反映済み）/.test(r5.why),'D7 「3 回目の Draft（Deposit 番号 反映済み）」 모양',r5.why);
  eq(DOC.TODO_RULES.TGROUPS.filter(g=>g[0]==='insrr'||g[0]==='fd').map(g=>g[2]),['保険・RR 準備','FD 作成・送付'],'D8 그룹 이름');
  ok(DOC.whenLabel({zone:'do', extra:true, red:true},NOW)==='—'&&DOC.whenLabel({zone:'do', due:null},NOW)==='—'&&DOC.whenLabel({zone:'do', due:null, dueText:'ETD 後に B/L 依頼'},NOW)==='ETD 後に B/L 依頼','D4 기한 없음 = 「—」 · 目安があれば 그 글 (v0.23 N9 「期限なし」 안 씀)'); }
/* G3 */
{ const x={iv:'NAA2699-01', fname:[{name:'NAA2698-01_FD.pdf', sub:'', others:['NAA2698-01'], ref:false}], fdBad:[{t:1, subject:'S', bad:['NAA2698-01_FD.pdf']}]};
  ok(DOC.todoExtra(x,1).length===2,'G3 FD 전 = 빨강 2 줄 (지금처럼)'); ok(DOC.todoExtra(Object.assign({fdDone:true},x),1).length===0,'G3 FD 済 = 今日やること 에 안 띄움'); }
/* B9 */
{ const k=n=>DOC.saveKind(n,''), SR=DOC.SAVE_RULES;
  eq(['NAA2699-01_FD.pdf','NAA2699-01_TO BANK.pdf','NAA2699-01_IV.pdf','NAA2699-01_PL.pdf','COMMERCIAL INVOICE NAA2699-01.pdf','PACKING LIST.pdf'].map(n=>k(n).key),['FD','TOBANK','IV','PL','IV','PL'],'B9 종류 = FD · TO BANK · IV · PL');
  eq(['NAA2699-01_IV_PL_SI.pdf','INVOICE FOR FREIGHT.pdf','DHL INVOICE.pdf','NAA2699-01_FD DRAFT.pdf'].map(n=>k(n).ok),[false,false,false,false],'B9 IV+PL 묶음 · 운임 청구서 · FD Draft = 저장 안 함');
  eq([SR.NAME_DOC('naa2699-01','FD',0),SR.NAME_DOC('NAA2699-01','TO BANK',1),SR.NAME_DOC('NAA2699-01','IV',2)],['NAA2699-01_FD.pdf','NAA2699-01_TO BANK REV.pdf','NAA2699-01_IV REV2.pdf'],'B9 이름 = {IV}_FD · REV · REV2 (ACL 규칙과 같음)');
  const j=DOC.saveJudge('NAA2699-01',[{name:'NAA2699-01_FD.pdf',hash:'h1',tkey:'t1'}],['NAA2699-01_FD.pdf'],'h2','t2','FD'); eq([j.res,j.name],['2版目','NAA2699-01_FD REV.pdf'],'B9 같은 이름 있음 → 2版目 (덮어쓰기 0)');
  eq(DOC.saveJudge('NAA2699-01',[{name:'X.pdf',hash:'h1',tkey:'t1'}],[],'h1','t9','TOBANK').res,'重複','B9 같은 파일 = 重複');
  ok(DOC.guardSave(OUT+'save_test/NAA2699-01/NAA2699-01_TO BANK.pdf',{iv:'NAA2699-01',test:true,kind:'TOBANK'})===true,'B9 문지기 — 시험 폴더 · 정해진 이름 OK');
  thr(()=>DOC.guardSave(OUT+'save_test/NAA2699-01/NAA2699-01_ACL.pdf',{iv:'NAA2699-01',test:true,kind:'FD'}),'B9 문지기 — FD 인데 다른 이름 = 거부');
  thr(()=>DOC.guardSave(WIP+'/NAA2699-02/NAA2699-01_FD.pdf',{iv:'NAA2699-01',folder:WIP+'/NAA2699-02',kind:'FD'}),'B9 문지기 — 다른 Invoice 폴더 = 거부');
  const ships=[{iv:'NAA2699-01',bkg:'TESTBK1',bl:'TESTBL1',cntrs:['TSTU0000001']},{iv:'NAA2699-02',bkg:'TESTBK2',bl:'TESTBL2',cntrs:['TSTU0000002']}];
  eq(DOC.saveCands(ships,{booking:'',cntrs:['TSTU0000002'],text:'INVOICE NO. NAA2699-01'},{name:'scan.pdf',subject:'',doc:true}).cands,['NAA2699-01'],'B9 Invoice = PDF 안 글자의 Invoice 번호 (컨테이너보다 먼저 · 사람이 번호를 치지 않음)');
  eq(DOC.saveCands(ships,{booking:'',cntrs:[],text:''},{name:'x.pdf',subject:'[FD] NAA2699-02',doc:true}).cands,['NAA2699-02'],'B9 Invoice = 메일 제목'); }
/* F6 · F8 */
{ const L={lc_no:'TESTLC9', amount:{text:'USD 1,000.00'}, latest_shipment:'2026-12-10', expiry_date:'2027-01-10', payment:{tenor_text:'60 DAYS AFTER SIGHT'}, pod:{text:'SAMPLE PORT'}, source:{amends:[{no:2,file:'LRS-2699ZZ1_TESTLC9_AMEND2.pdf',date:'2026-11-20'},{no:1,file:'LRS-2699ZZ1_TESTLC9_AMEND1.pdf',date:'2026-11-17'}]}};
  const s=DOC.lcSummary(L); eq([s.no,s.amount,s.ship,s.expiry,s.pay,s.pod],['TESTLC9','USD 1,000.00','2026-12-10','2027-01-10','60 DAYS AFTER SIGHT','SAMPLE PORT'],'F6 요약 (L/C 番号 · 金額 · 44C · 31D · 支払 · 揚地)');
  eq(s.amends.map(a=>a.label),['Amend 1 (11/17) 反映済み','Amend 2 (11/20) 反映済み'],'F6 「Amend 1 (11/17) 反映済み」');
  const x=DOC.cpExample('NRA2699-01: S/I のコンテナ別記載の指示 ✓ → 足りない 4 → 0 (형님 D3 · v0.8)'); eq(x.ivs,['NRA2699-01'],'F8 実例 — 근거 Invoice'); ok(!/[\uac00-\ud7af]/.test(x.text)&&/足りない 4 → 0/.test(x.text),'F8 実例 — 무엇이 달랐나 (한글 빼고)',x); }

console.log('2 화면 (jsdom · 가짜 세계)');
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
function world17(){
  const W=X.world(), b0=W.bookings[0];
  W.regions[0].cr49f_region='VIETNAM'; W.carriers=[{crcf9_carrierid:X.g('5',1),crcf9_carrier:'TEST LINE'}]; W.bookings.forEach(b=>{ b._cr49f_carrier_id_value=X.g('5',1); });
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',21),cr49f_invoice_no:'NAA2611-21',cr49f_booking_no:'TESTBK21',cr49f_etd:D(8),crcf9_bl_etd:D(8),cr49f_cy_cut:D(6)}));   // 通関依頼 前
  W.content[PT.PATH]=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:{'NAA2611-01':{tsukan_irai:true},'NAA2611-02':{tsukan_irai:true},'NBB2611-01':{tsukan_irai:true},'NCC2611-01':{tsukan_irai:true}},cotecna:{},
    shipping:{'NAA2611-01':{dep:'未',furikomi:'未',fd_date:'',fd_note:''}}},null,2);
  W.etag={}; W.etag[PT.PATH]='"e0"';
  /* E1: LRS-2611BB1 (T/T) の S/I に 別の契約番号 */
  W.sis[1].crcf9_bencert_text='WE CERTIFY … CONTRACT NUMBER (LRS-2609BB2)';
  return W;
}
/* 2-1 Invoice 別 — H1 · H2 · H4 · F1 범례 */
{ const W=world17(); W.dvPage=2; const w=await X.page(W,{html:HFILE, ls:{doc_tool_iv_mode_v16:'portal',doc_tool_who:'all'}});
  await X.until(()=>qa(w,'#dtTable tbody tr').length>0,10000);
  const ivs=qa(w,'#dtTable tbody tr').map(tr=>tr.cells[5].textContent.trim());
  ok(ivs.indexOf('NAA2611-21')<0&&ivs.indexOf('NAA2611-01')>=0,'H1 通関依頼 전 (NAA2611-21) = 줄 없음 · 通関依頼済 = 있음',ivs);
  ok(/船積書類（通関依頼済 \/ FD送付日未入力）/.test(txt(w,'dtBoardNote')),'H1 제목 글자 「(通関依頼済 / FD送付日未入力)」',txt(w,'dtBoardNote'));
  const bq=W.req.filter(r=>/cr49f_bookings\?\$filter=cr49f_etd ge/.test(decodeURIComponent(r)));
  ok(bq.length>=2&&bq.every(r=>!/\$top=/.test(decodeURIComponent(r)))&&W.dvPages>=3,'H4 부킹 읽기 = $top 없음 · nextLink 따라 끝까지 (가짜 2 건씩)',[bq.length,W.dvPages]);
  ok(ivs.length===4,'H4 페이지 나뉘어도 줄 전부 (4)',ivs);
  ok(/相手の返事待ち/.test(txt(w,'dtLegend'))&&/未 まだ/.test(txt(w,'dtLegend').replace(/\s+/g,' '))&&!/まだ届いていない/.test(txt(w,'dtLegend')),'F1 범례 「待ち = 相手の返事待ち」 · 「未 = まだ」',txt(w,'dtLegend'));
  /* H2 */
  const el=w.document.querySelector('[data-pt="NAA2611-01"][data-f="furikomi"]'); el.value='確認済'; el.dispatchEvent(new w.Event('change'));
  await X.until(()=>!!w.document.querySelector('#dtTable .pt-ok'),5000).catch(()=>{});
  const mk=w.document.querySelector('#dtTable .pt-ok'); if(!mk) console.log('DEBUG H2',W.writes.length,(w.__toasts||[]).slice(-3),txt(w,'dtTable').slice(0,200)); ok(mk&&mk.textContent==='✓ 保存'&&mk.previousSibling&&mk.previousSibling.dataset.f==='furikomi','H2 저장 성공 → 칸 옆 「✓ 保存」',mk&&mk.outerHTML);
  await X.sleep(V.SAVED_MS+200); ok(!w.document.querySelector('#dtTable .pt-ok'),'H2 1.5 초 뒤 사라짐');
  W.beforePut=async p=>{ W.etag[p]='"x'+Math.random()+'"'; };
  const el2=w.document.querySelector('[data-pt="NAA2611-01"][data-f="fd_note"]'); el2.value='X'; el2.dispatchEvent(new w.Event('change'));
  await X.until(()=>!!w.document.querySelector('#dtTable .pt-ng'),5000).catch(()=>{}); W.beforePut=null;
  const ng=w.document.querySelector('#dtTable .pt-ng'); ok(ng&&ng.textContent==='保存できません','H2 실패 → 빨강 「保存できません」 (지금 문구)',ng&&ng.outerHTML);
  w.close(); }
/* 2-2 今日やること · 문구 (직원) — D1 · D2 · D3 · D4 · D15 · E1 · B1 */
{ const W=world17(); const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}});
  await X.until(()=>!!w.document.querySelector('.tl-zone'),10000);
  ok(w.__cfg.desc==='書類担当の今日の仕事と、ACL・B/L Draft・S/I の確認をまとめたツールです（試験運用中）','D1 로그인 화면 설명',w.__cfg.desc);
  ok(/^読み込み完了 \d\d:\d\d$/.test(txt(w,'dtProg')),'D2 직원 = 「読み込み完了 HH:MM」 한 줄',txt(w,'dtProg'));
  const box=txt(w,'dtTodoBox'); ok(!/メール \d+ 通|初回表示|ACL 照合結果|本登録メール \d+ 通/.test(box),'D2 메일 통수 · 初回表示 = 직원에게 안 보임',box.slice(-300));
  const dues=qa(w,'.tl-z-do .tl-due').map(d=>d.firstChild?d.firstChild.textContent:''); ok(dues.length&&dues.every(t=>/^期限(切れ)? \d+\/\d+$|^—$|^ETD 後に B\/L 依頼$|^メール確認中…$|^メール未確認$|^通関待ち$/.test(t)),'D4 왼쪽 칸 = 모두 「期限 …」 모양',dues);
  ok(!/\d+h \/ \d+h|LG 済|後払い船社は|本日|昨日 B\/L 受領/.test(box),'D4 · D5 · D6 · D7 옛 글자 없음',box.match(/.{0,30}(\d+h \/|LG 済|後払い船社は|本日|昨日).{0,30}/));
  ok(!/別の契約番号: LRS-2609BB2/.test(box),'E1 → v0.27 (N27): 다 나간 계약 (NBB2611-01 ETD 지남) = 参考 · 今日やること 에 안 나옴 (S/I 탭은 빨강 그대로)',box.slice(0,400));
  { const L=qa(w,'#dtTodoBox .tl-what, #dtTodoBox .tl-why, #dtTodoBox .tl-due, #dtTodoBox .tl-gh, #dtTodoBox .tl-zh').map(e=>e.textContent).filter(t=>JSP.test(t)); ok(!L.length,'D15 일본어 사이 띄어쓰기 없음 (今日やること 각 칸)',L); }
  ok(!/a1_bench|bl_bench|acl_bench|D-01|UTC/.test(txt(w,'dtMain')),'B1 · D10 · F4 직원 화면 = a1_bench · D-01 · UTC 0');
  /* E1 S/I 탭 · D13 · D14 */
  w.eval("openCt(S.ct&&Object.keys(S.ct).find(id=>S.ct[id].cr49f_sale_contract_no==='LRS-2611BB1'),'si')"); await X.until(()=>/LRS-2611BB1/.test(txt(w,'dtCtSum')),5000); await X.sleep(50);
  ok(/別の契約番号: LRS-2609BB2/.test(txt(w,'dtCtBody'))&&!!w.document.querySelector('#dtCtBody .dt-c-diff'),'E1 S/I 탭 빨강 「別の契約番号: LRS-2609BB2」',txt(w,'dtCtBody').slice(0,300));
  w.document.querySelector('[data-back]')&&qa(w,'[data-back]').forEach(b=>{ if(b.offsetParent!==undefined) {} }); w.eval("show('list'); S.board='ct'; render()"); await X.sleep(30);
  ok(txt(w,'dtBoardNote').indexOf('契約ごとの L/C と S/I。契約番号を押すと開きます。')===0,'D14 契約別 안내',txt(w,'dtBoardNote'));
  eq(DOC.judgeCt({pay:'TT', ct:'LRS-2699ZZ1', sis:[{crcf9_sino:1, crcf9_consignee:'C', crcf9_notify_party:'N', crcf9_po_vo:'P', crcf9_vo_no:'V', crcf9_place_of_delivery_1:'X', crcf9_pod_bl1:'Y'}]}).si.why,'S/I あり（1 セット）','D13 「S/I あり（1 セット）」');
  w.close(); }
/* 2-3 Invoice 상세 (직원) — F2 · F3 · D9 · D11 · D12 · F7 · F9 · F10 · D3 */
{ const W=world17(); const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}});
  w.eval("openIv('NAA2611-01','ins')"); await X.until(()=>/NAA2611-01/.test(txt(w,'dtIvSum')),5000); await X.sleep(30);
  ok(/L\/C 原本を開く/.test(txt(w,'dtIvSum'))&&/L\/C の読み取り結果/.test(txt(w,'dtIvSum'))&&!/LC 原本|LC 読み取り/.test(txt(w,'dtIvSum')),'D9 「L/C」 통일 · 「L/C の読み取り結果」');
  ok(/本船変更の可能性（ACL の本船が S\/I と違います）/.test(txt(w,'dtIvSum'))&&!/ACL 照合: 本船変更/.test(txt(w,'dtIvSum')),'D12 「本船変更の可能性（ACL の本船が S/I と違います）」',txt(w,'dtIvSum'));
  const tab=k=>{ w.document.querySelector('#dtIvTabs button[data-tab="'+k+'"]').click(); return txt(w,'dtIvBody'); };
  const ins=tab('ins'); ok(!/D-04 で作ります/.test(ins)&&w.document.querySelector('#dtIvBody [data-open="d04"]').textContent==='保険を入力','F3 保険 = 설명문 없음 · 「保険を入力」 (D-04)',ins);
  const fd=tab('fd'); ok(!/D-03「FINAL|照合は D-01/.test(fd)&&w.document.querySelector('#dtIvBody [data-open="d03"]').textContent==='FD を作る','F3 FD = 「FD を作る」 (D-03)');
  const cu=tab('customs'); ok(!/C-01 へ移る/.test(cu)&&w.document.querySelector('#dtIvBody [data-open="c01"]').textContent==='通関書類','F3 通関 = 「通関書類」 (C-01)');
  const acl=tab('acl'); ok(/^直すところ 1 か所/.test(w.document.querySelector('#dtIvBody .av-concl').textContent)&&!/✓ S\/I の内容はすべて/.test(acl),'D11 相違 있으면 ✓ 안 씀 · 결론 맨 위 「直すところ 1 か所」',acl.slice(0,300));
  ok(!/表示中/.test(acl),'D2 ACL 「表示中: ACL_…」 = 직원에게 없음');
  /* F7 L/C 読み取り 창 머리 · F4 시각 */
  w.eval("showLcJson(S.cur.b._cr49f_sale_contract_id_value)"); await X.until(()=>!w.document.getElementById('dtModal').hidden,5000);
  const mt=txt(w,'dtModalBox'); ok(/^L\/C の読み取り結果/.test(mt)&&!/_READ|lc_read|読むだけ/.test(mt),'F7 L/C 읽기 창 머리 (保管所 · lc_read) = 직원에게 없음',mt.slice(0,200));
  ok(w.eval("lcMdStaff('作成 2026-11-23T11:53:01.273Z · 保管所 lc_read/1\\nL/C 番号 X')")==='作成 11/23 20:53 · 保管所 lc_read/1'.replace(/.*/,'')+'L/C 番号 X','F4 · F7 MD 안 ISO 시각 줄 = 직원에게 숨김 (만든 사람 줄) · 나머지 그대로');
  eq(w.eval("jstHM('2026-11-23T12:56:00Z')"),'11/23 21:56','F4 시각 = 일본 시간 「11/23 21:56」');
  eq(w.eval("logLabel('20261123-215600_acl.json')"),'11/23 21:56 · ACL 照合','F4 履歴 = 「11/23 21:56 · ACL 照合」 (파일 이름 · 숫자 아님)');
  w.eval('closeModal()');
  /* F9 설정 */
  w.eval('openSettings()'); ok(/S\/I 推薦で使います（このパソコンのブラウザだけに保存）/.test(txt(w,'dtModalBox'))&&!/P3|a1_bench|D-01/.test(txt(w,'dtModalBox')),'F9 API 키 설명 (P3 · a1_bench 없음)'); w.eval('closeModal()');
  /* F10 保存の入口 */
  await X.until(()=>w.eval('SAVE.mailSt')==='ok'||w.eval('SAVE.mailSt')==='error',20000);
  ok(/新しい書類 \d+ 件（直近 5 営業日のメールを確認 · \d\d:\d\d）/.test(txt(w,'dtInbox')),'F10 「新しい書類 0 件（直近 5 営業日のメールを確認 · 21:58）」',txt(w,'dtInbox').slice(0,120));
  /* D3 */
  ok(/'確認しました'|>確認しました</.test(HTML)&&!/>確認した</.test(HTML),'D3 「確認しました」');
  w.close(); }
/* 2-4 관리자 = 개발 정보 보임 (D2 · F7) */
{ const W=world17(); const w=await X.page(W,{html:HFILE, email:'boss@example.test', ls:{doc_tool_who:'all'}});
  ok(/^読み込み完了 — 船積/.test(txt(w,'dtProg')),'D2 관리자 = 읽기 내용 전부',txt(w,'dtProg'));
  w.eval("openIv('NAA2611-01','acl')"); await X.until(()=>/NAA2611-01/.test(txt(w,'dtIvSum')),5000); await X.sleep(30);
  ok(/表示中: ACL_/.test(txt(w,'dtIvBody')),'D2 관리자 = ACL 「表示中」 보임');
  w.close(); }
/* 2-5 F6 契約 L/C 탭 — 요약 표 · Amend PDF 버튼 */
{ const W=world17(); const j=JSON.parse(W.content['古紙/LC/_READ/LRS-2611AA1.json']); j.amount={text:'USD 1,000.00'}; j.payment={tenor_text:'AT SIGHT'}; j.source.amends=[{no:1,file:'LRS-2611AA1_TESTLC001_AMEND1.pdf',date:'2026-11-17'}];
  W.content['古紙/LC/_READ/LRS-2611AA1.json']=JSON.stringify(j);
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}}); w.eval("openCt(Object.keys(S.ct).find(id=>S.ct[id].cr49f_sale_contract_no==='LRS-2611AA1'),'lc')");
  await X.until(()=>/Amend 1 \(11\/17\) 反映済み/.test(txt(w,'dtCtBody')),5000).catch(()=>{});
  const b=txt(w,'dtCtBody'); ok(/L\/C 番号TESTLC001/.test(b)&&/金額USD 1,000.00/.test(b)&&/船積期限 \(44C\)2026-12-15/.test(b)&&/有効期限 \(31D\)2026-12-31/.test(b)&&/支払AT SIGHT/.test(b)&&/揚地CAT LAI/.test(b)&&/Amend 1 \(11\/17\) 反映済み/.test(b),'F6 L/C 탭 요약 표 바로 (번호 · 금액 · 44C · 31D · 支払 · 揚地 · Amend)',b.slice(0,400));
  ok(!!w.document.querySelector('#dtCtBody [data-lcamend][data-file="LRS-2611AA1_TESTLC001_AMEND1.pdf"]')&&!!w.document.querySelector('#dtCtBody [data-lcorig]'),'F6 「L/C 原本を開く」 옆에 「Amend 1 を開く」');
  ok(!/判読|保管所|アメンド/.test(b),'D9 L/C 탭 문구 (判読 · 保管所 · アメンド 없음)',b.slice(0,200));
  w.close(); }
/* 2-6 G10 스캔 ACL — 저장본 (ACL_bench/_scan_ai/{sha256}.json) 으로 대조 · 「AI 判読 (スキャン)」 */
{ const W=world17(); const SCAN=await BF.mkPdf([[]]); W.sp[WIP+'/NAA2611-01'][1]=Object.assign({},W.sp[WIP+'/NAA2611-01'][1],{id:'scan1'}); W.itemBytes={scan1:SCAN};
  const fields={shipper:{text:'SAMPLE EXPORT CO., LTD.'},consignee:{text:'TO ORDER OF SAMPLE BANK'},notify:{text:'SAMPLE NOTIFY CO'},booking:{text:'TESTBK1'},vessel:{text:'SAMPLE VESSEL 001'},pol:{text:'SAMPLE POL'},pod:{text:'SAMPLE PORT VN'}};
  const read={layout:'NACCS', pages:1, fields, rows:[{container:'TSTU0000001',seal:'S1',type:'40HC',size:'40',bales:10,cargo:10000,tare:3800}]};
  W.content['古紙/-. AI 活用/D-00/ACL_bench/_scan_ai/'+sha(SCAN)+'.json']=JSON.stringify({schema:'acl_scan_ai/1', model:'test-model', reads:[read,read], cost_usd:0, at:'2026-11-23T13:00:00Z'});
  const w=await X.page(W,{html:HFILE, ...INIT, ls:{doc_tool_who:'all'}}); { const P=R.pdfjsForWindow(); w.pdfjsLib={GlobalWorkerOptions:{}, getDocument:o=>{ const t=P.getDocument(o); try{ o.data.buffer.transfer(); }catch(e){ console.log('transfer 不可',e.message); } return t; }}; }   // 実 Chrome と同じ: pdf.js に渡したバッファは空になる (transfer)
  const r=await w.eval("aclCompareOne('NAA2611-01')"); ok(r.format==='SCAN'&&r.verdict!=='読取対象外'&&r.ai&&r.ai.label==='AI 判読 (スキャン)'&&(r.items||[]).some(i=>i.key==='ai:scan'),'G10 스캔 ACL → 저장본 AI 판독으로 대조 (読取対象外 아님 · 「AI 判読 (スキャン)」 · pdf.js 가 버퍼를 비워도 sha256 = 원본)',{f:r.format,v:r.verdict,why:r.why});
  ok(W.writes.length===0&&!W.req.some(x=>/anthropic/.test(x)),'G10 AI 호출 0 · 쓰기 0 (저장본 읽기만)');
  W.itemBytes.scan1=await BF.mkPdf([[],[]]); const r2=await w.eval("aclCompareOne('NAA2611-01')"); ok(r2.verdict==='読取対象外'&&/AI 判読なし/.test(r2.why),'G10 저장본 없는 스캔 = 読取対象外 (AI 判読なし)',r2.why);
  ok(/const ACL_ENGINE = \{commit:'[0-9a-f]{40}', sha256:'[0-9a-f]{64}', ver:'0\.(?:1[4-9]|2\d)'\}/.test(HTML),'G10 엔진 고정 = acl_bench (커밋 + sha256 · v0.14 이상 — v0.18 에서 980b6f4)');
  w.close(); }
/* 2-7 B9 保存の入口 — 놓기 (시험 모드) · FD · TO BANK · 메일 첨부 */
{ const W=world17(); W.messages=W.messages.concat([{id:'mb',subject:'Documents NAA2611-01',from:{emailAddress:{address:'trade@bank.example.org'}},receivedDateTime:new Date(Date.now()-3600e3).toISOString(),hasAttachments:true,attachments:[{id:'ab',name:'NAA2611-01_TO BANK.pdf',isInline:false,size:100}]}]);
  W.messages.push({id:'mx',subject:'Your invoice',from:{emailAddress:{address:'billing@vendor.example.org'}},receivedDateTime:new Date(Date.now()-7200e3).toISOString(),hasAttachments:true,attachments:[{id:'ax',name:'Invoice-TEST-0041.pdf',isInline:false,size:100}]});
  const TB=await BF.mkPdf([[{x:40,y:60,t:'INVOICE NO. NAA2611-01'},{x:40,y:80,t:'TO BANK DOCUMENTS'}]]); W.attBytes={'mb|ab':TB, 'mx|ax':await BF.mkPdf([[{x:40,y:60,t:'INVOICE TEST-0041 AMOUNT DUE'}]])};
  const w=await X.page(W,{...INIT, html:HFILE, first:true, email:'boss@example.test', ls:{doc_tool_board_v28:'todo', doc_tool_who:'all', doc_tool_save_test:'1'}}); w.pdfjsLib=R.pdfjsForWindow();
  await X.until(()=>w.eval('SAVE.mailSt')==='ok'||w.eval('SAVE.mailSt')==='error',20000); await X.until(()=>w.eval('SAVE.rows').every(r=>r.res&&r.res!=='')||false,20000).catch(()=>{});
  const mrow=w.eval('SAVE.rows').find(r=>r.mailId==='mb'); ok(mrow&&mrow.kind&&mrow.kind.key==='TOBANK'&&mrow.iv==='NAA2611-01'&&mrow.res==='新規'&&mrow.target==='NAA2611-01_TO BANK.pdf','B9 메일 첨부 TO BANK → {IV}_TO BANK.pdf (新規)',mrow&&{k:mrow.kind,iv:mrow.iv,res:mrow.res,t:mrow.target,msg:mrow.msg});
  { const xr=w.eval('SAVE.rows').find(r=>r.mailId==='mx'); ok(xr&&xr.res==='対象外'&&/Invoice 番号のない書類/.test(xr.msg),'B9 메일의 IV 인데 당사 Invoice 번호 없음 (상대 청구서) = 対象外 (기록 · 다시 안 나옴)',xr&&{res:xr.res,msg:xr.msg}); }
  const FD1=await BF.mkPdf([[{x:40,y:60,t:'COMMERCIAL INVOICE'},{x:40,y:80,t:'INVOICE NO. NAA2611-01'}]]), FD2=await BF.mkPdf([[{x:40,y:60,t:'FINAL DOCUMENTS'},{x:40,y:80,t:'NAA2611-01 REVISED'}]]);
  const file=(name,b)=>({name, arrayBuffer:async()=>{ const u=new Uint8Array(b); return u.buffer.slice(u.byteOffset,u.byteOffset+u.length); }});
  w.eval('SAVE.rows=[]'); const w0=W.writes.length;
  await w.saveDrop([file('FD.pdf',FD1)]); const r1=w.eval('SAVE.rows')[0];
  ok(r1.kind.key==='FD'&&r1.iv==='NAA2611-01'&&r1.res==='新規'&&r1.target==='NAA2611-01_FD.pdf','B9 놓기 FD (이름에 번호 없음 → PDF 글자의 Invoice) → {IV}_FD.pdf',{k:r1.kind,iv:r1.iv,res:r1.res,t:r1.target,why:r1.msg});
  w.document.querySelector('#dtInbox [data-svsave="'+r1.id+'"]').click(); await X.until(()=>w.eval('SAVE.rows')[0].res==='保存済',10000);
  const puts=W.writes.slice(w0).map(x=>decodeURIComponent(x.url)); ok(puts.some(u=>u.indexOf(OUT+'save_test/NAA2611-01/NAA2611-01_FD.pdf:/content?@microsoft.graph.conflictBehavior=fail')>0)&&puts.every(u=>u.indexOf(WIP)<0),'B9 시험 모드 저장 = save_test/{IV}/ 새 파일 · Invoice 폴더 쓰기 0',puts);
  ok(puts.some(u=>/doc_tool\/save_log\/\d{8}\/\d{8}-\d{6}_NAA2611-01_[a-z0-9]+\.json/.test(u)),'B9 같은 기록 (save_log)');
  await w.saveDrop([file('NAA2611-01_FD.pdf',FD1),file('FD_new.pdf',FD2)]); const rs=w.eval('SAVE.rows'), r2=rs[1], r3=rs[2];
  ok(r2.res==='重複','B9 같은 파일 다시 = 重複',r2.res); ok(r3.res==='2版目'&&r3.target==='NAA2611-01_FD REV.pdf','B9 다른 FD = 2版目 → {IV}_FD REV.pdf (덮어쓰기 0)',[r3.res,r3.target]);
  ok(W.writes.every(x=>x.method==='PUT'),'B9 쓰기 = PUT 새 파일뿐');
  w.close(); }

console.log((fail?'FAIL':'PASS')+' v17 — pass '+pass+' fail '+fail);
process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL v17 예외',e&&e.stack||e); console.log('FAIL v17 — pass '+pass+' fail '+(fail+1)); process.exit(1); });
