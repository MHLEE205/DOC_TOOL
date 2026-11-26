/* v0.14 시험 (지시서 D00 사용성 개선 · Step 5) — 가짜 데이터만 · 네트워크 없음. node v14.js [html]
   1 판단 규칙 1-1 (지불일 = 송금 처리 끝 · 앞날 = 送金予定) · 1-2 (베트남 Deposit 회답 대기 = 待ち · バイヤー) · 1-3 (대기는 늘 보임 · 기준 넘으면 催促) · 1-4 (乙仲 ACL 訂正依頼 → 待ち · 訂正 ACL)
   2 그룹 (やること = 일의 순서 · 待ち = 상대별 · 今日終わったもの) · 정렬 · 기한 색
   3 화면 (세 구역 · 한 줄 · 그룹 머리 안내 · ？ = 매뉴얼 링크 · 0 건 = 한 줄 · 今日終わったもの 접힘 · 폴더 전 COMPASS 만으로 먼저)
   4 保存の入口 (할 일만 펼침 · 済み n 件 · 0 건 = 한 줄 · 取消 / 重複 / 同じ内容 기억 → 다시 열면 안 나옴 · 이름 · 크기 같으면 안 내려받음 · 못 읽으면 再確認)
   5 속도 (폴더 = $batch 20 개씩 · 안은 GET 만 · 실패 → 1 건씩 · 이 브라우저에 기억 → 두 번째는 바뀐 폴더만) */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine'), FX=require('./acl_fx/fixtures'), N=require('./acl_fx/fake_naccs'), PR=require('./acl_fx/pdfread');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const qa=(w,s)=>[...w.document.querySelectorAll(s)];
