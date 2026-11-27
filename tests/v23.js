/* v0.23 시험 (지시서 THOR_20 · 수정 묶음 v0.4 N8 · N9 · N10 · N1 ~ N4) — 가짜 데이터 · 가짜 거래처 · 네트워크 없음 · 메일 보내기 0. node v23.js [html]
   N8 메일을 다 읽기 전 · 못 읽은 구간 = 「メール確認中 / 未確認」 (「〜メールなし · 期限切れ」 안 보임) · 구간 다시 읽기 · 띠는 모두에게
   N9 B/L 번호 (접두어 · 하이픈 · 여러 건 · 본문) 로 연결 · B/L 受領 = 폴더 · 후불 사본 메일 · 선사 발행 메일 · 「期限なし」 → 目安 / 「—」
   N10 「済にする」 (이유 · 메모 · 기록 · 숨김 · 元に戻す · 다른 창) · 관리자 「メールが見つからない」 · 「長く残っている」
   N1 · N2 S/I 상이 칸 (빨강 · 틀린 글자 · 이유 · 띠 → 그 줄) · 「✏ 直す」 (그 칸만 PATCH · 미리 채움 · 控え → PATCH → 履歴)
   N3 保存の入口 — 다른 창 保存/取消 → 그 줄 사라짐 · 다시 확인 = 기록 · 폴더 다시 읽음 · N4 「S/I 確認（相違）」 묶음 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), R=require('./acl_fx/pdfread');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const TR=DOC.TODO_RULES, at=DOC.at, T='2026-11-25';
(async()=>{
console.log('버전');
ok(/<title>LEENAI D-00 書類ツール v0\.(?:2[3456789]|3[0-4](?:\.1)?)<\/title>/.test(HTML)&&/version:'0\.(?:2[3456789]|3[0-4](?:\.1)?)'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.23 (title · CFG) · 푸터');

console.log('N9 B/L 번호로 연결');
{ const ships=[{id:'s1', iv:'NAA2611-01', bkg:'TYOGQ9000001', bl:'ONEYTYOGQ9000001'},{id:'s2', iv:'NAA2611-02', bkg:'TYOGN9000002', bl:'ONEYTYOGN9000002'},{id:'s3', iv:'NAA2611-03', bkg:'I990000003', bl:'I990000003'},
    {id:'s4', iv:'NAA2611-04', bkg:'A99GX00004', bl:'A99GX00004'},{id:'s5', iv:'NAA2611-05', bkg:'TYOGN9000006', bl:'ONEYTYOGN9000006'},{id:'s6', iv:'NAA2611-06', bkg:'99000007', bl:'HLCUTYO269900007'}];
  for(let i=7;i<=16;i++) ships.push({id:'s'+i, iv:'NAA2611-'+String(i).padStart(2,'0'), bkg:'TYOGX'+(1000000+i), bl:'ONEYTYOGX'+(1000000+i)});
  const I=DOC.linkIndex(ships), L=t=>DOC.linkMail(t,I).sort();
  eq(L(' [BL発行依頼/振込明細書送付]BL#ONETYOGQ9000001 ONETYOGN9000002'),['s1','s2'],'접두어 「ONE」 (ONEY 아님) · 한 통에 여러 B/L');
  eq(L(' <振込明細書送付>ONE-ONEYTYOGN9000006'),['s5'],'「ONE-ONEY…」 (하이픈 · 접두어 2 겹)');
  eq(L('Re: ＜振込明細書送付＞YMJAI990000003'),['s3'],'「YMJA」 접두어 (전각 꺾쇠)');
  eq(L('INTERASIA-A99GX00004 A99GX00005.pdf'),['s4'],'첨부 이름 「INTERASIA-A99GX…」 (하이픈으로 붙은 번호)');
  eq(L('[SWB発行依頼/振込依頼書送付BL#A99GX00004'),['s4'],'닫는 괄호 없음');
  eq(L('HLCU 99000007 TESTWORD ABCDEF'),['s6'],'숫자만 부킹 + 다른 낱말 (가짜 연결 없음)');
  const m=(subj,body,att)=>({skind:'staff', kind:'b', uses:['BLISSUE'], subj, body:body||'', att:att||[]});
  const six=m('[BL発行依頼/振込明細書送付]BL#'+ships.slice(6,12).map(s=>s.bl).join(' '));
  eq([DOC.linkMails(six,I).length, DOC.linkMax(six)],[6,8],'송금 · B/L 依頼 = 8 건까지 (전에는 4 건 넘으면 버림)');
  const wide=m('[BL発行依頼]BL#ONETYOGQ9000001','参考: '+ships.slice(6).map(s=>s.bl).join(' '));
  eq(DOC.linkMails(wide,I),['s1'],'본문까지 8 건 넘으면 = 제목 · 첨부만 (본문의 다른 번호 안 주움)');
  const reply=m('Re: 【過入金】Re: [BL発行依頼/振込明細書送付]BL#ONETYOGQ9000001','ONEYTYOGN9000006が相殺先B/Lナンバーです。本日振込いたします。');
  eq(DOC.linkMails(reply,I).sort(),['s1','s5'],'본문에만 있는 B/L 번호도 (8 건 이하)');
  eq(DOC.linkMax({skind:'carrier', kind:'', uses:['BLDRAFT']}),4,'다른 메일은 그대로 4 건'); }

console.log('N9 B/L 受領 · 期限なし');
{ const NOW=at(T,'10:00'), base={iv:'NAA2611-01', country:'INDONESIA', term:'CIF', pay:'TT', cut:'2026-11-17', blDate:'2026-11-26', files:[], aclFiles:[], portal:{fd_date:'', tsukan:true}, hon:[], now:NOW};
  const ml=(t,skind,subj,o)=>Object.assign({t:at(T.slice(0,8)+t.slice(0,2),t.slice(3)), subj, att:[], body:'', skind, uses:DOC.mailUses({subj, skind, att:[], body:''}), kind:''},o||{});
  const draft=ml('20 10:00','carrier','[SINOKOR] INFORMATION OF BILL[(INVOICE,COPY NOTICE ) // SNKO0001 x 1)');
  const S1=DOC.todoSignals(Object.assign({},base,{carrier:'SINOKOR', mails:[draft]}));
  ok(S1.bl!=null&&S1.blSrc==='船社の B/L 写し','후불 선사 · B/L 사본 메일 (COPY NOTICE) = B/L 受領',{bl:S1.bl, src:S1.blSrc});
  const r1=DOC.todoRow(Object.assign({},base,{carrier:'SINOKOR'}),S1,NOW,null); ok(r1&&(r1.gkey==='insrr'||r1.gkey==='fd')&&/船社の B\/L 写し/.test(r1.why),'→ 保険・RR / FD 단계 · 이유 = 船社の B/L 写し',r1);
  const S2=DOC.todoSignals(Object.assign({},base,{carrier:'ONE', mails:[draft]})); ok(S2.bl==null,'선불 선사는 사본 메일만으로 B/L 受領 아님 (Draft 로만)',S2.blSrc);
  const S3=DOC.todoSignals(Object.assign({},base,{carrier:'ONE', mails:[], files:[{name:'NAA2611-01_SWB.pdf', lastModified:'2026-11-24T01:00:00Z'}]})); ok(S3.bl!=null&&S3.blSrc==='フォルダの B/L','폴더의 발행된 B/L (_SWB) = B/L 受領 (송금 기록 없어도)',S3.blSrc);
  const S4=DOC.todoSignals(Object.assign({},base,{carrier:'ONE', mails:[ml('24 09:00','carrier','ONE Group SWB is Ready for Print - SWB #: ONEYTYOGQ1 - REF #: NAA2611-01')]})); ok(S4.bl!=null&&S4.blSrc==='船社 B/L メール','선사 「SWB is Ready for Print」 = B/L 受領',S4.blSrc);
  const S5=DOC.todoSignals(Object.assign({},base,{carrier:'ONE', mails:[ml('24 09:00','carrier','RE: ONE Group SWB is Ready for Print')]})); ok(S5.bl==null,'답장 (RE:) 은 발행 알림으로 안 봄');
  const S6=DOC.todoSignals(Object.assign({},base,{carrier:'HEUNG A', mails:[ml('20 10:00','carrier','[HEUNG A LINE] INFORMATION OF BILL[(BK NOTICE ) // HASL1 x 1)')]})); ok(S6.bl==null,'BK NOTICE 는 사본 아님');
  const S7=DOC.todoSignals(Object.assign({},base,{carrier:'SINOKOR', mails:[ml('20 10:00','carrier','Draft B/L for approval SNKO0001')]}));
  const r7=DOC.todoRow(Object.assign({},base,{carrier:'SINOKOR'}),S7,NOW,null); eq([r7&&r7.gkey, r7&&DOC.whenLabel(r7,NOW)],['draft','ETD 後に B/L 依頼'],'후불 Draft = 「期限なし」 대신 「ETD 後に B/L 依頼」');
  eq(DOC.whenLabel({zone:'do', due:null},NOW),'—','목안 없으면 「—」'); }

console.log('N4 S/I 確認（相違） 묶음 · N1 칸');
{ eq(TR.TGROUPS[0].slice(0,3),['sichk','do','S/I 確認（相違）'],'「S/I 確認（相違）」 묶음 = 맨 앞 (やること)');
  const x=DOC.todoExtra({iv:'NAA2699-02', ct:'LRS-2699XS1', otherCt:['LRS-2699XS2']}, at(T,'09:00')); eq([x.length, x[0].gkey],[1,'sichk'],'別の契約番号 = S/I 確認（相違） (S/I 更新（L/C 着） 아님)');
  const sis=[{cr49f_s_iid:'si1', crcf9_sino:1, crcf9_bencert_text:'WE CERTIFY … CONTRACT NO. LRS-2699XS2 DATED …', crcf9_consignee:'TO ORDER'},{cr49f_s_iid:'si2', crcf9_sino:2, crcf9_bencert_text:'CONTRACT NO. LRS-2699XS1'}];
  const I=DOC.siFieldIssues(sis,'LRS-2699XS1'); eq(I.map(i=>[i.siId,i.field,i.bad,i.reason]),[['si1','crcf9_bencert_text',['LRS-2699XS2'],'この契約は LRS-2699XS1']],'siFieldIssues = 그 S/I · 그 칸 · 틀린 글자 · 짧은 이유');
  eq(I[0].fixTo,'WE CERTIFY … CONTRACT NO. LRS-2699XS1 DATED …','고칠 값 = 이 계약번호로 바꾼 문장');
  eq(DOC.cxBadWords('書き換え: BILL OF LADING → B/L · 抜けた: DATE · 足した: FOR 100PCT OF INVOICE VALUE'),['B/L','FOR 100PCT OF INVOICE VALUE'],'CP-A04 이유 → S/I 쪽 틀린 글자'); }

console.log('N8 메일 읽는 중 · 못 읽음');
{ const W=X.world(), w=await X.page(W,{...INIT, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>w.eval('TODO.mailSt')==='ok',20000);
  const pend=JSON.parse(w.eval('TODO.mailSt="load"; JSON.stringify(todoMailPend({why:"本登録済 11/25 · Deposit 依頼メールなし", group:"late", when:"期限切れ 11/25", whenSub:"18:00", nudge:{over:true}}))'));
  ok(pend.why==='本登録済 11/25 · Deposit 依頼メール確認中'&&pend.when==='メール確認中…'&&pend.group==='pend'&&pend.whenSub===''&&pend.nudge.over===false,'읽는 중 = 「メール確認中…」 · 「メールなし」 안 씀 · 期限切れ / 催促 안 셈',pend);
  w.eval('S.board="todo"; S.view="list"; renderTodo()');
  const bar=w.document.getElementById('dtTodoBar').textContent; ok(/メールを読み込み中/.test(bar)&&/メール確認中/.test(bar),'띠 = 직원에게도 (관리자만 아님) · 화면 위',bar);
  ok(!w.document.querySelector('#dtTodoBox .tl-badge.tl-d-late'),'읽는 중엔 「期限切れ n」 배지 0');
  /* 못 읽는 구간 → 3 번 다시 → 실패면 「メール未確認」 · 「もう一度」 */
  w.eval('DOC.TODO_RULES.MAIL_RETRY.splice(0,3,5,5,5)'); W.mailErr=403; const r0=W.mailReads||0; w.eval('TODO.mailSeq++; loadTodoMail(TODO.mailSeq)');
  await X.until(()=>w.eval('TODO.mailSt')==='error',20000); w.eval('renderTodo()');
  eq([w.eval('TODO.mailBad'), (W.mailReads||0)-r0],[10,40],'구간마다 3 번 다시 읽음 (10 구간 × 4 번) · 못 읽은 구간 수');
  const eb=w.document.getElementById('dtTodoBar').textContent; ok(/メールを一部読めませんでした（10 \/ 10 区間）/.test(eb)&&!!w.document.getElementById('dtMailRetry'),'못 읽으면 = 빨간 띠 · 「もう一度 メールを読む」',eb);
  ok(w.eval('todoRows().filter(r=>!r.extra).every(r=>r.mailPend&&r.when==="メール未確認")'),'못 읽은 동안 메일로 정하는 줄 = 「メール未確認」');
  W.mailErr=0; w.document.getElementById('dtMailRetry').click(); await X.until(()=>w.eval('TODO.mailSt')==='ok',20000); w.eval('renderTodo()');
  ok(w.document.getElementById('dtTodoBar').textContent===''&&w.eval('todoRows().every(r=>!r.mailPend)'),'다시 읽으면 = 띠 없음 · 보통 판단');
  ok(/const bk=DOC\.linkMails\(m, I\);/.test(HTML)&&/if\(!bk\.length\|\|bk\.length>DOC\.linkMax\(m\)\) return;/.test(HTML),'메일 연결 = linkMails · linkMax (N9)'); }

