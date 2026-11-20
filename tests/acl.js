/* #6 ACL 탭 — acl_bench v0.4 엔진을 같은 파일로 공유 (커밋 고정 + sha256) · 한 건 대조 결과가 엔진을 직접 부른 것과 같음 · 쓰기는 doc_tool/ 아래만 · 메일은 열기만
   엔진 원문: CONTRACT_SEND 클론에서 git show (ACL_REPO=경로 · 기본 ../../CONTRACT_SEND) → 없으면 raw 주소에서 받음. node acl.js [html] */
const fs=require('fs'),path=require('path'),cp=require('child_process'),nodeCrypto=require('crypto');
const {JSDOM}=require('jsdom');
const FX=require('./acl_fx/fixtures'), N=require('./acl_fx/fake_naccs'), R=require('./acl_fx/pdfread'), X=require('./fake');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
const COMMIT=HTML.match(/commit:'([0-9a-f]{40})'/)[1], SHA=HTML.match(/sha256:'([0-9a-f]{64})'/)[1];
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const clone=o=>JSON.parse(JSON.stringify(o));
const FVK='@OData.Community.Display.V1.FormattedValue';

async function engineText(){
  const repo=process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND');
  try{ return cp.execFileSync('git',['-C',repo,'show',COMMIT+':acl_bench.html'],{maxBuffer:1<<24}); }catch(e){}
  const r=await fetch('https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/'+COMMIT+'/acl_bench.html'); return Buffer.from(await r.arrayBuffer());
}
(async()=>{
  const ENG=await engineText();
  ok(nodeCrypto.createHash('sha256').update(ENG).digest('hex')===SHA,'엔진 원문 sha256 = 도구에 적은 값 (커밋 '+COMMIT.slice(0,7)+')');
  const E=new Function('module',ENG.toString('utf8').match(/<script id="acl-core">([\s\S]*?)<\/script>/)[1]+';return ACL;')(undefined);

  /* 가짜 세계 — Invoice 2건: 01 = 완전 · 02 = 씰 번호 다름 */
  const W=X.world(), T=W.T, WIP='古紙/-. 古紙書類/▲ 書類作成中', bytes={}, cps={};
  W.siRule=[{scope_type:'country',scope:'VIETNAM',rule:'acl_freight_arranged',value:'1'},{scope_type:'all',scope:'ALL',rule:'acl_received_bl',value:''}];
  for(const n of [1,2]){
    const c=FX.compass(n); cps[c.invoice]=c; const spec=FX.perfectSpec(E,c); if(n===2) spec.rows[1].seal='SL999999';
    const b=Buffer.from(await N.build(spec)); bytes['acl'+n]=b;
    W.bookings.push(Object.assign({},c.booking,{cr49f_etd:X.addDays(T,2)+'T00:00:00Z',crcf9_bl_etd:X.addDays(T,2)+'T00:00:00Z',crcf9_insurance_premiums:null,_cr49f_fowarder_id_value:'00000000-0000-4000-8000-fd0000000001',['_cr49f_fowarder_id_value'+FVK]:'7'}));
    W.sp[WIP].push({id:'d'+c.invoice,name:c.invoice,folder:{childCount:1},webUrl:'https://example.test/sp/'+c.invoice});
    W.sp[WIP+'/'+c.invoice]=[{id:'acl'+n,name:c.invoice+'_ACL.pdf',file:{},size:b.length,lastModifiedDateTime:'2026-11-12T00:00:00Z',webUrl:'https://example.test/sp/acl'+n}];
    W.contracts.push({cr49f_sale_contractid:c.booking._cr49f_sale_contract_id_value,cr49f_sale_contract_no:'LRS-2699TS'+n,cr49f_pay_cls:1,['cr49f_pay_cls'+FVK]:'LC',cr49f_terms_conditions:'CIF',_cr49f_buyer_id_value:'00000000-0000-4000-8000-bb0000000001',cr49f_sale_contract_date:X.addDays(T,-100)});
  }
  W.docStaff.push({iv_code:'FK',importer:'BUYER-T',staff:'STAFF_A'});
  W.buyers.push({cr49f_buyerid:'00000000-0000-4000-8000-bb0000000001',cr49f_buyer:'BUYER-T',cr49f_buyer_code:'BUYERT',crcf9_country:1,['crcf9_country'+FVK]:'VIETNAM'});
  W.regions.push({cr49f_regionid:FX.g('f000',1),cr49f_region:'VIETNAM',cr49f_pod:'CAT LAI'}); W.pols.push({crcf9_region_japanid:FX.g('e000',1),crcf9_pol:'TOKYO'});
  W.forwarders=[{crcf9_customsid:'00000000-0000-4000-8000-fd0000000001',crcf9_forwarder_company:'SAMPLE FORWARDER',crcf9_pol:'TOKYO',crcf9_forwarder_to_email:'fwd@example.test',crcf9_forwarder_cc_email:'fwd2@example.test;fwd3@example.test'}];
  const all=Object.values(cps);
  W.containersAll=[].concat(...all.map(c=>c.containers.map(x=>Object.assign({_crcf9_booking_id_value:c.booking.cr49f_bookingid},x))));
  W.sisAll=[].concat(...all.map(c=>c.sis)); W.detailsAll=[].concat(...all.map(c=>Object.entries(c.details).map(([sid,ds])=>ds.map(d=>Object.assign({_crcf9_s_i_id_value:sid},d))).flat()));

  let engineBody=ENG;
  /* fake.js page() 는 fetch 를 world 로 만든다 — 여기서는 page 를 연 뒤 fetch 를 감싼다 */
  const htmlPath=path.join(require('os').tmpdir(),'doc_tool_acl_test.html'); fs.writeFileSync(htmlPath,HTML);
  const w=await X.page(W,{html:htmlPath,ls:{doc_tool_who:'all'}});
  const inner=w.fetch;
  w.fetch=async(url,init)=>{
    if(String(url).indexOf('https://raw.githubusercontent.com/')===0){ W.req.push('GET '+url); return {ok:true,status:200,arrayBuffer:async()=>{ const b=Buffer.from(engineBody); return b.buffer.slice(b.byteOffset,b.byteOffset+b.length); }}; }
    const m=String(url).match(/\/items\/(acl\d)\/content$/); if(m){ W.req.push('GET '+url); return {ok:true,status:200,arrayBuffer:async()=>{ const b=bytes[m[1]]; return b.buffer.slice(b.byteOffset,b.byteOffset+b.length); }}; }
    if(String(url).indexOf(X.DV)===0){ const r=(function(){ const u=decodeURIComponent(String(url).slice(X.DV.length)); let mm;
        if((mm=u.match(/^crcf9_customses\(([^)]+)\)/))){ const f=W.forwarders.find(x=>x.crcf9_customsid===mm[1]); return f?[200,clone(f)]:[404,{}]; }
        if((mm=u.match(/^crcf9_container_informations\?\$filter=_crcf9_booking_id_value eq ([\w\-]+)&\$select=crcf9_container_informationid/))) return [200,{value:clone(W.containersAll.filter(x=>x._crcf9_booking_id_value===mm[1]))}];
        if((mm=u.match(/^cr49f_s_is\?\$filter=_cr49f_sale_contract_id_value eq ([\w\-]+)&\$select=cr49f_s_iid,crcf9_sino,cr49f_lc_no,crcf9_consignee,crcf9_notify_party,crcf9_address/))) return [200,{value:clone(W.sisAll.filter(x=>x._cr49f_sale_contract_id_value===mm[1]))}];
        if((mm=u.match(/^crcf9_s_i_details\?\$filter=_crcf9_s_i_id_value eq ([\w\-]+)/))) return [200,{value:clone(W.detailsAll.filter(x=>x._crcf9_s_i_id_value===mm[1]))}];
        return null; })();
      if(r){ W.req.push('GET '+url); return {ok:r[0]===200,status:r[0],headers:{get:()=>null},json:async()=>r[1]}; } }
    return inner(url,init);
  };
  w.pdfjsLib=R.pdfjsForWindow();
  if(!w.crypto||!w.crypto.subtle) Object.defineProperty(w,'crypto',{value:nodeCrypto.webcrypto});
  w.LEENAI.master.get=async n=>clone(n==='si_rule'?W.siRule:n==='staff'?W.staff:n==='doc_staff'?W.docStaff:[]);
  const $=id=>w.document.getElementById(id), txt=id=>$(id).textContent;
  const openIv=async iv=>{ w.document.getElementById('dtQ').value=iv; w.document.getElementById('dtGo').click(); await X.until(()=>$('dtIv').style.display==='flex'&&txt('dtIvSum').indexOf(iv)>=0); w.document.querySelector('#dtIvTabs button[data-tab="acl"]').click(); };

  /* ── 01: 완전 → 照合する → 결과 = 엔진 직접 ── */
  for(const [iv,want] of [['NFK2601-01','完全一致'],['NFK2601-02','相違あり']]){
    await openIv(iv);
    ok(/照合結果なし/.test(txt('dtIvBody'))&&$('dtAclRun'),iv+' 照合 전 — 確認 · 照合する 버튼');
    const w0=W.writes.length; $('dtAclRun').click();
    await X.until(()=>/照合しました|照合できません/.test(txt('dtIvBody')),20000);
    ok(/照合しました/.test(txt('dtIvBody')),iv+' 照合 완료',txt('dtIvBody').slice(0,300));
    const puts=W.writes.slice(w0); ok(puts.length===2&&puts.every(p=>p.method==='PUT'&&/conflictBehavior=fail/.test(p.url)),iv+' 쓰기 2건 (결과 · 履歴) · 덮어쓰지 않음',puts.map(p=>p.url));
    const pr=puts.map(p=>decodeURIComponent(p.url)); ok(/D-00\/doc_tool\/acl\/NFK2601-0\d_\d{8}-\d{6}\.json/.test(pr[0])&&/D-00\/doc_tool\/log\/NFK2601-0\d\/\d{8}-\d{6}_acl\.json/.test(pr[1]),iv+' 쓰는 곳 = doc_tool/acl · doc_tool/log',pr);
    const blobText=async b=>b&&b.text?await b.text():String(b);
    const res=JSON.parse(await blobText(puts[0].body));
    /* 엔진 직접 — 같은 PDF · 같은 COMPASS · 같은 규칙 */
    const c=cps[iv], pages=await R.readItems(bytes['acl'+iv.slice(-1)]), acl=E.readNaccs(pages);
    const cpx={ok:true, booking:Object.assign({},W.bookings.find(b=>b.cr49f_invoice_no===iv)), bookings:1, pol:'TOKYO', pod:'CAT LAI', containers:c.containers, sis:c.sis, details:c.details, meta:res.meta};
    const rules=E.dispRules(W.siRule), direct=E.compareOne(acl,cpx,{rules:rules.rules, meta:res.meta, podExclude:E.podExcludeRules(W.siRule), fileModified:'2026-11-12T00:00:00Z'});
    ok(res.verdict===want&&direct.verdict===want,iv+' 판정 '+want+' (도구 = 엔진 직접)',[res.verdict,direct.verdict]);
    ok(JSON.stringify(res.items)===JSON.stringify(direct.items),iv+' 항목 하나하나 같음 ('+direct.items.length+')');
    ok(JSON.stringify(res.kinds)===JSON.stringify(direct.kinds)&&JSON.stringify(res.sets)===JSON.stringify(direct.sets)&&JSON.stringify(res.xx)===JSON.stringify(direct.xx),iv+' 종류 · 세트 · XX 같음');
    ok(res.meta&&res.meta.contract==='LRS-2699TS'+iv.slice(-1)&&res.meta.country==='VIETNAM'&&res.meta.forwarderCompany==='SAMPLE FORWARDER',iv+' 범위 정보 (계약 · 나라 · 乙仲)',res.meta);
    ok(res.engine===('acl_bench v0.4 @'+COMMIT.slice(0,7))&&res.by==='書類ツール v0.1','결과에 엔진 출처 · 도구');
    ok(W.req.filter(r=>/raw\.githubusercontent/.test(r)).length===1,'엔진은 한 번만 읽음');
  }
  /* 02 = 相違 → 화면 · 메일 */
  const body=txt('dtIvBody');
  ok(/直してもらうところ/.test(body)&&/SL999999/.test(body)&&/相違 1/.test(body),'相違 화면 (直してもらうところ · ACL 값)',body.slice(0,400));
  ok(/表示欄/.test(body)&&/Received B\/L/.test(body),'표시 칸 줄');
  $('dtAclMail').click(); await X.sleep(20);
  const mt=W.opened.pop()||''; const dec=decodeURIComponent(mt);
  ok(/^mailto:fwd@example\.test\?subject=/.test(mt)&&/cc=fwd2@example\.test,fwd3@example\.test/.test(dec),'메일 = 乙仲 To · Cc (Outlook 에서 열기만)',mt.slice(0,200));
  ok(/\[ACL訂正依頼\] NFK2601-02/.test(dec)&&/ご訂正をお願いいたします/.test(dec)&&/SL999999/.test(dec)&&/✦ Powered by LEENAI Automation System/.test(dec),'메일 제목 · 본문 일본어 · 푸터');
  ok(W.copied&&/SL999999/.test(W.copied),'본문 복사');
  ok(!W.writes.some(p=>p.method!=='PUT')&&W.writes.every(p=>/D-00\/doc_tool\//.test(decodeURIComponent(p.url))),'쓰기는 doc_tool/ 아래 PUT 만 (COMPASS 쓰기 0)');
  /* 현황판 — 이 도구의 결과로 칸이 바뀜 */
  w.document.querySelector('#dtIv [data-back]').click();
  const row=[...w.document.querySelectorAll('#dtTable tbody tr')].find(t=>/NFK2601-02/.test(t.textContent));
  ok(row&&row.querySelectorAll('td.c .st')[1].textContent==='相違','현황판 ACL 칸 = 새 결과 (相違)');
  const row1=[...w.document.querySelectorAll('#dtTable tbody tr')].find(t=>/NFK2601-01/.test(t.textContent));
  ok(row1&&row1.querySelectorAll('td.c .st')[1].textContent==='済','현황판 ACL 칸 = 새 결과 (完全一致 → 済)');

  /* ── 엔진 파일이 바뀌면 쓰지 않음 (sha256) ── */
  const W2n=W.writes.length; engineBody=Buffer.concat([ENG,Buffer.from(' ')]);
  w.eval('ACLX=null');
  await openIv('NFK2601-01'); $('dtAclRun').click(); await X.until(()=>/照合できません|照合しました/.test(txt('dtIvBody')),20000);
  ok(/sha256/.test(txt('dtIvBody'))&&W.writes.length===W2n,'엔진 sha256 다름 → 쓰지 않고 멈춤 · 쓰기 0',txt('dtIvBody').slice(0,200));

  /* ── acl_bench 는 바뀌지 않음 — 지금 CONTRACT_SEND/acl_bench.html = 고정 커밋 ── */
  try{ const cur=fs.readFileSync(path.join(process.env.ACL_REPO||path.join(__dirname,'../../CONTRACT_SEND'),'acl_bench.html')); ok(nodeCrypto.createHash('sha256').update(cur).digest('hex')===SHA,'CONTRACT_SEND/acl_bench.html 그대로 (sha256)'); }catch(e){ console.log('(참고) CONTRACT_SEND 클론 없음 — acl_bench 그대로 확인 생략'); }
  fs.unlinkSync(htmlPath);
  console.log((fail?'FAIL':'PASS')+' acl — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL acl 예외',e.stack); process.exitCode=1; });
