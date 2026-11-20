/* #7 S/I 탭 — a1_bench v0.12 엔진 (커밋 고정 + sha256) 으로 계약 1건 추천 → 고침 → 쓰기 전 저장 → 쓰기 → 다시 읽기 일치 · 취소하면 아무것도 안 씀
   가짜 COMPASS (S/I · 명세 PATCH/POST 를 기억) · 가짜 Anthropic (a1_bench 시험 harness 의 응답) · LC 는 글자로 (harness 와 같은 바꿔치기). node si.js [html] */
const fs=require('fs'),path=require('path'),cp=require('child_process'),nodeCrypto=require('crypto');
const X=require('./fake'), FX=require('./si_fx');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
const A1=HTML.match(/const A1_ENGINE = \{commit:'([0-9a-f]{40})', sha256:'([0-9a-f]{64})'/), COMMIT=A1[1], SHA=A1[2];
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const clone=o=>JSON.parse(JSON.stringify(o)), FVK='@OData.Community.Display.V1.FormattedValue';
const G=(p,n)=>(p+'00000000').slice(0,8)+'-0000-4000-8000-'+String(n).padStart(12,'0');   // 가짜 GUID
async function engineText(){
  const repo=process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND');
  try{ return cp.execFileSync('git',['-C',repo,'show',COMMIT+':a1_bench.html'],{maxBuffer:1<<25}); }catch(e){}
  const r=await fetch('https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/'+COMMIT+'/a1_bench.html'); return Buffer.from(await r.arrayBuffer());
}
const HEAD=['crcf9_consignee','crcf9_notify_party','crcf9_address','crcf9_tel','crcf9_fax','crcf9_all','crcf9_invoicetext','crcf9_bl_text1','crcf9_bl_text2','crcf9_bencert_text','crcf9_po_vo','crcf9_vo_no','crcf9_remark',
  'cr49f_payment_terms','crcf9_payment_deadline','crcf9_payment_classification','crcf9_place_of_delivery_1','crcf9_place_of_delivery_2','crcf9_place_of_delivery_3','crcf9_port_of_discharge','crcf9_shipping_mark','cr49f_lc_no'];

(async()=>{
  const ENG=await engineText();
  ok(nodeCrypto.createHash('sha256').update(ENG).digest('hex')===SHA,'S/I 엔진 원문 sha256 = 도구에 적은 값 (a1_bench @'+COMMIT.slice(0,7)+')');
  /* ── 가짜 세계 (a1_bench 시험의 계약 6건 · GUID 로) ── */
  const W=X.world(), T=W.T; let engBody=ENG;
  const cid={}, sdid={}, item=G('17e0',1); FX.NOS.forEach((no,i)=>{ cid[no]=G('5c00',i+1); sdid[no]=G('5d00',i+1); });
  const bid={'b-sg':G('b500',1),'b-ca':G('b500',2)};
  FX.BUYERS.forEach(b=>W.buyers.push(Object.assign({},b,{cr49f_buyerid:bid[b.cr49f_buyerid],['crcf9_country'+FVK]:b.crcf9_country})));
  FX.SC.forEach(c=>W.contracts.push(Object.assign({},c,{cr49f_sale_contractid:cid[c.cr49f_sale_contract_no],_cr49f_buyer_id_value:bid[c._cr49f_buyer_id_value],['cr49f_pay_cls'+FVK]:'LC',_cr49f_pod1_value:null})));
  W.sale=FX.NOS.map(no=>({cr49f_sale_detailid:sdid[no],_cr49f_sale_contract_id_value:cid[no],cr49f_price:200,cr49f_quantity:500,_cr49f_item_id_value:item,['_cr49f_item_id_value'+FVK]:'OCC'}));
  W.dets=[]; let k=0;
  FX.NOS.filter(no=>no!=='LRS-2605SG1').forEach(no=>FX.siOf(no).forEach(h=>{ const id=G('51'+String(h.crcf9_sino),++k); W.sis.push(Object.assign({},h,{cr49f_s_iid:id,_cr49f_sale_contract_id_value:cid[no]}));
    W.dets.push({crcf9_s_i_detailid:G('de00',k),_crcf9_s_i_id_value:id,_crcf9_sale_detail_id_value:sdid[no],_crcf9_item_id_value:item,crcf9_productname:'OCC',crcf9_hs_code:'HS CODE: 47071000',crcf9_weight:500,crcf9_price:200,modifiedon:'2026-03-16T00:00:00Z'}); }));
  const M2O={cr49f_s_i:[{ReferencingAttribute:'cr49f_sale_contract_id',ReferencedEntity:'cr49f_sale_contract',ReferencingEntityNavigationPropertyName:'cr49f_sale_contract_id'},{ReferencingAttribute:'ownerid',ReferencedEntity:'systemuser',ReferencingEntityNavigationPropertyName:'ownerid'}],
    crcf9_s_i_detail:[{ReferencingAttribute:'crcf9_s_i_id',ReferencedEntity:'cr49f_s_i',ReferencingEntityNavigationPropertyName:'crcf9_s_i_id'},{ReferencingAttribute:'crcf9_sale_detail_id',ReferencedEntity:'cr49f_sale_detail',ReferencingEntityNavigationPropertyName:'crcf9_sale_detail_id'},{ReferencingAttribute:'crcf9_item_id',ReferencedEntity:'cr49f_item',ReferencingEntityNavigationPropertyName:'crcf9_item_id'}]};
  const SETS={cr49f_s_i:'cr49f_s_is',crcf9_s_i_detail:'crcf9_s_i_details',cr49f_sale_contract:'cr49f_sale_contracts',cr49f_sale_detail:'cr49f_sale_details',cr49f_item:'cr49f_items'};
  const ifMatch=[]; let newN=0;

  const htmlPath=path.join(require('os').tmpdir(),'doc_tool_si_test.html'); fs.writeFileSync(htmlPath,HTML);
  const w=await X.page(W,{html:htmlPath,ls:{doc_tool_who:'all',leenai_apikey_v1:'TEST-KEY'}});
  const inner=w.fetch, R=(st,body,h)=>({ok:st>=200&&st<300,status:st,statusText:String(st),headers:{get:k=>(h||{})[k]||null},json:async()=>clone(body),text:async()=>JSON.stringify(body)});
  w.fetch=async(url,init)=>{
    url=String(url); init=init||{}; const method=(init.method||'GET').toUpperCase(), u=decodeURIComponent(url);
    if(url.indexOf('https://api.anthropic.com/')===0){ W.req.push('AI'); return FX.sse(JSON.stringify(FX.claudeReply(JSON.parse(init.body)))); }
    if(url.indexOf('https://raw.githubusercontent.com/')===0){ W.req.push('GET '+url); return {ok:true,status:200,arrayBuffer:async()=>{ const b=Buffer.from(engBody); return b.buffer.slice(b.byteOffset,b.byteOffset+b.length); }}; }
    if(url.indexOf(X.DV)===0){ const p=u.slice(X.DV.length); let m;
      if(method!=='GET'){ const body=JSON.parse(init.body); W.writes.push({method,url,body:init.body,headers:init.headers});
        if(method==='PATCH'){ ifMatch.push((init.headers||{})['If-Match']); m=p.match(/^(\w+)\(([^)]+)\)$/); const rows=m[1]==='cr49f_s_is'?W.sis:W.dets, key=m[1]==='cr49f_s_is'?'cr49f_s_iid':'crcf9_s_i_detailid', row=rows.find(r=>r[key]===m[2]); if(!row) return R(404,{error:{message:'nf'}}); Object.assign(row,body); return R(204,{}); }
        if(p==='cr49f_s_is'){ const id=G('5e00',++newN), c=(body['cr49f_sale_contract_id@odata.bind'].match(/\(([^)]+)\)/)||[])[1]; const row=Object.assign({cr49f_s_iid:id,_cr49f_sale_contract_id_value:c},body); delete row['cr49f_sale_contract_id@odata.bind']; W.sis.push(row); return R(201,row); }
        if(p==='crcf9_s_i_details'){ const id=G('5f00',++newN), b=x=>(String(body[x]||'').match(/\(([^)]+)\)/)||[])[1]; const row=Object.assign({crcf9_s_i_detailid:id,_crcf9_s_i_id_value:b('crcf9_s_i_id@odata.bind'),_crcf9_sale_detail_id_value:b('crcf9_sale_detail_id@odata.bind'),_crcf9_item_id_value:b('crcf9_item_id@odata.bind')},body);
          Object.keys(row).filter(x=>/@odata\.bind$/.test(x)).forEach(x=>delete row[x]); W.dets.push(row); return R(201,row); }
        return R(400,{error:{message:'unknown '+p}}); }
      if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\/Attributes/))) return R(200,{value:(m[1]==='cr49f_s_i'?HEAD.concat(['crcf9_sino','cr49f_s_iid']):['crcf9_productname','crcf9_hs_code','crcf9_s_i_detailid','crcf9_price','crcf9_weight']).map(x=>({LogicalName:x}))});
      if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\/ManyToOneRelationships/))) return R(200,{value:M2O[m[1]]||[]});
      if((m=p.match(/^EntityDefinitions\(LogicalName='(\w+)'\)\?\$select=EntitySetName/))) return R(200,{EntitySetName:SETS[m[1]]});
      if(/^cr49f_sale_contracts\?\$filter=startswith/.test(p)) return R(200,{value:clone(W.contracts.filter(c=>/^LRS-2[56]/.test(c.cr49f_sale_contract_no)))});
      if(/^cr49f_buyers\?\$select=/.test(p)) return R(200,{value:clone(W.buyers)});
      if((m=p.match(/^crcf9_s_i_details\?\$filter=_crcf9_s_i_id_value eq ([\w\-]+)/))) return R(200,{value:clone(W.dets.filter(d=>d._crcf9_s_i_id_value===m[1]))});
      if((m=p.match(/^cr49f_sale_details\?\$filter=_cr49f_sale_contract_id_value eq ([\w\-]+)/))) return R(200,{value:clone(W.sale.filter(d=>d._cr49f_sale_contract_id_value===m[1]))});
    }
    if(url.indexOf(X.GR)===0&&/LC\/2026:\/children/.test(u)) return R(200,{value:FX.NOS.map(no=>({name:no+'_'+FX.LCS[no].lcNo+'.pdf',size:1000,file:{}}))});
    return inner(url,init);
  };
  w.TextDecoder=TextDecoder; w.TextEncoder=TextEncoder; if(!w.crypto||!w.crypto.subtle) Object.defineProperty(w,'crypto',{value:nodeCrypto.webcrypto});
  w.LEENAI.master.get=async n=>clone(n==='staff'?W.staff:n==='doc_staff'?W.docStaff:n==='si_rule'?[]:n==='hscode'?[{item:'OCC',hs:'4707.10'}]:{AT_SIGHT:'AT SIGHT'});
  w.__lc=FX.lcText;
  const $=id=>w.document.getElementById(id), txt=id=>($(id)||{}).textContent||'';
  const openCt=async no=>{ $('dtQ').value=no; $('dtGo').click(); await X.until(()=>$('dtCt').style.display==='flex'&&txt('dtCtSum').indexOf(no)>=0,8000); if(w.document.querySelector('#dtCtTabs button.on').dataset.tab!=='si') w.document.querySelector('#dtCtTabs button[data-tab="si"]').click(); await X.sleep(30); };
  const hook=async()=>{ await w.eval('loadA1Engine()'); w.eval("A1X._testSetReadLc(async function(name){ var no=name.split('_')[0]; var t=window.__lc(no); return {name:name,file:null,size:t.length,restore:{ok:true,text:t,textLen:t.length},text:t,image:false,zeros:0,failed:0,pages:1}; })"); };
  const recommend=async()=>{ $('dtSiRun').click(); await X.until(()=>/ほか \d+ 項目/.test(txt('dtCtBody'))||/推薦できません/.test(txt('dtCtBody')),30000); };
  const writesAfter=n=>W.writes.slice(n);

  /* ── A. 새 계약 (S/I 없음) — 추천 ── */
  await openCt('LRS-2605SG1');
  ok(/COMPASS に S\/I なし/.test(txt('dtCtBody'))&&$('dtSiRun')&&!$('dtSiRun').disabled,'S/I 없음 → 待ち · 推薦を作る');
  await hook(); const ai0=W.req.filter(r=>r==='AI').length, wr0=W.writes.length;
  await recommend();
  ok(/ほか \d+ 項目/.test(txt('dtCtBody')),'추천 완료 → 표 (나머지 접기)',txt('dtCtBody').slice(0,300));
  const kinds=FX.prompts.map(p=>p.kind); ok(W.req.filter(r=>r==='AI').length-ai0===3&&kinds.filter(x=>x==='r2_extract').length===2&&kinds.filter(x=>x==='r2_assemble').length===1,'AI 3번 (L/C 판독 ×2 · 조립 ×1 = a1_bench R2)',kinds);
  ok(FX.prompts.every(p=>p.lcNo==='ILC0003'),'대상 계약의 LC 로 (ILC0003)');
  ok(/a1_bench v0\.12 @435799c/.test(txt('dtCtBody'))&&/US\$ \d+\.\d\d/.test(txt('dtCtBody')),'엔진 출처 · 이번 비용 표시');
  ok(/根拠あり \d+/.test(txt('dtSiPills'))&&/要確認 \d+/.test(txt('dtSiPills')),'S/I 없음 → 根拠あり · 要確認 수',txt('dtSiPills'));
  ok(/直前 S\/I LRS-2604SG1/.test(txt('dtCtBody')),'직전 S/I = 같은 바이어 앞 계약 (2604SG1)');
  const recPut=writesAfter(wr0); ok(recPut.length===1&&/D-00\/doc_tool\/si_rec\/LRS-2605SG1_\d{8}-\d{6}\.json/.test(decodeURIComponent(recPut[0].url))&&/conflictBehavior=fail/.test(recPut[0].url),'추천 저장 (doc_tool/si_rec · 덮어쓰지 않음)',recPut.map(x=>x.url));
  /* 고치기 */
  const inp=w.document.querySelector('#dtCtBody [data-sn="1"][data-col="crcf9_consignee"]');
  ok(!!inp,'Consignee 칸 (sino 1)'); const recCons=inp.value; inp.value='TO ORDER OF SAMPLE BANK (EDITED)'; inp.dispatchEvent(new w.Event('input'));
  /* 취소 */
  const wr1=W.writes.length; $('dtSiWrite').click(); await X.until(()=>!$('dtModal').hidden,8000);
  ok(/新規 S\/I sino 1/.test(txt('dtModalBox'))&&/EDITED/.test(txt('dtModalBox'))&&$('dtSiGo').disabled,'쓰기 확인 화면 (바뀌는 칸 · 확인 전 버튼 잠김)',txt('dtModalBox').slice(0,300));
  w.document.querySelector('#dtModalBox [data-close]').click(); await X.sleep(50);
  ok(W.writes.length===wr1&&$('dtModal').hidden,'やめる → 아무것도 안 씀 (控え도 없음)');
  /* 쓰기 */
  $('dtSiWrite').click(); await X.until(()=>!$('dtModal').hidden,8000); $('dtSiOk').checked=true; $('dtSiOk').dispatchEvent(new w.Event('change')); ok(!$('dtSiGo').disabled,'확인 체크 → 버튼 열림');
  $('dtSiGo').click(); await X.until(()=>/書き込みました|途中で止めました|書き込めません/.test(txt('dtCtBody')),20000);
  ok(/書き込みました/.test(txt('dtCtBody'))&&/読み直して一致/.test(txt('dtCtBody')),'쓰기 → 다시 읽기 일치',txt('dtSiSt'));
  const ws=writesAfter(wr1), dec=x=>decodeURIComponent(x.url);
  ok(/si_backup\/LRS-2605SG1_\d{8}-\d{6}\.json/.test(dec(ws[0]))&&/conflictBehavior=fail/.test(ws[0].url),'처음 = 쓰기 전 控え (SharePoint · 덮어쓰지 않음)',ws.map(dec));
  const posts=ws.filter(x=>x.method==='POST'); const siPost=posts.filter(x=>/cr49f_s_is$/.test(x.url)).map(x=>JSON.parse(x.body)), dPost=posts.filter(x=>/crcf9_s_i_details$/.test(x.url)).map(x=>JSON.parse(x.body));
  ok(siPost.length>=1&&siPost[0].crcf9_sino===1&&siPost[0]['cr49f_sale_contract_id@odata.bind']==='/cr49f_sale_contracts('+cid['LRS-2605SG1']+')'&&siPost[0].crcf9_consignee==='TO ORDER OF SAMPLE BANK (EDITED)','S/I 새로 만들기 = 이 계약에 연결 · 고친 값',siPost[0]);
  ok(dPost.length===siPost.length&&dPost.every(d=>d['crcf9_sale_detail_id@odata.bind']==='/cr49f_sale_details('+sdid['LRS-2605SG1']+')'&&d['crcf9_item_id@odata.bind']==='/cr49f_items('+item+')'&&d.crcf9_weight===500&&d.crcf9_price===200&&/^\/cr49f_s_is\(/.test(d['crcf9_s_i_id@odata.bind'])),'명세 = 새 S/I · 판매 명세 · 품목에 연결 · 수량 · 단가 = 판매 명세',dPost);
  ok(!ws.some(x=>x.method==='PATCH'||x.method==='DELETE'),'새 계약 → PATCH · DELETE 없음');
  const logW=ws.filter(x=>/doc_tool\/log\/LRS-2605SG1\/\d{8}-\d{6}_si\.json/.test(dec(x)));
  ok(logW.length===1,'履歴 저장 (doc_tool/log/{契約})');
  const blobText=async b=>b&&b.text?await b.text():String(b);
  const lg=JSON.parse(await blobText(logW[0].body)); ok(lg.edits.some(e=>e.col==='crcf9_consignee'&&e.final==='TO ORDER OF SAMPLE BANK (EDITED)'&&e.rec===recCons)&&lg.verify.ok&&lg.backup,'履歴 = 고친 칸 (推薦 ↔ 最終) · 확인 · 控え 경로',lg.edits);
  ok(ws.every(x=>x.method==='PUT'?/D-00\/doc_tool\//.test(dec(x)):/\/(cr49f_s_is|crcf9_s_i_details)$/.test(x.url)),'쓰는 곳 = doc_tool/ · S/I · S/I 명세 뿐');
  w.document.querySelector('#dtCt [data-back]').click(); await X.sleep(20);
  const ctr=[...w.document.querySelectorAll('#dtTable tbody tr')].find(t=>/LRS-2605SG1/.test(t.textContent));
  ok(!ctr||ctr.querySelectorAll('td.c .st')[1].textContent!=='待ち','현황판 S/I 칸이 바뀜 (待ち 아님)');

  /* ── B. S/I 있는 계약 — 바뀐 칸만 PATCH (If-Match) ── */
  await openCt('LRS-2604SG1'); await recommend();
  ok(/一致 \d+/.test(txt('dtSiPills'))&&/要確認 \d+/.test(txt('dtSiPills')),'S/I 있음 → 一致 · 要確認 (COMPASS 와 비교)',txt('dtSiPills'));
  ok(/COMPASS: /.test(txt('dtCtBody')),'다른 칸은 COMPASS 값을 함께 보여 줌');
  const wr2=W.writes.length; $('dtSiWrite').click(); await X.until(()=>!$('dtModal').hidden||/書き込むものはありません/.test(txt('dtCtBody')),8000);
  if(!$('dtModal').hidden){ ok(/変更 S\/I sino 1/.test(txt('dtModalBox')),'변경 확인 화면'); $('dtSiOk').checked=true; $('dtSiOk').dispatchEvent(new w.Event('change')); $('dtSiGo').click();
    await X.until(()=>/書き込みました|途中で止めました|書き込めません/.test(txt('dtCtBody')),20000);
    const ws2=writesAfter(wr2), pt=ws2.filter(x=>x.method==='PATCH');
    ok(/読み直して一致/.test(txt('dtCtBody')),'PATCH → 다시 읽기 일치',txt('dtSiSt'));
    ok(pt.length>=1&&ifMatch.every(x=>x==='*')&&pt.every(x=>/(cr49f_s_is|crcf9_s_i_details)\([0-9a-f\-]{36}\)$/.test(x.url)),'바뀐 행만 PATCH · If-Match * (없으면 만들지 않음)',pt.map(x=>x.url));
    const sid=W.sis.find(h=>h._cr49f_sale_contract_id_value===cid['LRS-2604SG1']&&h.crcf9_sino===1).cr49f_s_iid; const b1=pt.filter(x=>x.url.indexOf(sid)>=0).map(x=>JSON.parse(x.body))[0]||{};
    ok(Object.keys(b1).every(c=>HEAD.indexOf(c)>=0),'PATCH 본문 = 정해진 칸만',Object.keys(b1));
    ok(!ws2.some(x=>x.method==='POST'&&/cr49f_s_is$/.test(x.url)),'있는 sino 는 새로 만들지 않음');
  } else ok(false,'S/I 있는 계약에서 바뀐 칸이 없음 (시험 데이터 확인)');

  /* ── C. 엔진 파일이 다르면 멈춤 ── */
  engBody=Buffer.concat([ENG,Buffer.from(' ')]); w.eval('A1X=null'); const ai1=W.req.filter(r=>r==='AI').length;
  await openCt('LRS-2605CA1'); $('dtSiRun').click(); await X.until(()=>/推薦できません/.test(txt('dtCtBody')),10000);
  ok(/sha256/.test(txt('dtCtBody'))&&W.req.filter(r=>r==='AI').length===ai1,'엔진 sha256 다름 → AI 호출 0 · 멈춤');
  try{ const cur=fs.readFileSync(path.join(process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND'),'a1_bench.html')); ok(nodeCrypto.createHash('sha256').update(cur).digest('hex')===SHA,'CONTRACT_SEND/a1_bench.html 그대로 (sha256)'); }catch(e){ console.log('(참고) CONTRACT_SEND 클론 없음 — a1_bench 그대로 확인 생략'); }
  ok(!W.writes.some(x=>x.method==='DELETE'),'DELETE 0');
  if(process.env.SI_DEBUG) W.writes.forEach(x=>console.log('  DEBUG',x.method,decodeURIComponent(x.url).replace(/^https:\/\/[^/]+/,'').slice(0,90),x.method==='PUT'?'':String(x.body).slice(0,160)));
  fs.unlinkSync(htmlPath);
  console.log((fail?'FAIL':'PASS')+' si — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL si 예외',e.stack); process.exitCode=1; });
