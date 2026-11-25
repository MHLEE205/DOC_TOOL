/* v0.22 시험 (지시서 THOR_17 Part ② · 형님 V1 ~ V8 · K3 · K4 · 리나이 자동 기록) — 가짜 데이터 · 가짜 거래처 (SAMPLE · TEST · 2699 · example.test) · 네트워크 없음 (AI 도 가짜) · 메일 보내기 0. node v22.js [html]
   V1 서류 보기 (왼쪽 PDF / 오른쪽 결과 · 쪽 ← → · 확대 · ⟲ ⟳ 180° 이 PC 기억 · 결과 줄 → 그 칸 · 글자 찾기 dvFind) · V2 保存の入口 「👁 見る」 · V3 「3 回目で確定」 · 잘라낸 그림 ·
   V4 ACL · B/L 순서 (결론 → 相違 → 読めない → 過去の誤記 · 表記差 → 버튼 → 체크리스트 (맨 아래 · 접기)) · V5 결과 5 색 (CSS 변수 · 라이트 / 다크) · V7 契約別 완료 접기 · V8 国内 (JAPAN · LS- · L) 규칙 한 곳 ·
   자동 기록 (fdHash · 같은 결과 = 안 씀) · K3 보험증권 AI (저장본 · 빈 서식 → TO BANK · 키 없음) · K4 FD送付日 · 문지기 (.ins.json · _h 이름) · 엔진 고정 */
const fs=require('fs'),path=require('path'),nodeCrypto=require('crypto');
const X=require('./fake'), ENG=require('./engine'), R=require('./acl_fx/pdfread'), {mkPdf}=require('./bl_fx/draft');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const WIP='古紙/-. 古紙書類/▲ 書類作成中', IV='NAA2611-01';
const INIT={init:w=>{ w.pdfjsLib=R.pdfjsForWindow(); }};
const body=w=>w.document.getElementById('dtIvBody');
const open=async(w,tab)=>{ w.document.getElementById('dtQ').value=IV; w.document.getElementById('dtGo').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.querySelector('#dtIvTabs button[data-tab="'+tab+'"]'),20000);
  await X.until(()=>w.eval('S.folders["'+IV+'"]&&S.folders["'+IV+'"].files')?true:false,20000);
  w.document.querySelector('#dtIvTabs button[data-tab="'+tab+'"]').click(); await X.sleep(200); };