console.log('N10 済にする');
{ const W=X.world(), w=await X.page(W,{...INIT, first:true, ls:{doc_tool_who:'all'}}); await X.until(()=>w.eval('TODO.mailSt')==='ok',20000); w.eval('S.board="todo"; S.view="list"; renderTodo()');
  const row=JSON.parse(w.eval('JSON.stringify((todoRows().filter(r=>!r.extra)[0])||null, (k,v)=>k==="b"?undefined:v)')); ok(!!row,'가짜 세계에 今日やること 줄 있음');
  const iv=row.iv, btn=w.document.querySelector('#dtTodoBox [data-tddone="'+iv+'"]'); ok(!!btn&&btn.textContent==='済にする','줄마다 「済にする」');
  const n0=W.writes.length; btn.click(); await X.until(()=>!!w.document.getElementById('dtMdOk'),5000);
  ok(/メールで済/.test(w.document.getElementById('dtModalBox').textContent)&&/電話 · 口頭で済/.test(w.document.getElementById('dtModalBox').textContent)&&/不要/.test(w.document.getElementById('dtModalBox').textContent),'이유 3 가지');
  w.document.getElementById('dtMdSubj').value='[BL発行依頼]BL#TEST123'; w.document.getElementById('dtMdMemo').value='テスト'; w.document.getElementById('dtMdOk').click();
  await X.until(()=>W.writes.length>n0,5000); await X.sleep(50);
  const wr=W.writes.slice(n0).map(x=>({m:x.method,u:decodeURIComponent(x.url),b:x.body})); const p=wr.find(x=>/doc_tool\/state\/done\//.test(x.u)); const rec=p&&JSON.parse(typeof p.b==='string'?p.b:await p.b.text());
  ok(wr.length===1&&p&&p.m==='PUT'&&/conflictBehavior=fail/.test(p.u),'기록 = doc_tool/state/done/ 새 파일 1 개 (덮어쓰기 아님)',wr.map(x=>x.m+' '+x.u));
  ok(rec&&rec.invoice===iv&&rec.gkey===row.gkey&&rec.stage===row.stage&&rec.reason==='mail'&&rec.mail_subject==='[BL発行依頼]BL#TEST123'&&rec.memo==='テスト'&&rec.user==='tester@example.test'&&rec.undo===false,'기록 = Invoice · 단계 · 이유 · 메일 제목 · 메모 · 누가',rec);
  ok(!w.eval('todoRows()').some(r=>r.iv===iv&&r.gkey===row.gkey&&!r.extra),'그 줄은 今日やること 에서 사라짐');
  ok(w.eval('TODO.manShown.length')===1&&!!w.document.querySelector('#dtTodoBox .tl-z-man'),'「済にしたもの」 구역에 1 건');
  /* 다른 사람 (다시 열기) = 기록에서 */
  const W2=X.world(); W2.sp=W.sp; const fileName=p.u.split('/').pop().replace(/:.*$/,''); const dir='古紙/-. AI 活用/D-00/doc_tool/state/done';
  const w2=await X.page(W2,{...INIT, first:true, ls:{doc_tool_who:'all'}, init:win=>{ win.pdfjsLib=R.pdfjsForWindow(); }});
  w2.eval('manDoneApply('+JSON.stringify(rec)+')'); ok(!w2.eval('todoRows()').some(r=>r.iv===iv&&r.gkey===row.gkey&&!r.extra),'다른 창 · 다른 사람 = 기록을 읽으면 같은 줄이 사라짐');
  /* 다른 창 (같은 PC) = BroadcastChannel / storage */
  const w3=await X.page(X.world(),{...INIT, first:true, ls:{doc_tool_who:'all'}}); w3.eval('bcOn('+JSON.stringify({type:'done', rec})+')'); ok(!!w3.eval('TODO.manDone["'+iv+'"]'),'같은 PC 의 다른 창 = 바로 반영 (bcOn)');
  /* 元に戻す */
  w.eval('TODO.open=Object.assign({},TODO.open||{},{man:true}); renderTodo()');
  const ub=w.document.querySelector('#dtTodoBox [data-tdundo="'+iv+'"]'); ok(!!ub,'「元に戻す」 버튼'); const n1=W.writes.length; ub.click(); await X.until(()=>W.writes.length>n1,5000); await X.sleep(50);
  const u=W.writes[W.writes.length-1], ur=JSON.parse(typeof u.body==='string'?u.body:await u.body.text()); ok(ur.undo===true&&ur.undo_of===rec.at_saved&&ur.invoice===iv,'元に戻す = undo 기록 (새 파일)',ur);
  ok(w.eval('todoRows()').some(r=>r.iv===iv&&r.gkey===row.gkey),'元に戻すと 줄이 다시 나옴');
  /* 관리자 */
  const wa=await X.page(X.world(),{...INIT, first:true, email:'boss@example.test', ls:{doc_tool_who:'all'}}); wa.eval('manDoneApply('+JSON.stringify(rec)+'); S.board="todo"; S.view="list"; renderTodo()');
  const mm=wa.document.getElementById('dtManMiss'); ok(!!mm&&/メールが見つからない（1）/.test(mm.textContent)&&!!wa.document.getElementById('dtLong'),'관리자 = 「メールが見つからない（n）」 · 「長く残っている」');
  mm.click(); const mt=wa.document.getElementById('dtModalBox').textContent; ok(mt.indexOf(iv)>=0&&/\[BL発行依頼\]BL#TEST123/.test(mt),'모음 표 = Invoice · 메일 제목',mt.slice(0,300));
  wa.eval('closeModal()'); wa.document.getElementById('dtLong').click(); ok(/長く残っている/.test(wa.document.getElementById('dtModalBox').textContent)&&/自動で 済にはしません/.test(wa.document.getElementById('dtModalBox').textContent),'오래 남은 일 = 목록만 (자동 끝 아님)');
  ok(!w.document.getElementById('dtManMiss'),'직원 화면엔 관리자 버튼 없음'); }

console.log('N3 保存の入口');
{ const W=X.world(), w=await X.page(W,{...INIT}); await X.until(()=>typeof w.eval('typeof saveSeenApply')==='string',5000);
  w.eval('SAVE.rows=[{id:901, src:"メール", mailId:"mX", attName:"ACL_X.pdf", name:"ACL_X.pdf", res:"新規", iv:"NAA2611-01"},{id:902, src:"メール", mailId:"mY", attName:"ACL_Y.pdf", name:"ACL_Y.pdf", res:"新規", iv:"NAA2611-01"}]');
  w.eval('bcOn({type:"save", key:"mX|ACL_X.pdf", iv:"NAA2611-01", result:"保存"})');
  eq(JSON.parse(w.eval('JSON.stringify(SAVE.rows.map(r=>r.id))')),[902],'다른 창에서 保存 → 이 창의 그 줄 바로 사라짐');
  ok(w.eval('SAVE.logLocal.has("mX|ACL_X.pdf")'),'다음 「メールを確認」 에서도 다시 안 나옴 (기록 기억)');
  ok(/SAVE\.logKeys=null;   \/\/ v0\.23 \(N3\)/.test(HTML)&&/await savePrune\(keys\); renderInbox\(\);/.test(HTML),'「メールを確認」 = 매번 save_log 다시 읽음 · 폴더 다시 읽고 끝난 줄 지움');
  ok(/if\(seq===S\.loadSeq\)\{ SAVE\.started=true; return saveMailScan\(\); \}/.test(HTML),'화면 갱신 (다시 읽기) 때도 保存の入口 다시 확인'); }

console.log('N1 · N2 S/I 칸 · ✏ 直す');
{ const W=X.world(), id='00000000-0000-4000-8000-000000000d01', siId='00000000-0000-4000-8000-000000000f01';
  Object.keys(W).forEach(k=>{ if(Array.isArray(W[k])) W[k]=JSON.parse(JSON.stringify(W[k]).split(X.g('d',1)).join(id).split(X.g('f',1)).join(siId)); });
  W.sis[0].crcf9_bencert_text='WE CERTIFY THAT … CONTRACT NO. LRS-2699AA2 …';
  W.putFail=u=>{ const last=W.writes[W.writes.length-1]; if(last&&last.method==='PATCH'&&/cr49f_s_is\(/.test(u)){ const b=JSON.parse(last.body); Object.assign(W.sis.find(x=>x.cr49f_s_iid===siId),b,{modifiedon:'2026-11-25T09:00:00Z'}); } return 0; };
  const w=await X.page(W,{...INIT}); await X.until(()=>/読み込み完了/.test((w.document.getElementById('dtProg')||{}).textContent||''),30000);
  const d=w.document.createElement('div'); d.innerHTML=w.eval('siBandHtml("'+id+'", __W.sis.filter(s=>s._cr49f_sale_contract_id_value==="'+id+'"))+siCurHtml({sis:__W.sis.filter(s=>s._cr49f_sale_contract_id_value==="'+id+'")}, "'+id+'")'); w.document.body.appendChild(d);
  const tr=d.querySelector('#siRow-crcf9_bencert_text'); ok(tr&&tr.classList.contains('si-bad'),'걸린 칸의 줄 = 빨간 테두리 (si-bad)');
  ok(tr&&tr.querySelector('mark.si-mk')&&tr.querySelector('mark.si-mk').textContent==='LRS-2699AA2','틀린 글자만 빨간 바탕');
  ok(tr&&/この契約は LRS-2611AA1/.test(tr.querySelector('.si-why').textContent),'줄 끝 짧은 이유 「この契約は …」');
  ok(d.querySelector('[data-sigo="crcf9_bencert_text"]')&&/S\/I 確認（相違） 1 欄/.test(d.textContent),'위 띠 = 상이 칸 (누르면 그 줄로)');
  ok(d.querySelectorAll('[data-siedit]').length>=10,'칸마다 「✏ 直す」');
  /* ✏ 直す → 미리 채움 → 保存 → 전/후 확인 → 그 칸만 */
  w.eval('S.cur={type:"ct", id:"'+id+'"}; S.siCur["'+id+'"]={sis:__W.sis.filter(s=>s._cr49f_sale_contract_id_value==="'+id+'")}');
  const sst=w.document.createElement('div'); sst.id='dtSiSt'; w.document.body.appendChild(sst);
  const n0=W.writes.length; w.eval('siEditField("'+id+'","'+siId+'","crcf9_bencert_text")'); await X.until(()=>!!w.document.getElementById('dtSiEdV'),10000);
  eq(w.document.getElementById('dtSiEdV').value,'WE CERTIFY THAT … CONTRACT NO. LRS-2611AA1 …','입력창 = 고칠 값 미리 채움 (이 계약번호로)');
  w.document.getElementById('dtSiEdNext').click(); await X.until(()=>!!w.document.getElementById('dtSiFixGo'),5000);
  const mt=w.document.getElementById('dtModalBox').textContent; ok(/LRS-2699AA2/.test(mt)&&/LRS-2611AA1/.test(mt)&&w.document.getElementById('dtSiFixGo').disabled&&W.writes.length===n0,'전/후 확인 창 · 체크 전 못 누름 · 쓰기 0');
  const cb=w.document.getElementById('dtSiFixOk'); cb.checked=true; cb.onchange(); w.document.getElementById('dtSiFixGo').click();
  await X.until(()=>W.writes.length>=n0+3,10000); await X.sleep(100);
  const ws=W.writes.slice(n0).map(x=>({m:x.method, u:decodeURIComponent(x.url), b:x.body}));
  const bk=ws.find(x=>/doc_tool\/si_backup\//.test(x.u)), pt=ws.find(x=>x.m==='PATCH'), lg=ws.find(x=>/doc_tool\/log\//.test(x.u));
  ok(!!bk&&!!pt&&!!lg&&ws.indexOf(bk)<ws.indexOf(pt)&&ws.indexOf(pt)<ws.indexOf(lg),'순서 = 控え → PATCH → 履歴',ws.map(x=>x.m+' '+x.u.slice(-50)));
  ok(pt&&JSON.stringify(JSON.parse(pt.b))===JSON.stringify({crcf9_bencert_text:'WE CERTIFY THAT … CONTRACT NO. LRS-2611AA1 …'}),'PATCH = 그 S/I 의 그 칸만',pt&&pt.b);
  const L=JSON.parse(typeof lg.b==='string'?lg.b:await lg.b.text()); ok(L.ok===true&&L.field==='crcf9_bencert_text'&&/✏ 直す/.test(L.kind)&&/この契約は/.test(L.reason),'履歴 = 칸 · 앞 뒤 · 이유 · 다시 읽어 같음',L);
  ok(w.eval('S.siCur["'+id+'"]')===undefined,'저장 뒤 = 다시 읽고 다시 검사');
  ok(!ws.some(x=>/sendMail|\/send$/.test(x.u)),'메일 보내기 0');
  let e1=''; try{ DOC.guardDv('PATCH','cr49f_s_is',siId,{crcf9_sino:3},{contractId:id, siIds:new Set([siId])}); }catch(e){ e1=e.message; } ok(/crcf9_sino/.test(e1),'문지기 — S/I 칸 밖 = 막음'); }

console.log((fail?'FAIL':'PASS')+' v23 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v23 예외',e.stack); process.exitCode=1; });
