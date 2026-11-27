/* 가짜 세계 — 가짜 COMPASS (Dataverse GET) · 가짜 SharePoint (Graph) · 가짜 LEENAI. 가짜 데이터만 (example.test · TEST 번호) */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom'), ENG=require('./engine'), nodeCrypto=require('crypto');
const DV='https://orgde512c6f.crm7.dynamics.com/api/data/v9.2/', GR='https://graph.microsoft.com/v1.0/drives/DRV';
const clone=o=>JSON.parse(JSON.stringify(o));
const pad=n=>String(n).padStart(2,'0');
function todayIso(){ const d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function addDays(iso,n){ const d=new Date(iso+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
const g=(p,n)=>p+'0000-0000-0000-0000-'+String(n).padStart(12,'0');   // 가짜 GUID
const FVK='@OData.Community.Display.V1.FormattedValue';

function world(){
  const T=todayIso(), D=n=>addDays(T,n)+'T00:00:00Z';
  const W={T, req:[], writes:[], opened:[]};
  W.staff=[{code:'STAFF_A',name_ja:'山田 太郎',email:'tester@example.test',active:true,portal_admin:false},{code:'STAFF_B',name_ja:'佐藤 花子',email:'b@example.test',active:true,portal_admin:false},{code:'BOSS',name_ja:'管理 者',email:'boss@example.test',active:true,portal_admin:true}];
  W.docStaff=[{iv_code:'AA',importer:'BUYER-A',staff:'STAFF_A'},{iv_code:'BB',importer:'BUYER-B',staff:'STAFF_B'}];
  W.regions=[{cr49f_regionid:g('a',1),cr49f_region:'VIETNAM',cr49f_pod:'SAMPLE PORT VN'},{cr49f_regionid:g('a',2),cr49f_region:'KOREA',cr49f_pod:'SAMPLE PORT KR'},{cr49f_regionid:g('a',3),cr49f_region:'INDONESIA',cr49f_pod:'SAMPLE PORT ID'}];
  W.pols=[{crcf9_region_japanid:g('b',1),crcf9_pol:'SAMPLE POL'}];
  W.buyers=[{cr49f_buyerid:g('c',1),cr49f_buyer:'BUYER-A',cr49f_buyer_name:'BUYER A CO., LTD.',crcf9_country:'VIETNAM'},
    {cr49f_buyerid:g('c',2),cr49f_buyer:'BUYER-B',cr49f_buyer_name:'BUYER B CO., LTD.',crcf9_country:'KOREA'},
    {cr49f_buyerid:g('c',3),cr49f_buyer:'BUYER-C',cr49f_buyer_name:'BUYER C CO., LTD.',crcf9_country:'INDONESIA'}];   // v0.6: 実際の形 (文字 · 表示値なし)
  const ct=(n,no,pay,term,buyer,date)=>({cr49f_sale_contractid:g('d',n),cr49f_sale_contract_no:no,cr49f_pay_cls:pay==='LC'?1:2,['cr49f_pay_cls'+FVK]:pay,cr49f_terms_conditions:term,_cr49f_buyer_id_value:g('c',buyer),['_cr49f_buyer_id_value'+FVK]:String(40+buyer),_cr49f_country_id_value:g('9',buyer),['_cr49f_country_id_value'+FVK]:String(buyer+2),cr49f_sale_contract_date:date,cr49f_latest_shipment:addDays(date,60)+'T00:00:00Z'});   // v0.6: 調べる欄の表示値 = 番号 (実際の COMPASS と同じ · 相手の表の名前の欄が cr49f_id)
  W.contracts=[ct(1,'LRS-2611AA1','LC','CIF',1,addDays(T,-120)),ct(2,'LRS-2611BB1','TT','CFR',2,addDays(T,-120)),ct(3,'LRS-2611CC1','LC','CIF',3,addDays(T,-10))];
  const bk=(n,iv,c,reg,etd,prem,extra)=>Object.assign({cr49f_bookingid:g('e',n),cr49f_invoice_no:iv,cr49f_booking_no:'TESTBK'+n,cr49f_bl_number:'TESTBL'+n,cr49f_etd:etd,crcf9_bl_etd:etd,cr49f_main_ship_name:'SAMPLE VESSEL 00'+n,_cr49f_sale_contract_id_value:g('d',c),_cr49f_region_id_value:g('a',reg),_cr49f_region_japan_id_value:g('b',1),_cr49f_carrier_id_value:null,crcf9_insurance_premiums:prem,modifiedon:'2026-11-01T00:00:00Z'},extra||{});
  W.bookings=[bk(1,'NAA2611-01',1,1,D(3),1000),bk(2,'NAA2611-02',1,1,D(10),null),bk(3,'NBB2611-01',2,2,D(-5),null),bk(4,'NCC2611-01',3,3,D(60),null)];
  W.containers=[{_crcf9_booking_id_value:g('e',1),crcf9_container_no:'TSTU0000001',crcf9_type:'40HC'},{_crcf9_booking_id_value:g('e',1),crcf9_container_no:'TSTU0000002',crcf9_type:'40HC'}];
  const si=(n,c,lc)=>({cr49f_s_iid:g('f',n),_cr49f_sale_contract_id_value:g('d',c),crcf9_sino:1,cr49f_lc_no:lc,crcf9_consignee:'TO ORDER OF SAMPLE BANK',crcf9_notify_party:'SAMPLE NOTIFY CO',crcf9_po_vo:'PO TEST-'+n,crcf9_vo_no:null,crcf9_place_of_delivery_1:'SAMPLE PORT',crcf9_pod_bl1:null,modifiedon:'2026-11-01T00:00:00Z'});
  W.sis=[si(1,1,'TESTLC001'),si(2,2,'')];
  /* v0.6 販売明細 · 品目 (PORTAL 「販売契約」 と同じ読み方) — 品目の表示値も番号 */
  W.items=[{cr49f_itemid:g('7',1),cr49f_item:'TEST ITEM OCC'},{cr49f_itemid:g('7',2),cr49f_item:'TEST ITEM ONP'}];
  const sd=(n,c,it,q,p)=>({cr49f_sale_detailid:g('8',n),_cr49f_sale_contract_id_value:g('d',c),_cr49f_item_id_value:g('7',it),['_cr49f_item_id_value'+FVK]:String(10+it),cr49f_quantity:q,cr49f_price:p});
  W.sale=[sd(1,1,1,100,250),sd(2,3,1,200.5,1234),sd(3,3,2,50,180)];
  /* SharePoint — 경로 → 항목 */
  const WIP='古紙/-. 古紙書類/▲ 書類作成中', file=(name,mod)=>({id:'i'+Math.random().toString(36).slice(2,9),name,file:{},size:10,lastModifiedDateTime:mod||'2026-11-10T00:00:00Z',webUrl:'https://example.test/sp/'+encodeURIComponent(name)}), dir=name=>({id:'d'+name,name,folder:{childCount:1},webUrl:'https://example.test/sp/'+encodeURIComponent(name)});
  W.sp={};
  W.sp[WIP]=[dir('NAA2611-01'),dir('NBB2611-01')];
  W.sp[WIP+'/NAA2611-01']=[file('NAA2611-01_ED.pdf'),file('NAA2611-01_ACL.pdf'),file('NAA2611-01_DRAFT.pdf'),dir('PHOTO')];
  W.sp[WIP+'/NBB2611-01']=[file('NBB2611-01_ED.pdf'),file('NBB2611-01_ACL.pdf'),file('NBB2611-01_ACL REV.pdf'),file('NBB2611-01_SWB.pdf'),file('NBB2611-01_RR.pdf'),file('NBB2611-01_FD.pdf')];
  W.sp['古紙/_OLD_DOC/'+T.slice(0,4)]=[]; W.sp['古紙/_OLD_DOC/'+(+T.slice(0,4)-1)]=[];
  /* v0.10: L/C 保管所 (古紙/LC/_READ · lc_read/1) — D-01 フォルダは読まない (中身を置いても使われないことを v10.js で確認) */
  W.sp['古紙/LC/_READ']=[file('LRS-2611AA1.json'),file('LRS-2611AA1.md'),file('_index.json'),dir('_old')];
  W.content={};
  W.content['古紙/LC/_READ/LRS-2611AA1.json']=JSON.stringify({schema:'lc_read/1',contract:'LRS-2611AA1',version:1,lc_no:'TESTLC001',issue_date:'2026-10-01',expiry_date:'2026-12-31',latest_shipment:'2026-12-15',
    source:{run:'test',reads:2,lc_pdf:['TESTLC001.pdf'],amends:[]},pol:{text:'ANY JAPANESE PORT',any_japan:true},pod:{text:'CAT LAI',list:['CAT LAI']},applicant:{name:'SAMPLE PAPER CO., LTD.',address:''},
    bl:{consignee_text:'TO THE ORDER OF SAMPLE BANK',consignee_bank:'SAMPLE BANK',notify_text:'NOTIFY APPLICANT',notify_is_applicant:true,notify_name_words:['SAMPLE','PAPER'],originals:3,freight:'PREPAID'},fields:{},checks:[]});
  W.content['古紙/LC/_READ/LRS-2611AA1.md']='# L/C 判読 — LRS-2611AA1 (v1)\n\n| 項目 | 値 |\n|---|---|\n| L/C 番号 | TESTLC001 |\n| **船積期限 (44C)** | **2026-12-15** |\n| **有効期限 (31D)** | **2026-12-31** |\n| Consignee (46A) | TO THE ORDER OF SAMPLE BANK → 銀行 **SAMPLE BANK** |\n\n## 確認が必要 (0)\n\nなし\n\n---\n✦ Powered by LEENAI Automation System\n';
  W.sp['古紙/-. AI 活用/D-01-LC_FD_CHECKER']=[file('LRS-2611AA1_TESTLC001.json')];
  W.content['古紙/-. AI 活用/D-01-LC_FD_CHECKER/LRS-2611AA1_TESTLC001.json']=JSON.stringify([{id:'x',contractNo:'LRS-2611AA1',lcNo:'TESTLC001',lcDate:'2026-10-01',amount:'USD 1,000.00',issuingBank:'SAMPLE BANK',fileNames:['TESTLC001.pdf']}]);
  W.sp['古紙/-. AI 活用/D-00/ACL_bench']=[dir('ACL_20261101-000000'),dir('ACL_20261120-000000'),dir('_input')];
  const item=(status,label,exp,act,group,detail)=>({group:group||'本文',key:label,label,status,expected:exp,actual:act,detail:detail||'',kind:''});
  W.content['古紙/-. AI 活用/D-00/ACL_bench/ACL_20261120-000000/results.json']=JSON.stringify({run_id:'ACL_20261120-000000',version:'0.4',finished:'2026-11-20T00:00:00Z',results:[
    {invoice:'NAA2611-01',file:WIP+'/NAA2611-01/NAA2611-01_ACL.pdf',fileModified:'2026-11-10T00:00:00Z',aclVersion:'初版',verdict:'相違あり',items:[item('DIFF','Ocean Vessel + Voy.No.','SAMPLE VESSEL 001','SAMPLE VESSEL 009','本船・港','X のあとにブッキング変更 (本船変更の可能性)'),item('NOTATION','Consignee','A, B','A ,B'),item('MATCH','Shipper','S','S'),item('MATCH','Way Bill','1','1','表示欄')]},
    {invoice:'NBB2611-01',file:WIP+'/NBB2611-01/NBB2611-01_ACL REV.pdf',fileModified:'2026-11-10T00:00:00Z',aclVersion:'REV',verdict:'完全一致',items:[item('MATCH','Shipper','S','S')]}]});
  W.content['古紙/-. AI 活用/D-00/ACL_bench/ACL_20261101-000000/results.json']=JSON.stringify({run_id:'old',results:[]});
  W.mailCsv='﻿件名,件名規則,Invoice番号\r\nTEST,本船変更,NAA2611-02\r\n';
  /* v0.3 本登録 — ログインした人のメールボックス (Graph me/messages · 読むだけ) · 会社のドメイン (example.test) が送った 「本登録お願いします」 */
  W.messages=[{subject:'[本登録依頼] Re: NBB2611-01 BKG TESTBK3',from:{emailAddress:{address:'b@example.test'}},sentDateTime:D(-3),uniqueBody:{content:'D/Rを確認致しました。本登録お願いします。'},bodyPreview:''}];
  return W;
}

function parseFilter(f){   // 「A eq x or A eq y」 · 「A eq 'x'」 · 날짜 범위 · contains
  const conds=[]; let m; const re=/(\w+) eq (?:'([^']*)'|([\w\-]+))/g; while((m=re.exec(f))) conds.push([m[1],m[2]!==undefined?m[2]:m[3]]);
  return conds;
}
function dvHandle(W,url){
  const u=decodeURIComponent(url.slice(DV.length)); const m=u.match(/^(\w+)(?:\(([^)]+)\))?(?:\?(.*))?$/); if(!m) return [404,{}];
  const ent=m[1], id=m[2], qs=m[3]||'', filt=(qs.match(/\$filter=(.*?)(?:&\$|$)/)||[])[1]||'';
  const T={cr49f_bookings:W.bookings,cr49f_regions:W.regions,crcf9_region_japans:W.pols,cr49f_sale_contracts:W.contracts,cr49f_buyers:W.buyers,cr49f_s_is:W.sis,crcf9_container_informations:W.containers,cr49f_sale_details:W.sale||[],crcf9_s_i_details:W.dets||[],cr49f_items:W.items||[],crcf9_carriers:W.carriers||[],crcf9_customses:W.customs||[]}[ent];
  if(!T) return [404,{error:{message:'no table '+ent}}];
  const pk={cr49f_bookings:'cr49f_bookingid',cr49f_regions:'cr49f_regionid',crcf9_region_japans:'crcf9_region_japanid',cr49f_sale_contracts:'cr49f_sale_contractid',cr49f_buyers:'cr49f_buyerid',cr49f_s_is:'cr49f_s_iid',crcf9_s_i_details:'crcf9_s_i_detailid',cr49f_items:'cr49f_itemid',cr49f_sale_details:'cr49f_sale_detailid'}[ent];
  if(id){ const r=T.find(x=>x[pk]===id); return r?[200,clone(r)]:[404,{}]; }
  let rows=T;
  if(/cr49f_etd ge/.test(filt)){ const d=filt.match(/\d{4}-\d{2}-\d{2}/g); rows=T.filter(r=>[r.cr49f_etd,r.crcf9_bl_etd].some(v=>v&&v.slice(0,10)>=d[0]&&v.slice(0,10)<=d[1])); }
  else if(/cr49f_sale_contract_date ge/.test(filt)){ const d=filt.match(/\d{4}-\d{2}-\d{2}/)[0]; rows=T.filter(r=>r.cr49f_sale_contract_date>=d); }
  else if(/contains\(cr49f_lc_no,'([^']*)'\)/.test(filt)){ const q=filt.match(/contains\(cr49f_lc_no,'([^']*)'\)/)[1]; rows=T.filter(r=>String(r.cr49f_lc_no||'').indexOf(q)>=0); }
  else if(filt){ const c=parseFilter(filt); rows=T.filter(r=>c.some(([k,v])=>String(r[k])===v)); }
  /* v0.17 (H4): ページ送り — W.dvPage があれば ブッキングを その数ずつ返し @odata.nextLink ($skiptoken) で続き */
  if(W.dvPage&&ent==='cr49f_bookings'){ const sk=+((qs.match(/\$skiptoken=(\d+)/)||[])[1]||0), out=rows.slice(sk,sk+W.dvPage); W.dvPages=(W.dvPages||0)+1;
    return [200,Object.assign({value:clone(out)},sk+W.dvPage<rows.length?{'@odata.nextLink':DV+ent+'?'+qs.replace(/&\$skiptoken=\d+/,'')+'&$skiptoken='+(sk+W.dvPage)}:{})]; }
  return [200,{value:clone(rows)}];
}
function fakeFetch(W){
  const res=(st,body,text)=>({ok:st>=200&&st<300,status:st,statusText:String(st),headers:{get:()=>null},json:async()=>clone(body),text:async()=>text!=null?text:JSON.stringify(body),arrayBuffer:async()=>Buffer.from(text||'')});
  const self=async(url,init)=>{
    init=init||{}; const method=(init.method||'GET').toUpperCase(); W.req.push(method+' '+url);
    /* v0.14: Graph $batch — 中が GET だけなら 読む (1 件ずつ同じ処理) · 書くものが混じれば 書き込みとして記録 */
    if(method==='POST'&&url==='https://graph.microsoft.com/v1.0/$batch'){ let b=null; try{ b=JSON.parse(init.body); }catch(e){}
      const rq=(b&&b.requests)||[]; if(rq.length&&rq.length<=20&&rq.every(r=>String(r.method||'GET').toUpperCase()==='GET')){ W.batches=(W.batches||0)+1; const out=[];
        for(const r of rq){ const x=await self('https://graph.microsoft.com/v1.0'+r.url); let body=null; try{ body=await x.json(); }catch(e){} out.push({id:r.id, status:x.status, headers:{}, body}); }
        return res(200,{responses:out}); } }
    /* v0.19: Outlook の下書き (me/messages · createReply(All) · attachments · PATCH) — W.mailDeny = 権限なし (403) · 下書きは W.drafts に */
    if(method!=='GET'&&/^https:\/\/graph\.microsoft\.com\/v1\.0\/me\/messages/.test(url)){ W.mailWrites=(W.mailWrites||[]).concat([{method,url,body:init.body}]); if(W.mailDeny) return res(403,{error:{code:'ErrorAccessDenied'}});
      W.drafts=W.drafts||{}; const b=init.body?JSON.parse(init.body):{}; let m;
      if(/\/me\/messages$/.test(url)){ m=Object.assign({id:'draft'+(Object.keys(W.drafts).length+1), isDraft:true, attachments:[]}, b); W.drafts[m.id]=m; return res(201,m); }
      if((m=url.match(/\/me\/messages\/([^/]+)\/(createReplyAll|createReply)$/))){ const src=(W.messages||[]).find(x=>x.id===m[1])||{}; const fa=(src.from&&src.from.emailAddress&&src.from.emailAddress.address)||'x@example.test', d={id:'draft'+(Object.keys(W.drafts).length+1), isDraft:true, subject:'RE: '+(src.subject||''), comment:b.comment, toRecipients:[src.from||{emailAddress:{address:'x@example.test'}}], ccRecipients:src.ccRecipients||[], attachments:[],
        body:{contentType:'html', content:'<html><head><meta charset="utf-8"></head><body><hr><div id="divRplyFwdMsg"><b>From:</b> '+fa+'<br><b>Subject:</b> '+(src.subject||'')+'</div><div>'+(src.bodyPreview||'ORIGINAL MESSAGE TEXT')+'</div></body></html>'}};   /* v0.27 (N30): 元のメールの引用 (Outlook の全員に返信と同じ形) */ W.drafts[d.id]=d; return res(201,d); }
      if((m=url.match(/\/me\/messages\/([^/]+)\/attachments$/))){ const d=W.drafts[m[1]]; if(!d) return res(404,{}); d.attachments.push({name:b.name, size:(b.contentBytes||'').length}); return res(201,{id:'att'}); }
      if((m=url.match(/\/me\/messages\/([^/]+)$/))&&method==='PATCH'){ const d=W.drafts[m[1]]; if(!d) return res(404,{}); Object.assign(d,b); return res(200,d); }
      return res(400,{}); }
    /* v0.21: TO BANK の頁判別 (AI) — W.aiAnswer(n) の JSON を返す · 呼んだ数 W.aiCalls (データの書き込みではない) */
    if(url==='https://api.anthropic.com/v1/messages'){ W.aiCalls=(W.aiCalls||0)+1; W.aiHeaders=init.headers; const a=W.aiAnswer?W.aiAnswer(W.aiCalls):{doc_type:'OTHER',mark:'NONE',signed:false,first:true};
      return res(200,{content:[{type:'text',text:JSON.stringify(a)}], usage:{input_tokens:1600,output_tokens:120}, stop_reason:'end_turn'}); }
    if(method!=='GET'){ W.writes.push({method,url,body:init.body});
      /* v0.16: PORTAL clearance_status.json — If-Match (eTag) の上書き · 違えば 412 · W.beforePut = 同時に誰かが保存した 흉내 */
      const IM=init.headers&&init.headers['If-Match'];
      if(IM&&url.indexOf(GR)===0){ const pm=decodeURIComponent(url.slice(GR.length)).match(/^\/root:\/(.*):\/content$/); if(!pm) return res(400,{});
        if(W.beforePut) await W.beforePut(pm[1]);
        W.etag=W.etag||{}; const cur=W.etag[pm[1]]||'"e0"'; if(W.content[pm[1]]==null) return res(404,{});
        if(IM!==cur){ W.puts412=(W.puts412||0)+1; return res(412,{error:{code:'resourceModified',message:'ETag does not match'}}); }
        W.content[pm[1]]=typeof init.body==='string'?init.body:await init.body.text(); W.etag[pm[1]]='"e'+(W.etagN=(W.etagN||0)+1)+'"'; return res(200,{size:1}); }
      /* v0.9: 保存の入口 — 名前がもう使われている (409) の試験 */
      if(W.putFail){ const st=W.putFail(decodeURIComponent(url)); if(st) return res(st,{error:{code:'nameAlreadyExists',message:'already exists'}}); }
      if(url.indexOf(GR)===0){ return res(201,{size:1}); } return res(204,{}); }
    /* v0.9: メールの添付 (GET · $value) · フォルダのファイルの中身 (items/{id}/content) */
    const ab=b=>({ok:true,status:200,headers:{get:()=>null},arrayBuffer:async()=>{ const u=new Uint8Array(b); return u.buffer.slice(u.byteOffset,u.byteOffset+u.length); }});
    { const mm=url.match(/\/me\/messages\/([^/]+)\/attachments\/([^/]+)\/\$value$/); if(mm){ const b=W.attBytes&&W.attBytes[mm[1]+'|'+mm[2]]; return b?ab(b):res(404,{}); } }
    { const mm=url.match(/\/items\/([^/]+)\/content$/); if(mm&&W.itemBytes&&W.itemBytes[mm[1]]) return ab(W.itemBytes[mm[1]]); }
    /* v0.3: acl_bench エンジン (raw · 커밋 고정) · 메일함 (me/messages — 읽기만) */
    /* v0.12: bl_bench エンジン (raw · 커밋 고정) */
    if(url.indexOf('https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/')===0&&/bl_bench\.html$/.test(url)){ const b=W.blEngine; if(!b) return res(404,{}); return {ok:true,status:200,headers:{get:()=>null},arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}; }
    if(url.indexOf('https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/')===0&&/fd_bench\.html$/.test(url)){ const b=W.fdEngine; if(!b) return res(404,{}); return {ok:true,status:200,headers:{get:()=>null},arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}; }   // v0.21
    if(url.indexOf('https://raw.githubusercontent.com/MHLEE205/CONTRACT_SEND/')===0&&/acl_bench\.html$/.test(url)){ const b=W.aclEngine; if(!b) return res(404,{}); return {ok:true,status:200,headers:{get:()=>null},arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}; }
    /* v0.27 (N30): 메일 1 통 읽기 (元のメール · 下書き 다시 읽기) — W.messages · W.drafts */
    { const sm=url.match(/^https:\/\/graph\.microsoft\.com\/v1\.0\/me\/messages\/([^/?]+)\?/); if(sm&&method==='GET'){ const id=decodeURIComponent(sm[1]), d=(W.drafts||{})[id]||(W.messages||[]).find(m=>m.id===id); if(!d) return res(404,{});
      return res(200,Object.assign({toRecipients:[], ccRecipients:[], conversationId:'conv-'+id, body:{contentType:'html', content:d.bodyPreview||''}}, clone(d))); } }
    if(url.indexOf('https://graph.microsoft.com/v1.0/me/messages')===0){ W.mailReads=(W.mailReads||0)+1; if(W.mailErr) return res(W.mailErr,{error:{code:'ErrorAccessDenied'}});
      /* v0.15 (B7): $search="{Invoice}" — 件名 · 添付名 · 本文に その語があるメール (W.searchMessages) */
      { const sq=decodeURIComponent(url).match(/\$search="([^"]+)"/); if(sq&&W.searchMessages){ W.searches=(W.searches||[]).concat([sq[1]]); const q=sq[1].toUpperCase(); return res(200,{value:clone((W.searchMessages||[]).filter(m=>(String(m.subject)+' '+(m.attachments||[]).map(a=>a.name).join(' ')+' '+(m.bodyPreview||'')).toUpperCase().indexOf(q)>=0))}); } }
      /* v0.9: receivedDateTime ge … (保存の入口のメール) — 日付で絞る */
      const ge=decodeURIComponent(url).match(/receivedDateTime ge ([0-9T:.\-Z]+)/); return res(200,{value:clone((W.messages||[]).filter(m=>!ge||!m.receivedDateTime||m.receivedDateTime>=ge[1]))}); }
    if(url.indexOf(DV)===0){ const [st,b]=dvHandle(W,url); return res(st,b); }
    if(url.indexOf(GR)===0){
      const p=decodeURIComponent(url.slice(GR.length));
      let m;
      /* v0.11: マスターの版の記録 (チェックポイントの承認の安全装置) — /root:/{path}?$select=id · /items/{id}/versions · /items/{id}/versions/{vid}/content */
      if((m=p.match(/^\/root:\/([^:?]*)\?\$select=id,eTag$/))){ if(W.content[m[1]]==null) return res(404,{}); W.etag=W.etag||{}; return res(200,{id:'pt-'+m[1].length, eTag:W.etag[m[1]]||'"e0"'}); }   // v0.16
      if((m=p.match(/^\/root:\/([^:?]*)\?\$select=id$/))){ const id=W.metaId&&W.metaId[m[1]]; return id?res(200,{id}):res(404,{}); }
      if((m=p.match(/^\/items\/([^/]+)\/versions\?/))){ const v=W.versions&&W.versions[m[1]]; return v?res(200,{value:v.map(x=>({id:x.id, lastModifiedBy:{user:{email:x.by}}}))}):res(404,{}); }
      if((m=p.match(/^\/items\/([^/]+)\/content$/))&&W.versions&&W.versions[m[1]]) return res(200,{items:W.versions[m[1]][0].items});   // 今の版 = ファイルの中身
      if((m=p.match(/^\/items\/([^/]+)\/versions\/([^/]+)\/content$/))){ if(W.versions&&W.versions[m[1]]&&W.versions[m[1]][0].id===m[2]) return res(400,{error:{code:'invalidRequest'}});   // 実際と同じ: 今の版は versions で読めない
        const v=W.versions&&(W.versions[m[1]]||[]).find(x=>x.id===m[2]); return v?res(200,{items:v.items}):res(404,{}); }
      if((m=p.match(/^\/root:\/(.*):\/children/))){ const k=W.sp[m[1]]; return k?res(200,{value:clone(k)}):res(404,{}); }
      if((m=p.match(/^\/root:\/(.*):\/content/))){ const t=W.content[m[1]]; return t!=null?res(200,null,t):res(404,{}); }
      if(/^\/root\/search\(q='mail_docstaff'\)/.test(p)) return res(200,{value:[{id:'mail1',name:'mail_docstaff_test.csv',size:10,lastModifiedDateTime:'2026-11-14T00:00:00Z',parentReference:{path:'/drives/DRV/root:/古紙/-. AI 活用/D-00/ACL_bench/_input'},file:{}}]});
      if(/^\/items\/mail1\/content/.test(p)) return res(200,null,W.mailCsv);
      if((m=p.match(/^\/root\/search\(q='([^']*)'\)/))) return res(200,{value:[{name:m[1],webUrl:'https://example.test/sp/'+m[1],file:{}}]});
      return res(404,{});
    }
    return res(404,{});
  };
  return self;
}
async function page(W, opt){
  opt=opt||{}; const HTML=fs.readFileSync(opt.html||path.join(__dirname,'../index.html'),'utf8');
  const FAKE='<script>window.__btns=[];window.LEENAI={auth:{token:async t=>"TOK-"+t,status:{dataverse:"ok",graph:"ok"}},user:{email:'+JSON.stringify(opt.email||'tester@example.test')+',name:"TEST USER"},SP:{DRIVE_ID:"DRV"},'+
    'master:{get:async function(n){ return JSON.parse(JSON.stringify(n==="staff"?window.__W.staff:n==="doc_staff"?window.__W.docStaff:(window.__W.masters&&window.__W.masters[n])||(window.__W.masters&&n!=="si_rule"&&n!=="forwarder"&&n!=="dray"&&n!=="sales_mail"?(function(){ throw new Error("SP master 404"); })():[]))); },upsert:async function(n,k,row,o){ (window.__W.upserts=window.__W.upserts||[]).push({n:n,k:k,row:row,o:o}); return {action:"修正"}; }},toast:function(m,t){ (window.__toasts=window.__toasts||[]).push(m); },'+
    'addHeaderButton:function(o){ window.__btns.push(o); },_openMasterPanel:function(){ window.__master=1; },'+
    'init:function(o){ window.__cfg=o; document.title="LEENAI "+o.sys+" "+o.name+" v"+o.version; setTimeout(function(){ var h=document.createElement("div"); h.id="ln-hdr-right"; document.getElementById("app").prepend(h); document.getElementById("app").style.display=""; o.onReady(); },0); }};</script>';
  const h=HTML.replace(/<script src="https:\/\/mhlee205\.github\.io\/LEENAI_COMMON\/v1\/leenai-common\.js"><\/script>/,FAKE).replace(/<link rel="stylesheet"[^>]*>/,'');
  if(W.aclEngine===undefined) W.aclEngine=ENG.bytes(HTML);
  if(W.fdEngine===undefined&&/const FD_ENGINE = /.test(HTML)) W.fdEngine=ENG.fdBytes(HTML);   // v0.21
  if(W.blEngine===undefined&&/const BL_ENGINE = /.test(HTML)) W.blEngine=ENG.blBytes(HTML);   // v0.12   // v0.3: 고정한 엔진 원문 (sha256 확인됨) — null 이면 읽기 실패 시험
  const dom=new JSDOM(h,{url:'https://mhlee205.github.io/DOC_TOOL/'+(opt.url||''),runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
    w.__W=W; w.fetch=fakeFetch(W); if(!w.crypto||!w.crypto.subtle) Object.defineProperty(w,'crypto',{value:nodeCrypto.webcrypto}); w.confirm=w.alert=w.prompt=()=>{ throw new Error('confirm/alert 호출됨'); };
    w.open=(u)=>{ W.opened.push(u); return null; }; Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{ W.copied=t; }}});
    /* v0.7: 最初の画面は 今日やること — v0.6 までの試験は 前の現況板 (doc_tool_board · 既定 Invoice 別) で開く (opt.first なら何も入れない = 本当の最初の画面) */
    const L=Object.assign({},opt.ls||{}); if(!opt.first&&L.doc_tool_board_v7===undefined) L.doc_tool_board_v7=L.doc_tool_board||'iv';
    if(!opt.first&&L.doc_tool_iv_mode_v16===undefined) L.doc_tool_iv_mode_v16='etd';
    if(L.doc_tool_autosave_v34===undefined) L.doc_tool_autosave_v34=opt.autosave?'1':'0';
    if(L.doc_tool_pt_auto_v34===undefined) L.doc_tool_pt_auto_v34=opt.ptauto?'1':'0';   /* v0.34.1: 앱 기본 = 入 · 앞의 시험은 切 (opt.ptauto 로 入) */   /* v0.34 (N55): 保存の入口 の自動保存 = 前の試験は切 (opt.autosave で入) */
    /* v0.28: 新しい画面 (表 1 つ) は doc_tool_board_v28 = 'main' (既定) — v0.27 までの試験は 旧画面 (同じ値を v28 の鍵に · opt.first は v0.28 の最初の画面) */
    if(!opt.first&&L.doc_tool_board_v28===undefined) L.doc_tool_board_v28=L.doc_tool_board_v7;   // v0.16: v0.15 までの試験は 「ETD 範囲で見る」 の表
    Object.entries(L).forEach(([k,v])=>w.localStorage.setItem(k,v)); w.scrollTo=()=>{}; if(opt.init) opt.init(w); }});
  const w=dom.window; await until(()=>/読み込み完了|読み込み失敗/.test(w.document.getElementById('dtProg').textContent));
  return w;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(f,ms){ const t0=Date.now(); while(!f()){ if(Date.now()-t0>(ms||10000)) throw new Error('시간 초과'); await sleep(10); } }
module.exports={world,page,until,sleep,todayIso,addDays,g,DV,GR,fakeFetchOf:fakeFetch};   // v0.16.1: width.js (Chrome) も同じ 가짜 세계
