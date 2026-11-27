/* v0.22.1 시험 (지시서 THOR_19 Part ② · 형님 P1) — 가짜 데이터 · 가짜 거래처 · 네트워크 없음 · 메일 보내기 0. node v221.js [html]
   ②-1 試験 줄 = 같은 단계 · 같은 대상은 1 묶음 (탭 3 번 오가도) · ②-2 CP-A04 相違 → 「L/C の文言で直す」 (확인 창 · 控え → payment_deadline 만 PATCH → 다시 읽기 → 履歴) · ②-3 推薦 · 仮 S/I 의 payment_deadline = L/C 42C 원문 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), R=require('./acl_fx/pdfread');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
(async()=>{
console.log('버전 · ②-3 L/C 42C 원문');
{ ok(/<title>LEENAI D-00 書類ツール v0\.(22\.1|23|24|25|26|27|28|29|30|31|32|33)<\/title>/.test(HTML)&&/version:'0\.(22\.1|23|24|25|26|27|28|29|30|31|32|33)'/.test(HTML),'버전 v0.22.1 이상 (title · CFG)');
  eq(DOC.lc42({payment:{tenor_text:'  90 DAYS AFTER\nBILL OF LADING DATE '}}),'90 DAYS AFTER BILL OF LADING DATE','lc42 = L/C 保管所 42C 원문 (공백만 정리)');
  const res={fieldHead:['crcf9_payment_deadline','crcf9_consignee'], rec:{sinos:{1:{crcf9_payment_deadline:'90 DAYS AFTER B/L DATE FOR 100PCT OF INVOICE VALUE'},2:{crcf9_payment_deadline:'90 DAYS AFTER BILL OF LADING DATE'}}}};
  const out=DOC.siDeadlineFix(res,'90 DAYS AFTER BILL OF LADING DATE');
  eq([res.rec.sinos[1].crcf9_payment_deadline, res.rec.sinos[2].crcf9_payment_deadline, out.length, res.deadlineFix&&res.deadlineFix[0].sino],['90 DAYS AFTER BILL OF LADING DATE','90 DAYS AFTER BILL OF LADING DATE',1,'1'],'siDeadlineFix — 추천 · 仮 S/I 의 payment_deadline = 42C 원문 (다른 것만 고침 · 기록)');
  eq([DOC.siDeadlineFix({fieldHead:['crcf9_consignee'], rec:{sinos:{1:{crcf9_payment_deadline:'X'}}}},'Y').length, DOC.siDeadlineFix({rec:{sinos:{1:{}}}},'').length],[0,0],'칸이 없거나 42C 가 없으면 그대로');
  ok(/const res=lc\?await siRecommend\(id,say\):await siTtRecommend\(id,say,\{tent\}\); await siDeadlineApply\(id,res\);/.test(HTML)&&/if\(saved\)\{ await siDeadlineApply\(id,saved\);/.test(HTML),'推薦 · 前回 · 仮 S/I · 저장한 추천 모두 siDeadlineApply'); }

console.log('②-1 試験 줄 = 1 묶음');
{ const W=X.world(), w=await X.page(W,{...INIT}); await X.until(()=>typeof w.eval('typeof trialAppend')==='string',5000);
  const d=w.document.createElement('div'); d.innerHTML='<section class="dt-panel"></section>'; w.document.body.appendChild(d); w.__root=d;
  w.__items=[{cp:'CP-A04', key:'cp:CP-A04', label:'TEST 42C', trial:true, status:'INFO', would:'DIFF', expected:'A', actual:'B', detail:''}];
  for(let i=0;i<3;i++) w.eval('trialAppend(window.__root, window.__items, "LRS-2611AA1", "S/I")');
  eq([d.querySelectorAll('[data-trialbox]').length, d.querySelectorAll('.fd-tr').length],[1,1],'같은 단계 · 같은 대상 3 번 = 묶음 1 · 줄 1 (형님 화면의 CP-A04 3 번)');
  w.eval('trialAppend(window.__root, window.__items, "NAA2611-01", "ACL")'); eq(d.querySelectorAll('[data-trialbox]').length,2,'다른 단계 = 따로');
  w.eval('trialAppend(window.__root, [], "LRS-2611AA1", "S/I")'); eq(d.querySelectorAll('[data-trialbox]').length,1,'다시 그려 줄이 없으면 앞 묶음도 지움'); }

console.log('②-2 「L/C の文言で直す」');
{ const W=X.world(), id='00000000-0000-4000-8000-000000000d01', siId='00000000-0000-4000-8000-000000000f01', TO='90 DAYS AFTER BILL OF LADING DATE';
  /* COMPASS の門番は GUID の形を見る — この試験だけ 契約 · S/I の ID を GUID の形に */
  Object.keys(W).forEach(k=>{ if(Array.isArray(W[k])) W[k]=JSON.parse(JSON.stringify(W[k]).split(X.g('d',1)).join(id).split(X.g('f',1)).join(siId)); });
  W.sis[0].crcf9_payment_deadline='90 DAYS AFTER B/L DATE FOR 100PCT OF INVOICE VALUE';
  W.putFail=u=>{ const last=W.writes[W.writes.length-1]; if(last&&last.method==='PATCH'&&/cr49f_s_is\(/.test(u)){ const b=JSON.parse(last.body); Object.assign(W.sis.find(x=>x.cr49f_s_iid===siId),b,{modifiedon:'2026-11-25T09:00:00Z'}); } return 0; };
  const w=await X.page(W,{...INIT}); await X.until(()=>/読み込み完了/.test((w.document.getElementById('dtProg')||{}).textContent||''),30000);
  /* ボタン (相違の行だけ) */
  w.__it=[{cp:'CP-A04', key:'cp:CP-A04', label:'S/I 42C', trial:true, status:'INFO', would:'DIFF', expected:TO, actual:'X', detail:'', fixSi:siId, fixTo:TO},{cp:'CP-A05', key:'cp:CP-A05', label:'x', trial:true, status:'INFO', would:'DIFF', expected:'', actual:'', detail:''}];
  const h=w.eval('trialRowsHtml(window.__it,"LRS-2611AA1","S/I")'); ok((h.match(/data-sifix=/g)||[]).length===1&&/L\/C の文言で直す/.test(h),'CP-A04 相違 줄에만 「L/C の文言で直す」 버튼');
  const n0=W.writes.length; w.eval('S.cur={type:"ct", id:"'+id+'"}'); w.eval('siFixDeadline("'+id+'","'+siId+'","'+TO+'")');
  const sst=w.document.createElement('div'); sst.id='dtSiSt'; w.document.body.appendChild(sst); try{ await X.until(()=>!!w.document.getElementById('dtSiFixGo'),10000); }catch(e){ console.log('DBG st=',sst.textContent,'modal=',(w.document.getElementById('dtModalBox')||{}).textContent); throw e; }
  const mt=w.document.getElementById('dtModalBox').textContent; ok(/90 DAYS AFTER B\/L DATE FOR 100PCT OF INVOICE VALUE/.test(mt)&&mt.indexOf(TO)>=0&&w.document.getElementById('dtSiFixGo').disabled,'확인 창 = 今の値 → L/C 42C · 확인 체크 전엔 書き込む 못 누름');
  ok(W.writes.length===n0,'확인 창까지 = 쓰기 0');
  const cb=w.document.getElementById('dtSiFixOk'); cb.checked=true; cb.onchange(); w.document.getElementById('dtSiFixGo').click();
  await X.until(()=>W.writes.length>=n0+3,10000); await X.sleep(100);
  const ws=W.writes.slice(n0).map(x=>({m:x.method, u:decodeURIComponent(x.url), b:x.body}));
  const bk=ws.find(x=>/doc_tool\/si_backup\//.test(x.u)), pt=ws.find(x=>x.m==='PATCH'), lg=ws.find(x=>/doc_tool\/log\//.test(x.u));
  ok(!!bk&&!!pt&&!!lg&&ws.indexOf(bk)<ws.indexOf(pt)&&ws.indexOf(pt)<ws.indexOf(lg),'순서 = 控え (si_backup) → COMPASS PATCH → 履歴 (log)',ws.map(x=>x.m+' '+x.u.slice(-60)));
  ok(pt&&new RegExp('/cr49f_s_is\\('+siId+'\\)$').test(pt.u)&&JSON.stringify(JSON.parse(pt.b))===JSON.stringify({crcf9_payment_deadline:TO}),'PATCH = 그 S/I 의 payment_deadline 만',pt&&{u:pt.u,b:pt.b});
  const lb=lg&&(typeof lg.b==='string'?lg.b:await lg.b.text()); const L=lb&&JSON.parse(lb); ok(L&&L.ok===true&&L.before==='90 DAYS AFTER B/L DATE FOR 100PCT OF INVOICE VALUE'&&L.after===TO&&/L\/C の文言で直す/.test(L.kind),'履歴 = 앞 · 뒤 값 · 읽어 보니 같음',L);
  ok(!ws.some(x=>/sendMail|\/send$/.test(x.u)),'메일 보내기 0');
  /* 門番: payment_deadline 밖의 칸 · 다른 계약 S/I = 막음 */
  let e1='', e2=''; try{ DOC.guardDv('PATCH','cr49f_s_is',siId,{crcf9_payment_deadline:'x', crcf9_sino:2},{contractId:id, siIds:new Set([siId])}); }catch(e){ e1=e.message; }
  try{ DOC.guardDv('PATCH','cr49f_s_is','00000000-0000-4000-8000-000000000f09',{crcf9_payment_deadline:'x'},{contractId:id, siIds:new Set([siId])}); }catch(e){ e2=e.message; }
  ok(/crcf9_sino/.test(e1)&&/この契約の S\/I でない/.test(e2),'문지기 — 다른 칸 · 다른 계약의 S/I = 막음',[e1,e2]); }

console.log((fail?'FAIL':'PASS')+' v221 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v221 예외',e.stack); process.exitCode=1; });