const R=DOC.TODO_RULES, at=DOC.at, WIP='古紙/-. 古紙書類/▲ 書類作成中', OUT=DOC.OUT_ROOT;
const S0=o=>Object.assign({sub:null, subKnown:false, acl:null, aclFix:null, aclLast:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, payPlan:false, bl:null, ins:null, rr:null, fd:null},o||{});
const X0=o=>Object.assign({iv:'NTE2699-01', country:'INDONESIA', term:'CFR', pay:'TT', carrier:'ONE', otsu:'', buyer:'', cut:'2026-11-18', cutAm:false, blDate:''},o||{});
const NOW=at('2026-11-20','09:00');
const row=(x,s,now)=>{ const r=DOC.todoRow(X0(x),S0(s),now||NOW,null); if(r){ r.group=DOC.todoGroup(r,now||NOW); r.when=DOC.whenLabel(r,now||NOW); } return r; };
const M=(t,o)=>Object.assign({t, subj:'', att:[], hasAtt:false, body:'', skind:'other', uses:[], kind:''},o);
const base={iv:'NTE2699-01', country:'INDONESIA', term:'CFR', carrier:'ONE', cut:'2026-11-18', files:[], portal:{}, hon:[], now:NOW};
(async()=>{
console.log('1-1 지불일 = 송금 처리 끝 (앞날 포함)');
{ const mails=[M(at('2026-11-17','10:00'),{skind:'staff',uses:['CUSTREQ'],subj:'【通関書類送付】',hasAtt:true}),M(at('2026-11-17','12:00'),{skind:'otsu',uses:['ACL'],hasAtt:true}),M(at('2026-11-17','13:00'),{skind:'staff',uses:['HON']}),M(at('2026-11-18','10:00'),{skind:'carrier',uses:['BLDRAFT']})];
  const s=DOC.todoSignals(Object.assign({},base,{mails, payDate:'2026-11-24'}));
  ok(s.payPlan===true&&s.pay===at('2026-11-24','15:00')&&s.bl===null,'앞날 지불일 → payPlan (B/L 받음은 아님)',s);
  const r=DOC.todoRow(X0(),s,NOW,null); r.group=DOC.todoGroup(r,NOW); r.when=DOC.whenLabel(r,NOW);
  ok(r.gkey==='blreq'&&/^送金予定 11\/24/.test(r.why)&&r.group==='later'&&r.zone==='do','→ 「B/L 発行依頼」 · 「送金予定 11/24」 · 期限切れ 아님 (11/24 18:00)',r);
  const s2=DOC.todoSignals(Object.assign({},base,{mails, payDate:'2026-11-19'})), r2=row({},{drafts:s2.drafts, pay:s2.pay, payPlan:s2.payPlan});
  ok(r2.gkey==='blreq'&&/^送金 11\/19/.test(r2.why)&&r2.group==='late','지난 지불일 → 「送金 11/19」 · 그날 18:00 지나면 期限切れ (전과 같음)',r2);
  const s3=DOC.todoSignals(Object.assign({},base,{mails, payDate:'2026-11-24', asof:NOW})); ok(s3.pay===null&&!s3.payPlan,'asof (시험 · 재현) 은 전과 같음 — 그 시각 뒤 지불일은 안 씀',s3);
  const s4=DOC.todoSignals(Object.assign({},base,{mails, payDate:'2026-11-24', blDate:'2026-11-19'})); ok(s4.bl===null,'앞날 지불일 + B/L date 지남 → B/L 받음 아님 (송금 예정일 전)',s4);
  ok(row({term:'FOB'},{drafts:[at('2026-11-19','10:00')], pay:at('2026-11-24','15:00'), payPlan:true}).gkey==='draft','FOB · 후불은 지불일이 있어도 송금 단계 아님 (전과 같음)'); }

console.log('1-2 베트남 Deposit 회답 대기');
{ const r=row({country:'VIETNAM'},{sub:1, depoReq:at('2026-11-19','16:00'), drafts:[at('2026-11-19','10:00')]});
  ok(r.zone==='wait'&&r.gkey==='w_buyer'&&r.what==='Deposit 番号待ち'&&r.group==='wait'&&r.due==null,'Draft 왔어도 Deposit 회답 대기 → 待ち · バイヤー (送金 期限切れ 로 세지 않음)',r);
  const r2=row({country:'VIETNAM'},{sub:1, depoReq:at('2026-11-17','10:00'), depoRep:at('2026-11-19','10:00'), drafts:[at('2026-11-19','10:00')]});
  ok(r2.gkey==='draft'&&/運賃送金/.test(r2.what),'번호 (회답) 오면 → 「B/L Draft 確認 → 送金」',r2);
  const r3=row({country:'VIETNAM'},{sub:1, drafts:[at('2026-11-19','10:00')]}); ok(r3.gkey==='depo'&&/^Deposit 依頼/.test(r3.what),'Deposit 의뢰 전 → やること · Deposit 依頼',r3); }

console.log('1-3 대기는 늘 보임');
{ const a=row({},{sub:at('2026-11-20','08:00')}); ok(a&&a.zone==='wait'&&a.gkey==='w_otsu'&&!a.action,'通関書類 送付 뒤 ACL 없음 (기준 안) → 待ち · 乙仲 (버튼 없음)',a);
  const b=row({},{sub:at('2026-11-17','10:00')}); ok(b.group==='chase'&&b.action&&b.action[0]==='催促メール','기준 넘음 → 催促メール',b);
  const c=row({},{sub:1, acl:1, hon:at('2026-11-20','08:00')}); ok(c.gkey==='w_carrier'&&c.what==='Draft 待ち','本登録 뒤 → 待ち · 船社 (Draft 待ち)',c);
  const d=row({},{pay:at('2026-11-19','15:00'), bmail:at('2026-11-19','16:00')}); ok(d.gkey==='w_carrier'&&d.what==='B/L 待ち','B/L 依頼 뒤 → 待ち · 船社 (B/L 待ち)',d);
  const e=row({},{drafts:[at('2026-11-19','10:00')], cmail:at('2026-11-19','12:00')}); ok(e.gkey==='w_carrier'&&e.what==='訂正 Draft 待ち','Draft 訂正依頼 뒤 → 待ち · 船社 (訂正 Draft 待ち)',e);
  const f=row({},{subKnown:true, subSrc:'輸出許可 (ED)'}); ok(f&&f.gkey==='w_otsu'&&f.when==='—'&&!f.nudge,'시각 모르는 통관 (ED · PORTAL) → 待ち · 乙仲 (시간 표시 —)',f); }

console.log('1-4 乙仲 ACL 訂正依頼');
{ const H=R.ACLFIX_HEAD, h=t=>H.test(DOC.mailHead(t));
  eq(['[ACL訂正依頼] Re: 【通関書類送付_TEST】','[本船変更/ACL訂正依頼] Re: 【通関書類送付】','[DR訂正依頼] Re: 「通関書類送付」','[本船変更依頼] Re: [本登録依頼]','RE: [ACL訂正依頼] Re: x','[本登録依頼] Re: [ACL訂正依頼] Re: x','[訂正依頼BL#TESTBL1]','【ACL確認依頼】 RE: x'].map(h),[true,true,true,true,true,false,false,false],
    '제목 머리말 (書類ツール 下書き [ACL訂正依頼] · [本船変更依頼] · 실제 [DR訂正依頼] · [本船変更/ACL訂正依頼]) — 맨 앞이 本登録依頼 면 아님 · B/L 訂正 아님');
  ok(DOC.ACL_MAIL.TAG.fix==='[ACL訂正依頼]'&&H.test(DOC.ACL_MAIL.TAG.fix)&&H.test(DOC.ACL_MAIL.TAG.vessel),'書類ツール 의 訂正 下書き 태그와 같은 모양');
  const mk=extra=>[M(at('2026-11-17','10:00'),{skind:'staff',uses:['CUSTREQ'],subj:'【通関書類送付】',hasAtt:true}),M(at('2026-11-17','12:00'),{skind:'otsu',uses:['ACL'],hasAtt:true}),M(at('2026-11-17','14:00'),{skind:'staff',subj:'[ACL訂正依頼] Re: 【通関書類送付_NTE2699-01】'})].concat(extra||[]);
  const s=DOC.todoSignals(Object.assign({},base,{mails:mk()})); ok(s.aclFix===at('2026-11-17','14:00')&&s.aclLast===at('2026-11-17','12:00'),'신호: 訂正依頼 시각 · 마지막 ACL',s);
  const r=DOC.todoRow(X0(),s,NOW,null); ok(r.gkey==='w_otsu'&&r.what==='訂正 ACL 待ち'&&r.nudge&&r.nudge.over,'訂正依頼 뒤 새 ACL 없음 → 待ち · 乙仲 「訂正 ACL 待ち」 (기준 넘음 → 催促)',r);
  const s2=DOC.todoSignals(Object.assign({},base,{mails:mk([M(at('2026-11-18','09:30'),{skind:'otsu',uses:['ACL'],hasAtt:true})])})), r2=DOC.todoRow(X0(),s2,NOW,null);
  ok(r2.gkey==='acl'&&/^訂正版 ACL 到着 11\/18/.test(r2.why),'새 ACL 오면 → 다시 「ACL 確認」',r2);
  const s3=DOC.todoSignals(Object.assign({},base,{mails:mk([M(at('2026-11-18','09:30'),{skind:'staff',uses:['HON']})])})); ok(DOC.todoRow(X0(),s3,NOW,null).gkey==='w_carrier','訂正 뒤 本登録 했으면 → Draft 단계 (전과 같음)');
  const s4=DOC.todoSignals(Object.assign({},base,{mails:mk(), files:[{name:'NTE2699-01_ACL REV.pdf', lastModified:'2026-11-18T00:30:00Z'}], aclFiles:[{name:'NTE2699-01_ACL REV.pdf', lastModified:'2026-11-18T00:30:00Z'}]}));
  ok(DOC.todoRow(X0(),s4,NOW,null).gkey==='acl','폴더에 새 ACL (REV) 이 訂正依頼 뒤에 들어옴 → ACL 確認',s4); }

console.log('2 그룹 · 정렬 · 기한 색');
{ eq(R.TGROUPS.map(g=>g[0]),['sichk','si','fname','acl','depo','draft','blreq','insrr','fd','fdlc','w_otsu','w_carrier','w_buyer'],'그룹 순서 = 일의 순서 · 待ち = 乙仲 · 船社 · バイヤー (v0.15: 앞에 si · fname)');
  eq(R.TGROUPS.map(g=>g[1]).join(''),'dodododododododododowaitwaitwait','구역 (do 10 · wait 3 · v0.23 sichk)');
  ok(R.TGROUPS.every(g=>g[3]&&g[2])&&R.TGROUPS.filter(g=>g[4]).map(g=>g[0]).join()==='acl,draft'&&/^https:\/\/claude\.ai\/artifact\//.test(R.MANUAL),'그룹마다 한 줄 안내 · 매뉴얼 장 (있는 것만) · 링크만');
  const bl=at('2026-11-19','18:00');
  eq([row({blDate:'2026-11-19',term:'CIF'},{bl}).gkey,row({blDate:'2026-11-19',country:'KOREA'},{bl}).gkey,row({blDate:'2026-11-19'},{bl}).gkey,row({blDate:'2026-11-19',pay:'LC'},{bl}).gkey],['insrr','insrr','fd','fdlc'],'B/L 뒤: 保険 · RR → FD / L/C 원본');
  const rs=[row({iv:'A'},{drafts:[at('2026-11-18','10:00')]}),row({iv:'B',cut:'2026-11-20'},{sub:1,acl:at('2026-11-19','10:00')}),row({iv:'C',cut:'2026-11-27'},{sub:1,acl:at('2026-11-19','10:00')})].map((r,i)=>Object.assign(r,{iv:['A','B','C'][i]}));
  const G=DOC.todoSort(rs); eq(G.acl.map(r=>r.iv+':'+r.group),['B:today','C:later'],'ACL 그룹: 오늘 → 다음 (기한 순)'); eq(G.draft.map(r=>r.group),['late'],'期限切れ = 빨강 (やること 에만)');
  const w=row({},{sub:at('2026-11-20','08:00')}); ok(w.group==='wait'&&DOC.todoGroup(w,NOW)!=='late','待ち 는 빨강 없음');
  const dn=DOC.todoDone(S0({hon:at('2026-11-20','08:30'), bmail:at('2026-11-19','15:00'), fd:at('2026-11-20','08:50'), pay:at('2026-11-24','15:00'), payPlan:true}),NOW);
  eq(dn.map(x=>x[1]),['本登録依頼','FD 送付'],'今日終わったもの = 오늘 · 지금 전 · 담당의 일 (예정 송금 · 어제 것 제외)'); }

console.log('3 화면');
{ const W=X.world(), T=W.T, D=n=>X.addDays(T,n)+'T00:00:00Z';
  W.bookings[0].crcf9_bl_etd=D(-1); W.bookings[0].crcf9_maritime_freight_payment_date=X.addDays(T,-1); W.bookings[0].cr49f_cy_cut=D(-3);
  W.bookings[0]._cr49f_carrier_id_value=X.g('6',1); W.carriers=[{crcf9_carrierid:X.g('6',1), crcf9_carrier:'ONE'}];
  const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}});
  await X.until(()=>!!w.document.querySelector('.tl-zone'));
  eq(qa(w,'.tl-zone').map(z=>z.className.match(/tl-z-(\w+)/)[1]),['do','wait','done','man'],'구역 순서 やること → 待ち → 今日終わったもの → 済にしたもの (v0.23)');
  eq(qa(w,'.tl-z-do .tl-gt').map(b=>b.textContent.replace(/^[▼▶·] /,'')),R.TGROUPS.filter(g=>g[1]==='do').map(g=>g[2]),'やること 그룹 이름 = 표 순서');
  /* v0.15 (A1): 待ち 는 처음에 접혀 있음 → 눌러 펼친 뒤 */
  ok(!w.document.querySelector('.tl-z-wait .tl-grp'),'v0.15 待ち 처음 = 접힘'); w.document.querySelector('[data-tdtoggle="zone_wait"]').click(); await X.sleep(20);
  eq(qa(w,'.tl-z-wait .tl-gt').map(b=>b.textContent.replace(/^[▼▶·] /,'')).slice(1),['乙仲','船社','バイヤー'],'待ち = 상대별');
  const empty=qa(w,'.tl-grp.tl-empty'); ok(empty.length>0&&empty.every(g=>!g.querySelector('.tl-row')&&g.querySelector('.tl-gt').disabled),'0 건 그룹 = 한 줄 (줄 없음 · 못 펼침)');
  const help=qa(w,'.tl-help'); ok(help.length===R.TGROUPS.length&&help.every(a=>a.getAttribute('href')===R.MANUAL&&a.target==='_blank'),'그룹마다 「？」 = 매뉴얼 링크 (새 창)');
  ok(/「3\. ACL が届いたら」/.test(help[R.TGROUPS.findIndex(g=>g[0]==='acl')].title),'「？」 제목 = 그 장 이름',help.map(h=>h.title));
  const rows=qa(w,'.tl-z-do .tl-row, .tl-z-wait .tl-row'), ivs=rows.map(r=>r.querySelector('button.dt-link').textContent);
  ok(rows.length>0&&ivs.length===new Set(ivs).size,'한 건 = 한 줄',ivs);
  ok(rows.every(r=>r.children.length===5&&!r.querySelector('.td-stg')),'줄 = 기한 | Invoice · 船社 · 国 | 次にやること | 理由 | 버튼 (진행 칩 없음)');
  const naa=rows.find(r=>/NAA2611-01/.test(r.textContent)); ok(naa&&/ONE · VIETNAM/.test(naa.querySelector('.tl-iv').textContent),'Invoice 옆 선사 · 나라',naa&&naa.textContent);
  ok(!w.document.querySelector('.tl-z-done .tl-row'),'今日終わったもの = 접혀 있음');
  ok(!w.document.querySelector('.td-sum')&&!w.document.querySelector('.td-bar'),'옛 숫자 칸 · 마감 막대 없음 (한 줄 안내로)');
  /* 상세에서 단계 칸 (진행 칩 대신) */
  naa.querySelector('button.dt-link').click(); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button'));
  ok(qa(w,'#dtIvTabs button').length>=5,'Invoice 누르면 상세 (단계 탭)'); w.document.querySelector('#dtIv [data-back]').click();
  ok(!W.writes.length,'쓰기 0',W.writes); }
