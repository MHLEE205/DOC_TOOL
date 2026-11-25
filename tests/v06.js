/* v0.6 시험 (지시서 D00 書類ツール v0.6 수정묶음 · 자체 확인 1 · 2 · 3 · 5 + 엔진 v0.8 고정) — 가짜 데이터만. node v06.js [html]
   1 「待ち」 = 붉은 굵은 글자 (바탕 거의 없음) · 相違 > 待ち > 確認 (4모드 대비는 theme.js)
   2 契約別 국가 · 바이어 · ITEM = 이름 (조회 칸 표시값 = 번호 를 쓰지 않음) · 값이 비면 「—」 · 계약 상세 국가도
   3 契約別 열 · 명세 여러 줄 (계약번호 · LC · S/I 첫 줄만) · 기간 4가지 (14 · 30 · 90 · 180 일) · 契約日降順 · TEST01 제외 · 要対応 = 계약 단위
   5 （仮） → S/I 確認 「S/I 未確定（仮）」 · ACL 칸 툴팁 · ACL 탭 결론 위 한 줄 (엔진 쪽 줄은 안 냄) · 판정 그대로 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const P=ENG.pin(HTML), E=ENG.engine(HTML);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const qa=(w,s)=>[...w.document.querySelectorAll(s)], txt=(w,id)=>w.document.getElementById(id).textContent;
(async()=>{
/* 엔진 v0.8 고정 */
ok(ENG.vnum(P.ver)>=ENG.vnum('0.8')&&typeof E.siTentative==='function'&&typeof E.cntrLineKeys==='function','엔진 고정 = acl_bench v0.8 (커밋 '+P.commit.slice(0,7)+' · sha256)',P);
ok(String(DOC.SI_TENT)===String(E.TENT_RE)&&DOC.ACL_TENT_NOTE===E.TENT_NOTE,'（仮） 모양 · 「参考」 문장 = 엔진 v0.8 과 같음 (한 규칙)');

/* 1 待ち */
{ const css=HTML.match(/<style>([\s\S]*?)<\/style>/)[1], rule=sel=>(css.match(new RegExp('\\'+sel+'\\{([^}]*)\\}'))||[])[1]||'';
  ok(/font-weight:700/.test(rule('.st-wait'))&&!/font-weight/.test(rule('.st-todo')),'待ち = 굵게 (確認 은 보통)',rule('.st-wait'));
  const V=b=>{ const o={}; String(b).replace(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g,(m,k,v)=>{ o[k]=v; }); return o; };
  const L=V(css.match(/\nhtml\{([\s\S]*?)\}/)[1]), D=V(css.match(/html:not\(\[data-theme\]\),html\[data-theme="dark"\]\{([\s\S]*?)\}/)[1]);
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)), red=h=>{ const [r,g,b]=rgb(h); return r>g+60&&r>b+60; }, faint=(h,base)=>rgb(h).every((v,i)=>Math.abs(v-rgb(base)[i])<=24);
  ok(red(L['st-wait-fg'])&&red(D['st-wait-fg'])&&red(L['dt-dot-wait'])&&red(D['dt-dot-wait']),'待ち 글자 · 점 = 붉은색 (밝은 3모드 · 다크)',[L['st-wait-fg'],D['st-wait-fg']]);
  ok(faint(L['st-wait-bg'],'#FFFFFF')&&!faint(L['st-diff-bg'],'#FFFFFF'),'待ち 바탕 = 아주 연함 · 相違 = 빨간 바탕 그대로 (相違 > 待ち)',[L['st-wait-bg'],L['st-diff-bg']]);
  ok(L['dt-dot-unk']&&!red(L['dt-dot-unk'])&&/border-color:var\(--dt-dot-unk\)/.test(css),'? 점 테두리는 회색 그대로 (待ち 와 따로)');
  const W=X.world(), w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  const waits=qa(w,'#dtTable .st-wait'); ok(waits.length>0&&waits.every(e=>e.textContent==='待ち'),'현황판 待ち = st-wait ('+waits.length+')');
  ok(/st-wait/.test(w.document.querySelector('.dt-legend').innerHTML),'범례도 같은 모양');
}

