/* v0.3 시험 (지시서 D00 書類ツール v0.3 + ACL 엔진 v0.5 · 자체 확인 #4 ~ #8) — 가짜 데이터만. node v03.js [html]
   #4 ACL 화면 (결론 1줄 · 확인한 항목 전부 · 相違만 펼침 · 내부 이름 관리자만) · #5 本登録 (메일 → 済 · 相違 + 本登録 · CSV 대체 · 읽기만)
   #6 FD (이름 흔들림 · 하위 폴더 IV · PL · B/L 묶음) · #7 契約別 (계약일 역순 · 기간 4 · 열 · TEST01 제외) · #8 처음 색 = LEENAI
   (#1 ~ #3 넘침 · 세트 · 이름 = CONTRACT_SEND/tests/acl_bench/v05.js · #9 회귀 = 다른 시험 · #10 = check.js) */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,600));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});

(async()=>{
/* ════════ 순수 로직 ════════ */
const IV='NZZ2699-01', f=(name,sub)=>Object.assign({name, lastModified:'2026-11-10T00:00:00Z'},sub?{sub}:{});
/* #6 FD 이름 흔들림 */
const isFd=n=>DOC.fdFiles([f(n)],IV).length===1;
eq([IV+'_FD.pdf',IV+' FD.pdf',IV+'-FD.pdf',IV+'_FD-1.pdf',IV+'_FD2.pdf',IV+'_FD REV.pdf',IV+'_FD REV2.pdf',IV+'_ FD.pdf',IV+'_(FD).pdf',' '+IV+'_FD.pdf'].map(isFd),Array(10).fill(true),'FD 이름 흔들림 — _FD · 공백 FD · -FD · FD-1 · FD2 · FD REV · REV2 · 「_ FD」 · (FD) · 앞 공백 → FD');
eq([IV+'_FD DRAFT.pdf',IV+'_DRAFT FD.pdf',IV+'_仮FD.pdf',IV+'_FD仮.pdf',IV+'_FD(EST).pdf',IV+'_FD(TENTATIVE ).pdf',IV+'_FD(임시서류).pdf',IV+'_IV(FD).pdf','仮'+IV+'_FD.pdf','NZZ2699-02_FD.pdf',IV+'_FD.xlsx',IV+'_FDA.pdf'].map(isFd),Array(12).fill(false),
  'FD 아님 — DRAFT · 仮 · EST · TENTATIVE · 임시 · IV(FD) · 앞에 仮 · 다른 Invoice · xlsx · FDA (⚠️ 토르 판단: 임시본은 FD 済 로 안 셈)');
eq(DOC.fdFiles([f(IV+'_FD.pdf','PHOTO')],IV).length,0,'하위 폴더의 FD 는 안 셈 (폴더 바로 아래만)');
const J=(files,o)=>DOC.judgeIv(Object.assign({iv:IV,country:'TAIWAN',term:'CFR',premium:0,etdPast:false,folder:{files},acl:null,mailRules:[],bookingNo:'TESTBK0001',blNo:'TESTBL00001',otherBookings:[]},o||{})).fd;
eq([J([f(IV+'_FD-1.pdf')]).s,J([f(IV+' FD.pdf')]).why],['done','FINAL DOCUMENT あり'],'FD-1 · 공백 FD → 済');
/* #6 대만향 묶음 (형님 D4) */
const sub=(...n)=>n.map(x=>f(x,IV));
const b1=J(sub(IV+'_IV.pdf',IV+'_PL.xlsx',IV+'_SWB.pdf'));
eq([b1.s,b1.why,b1.files.length],['done','IV · PL · B/L まとめ済 (フォルダ '+IV+'/)',3],'하위 폴더 '+IV+'/ 에 IV · PL · B/L (SWB) → FD 済 「IV · PL · B/L まとめ済」');
eq([J(sub(IV+'_IV.pdf',IV+'_PL.xlsx','SAMPLEWAYBILL.pdf')).s,J(sub(IV+'_IV.pdf',IV+'_PL.xlsx','ONEY'+'TESTBK0001_NONCOPY.pdf')).s,J(sub(IV+'_IV.pdf',IV+'_PL.xlsx','TESTBL00001.pdf')).s],['done','done','done'],
  'B/L = 이름에 WAYBILL · 부킹 번호 · B/L 번호');
const b2=J(sub(IV+'_IV.pdf',IV+'_PL.xlsx')); eq([b2.s,/B\/L がない/.test(b2.why)],['not',true],'하나 빠짐 (B/L) → 済 아님 · 무엇이 없는지');
eq(J(sub(IV+'_IV.pdf','OTHER.pdf',IV+'_SWB.pdf')).s,'not','PL 없음 → 済 아님');
eq(J([f(IV+'_IV.pdf','NZZ2699-02'),f(IV+'_PL.xlsx','NZZ2699-02'),f(IV+'_SWB.pdf','NZZ2699-02')]).s,'not','다른 Invoice 번호 폴더 → 안 셈');
eq(J([f(IV+'_FD.pdf')].concat(sub(IV+'_IV.pdf'))).s,'done','FD 파일이 있으면 FD (묶음은 안 봄)');
/* #5 本登録 연결 */
const ships=[{iv:'NZZ2699-01',bk:'TESTBK0001',bl:'TESTBL0001'},{iv:'NZZ2699-02',bk:'TESTBK0002',bl:''}];
const H=DOC.honIndex([{at:'2026-11-18T01:00:00Z',text:'[本登録依頼] Re: 通関書類送付_NZZ2699-01'},{at:'x',text:'BKG#TESTBK0002 本登録お願いします'},{at:'y',text:'NZZ2699-09 TESTBK0001'},{at:'z',invoices:['NZZ2699-02'],bkgs:[],text:''}],ships);
eq([H['NZZ2699-01'].length,H['NZZ2699-02'].length],[1,2],'本登録 메일 ↔ 선적: Invoice 번호 우선 · 없으면 부킹 번호 · 다른 Invoice 번호만 있으면 연결 안 함 · CSV (invoices)');
eq(DOC.jstDay('2026-11-17T20:00:00Z'),'2026-11-18','날짜 = 일본 시간');
eq([E.mailKind('ご訂正ありがとうございます。本登録をお願いします。'),E.mailKind('Seal No →ABC ご訂正をお願いします。'),E.mailKind('D/Rを確認致しました。本登録お願いします。')],['本登録','訂正依頼','本登録'],'「ご訂正ありがとうございます…本登録を」 → 本登録 (엔진 MAIL_RULE 그대로)');
/* #7 契約別 규칙 */
eq(['LRS-2611AA1','UCS-26110BB2','LS-2611C3','TEST01','LRS2611AA1','lrs-2611aa1'].map(n=>DOC.CT_REAL.test(DOC.up(n))),[true,true,true,false,false,true],'실제 계약번호 모양 (LRS- · UCS- · LS-) · TEST01 · 하이픈 없음 → 제외');
eq(DOC.CT_PERIODS.map(p=>p[1]),['直近2週間','直近1ヶ月','直近3ヶ月','直近6ヶ月'],'기간 4가지 (v0.6: PORTAL 과 같은 말 · 直近2週間 + 直近6ヶ月 남김)');
eq([DOC.monthsAgo('2026-11-20',1),DOC.monthsAgo('2026-03-31',1),DOC.monthsAgo('2026-11-20',6)],['2026-10-20','2026-02-28','2026-05-20'],'n 개월 전 (말일 맞춤)');
eq(DOC.sortCtDate([{ct:'A',date:'2026-11-01'},{ct:'C',date:'2026-11-10'},{ct:'B',date:'2026-11-10'}]).map(r=>r.ct),['C','B','A'],'계약일 역순 (같은 날 = 번호 역순)');

/* ════════ 화면 (jsdom) ════════ */
const $$=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>(w.document.getElementById(id)||{}).textContent||'';
const csvRow=(at,rule,inv,body,from)=>[from||'山田 太郎',at,'','TEST '+inv,'',rule,'','','','','0',inv,'','',body,'<x@example.test>'].map(v=>'"'+v+'"').join(',');
const CSV_H='発信者,発信日時(JST),月,件名,返信/転送,件名規則,宛先(To)ドメイン,CCドメイン,添付有無,添付ファイル名,インライン画像数,Invoice番号,BKG/BL番号,添付種別,本文(先頭300字),internetMessageId';
{ /* #4 · #5 — NAA2611-01 = 저장된 照合 相違 · NBB2611-01 = 完全一致 + 本登録 메일 (가짜 b@example.test = 佐藤) */
  const W=X.world(); W.messages.push({subject:'Re: NAA2611-02 本登録',from:{emailAddress:{address:'fwd@forwarder.test'}},sentDateTime:X.addDays(W.T,-1)+'T00:00:00Z',uniqueBody:{content:'本登録お願いします'}});   // 다른 회사 (乙仲) 가 보낸 것 → 안 셈
  const w=await X.page(W,{ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  const cell=iv=>{ const tr=$$(w,'#dtTable tbody tr').find(t=>t.textContent.indexOf(iv)>=0); return tr?tr.querySelectorAll('td.c .st')[1]:null; };
  eq([cell('NBB2611-01').textContent,/本登録済 \(\d+\/\d+ 佐藤\)/.test(cell('NBB2611-01').getAttribute('title'))],['済',true],'#5 本登録 메일 (회사 사람) → ACL 済 「本登録済 (날짜 佐藤)」');
  eq([cell('NAA2611-01').textContent,cell('NAA2611-02').textContent],['相違','未'],'#5 本登録 없음 → 相違 그대로 · 다른 회사가 보낸 本登録 메일은 안 셈');
  ok(/本登録メール 1 通/.test(w.eval('S.doneMsg')),'읽기 완료 줄에 本登録 메일 수',w.eval('S.doneMsg'));
  ok(W.req.filter(r=>/\/me\/messages/.test(r)).every(r=>/^GET /.test(r))&&!W.writes.length,'#5 메일은 읽기만 (GET · 보내기 · PATCH · move 0)',W.req.filter(r=>/me\/messages/.test(r)));
  /* #4 ACL 화면 */
  w.document.getElementById('dtQ').value='NAA2611-01'; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&/NAA2611-01/.test(txt(w,'dtIvSum')));
  w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click();
  const B=w.document.getElementById('dtIvBody'), concl=B.querySelector('.av-concl');
  ok(concl&&/^直すところ 1 か所/.test(concl.textContent)&&/本登録: まだ/.test(B.textContent),'#4 ① 결론 1줄 「直すところ 1 か所」 + 「本登録: まだ」',concl&&concl.textContent);
  const items=JSON.parse(w.eval('JSON.stringify(ivRow(S.cur.b).x.acl.result.items)'));
  ok(B.querySelectorAll('.av-list tr:not(.av-g)').length===items.length,'#4 ② 확인한 항목 전부 — 한 항목 한 줄 ('+items.length+')');
  ok(B.querySelectorAll('.av-diff').length>=1&&B.querySelector('.av-diff .av-hl')&&!/追加「|脱落「/.test(B.textContent),'#4 ③ 相違만 펼침 — ACL · S/I（正） 나란히 · 다른 글자만 색 · 글자 단위 문장 없음');
  ok(!/crcf9_|ブッキング POD/.test(B.innerHTML)&&!B.querySelector('.av-list tr[title]'),'#4 직원 화면: 내부 이름 · 근거 문장 없음 (title 없음)');
  w.eval('S.me.admin=true; renderIv()'); ok(!!w.document.querySelector('#dtIvBody .av-list tr[title]'),'#4 관리자: 근거는 마우스를 올리면 (title)'); w.eval('S.me.admin=false');
  ok(!!B.ownerDocument.querySelector('#dtAclMail')&&!!B.ownerDocument.querySelector('#dtAclRun'),'#4 버튼 그대로 (訂正依頼メール · 再照合)');
  w.document.querySelector('#dtIv [data-back]').click();
  w.document.getElementById('dtQ').value='NBB2611-01'; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&/NBB2611-01/.test(txt(w,'dtIvSum')));
  w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click();
  const c2=w.document.querySelector('#dtIvBody .av-concl');
  ok(c2&&/^問題なし/.test(c2.textContent)&&/本登録: 済 \(\d+\/\d+ 佐藤\)/.test(c2.textContent),'#4 · #5 完全一致 + 本登録 → 「問題なし」 「本登録: 済 (날짜 佐藤)」',c2&&c2.textContent);
  /* 相違 + 本登録 → 済 · 相違のまま本登録 */
  W.messages.push({subject:'[本登録依頼] NAA2611-01',from:{emailAddress:{address:'tester@example.test'}},sentDateTime:X.addDays(W.T,-2)+'T03:00:00Z',uniqueBody:{content:'ご訂正ありがとうございます。本登録をお願いします。'}});
  w.document.querySelector('#dtIv [data-back]').click(); w.document.getElementById('dtReload').click();
  await X.until(()=>/読み込み完了/.test(txt(w,'dtProg'))&&cell('NAA2611-01')&&cell('NAA2611-01').textContent==='済');
  ok(/相違ありで本登録済み（要確認）/.test(cell('NAA2611-01').getAttribute('title'))&&/山田/.test(cell('NAA2611-01').getAttribute('title')),'#5 相違 + 本登録 메일 → 済 · 툴팁 「相違ありで本登録済み（要確認）」 (v0.17 D11)',cell('NAA2611-01').getAttribute('title'));
}
{ /* #5 메일을 읽지 못함 → CSV 로 대체 + 표시 */
  const W=X.world(); W.mailErr=403; W.messages=[];
  W.mailCsv='﻿'+CSV_H+'\r\n'+csvRow('2026-11-10 10:00:00','本登録依頼','NBB2611-01','D/Rを確認致しました。本登録お願いします。','佐藤 花子')+'\r\n'+csvRow('2026-11-10 11:00:00','本船変更','NAA2611-02','本船変更のお知らせ')+'\r\n';
  const w=await X.page(W,{ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  const tr=$$(w,'#dtTable tbody tr').find(t=>/NBB2611-01/.test(t.textContent)), c=tr.querySelectorAll('td.c .st')[1];
  ok(c.textContent==='済'&&/佐藤/.test(c.getAttribute('title'))&&/⚠ メールを読めない \(403\)/.test(w.eval('S.doneMsg'))&&/CSV 1 通/.test(w.eval('S.doneMsg')),'#5 메일 읽기 실패 (403) → メール一覧 CSV (本登録依頼) 로 대체 · 읽기 줄에 표시',[c.textContent,c.getAttribute('title'),w.eval('S.doneMsg')]);
  ok(/本船変更/.test($$(w,'#dtTable tbody tr').find(t=>/NAA2611-02/.test(t.textContent)).textContent),'CSV 의 本船変更 꼬리표는 그대로');
}
{ /* #6 대만향 — 하위 폴더 읽기 (FD 가 없을 때만) */
  const W=X.world(), WIP='古紙/-. 古紙書類/▲ 書類作成中', fi=(n)=>({id:'t'+n,name:n,file:{},size:1,lastModifiedDateTime:'2026-11-10T00:00:00Z',webUrl:'https://example.test/sp/'+n});
  W.sp[WIP].push({id:'dNAA2',name:'NAA2611-02',folder:{childCount:2},webUrl:'https://example.test/sp/NAA2611-02'});
  W.sp[WIP+'/NAA2611-02']=[fi('NAA2611-02_ED.pdf'),{id:'sub2',name:'NAA2611-02',folder:{childCount:3},webUrl:'x'}];
  W.sp[WIP+'/NAA2611-02/NAA2611-02']=[fi('NAA2611-02_IV.pdf'),fi('NAA2611-02_PL.xlsx'),fi('TESTBL2.pdf')];
  const w=await X.page(W,{ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  const tr=$$(w,'#dtTable tbody tr').find(t=>/NAA2611-02/.test(t.textContent)), c=[...tr.querySelectorAll('td.c .st')].pop();
  ok(c.textContent==='済'&&/IV · PL · B\/L まとめ済/.test(c.getAttribute('title')),'#6 하위 폴더 NAA2611-02/ 의 IV · PL · B/L (B/L 번호 이름) → 현황판 FD 済',[c.textContent,c.getAttribute('title')]);
  ok(W.req.some(r=>/NAA2611-02\/NAA2611-02:\/children/.test(decodeURIComponent(r)))&&!W.req.some(r=>/NBB2611-01\/[^:]*:\/children/.test(decodeURIComponent(r).replace(/NBB2611-01:\/children/,''))),'FD 없는 폴더만 하위 폴더를 읽음');
  ok(/FD済み 1 件を非表示/.test(txt(w,'dtProg'))===false,'(FD済み 숨김 꺼 둠)');
}
{ /* #7 契約別 — TEST01 제외 · 국 · POD · 계약일 */
  const W=X.world(), FVK='@OData.Community.Display.V1.FormattedValue', g=X.g;
  W.contracts.push({cr49f_sale_contractid:g('d',9),cr49f_sale_contract_no:'TEST01',cr49f_pay_cls:2,['cr49f_pay_cls'+FVK]:'TT',cr49f_terms_conditions:'CFR',_cr49f_buyer_id_value:g('c',1),cr49f_sale_contract_date:X.addDays(W.T,-3)});
  Object.assign(W.contracts[2],{_cr49f_pod1_value:g('a',3),['_cr49f_pod1_value'+FVK]:'31'});   // v0.6: 表示値は番号 (実際の形)
  const w=await X.page(W,{ls:{doc_tool_who:'all',doc_tool_board:'ct'}});
  const rows=$$(w,'#dtTable tbody tr').map(tr=>[...tr.querySelectorAll('td')].slice(0,9).map(td=>td.textContent));
  eq(rows,[['LRS-2611CC1',X.addDays(W.T,-10),'INDONESIA','BUYER-C','TEST ITEM OCC','200.50','$1,234',X.addDays(W.T,50),'担当未登録'],['',X.addDays(W.T,-10),'INDONESIA','BUYER-C','TEST ITEM ONP','50.00','$180',X.addDays(W.T,50),'担当未登録']],'#7 直近1ヶ月 · 열 (v0.6: 契約番号 · 契約日 · 国 · バイヤー · ITEM · QTY · 単価 · 最終船積日 · 担当 — 명세 2 줄) · TEST01 제외');
  ok(/試験などの契約 1 件は出していません/.test(txt(w,'dtTable'))&&/TEST01/.test(w.document.querySelector('#dtTable .dt-note').getAttribute('title')),'#7 제외 건수 표시 (마우스 = 번호)');
  eq($$(w,'#dtCtPeriod button').map(b=>b.textContent),['直近2週間','直近1ヶ月','直近3ヶ月','直近6ヶ月'],'#7 기간 4가지 (契約別에만)');
  ok(w.document.getElementById('dtIvCtl').style.display==='none','#7 ETD · FD済み 조작은 契約別에서 숨김');
  w.document.querySelector('#dtCtPeriod button[data-days="90"]').click(); eq($$(w,'#dtTable button.dt-link[data-ct]').map(b=>b.textContent),['LRS-2611CC1'],'直近3ヶ月 (120 일 전 계약은 아직 밖)');
  w.document.querySelector('#dtCtPeriod button[data-days="180"]').click(); eq($$(w,'#dtTable button.dt-link[data-ct]').map(b=>b.textContent),['LRS-2611CC1','LRS-2611BB1','LRS-2611AA1'],'直近6ヶ月 → 계약일 역순');
  w.document.getElementById('dtTodo').click(); ok($$(w,'#dtTable tbody tr').filter(tr=>tr.querySelector('button[data-ct]')).every(tr=>[...tr.querySelectorAll('td.c .st')].some(s=>/確認|相違/.test(s.textContent))),'要対応 = LC · S/I 가 確認 · 相違');
}
{ /* #8 처음 색 = LEENAI (공통 파일 키 leenai_theme 없을 때만 · 키는 쓰지 않음) · 고른 뒤 기억 */
  const W=X.world(), w=await X.page(W,{ls:{doc_tool_who:'all'}}), raw=k=>{ for(let i=0;i<w.localStorage.length;i++) if(w.localStorage.key(i)===k) return 'set'; return null; };
  ok(w.localStorage.getItem('leenai_theme')==='leenai'&&raw('leenai_theme')===null,'#8 고른 적 없음 → 공통 파일에는 「leenai」 (키는 쓰지 않음 — 같은 주소의 다른 TOOL 은 그대로)');
  w.localStorage.setItem('leenai_theme','focus'); ok(w.localStorage.getItem('leenai_theme')==='focus','#8 테마 버튼으로 고르면 (공통 파일이 키를 씀) 그 값을 기억');
  const W2=X.world(), w2=await X.page(W2,{ls:{leenai_theme:'light',doc_tool_who:'all'}}); ok(w2.localStorage.getItem('leenai_theme')==='light','#8 이미 고른 사람은 그대로 (light)');
  const W3=X.world(); W3.aclEngine=null; const w3=await X.page(W3,{ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  const c3=$$(w3,'#dtTable tbody tr').find(t=>/NAA2611-01/.test(t.textContent)).querySelectorAll('td.c .st')[1];
  ok(c3.textContent==='?'&&/エンジン/.test(c3.getAttribute('title'))&&/⚠ ACL エンジンを読めない/.test(w3.eval('S.doneMsg')),'엔진을 못 읽으면 ACL 칸 = ? (추측 안 함) · 읽기 줄에 표시',[c3.textContent,w3.eval('S.doneMsg')]);
}
console.log((fail?'FAIL':'PASS')+' v03 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v03 예외',e.stack); process.exitCode=1; });