/* 폴더 전 — COMPASS 만으로 먼저 그림 (Step 4-1) */
{ const W=X.world(); let firstRows=-1, foldersAt=-1;
  const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}, init:win=>{ const f0=win.fetch; win.fetch=async(u,o)=>{ if(/\$batch/.test(u)&&firstRows<0){ await new Promise(r=>setTimeout(r,30)); const b=win.document.getElementById('dtTodoBox'); firstRows=b?b.querySelectorAll('.tl-zone').length:0; foldersAt=Object.values(win.eval('S.folders')).filter(v=>v&&typeof v==='object').length; } return f0(u,o); }; }});
  ok(firstRows===4&&foldersAt===0,'폴더를 읽기 전에 할 일 화면 (세 구역) 이 이미 그려짐',{firstRows,foldersAt}); }

console.log('4 保存の入口');
const cp=FX.compass(1), spec=FX.perfectSpec(E,cp); spec.fields.booking=['TESTBK1']; spec.rows[0].container='TSTU0000001'; spec.rows=spec.rows.slice(0,1); FX.retotal(spec);
const PDF1=Buffer.from(await N.build(spec)); const spec2=JSON.parse(JSON.stringify(spec)); spec2.fields.consignee=['TO ORDER OF OTHER BANK']; const PDF2=Buffer.from(await N.build(spec2));
const INIT={init:w=>{ w.pdfjsLib=PR.pdfjsForWindow(); }}, SV=w=>w.eval('SAVE');
function mkWorld(){
  const W=X.world(); W.itemBytes={}; W.attBytes={};
  const f=W.sp[WIP+'/NAA2611-01'].find(x=>x.name==='NAA2611-01_ACL.pdf'); W.itemBytes[f.id]=PDF1;
  const D=X.addDays(W.T,0)+'T01:00:00Z', msg=(id,subject,atts)=>({id,subject,from:{emailAddress:{address:'otsu@forwarder.test'}},receivedDateTime:D,sentDateTime:D,hasAttachments:true,bodyPreview:'',attachments:atts.map(([aid,name,size])=>({id:aid,name,contentType:'application/pdf',size:size||77,isInline:false}))});
  W.messages=W.messages.concat([msg('m1','ACL TESTBK1',[['a1','ACL_TESTBK1.pdf']]),msg('m2','RE: ACL TESTBK1',[['a2','ACL_0002.pdf']])]);
  W.attBytes['m1|a1']=PDF2; W.attBytes['m2|a2']=PDF1;
  /* save_log 을 가짜 SharePoint 에 쌓음 (PUT → 다음 열기에서 읽힘) */
  W.putFail=u=>{ const m=u.match(/root:\/(.*doc_tool\/save_log\/(\d{8}))\/([^:]+):\/content/); if(m){ const dir=m[1]; (W.sp[OUT+'save_log']=W.sp[OUT+'save_log']||[]).some(x=>x.name===m[2])||W.sp[OUT+'save_log'].push({id:'d'+m[2],name:m[2],folder:{childCount:1}}); (W.sp[dir]=W.sp[dir]||[]).push({id:'l'+Math.random(),name:m[3],file:{}}); W.pending=(W.pending||[]).concat([[dir+'/'+m[3]]]); } return 0; };
  return W;
}
const rowsTxt=w=>qa(w,'#dtInbox .sv-row').map(r=>r.textContent);
const flush=async W=>{ for(const x of W.writes){ const u=decodeURIComponent(x.url), m=u.match(/root:\/(.*doc_tool\/save_log\/[^:]+):\/content/); if(m&&!W.content[m[1]]) W.content[m[1]]=typeof x.body==='string'?x.body:await x.body.text(); } };
{ const W=mkWorld(), w=await X.page(W,{...INIT, html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}});
  await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>SV(w).rows.length===2&&SV(w).rows.every(r=>r.res),20000);
  const res=SV(w).rows.map(r=>r.res).sort(); eq(res,['2版目','重複'],'(준비) 새 판 1 · 重複 1');
  ok(rowsTxt(w).length===1&&/2版目/.test(rowsTxt(w)[0]),'할 일 (新規 · N版目 · 不明 · フォルダなし) 만 펼침',rowsTxt(w));
  const rb=w.document.getElementById('dtSvRest'); ok(rb&&/済み 1 件（開く）/.test(rb.textContent),'나머지 = 「済み 1 件（開く）」 한 줄');
  rb.click(); ok(rowsTxt(w).length===2,'열면 보임'); w.document.getElementById('dtSvRest').click();
  const logs=W.writes.filter(x=>/save_log/.test(decodeURIComponent(x.url))); ok(logs.length===1&&/"result":"重複"/.test(await logs[0].body.text()),'重複 → save_log 에 기억 (1 번)',logs.length);
  /* 保存しない → 기억 */
  w.document.querySelector('#dtInbox [data-svno]').click(); await X.until(()=>W.writes.filter(x=>/save_log/.test(decodeURIComponent(x.url))).length===2);
  ok(/"result":"取消"/.test(await W.writes.filter(x=>/save_log/.test(decodeURIComponent(x.url)))[1].body.text()),'保存しない → 取消 기억');
  ok(W.writes.every(x=>x.method==='PUT'&&/doc_tool\/save_log\//.test(decodeURIComponent(x.url))&&/conflictBehavior=fail/.test(x.url)),'쓰기 = save_log 새 파일만',W.writes.map(x=>x.url));
  const box=w.document.getElementById('dtInbox').textContent; ok(/新しい書類 0 件（直近 5 営業日のメールを確認 · \d\d:\d\d）/.test(box)&&!w.document.querySelector('#dtInbox .sv-row'),'할 일 0 → 한 줄 「新しい書類 0 件（直近 5 営業日のメールを確認 · HH:MM）」 (v0.17 F10)',box.slice(0,200));
  /* 다시 열기 — 기억한 2 건은 안 나옴 · 첨부도 안 내려받음 */
  await flush(W); const W2=Object.assign(mkWorld(),{sp:W.sp, content:W.content}); W2.writes=[]; W2.req=[];
  const w2=await X.page(W2,{...INIT, html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}}); await X.until(()=>SV(w2).mailSt==='ok',20000); await X.sleep(30);
  ok(SV(w2).rows.length===0&&!W2.req.some(r=>/attachments\/a\d\/\$value/.test(r)),'새로 열어도 取消 · 重複 은 안 나옴 · 첨부 안 내려받음',{rows:SV(w2).rows.map(r=>r.res), req:W2.req.filter(r=>/\$value/.test(r))}); }
{ /* 이름 · 크기가 폴더 파일과 같으면 안 내려받음 */
  const W=mkWorld(); W.messages=W.messages.filter(m=>!/^m\d$/.test(m.id||'')); const D=X.addDays(W.T,0)+'T01:00:00Z';
  W.messages.push({id:'m5',subject:'ACL TESTBK1 NAA2611-01',from:{emailAddress:{address:'otsu@forwarder.test'}},receivedDateTime:D,hasAttachments:true,bodyPreview:'',attachments:[{id:'a5',name:'NAA2611-01_ACL.pdf',contentType:'application/pdf',size:10,isInline:false}]});
  W.attBytes['m5|a5']=PDF1;
  const w=await X.page(W,{...INIT, html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}}); await X.until(()=>SV(w).mailSt==='ok',20000);
  const r=SV(w).rows[0]; ok(r&&r.res==='重複'&&/名前 · 大きさが同じ/.test(r.msg)&&!W.req.some(x=>/attachments\/a5\/\$value/.test(x)),'이름 · 크기 같음 → 重複 (첨부 안 내려받음)',r&&r.msg); }
{ /* 保存済みファイルを読めない → 再確認 (새 판으로 잘못 보지 않음) */
  const W=mkWorld(); W.itemBytes={};   // 폴더의 ACL 파일 내용 = 404
  const w=await X.page(W,{...INIT, html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}}); await X.until(()=>SV(w).mailSt==='ok',20000); await X.until(()=>SV(w).rows.length===2&&SV(w).rows.every(r=>r.res),20000);
  ok(SV(w).rows.every(r=>r.res==='再確認')&&!w.document.querySelector('#dtInbox [data-svsave]'),'保存済み 파일을 못 읽음 → 「再確認」 (저장 버튼 없음 · 重複 / 新しい版 으로 단정하지 않음)',SV(w).rows.map(r=>r.res));
  ok(!W.writes.length,'再確認 은 기억하지 않음 (쓰기 0)'); }