/* 2 · 3 契約別 */
{ const W=X.world(), FVK='@OData.Community.Display.V1.FormattedValue', g=X.g, T=W.T;
  W.contracts.push({cr49f_sale_contractid:g('d',9),cr49f_sale_contract_no:'TEST01',cr49f_pay_cls:2,['cr49f_pay_cls'+FVK]:'TT',cr49f_terms_conditions:'CFR',_cr49f_buyer_id_value:g('c',1),['_cr49f_buyer_id_value'+FVK]:'41',cr49f_sale_contract_date:X.addDays(T,-3)});
  /* 14 일 경계 · 바이어 없음 · 명세 없음 */
  W.contracts.push({cr49f_sale_contractid:g('d',10),cr49f_sale_contract_no:'LRS-2611DD1',cr49f_pay_cls:2,['cr49f_pay_cls'+FVK]:'TT',cr49f_terms_conditions:'CFR',_cr49f_buyer_id_value:null,cr49f_sale_contract_date:X.addDays(T,-14),cr49f_latest_shipment:null});
  W.contracts.push({cr49f_sale_contractid:g('d',11),cr49f_sale_contract_no:'LRS-2611EE1',cr49f_pay_cls:2,['cr49f_pay_cls'+FVK]:'TT',cr49f_terms_conditions:'CFR',_cr49f_buyer_id_value:g('c',2),['_cr49f_buyer_id_value'+FVK]:'42',_cr49f_country_id_value:g('9',2),['_cr49f_country_id_value'+FVK]:'4',cr49f_sale_contract_date:X.addDays(T,-15)});
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all',doc_tool_board:'ct'}});
  const rows=()=>qa(w,'#dtTable tbody tr').map(tr=>[...tr.querySelectorAll('td')].map(td=>td.textContent));
  eq(qa(w,'#dtTable thead th').map(x=>x.textContent),['契約番号','契約日','国','バイヤー','ITEM','QTY(MT)','単価($/MT)','最終船積日','担当','LC','S/I'],'3 열 = PORTAL 販売契約 + 担当 | LC · S/I (POD · 決済 없음)');
  const all=rows(), named=all.map(r=>r.slice(2,5).join('|')).join('\n');
  ok(!/(^|\|)\d+(\||$)/m.test(named),'2 국가 · 바이어 · ITEM 칸에 번호 (조회 칸 표시값) 없음',named);
  eq(all.map(r=>r.slice(0,5)),[['LRS-2611CC1',X.addDays(T,-10),'INDONESIA','BUYER-C','TEST ITEM OCC'],['',X.addDays(T,-10),'INDONESIA','BUYER-C','TEST ITEM ONP'],['LRS-2611DD1',X.addDays(T,-14),'—','—','—'],['LRS-2611EE1',X.addDays(T,-15),'KOREA','BUYER-B','—']],'2 이름 (国 = バイヤーの国 · バイヤー · ITEM = 品目名) · 비면 「—」 · 3 契約日降順 · 명세 2 줄 · 直近1ヶ月 (30 일)');
  const r0=qa(w,'#dtTable tbody tr'); ok(r0[0].querySelectorAll('td.c .st').length===2&&r0[1].querySelectorAll('td.c .st').length===0&&!r0[1].querySelector('button.dt-link[data-ct]'),'3 계약번호 · LC · S/I 는 그 계약 첫 줄에만');
  ok(!r0[0].classList.contains('g2')&&!r0[1].classList.contains('g2')&&r0[2].classList.contains('g2')&&r0[1].classList.contains('cont'),'3 계약마다 바탕 번갈아 (PORTAL 처럼) · 이어진 줄 표시');
  ok(/試験などの契約 1 件/.test(txt(w,'dtTable')),'3 TEST01 제외');
  w.localStorage.setItem('dt_ct_done_open','1');   // v0.22 (V7): 完了 を開いた状態で 並びを見る
  const pick=d=>{ w.document.querySelector('#dtCtPeriod button[data-days="'+d+'"]').click(); return qa(w,'#dtTable button.dt-link[data-ct]').map(b=>b.textContent); };
  eq(pick(14),['LRS-2611CC1','LRS-2611DD1'],'3 直近2週間 = 14 일 (경계 포함 · 15 일 전 제외)');
  eq(pick(90),['LRS-2611CC1','LRS-2611DD1','LRS-2611EE1'],'3 直近3ヶ月');
  eq(pick(180),['LRS-2611CC1','LRS-2611DD1','LRS-2611EE1','LRS-2611BB1','LRS-2611AA1'],'3 直近6ヶ月 (180 일) · 계약일 역순');
  ok(w.localStorage.getItem('doc_tool_ct_days')==='180','3 기간 기억 (日)');
  const ee=rows().find(r=>r[0]==='LRS-2611EE1'); eq(ee.slice(2,5),['KOREA','BUYER-B','—'],'2 계약 조회 칸 국가 표시값 「4」 대신 バイヤーの国 KOREA');
  const aa=rows().find(r=>r[0]==='LRS-2611AA1'); eq(aa.slice(4,8),['TEST ITEM OCC','100.00','$250',X.addDays(T,-60)],'QTY 소수 2 자리 · 単価 $ · 最終船積日');
  w.document.getElementById('dtTodo').click(); const tc=qa(w,'#dtTable button.dt-link[data-ct]').length; ok(+txt(w,'dtTodo').match(/\d+/)[0]===tc,'3 要対応 건수 = 계약 수 (명세 줄 수 아님)',[txt(w,'dtTodo'),tc]);
  w.document.getElementById('dtAll').click();
  /* 계약 상세 국가 */
  w.document.querySelector('#dtTable button.dt-link[data-ct]').click(); await X.until(()=>w.document.getElementById('dtCt').style.display==='flex'&&!!w.document.querySelector('#dtCtTabs button'));
  ok(/INDONESIA/.test(txt(w,'dtCtSum')),'2 계약 상세 「国」 = 이름',txt(w,'dtCtSum'));
  ok(!W.writes.length,'쓰기 0');
}