(async()=>{
console.log('엔진 고정 · 버전');
{ const a=ENG.pin(HTML), b=ENG.blPin(HTML), f=ENG.fdPin(HTML);
  ok(a.commit===b.commit&&b.commit===f.commit&&a.ver==='0.20'&&b.ver==='0.6'&&f.ver==='0.3','acl v0.20 · bl v0.6 · fd v0.3 = 같은 커밋 (v0.22.1)',[a,b,f]);
  const A=ENG.engine(HTML), F=ENG.fdEngine(HTML); ok(typeof A.scanApplyR3==='function'&&typeof A.partyNotation==='function'&&typeof F.insMerge==='function'&&F.VERSION==='0.3','엔진 v0.20 (scanApplyR3 · partyNotation) · fd v0.3 (insMerge)');
  ok(/<title>LEENAI D-00 書類ツール v0\.22(\.1)?<\/title>/.test(HTML)&&/version:'0\.22(\.1)?'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.22 (title · CFG) · 푸터'); }

console.log('V8 国内 · V7 完了 — 규칙 한 곳');
{ eq([DOC.isDomestic({iv:'LTEST2699-01'}), DOC.isDomestic({ct:'LS-2611AA1'}), DOC.isDomestic({country:'japan'}), DOC.isDomestic({iv:'NAA2611-01', ct:'LRS-2611AA1', country:'VIETNAM'})],[true,true,true,false],'V8 isDomestic — Invoice L · 契約 LS- · 国 JAPAN');
  ok(/if\(isDomestic\(\{iv\}\)\) return false;/.test(HTML)&&/DOC\.isDomestic\(\{ct:c\.cr49f_sale_contract_no, country:cty\}\)/.test(HTML),'V8 Invoice 別 · 契約別 = 같은 함수 (규칙 한 곳)');
  const C=(l,s,o)=>DOC.ctDone({lc:{s:l}, si:Object.assign({s},o||{})});
  eq([C('done','done'), C('na','done'), C('wait','done'), C('done','todo'), C('done','done',{tent:true}), C('done','diff'), C('done','done',{lcStale:true})],[true,true,false,false,false,false,false],'V7 ctDone — L/C 済 / — + S/I 済 = 완료 · 仮 · 相違 · 待ち = 위'); }

console.log('자동 기록 — fdHash · 문지기');
{ const r1={items:[{key:'a',status:'INFO',trial:true,would:'DIFF',expected:'1',actual:'2'}], read:[{type:'IV',file:'x.pdf'}]}, r2=JSON.parse(JSON.stringify(r1)); r2.items[0].would='MATCH';
  ok(/^[0-9a-f]{8}$/.test(DOC.fdHash(r1))&&DOC.fdHash(r1)===DOC.fdHash(JSON.parse(JSON.stringify(r1)))&&DOC.fdHash(r1)!==DOC.fdHash(r2),'fdHash — 같은 결과 = 같은 키 · 다르면 다름 (8 자리)');
  const okP=p=>{ try{ return DOC.guardOut(p)===true; }catch(e){ return false; } }, V=DOC.V21;
  eq([okP(V.FD_DIR+IV+'_20261125-010203_d2_h0123abcd.json'), okP(V.FD_DIR+IV+'_20261125-010203_d2.json'), okP(V.FD_DIR+IV+'_20261125-010203_d2_hXYZ.json'), okP(V.FD_AI_DIR+'a'.repeat(64)+'.ins.json'), okP(V.FD_AI_DIR+'a'.repeat(64)+'.json'), okP(V.FD_AI_DIR+'a'.repeat(64)+'.x.json')],
     [true,true,false,true,true,false],'문지기 — fd/ _h 키 이름 · _fd_ai/{sha256}.ins.json 만 (다른 이름 막음)'); }

console.log('V1 글자 찾기 · 회전');
{ const pages=[{page:1, w:600, h:800, items:[{s:'SHIPPER',x:40,y:700,w:60,h:10},{s:'SAMPLE EXPORT',x:40,y:680,w:120,h:10},{s:'CO., LTD.',x:165,y:680,w:60,h:10}]},{page:2, w:600, h:800, items:[{s:'FREIGHT PREPAID AS ARRANGED',x:100,y:400,w:200,h:12}]}];
  const h=DOC.dvFind(pages,'SAMPLE EXPORT CO., LTD.\n1-2-3 SAMPLE TOWN'); ok(h&&h.page===1&&h.box[0]<0.07&&h.box[2]>0.37&&h.box[1]>0.1&&h.box[3]<0.16,'dvFind — 첫 줄 (조각 2 개 이어서) → 1 쪽 · 위치 (왼쪽 위 = 0)',h);
  ok(DOC.dvFind(pages,'freight prepaid as arranged').page===2&&DOC.dvFind(pages,'NOT IN DOC')===null&&DOC.dvFind(pages,'AB')===null,'dvFind — 2 쪽 · 없음 = null · 너무 짧음 = null'); }

console.log('V4 · V3 — ACL 결과 나누기 · B/L 표 옮기기');
{ eq(DOC.aclSplit('<div>A</div><!--av-list--><details>L</details>'),['<div>A</div>','<details>L</details>'],'aclSplit — <!--av-list--> 앞 = 위 · 뒤 = 체크리스트');
  const bh='<div class="av-concl av-ng">X</div><div class="av-h">確認した項目 (2)</div><table class="av-list"><tr title=""><td class="av-m av-read">ー</td><td>Port of Loading</td><td class="av-read">読めず</td></tr><tr title=""><td class="av-m av-ok">✓</td><td>Vessel</td><td class="av-ok">一致</td></tr></table><div class="av-h av-ng">相違 1 か所</div>';
  const sp=DOC.blSplit(bh); ok(sp.top.indexOf('確認した項目')<0&&/相違 1 か所/.test(sp.top)&&/<table class="av-list">/.test(sp.list)&&JSON.stringify(sp.reads)==='["Port of Loading"]','blSplit — 표를 떼어 내고 · 読めない 줄 이름'); }

console.log('V5 결과 5 색 — CSS 변수 (라이트 · 다크)');
{ const css=HTML.match(/<style>([\s\S]*?)<\/style>/)[1]; const both=k=>(css.match(new RegExp('--'+k+':#[0-9A-Fa-f]{6}','g'))||[]).length===2;
  ok(['rs-ok','rs-note','rs-ng','rs-read','rs-na'].every(both),'5 색 변수 — 라이트 · 다크 둘 다');
  ok(/\.av-ok\{color:var\(--rs-ok\)\}\.av-ng\{color:var\(--rs-ng\);font-weight:700\}\.av-note\{color:var\(--rs-note\)\}\.av-read\{color:var\(--rs-read\)\}\.av-na\{color:var\(--rs-na\)\}/.test(css)&&/\.av-list td\.av-m\.av-ng\{border-left-color:var\(--rs-ng\)\}/.test(css)&&/\.fd-w-DIFF\{color:var\(--rs-ng\);font-weight:700\}/.test(css),'一致 초록 · 表記差 노랑 · 相違 빨강 굵게 · 読めず 주황 · 対象外 회색 (글자 + 왼쪽 표시 · ACL · B/L · FD · S/I)'); }

console.log('V1 화면 — ACL 탭 = 왼쪽 서류 · 오른쪽 결과 · V4 순서');
{ const W=X.world(), w=await X.page(W,{...INIT}); await open(w,'acl'); await X.until(()=>!!w.document.getElementById('dtDV'),10000); await X.sleep(300);
  const L=w.document.querySelector('.dv-split .dv-left #dtDV'), Rt=w.document.querySelector('.dv-split .dv-right .dt-panel'); ok(!!L&&!!Rt,'왼쪽 #dtDV · 오른쪽 결과 (.dv-split)');
  const bar=L.querySelector('.dv-bar'); ok(!!bar&&['prev','next','in','out','fit','l90','r90','r180'].every(a=>!!bar.querySelector('[data-dv="'+a+'"]')),'보기 막대 — ← → · − ＋ 全体 · ⟲ ⟳ 180°');
  const B=body(w), A=B.querySelector('.dt-actions'), LB=B.querySelector('.av-listbox');
  ok(!!A&&(!LB||(A.compareDocumentPosition(LB)&w.Node.DOCUMENT_POSITION_FOLLOWING)),'V4 체크리스트 = 버튼 아래 (맨 아래 · 접기)',!!LB);
  ok(B.querySelectorAll('.dv-right [data-key]').length>0||!LB,'결과 줄에 data-key (누르면 서류의 그 칸으로)');
  /* 회전 = 이 PC 기억 (localStorage) */
  w.eval('DV.rotSet(DV.rk("X.pdf",2),180)'); eq([w.eval('DV.rotGet(DV.rk("X.pdf",2))'), JSON.parse(w.localStorage.getItem(DOC.V22.ROT_KEY))['X.pdf#2']],[180,180],'⟲ ⟳ 180° = 이 PC 에 기억 (파일 + 쪽)');
  eq([w.eval('JSON.stringify(DV.rotBox([0.1,0.2,0.3,0.4],180))'), w.eval('JSON.stringify(DV.rotBox([0.1,0.2,0.3,0.4],0))')],['[0.7,0.6,0.9,0.8]','[0.1,0.2,0.3,0.4]'],'노란 테두리 = 돌린 뒤 위치');
  ok(!W.writes.some(x=>/api\.anthropic|sendMail|\/send$/.test(x.url)),'AI · 메일 보내기 0'); }

console.log('V2 保存の入口 「👁 見る」');
{ const W=X.world(), w=await X.page(W,{...INIT}); await X.until(()=>typeof w.eval('typeof SAVE')==='string',5000);
  const pdf=await mkPdf([[{x:40,y:40,t:'SAMPLE ACL'}]]);
  w.eval('SAVE.rows.push({id:9901, res:"新規", iv:"'+IV+'", src:"メール", name:"'+IV+'_ACL.pdf", attName:"'+IV+'_ACL.pdf", msg:"x"})'); w.SAVE_BYTES=pdf; w.eval('SAVE.rows[SAVE.rows.length-1].bytes=new Uint8Array(window.SAVE_BYTES).buffer'); w.eval('renderInbox()');
  const vb=w.document.querySelector('[data-svview="9901"]'); ok(!!vb&&/見る/.test(vb.textContent),'PDF 줄 = 「👁 見る」 버튼');
  vb.click(); await X.sleep(200); ok(!!w.document.querySelector('#dtModalBox #dtDVm .dv-bar')&&/NAA2611-01_ACL\.pdf/.test(w.document.getElementById('dtModalBox').textContent),'누르면 같은 보기 부품 (모달 · 파일 이름)');
  const nw=W.writes.length; ok(nw===0||!W.writes.some(x=>/save_test|書類作成中/.test(decodeURIComponent(x.url))),'보기 = 쓰기 0'); }

console.log('V3 잘라낸 그림 (읽기만)');
{ const W=X.world(); const name='a'.repeat(64)+'.other.r3.freight.png'; W.content['古紙/-. AI 活用/D-00/ACL_bench/_scan_ai/'+name]='PNGDATA';
  const w=await X.page(W,{...INIT}); await X.until(()=>typeof w.eval('typeof cropLoad')==='string',5000);
  w.URL.createObjectURL=()=>'blob:test-crop'; const d=w.document.createElement('div'); d.innerHTML='<img data-crop="'+name+'"><img data-crop="../x.png">'; w.document.body.appendChild(d); await w.eval('cropLoad')(d); await X.sleep(100);
  const im=d.querySelectorAll('img'); ok(/^blob:/.test(im[0].src)&&!im[1].src,'_scan_ai/{sha256}.r3.{칸}.png 만 읽음 (다른 이름 = 안 읽음)',[im[0].src.slice(0,10),im[1].src]); }

console.log('K3 보험증권 AI · K4 FD送付日');
{ const W=X.world(); W.itemBytes={}; const add=(name,bytes)=>{ const f={id:'k'+Object.keys(W.itemBytes).length, name, file:{}, size:bytes.length, lastModifiedDateTime:'2026-11-10T00:00:00Z', webUrl:'https://example.test/sp/'+encodeURIComponent(name)}; W.sp[WIP+'/'+IV].push(f); W.itemBytes[f.id]=bytes; return f; };
  const pol=await mkPdf([[{x:40,y:40,t:'MARINE CARGO POLICY'}]]), tb=await mkPdf([[{x:40,y:40,t:'S1'}],[{x:40,y:40,t:'S2'}]]); add('126-00000000000000000000_1POL.pdf',pol); add(IV+'_TO BANK.pdf',tb);
  const sh=b=>nodeCrypto.createHash('sha256').update(b).digest('hex'), D='古紙/-. AI 活用/D-00/ACL_bench/_fd_ai/';
  W.content[D+sh(pol)+'.ins.json']=JSON.stringify({schema:'fd_ins_ai/1', sha256:sh(pol), by:'POL', pages:[1], reads:[{is_insurance:true},{is_insurance:true}]});   // 値のない様式
  const rd={is_insurance:true, currency:'USD', amount:'99,999.-', conditions:'INSTITUTE CARGO CLAUSES (A)', exclusions:'', vessel:'SAMPLE VESSEL 001', sailing:'NOV. 05, 2026', voyage_from:'SAMPLE POL', voyage_to:'CAT LAI', claims_payable_at:'DESTINATION', claims_currency:'USD', agent:'', assured:'SAMPLE EXPORT CO., LTD.', originals:'2', remarks:''};
  W.content[D+sh(tb)+'.ins.json']=JSON.stringify({schema:'fd_ins_ai/1', sha256:sh(tb), by:'LOCATE', pages:[2], reads:[rd,rd]});
  const w=await X.page(W,{...INIT}); await X.until(()=>typeof w.eval('typeof fdInsAi')==='string',5000);
  await X.until(()=>!!w.eval('S.folders&&S.bk&&S.bk.length'),20000); const F=ENG.fdEngine(HTML); w.FDE=F;
  const r=await w.eval('(async()=>{ const f=S.folders["'+IV+'"]; return f?await fdInsAi(window.FDE, "'+IV+'", f.files, null, f.files.find(x=>/TO BANK/.test(x.name)), null):"nofolder"; })()');
  ok(r&&r.from==='saved'&&r.ins&&r.ins.by==='LOCATE'&&r.ins.sha256===sh(tb),'_1POL = 값 없는 서식 → TO BANK 의 저장본 (AI 0)',r&&{from:r.from, by:r.ins&&r.ins.by});
  ok(!W.aiCalls,'저장본 = AI 0');
  /* K4: FD送付日 (PORTAL clearance_status.json shipping) → fd:due:present */
  const res=F.check({iv:IV, files:[], lc:{expiry_date:'2026-12-31', docs_46A:[]}, lcText:':48: PERIOD = 21', meta:{blDate:'2026-11-05'}, today:'2026-11-25', fdSent:'2026-11-30'});
  const it=res.items.find(i=>i.key==='fd:due:present'); ok(it&&it.would==='DIFF'&&/FD送付日/.test(it.detail),'K4 FD送付日 > 船積 + 21 日 = 相違 (試験)',it);
  ok(/sh\[sk\]\.fd_date/.test(HTML)&&/insAi, fdSent\}\)/.test(HTML),'FD 탭 = PORTAL 의 FD送付日 · 보험 AI 를 엔진에'); }

console.log('V7 · V8 화면 — 契約別 (国内 JAPAN · LS- 안 보임)');
{ const W=X.world(); const c0=W.contracts[0]; W.contracts.push(Object.assign({},c0,{cr49f_sale_contractid:X.g('c',99), cr49f_sale_contract_no:'LS-2611ZZ1', cr49f_sale_contract_date:X.addDays(W.T,-5)+'T00:00:00Z'}));
  const w=await X.page(W,{...INIT}); await X.until(()=>/読み込み完了/.test((w.document.getElementById('dtProg')||{}).textContent||''),30000);
  w.document.getElementById('dtBCt').click(); await X.sleep(200); w.document.querySelector('#dtCtPeriod button[data-days="180"]').click(); w.localStorage.setItem('dt_ct_done_open','1'); w.eval('render()'); await X.sleep(100);
  const cts=[...w.document.querySelectorAll('#dtTable button.dt-link[data-ct]')].map(b=>b.textContent); ok(cts.length>0&&cts.indexOf('LS-2611ZZ1')<0,'国内 契約 (LS-) = 契約別 에 안 나옴',cts); }

console.log((fail?'FAIL':'PASS')+' v22 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v22 예외',e.stack); process.exitCode=1; });