console.log('5 속도 — $batch · 기억');
{ const W=X.world(), w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}});
  const ch=W.req.filter(r=>/:\/children/.test(r)&&/▲ 書類作成中\/N/.test(decodeURIComponent(r)));
  ok(W.batches>=1&&ch.length>=2,'Invoice 폴더 = $batch 로 읽음',{batches:W.batches, ch:ch.length});
  ok(!W.writes.length,'$batch (GET 만) 은 쓰기가 아님 · 쓰기 0',W.writes);
  const c=JSON.parse(w.localStorage.getItem('doc_tool_folders_v14')); ok(c&&c.f&&c.f['NAA2611-01']&&c.f['NAA2611-01'].files.length>=3,'폴더 내용을 이 브라우저에 기억 (localStorage)');
  /* 두 번째 — 같은 브라우저 (localStorage 그대로) · 바뀐 폴더만 */
  const ls={doc_tool_who:'all', doc_tool_folders_v14:w.localStorage.getItem('doc_tool_folders_v14')};
  const W2=X.world(); W2.sp[WIP][1].folder={childCount:9};   // NBB2611-01 만 바뀜
  const w2=await X.page(W2,{html:HFILE, first:true, ls});
  const ch2=W2.req.filter(r=>/:\/children/.test(r)&&/▲ 書類作成中\/N/.test(decodeURIComponent(r))).map(r=>decodeURIComponent(r).match(/作成中\/([^:/]+)/)[1]);
  eq([...new Set(ch2)],['NBB2611-01'],'두 번째 열기 → 바뀐 폴더 (NBB2611-01) 만 다시 읽음');
  ok(/前回のまま 1/.test(w2.eval('S.doneMsg')),'완료 줄에 「前回のまま n」',w2.eval('S.doneMsg'));
  eq(JSON.stringify(w2.eval('S.folders["NAA2611-01"].files.map(f=>f.name).sort()')),JSON.stringify(w.eval('S.folders["NAA2611-01"].files.map(f=>f.name).sort()')),'기억한 폴더 = 읽은 것과 같음');
  const W3=X.world(), w3=await X.page(W3,{html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all', doc_tool_folders_v14:'{broken'}}); ok(/前回のまま 0/.test(w3.eval('S.doneMsg')),'기억이 깨져 있으면 → 전부 읽음 (오류 없음)'); }
{ /* $batch 실패 → 1 건씩 (지금처럼) */
  const W=X.world(); const w=await X.page(W,{html:HFILE, first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}, init:win=>{ const f0=win.fetch; win.fetch=async(u,o)=>/\$batch/.test(u)?{ok:false,status:400,headers:{get:()=>null},json:async()=>({})}:f0(u,o); }});
  ok(w.eval('typeof S.folders["NAA2611-01"]==="object"&&S.folders["NAA2611-01"].files.length>=3'),'$batch 안 되면 → 1 건씩 읽어서 같은 결과'); }
{ const app=HTML.split('<script id="doc-app">')[1]||''; const gb=app.slice(app.indexOf('async function graphBatch'), app.indexOf('async function loadFoldersBatch'));
  ok(/method:'GET'/.test(gb)&&!/method:'(?:PUT|PATCH|DELETE)'/.test(gb)&&(gb.match(/method:/g)||[]).length===2,'graphBatch: 안의 요청 = GET 고정 (밖은 POST $batch 1 곳)'); }
{ ok(/画面が止まった最長/.test(HTML)&&/PerformanceObserver/.test(HTML),'걸린 시간 · 화면 멈춤 (longtask) 을 화면 아래 한 줄로'); }
console.log((fail?'FAIL':'PASS')+' v14 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v14 예외',e.stack); process.exitCode=1; });