/* 5 （仮） */
{ const s1={crcf9_sino:1,crcf9_consignee:'A',crcf9_notify_party:'B',crcf9_place_of_delivery_1:'C',crcf9_po_vo:'PO1',cr49f_lc_no:'L1'};
  const base=DOC.judgeCt({pay:'TT',lcFiles:[],sis:[s1]}).si, t=DOC.judgeCt({pay:'TT',lcFiles:[],sis:[Object.assign({},s1,{crcf9_bl_text1:'TEST (仮）'})]}).si;
  ok(base.s==='done'&&t.s==='todo'&&t.tent&&/^S\/I 未確定（仮）/.test(t.why),'5 S/I （仮） → 確認 · 「S/I 未確定（仮）」',[base,t]);
  ok(DOC.siTent([{x:'【仮】'}])&&DOC.siTent([{x:'（ 仮 ）'}])&&!DOC.siTent([{x:'仮ACL'}])&&!DOC.siTent([{'x@OData.Community.Display.V1.FormattedValue':'(仮)'}]),'5 모양 (仮) · 【仮】 · 공백 / 괄호 없는 仮 는 아님');
  const W=X.world(); W.sis[0].crcf9_bl_text1='TEST NOTE（仮）';   // 계약 LRS-2611AA1 → NAA2611-01 · 02
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all',doc_tool_hide_fd:'0',doc_tool_ct_days:'180'}});
  const tr=qa(w,'#dtTable tbody tr').find(t=>/NAA2611-01/.test(t.textContent)), acl=tr.querySelectorAll('td.c .st')[1];
  ok(acl.textContent==='相違'&&/S\/I が未確定（仮）のため、照合結果は参考です/.test(acl.getAttribute('title')),'5 현황판 ACL 칸 = 판정 그대로 (相違) · 툴팁에 「参考」',[acl.textContent,acl.getAttribute('title')]);
  const tr2=qa(w,'#dtTable tbody tr').find(t=>/NBB2611-01/.test(t.textContent)); ok(!/参考/.test(tr2.querySelectorAll('td.c .st')[1].getAttribute('title')),'5 （仮） 없는 계약은 그대로');
  acl.click(); await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvBody .av'));
  const h=w.document.getElementById('dtIvBody').innerHTML, i1=h.indexOf('照合結果は参考です'), i2=h.indexOf('class="av"');
  ok(!!w.document.getElementById('dtAclTent')&&i1>=0&&i1<i2&&h.split('照合結果は参考です').length===2,'5 ACL 탭 결론 위에 한 줄 (한 번만 · 엔진 쪽 줄은 noTent)',[i1,i2]);
  /* 契約別 S/I */
  w.document.querySelector('#dtIv [data-back]').click(); w.document.getElementById('dtBCt').click();
  const ct=qa(w,'#dtTable tbody tr').find(t=>/LRS-2611AA1/.test(t.textContent)), si=ct.querySelectorAll('td.c .st')[1];
  ok(si.textContent==='確認'&&/S\/I 未確定（仮）/.test(si.getAttribute('title')),'5 契約別 S/I = 確認 · 이유',[si.textContent,si.getAttribute('title')]);
  ok(!W.writes.length,'쓰기 0');
}
console.log((fail?'FAIL':'PASS')+' v06 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v06 예외',e.stack); process.exitCode=1; });
