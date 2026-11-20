/* source: CONTRACT_SEND/tests/acl_bench/fixtures.js @243897d (가짜 데이터 · DOC_TOOL #6 시험용으로 복사 — 고치지 않음) */
/* 가짜 COMPASS (부킹 · 항구 · 컨테이너 · S/I · S/I 명세) 와 그것에 맞는 가짜 NACCS ACL spec — 레포 공개: 모두 가짜.
   GUID 는 모두 00000000-0000-4000-8000-… 모양 (run_all 이 확인) */
const g=(p,n)=>'00000000-0000-4000-8000-'+p+String(n).padStart(8,'0');
const INV=n=>'NFK2601-'+String(n).padStart(2,'0');
/* n 번째 Invoice 의 COMPASS (opts.containers = 개수 · opts.noBooking) */
function compass(n, opts){
  opts=opts||{}; const k=opts.containers||3, SD=g('5d00',n);
  const booking={cr49f_bookingid:g('b000',n), cr49f_booking_no:'BK'+String(1000000+n), cr49f_bl_number:'TESTBL'+String(n).padStart(4,'0'), cr49f_main_ship_name:'SAMPLE STAR 101W',
    cr49f_invoice_no:INV(n), crcf9_delivery_location:'', _cr49f_sale_contract_id_value:g('c000',n), _cr49f_region_japan_id_value:g('e000',1), _cr49f_region_id_value:g('f000',1)};
  const containers=[]; for(let i=1;i<=k;i++) containers.push({crcf9_container_informationid:g('ca'+String(n).padStart(2,'0'),i), crcf9_container_no:'TSTU'+String(n*100+i).padStart(7,'0'), crcf9_seal_no:'SL'+String(n*100+i).padStart(6,'0'),
    crcf9_type:'45GP', crcf9_quantity:20+i, crcf9_n_w:20000+i*100, crcf9_g_w:20000+i*100, crcf9_t_w:3700, _crcf9_sale_detail_id_value:SD});
  if(opts.blankRow) containers.push({crcf9_container_informationid:g('cb00',n), crcf9_container_no:null, crcf9_seal_no:null, crcf9_quantity:0, crcf9_n_w:0, crcf9_g_w:0, crcf9_t_w:0, _crcf9_sale_detail_id_value:SD});
  const si1={cr49f_s_iid:g('a100',n), crcf9_sino:1, _cr49f_sale_contract_id_value:g('c000',n), cr49f_lc_no:'TLC'+String(n).padStart(4,'0')+' DATED ON OCT 01',
    crcf9_consignee:'TO ORDER OF SAMPLE BANK\nHO CHI MINH BRANCH', crcf9_notify_party:'SAMPLE PAPER CO., LTD.', crcf9_address:'NO.1 SAMPLE ROAD, SAMPLE WARD,\nHO CHI MINH CITY, VIETNAM',
    crcf9_tel:'TEL: 84-28-0000-0000', crcf9_fax:'FAX: 84-28-0000-0001', crcf9_bl_text1:'WP#47072000#XXKGS #XXBALES', crcf9_bl_text2:'SAMPLE DEPOSIT NO.: XX',
    crcf9_pod_bl1:'CAT LAI PORT IN VIETNAM', crcf9_place_of_delivery_1:'CAT LAI PORT IN VIETNAM', crcf9_shipping_mark:null, crcf9_shipper:'SAMPLE EXPORT CO., LTD.', crcf9_shipper_address:'1-2-3 SAMPLE-CHO, TOKYO, JAPAN', crcf9_shipper_tel:'TEL : 03-0000-0000', crcf9_shipper_fax:'FAX : 03-0000-0001'};
  const si2={cr49f_s_iid:g('a200',n), crcf9_sino:2, _cr49f_sale_contract_id_value:g('c000',n), crcf9_consignee:'SAMPLE PAPER CO., LTD.', crcf9_bl_text1:'(SINO 2 — NOT FOR B/L)'};
  const details={[si1.cr49f_s_iid]:[{crcf9_productname:'WASTE PAPER OCC', crcf9_hs_code:'4707.10', _crcf9_sale_detail_id_value:SD, modifiedon:'2026-10-01T00:00:00Z'}],
    [si2.cr49f_s_iid]:[{crcf9_productname:'WASTE PAPER OCC (OLD NAME)', crcf9_hs_code:'4707.10', _crcf9_sale_detail_id_value:SD, modifiedon:'2026-09-01T00:00:00Z'}]};
  return {invoice:INV(n), booking:opts.noBooking?null:booking, pol:'TOKYO', pod:'CAT LAI', containers, sis:[si1,si2], details};
}
const lines=t=>String(t||'').split('\n').map(s=>s.trim()).filter(Boolean);
/* COMPASS 에 맞는 「완전한」 ACL spec (ACL = 도구의 순수 로직) — v0.2: 실제 양식의 칸 (값 · 합계) 모양 */
const WORDS=['ZERO','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN','TWENTY'];
function perfectSpec(ACL, cp){
  const ex=ACL.expected({booking:cp.booking, pol:cp.pol, pod:cp.pod, containers:cp.containers, sis:cp.sis, details:cp.details});
  const filled=cp.containers.filter(c=>c.crcf9_container_no);
  const rows=filled.map(c=>({container:c.crcf9_container_no, seal:c.crcf9_seal_no, type:'GP', size:'45', bales:c.crcf9_quantity, cargo:c.crcf9_n_w, tare:c.crcf9_t_w, measure:40}));
  const vs=String(cp.booking.cr49f_main_ship_name).split(' '), voy=vs.pop();
  return retotal({order:'valuesFirst', rows, invoice:cp.invoice,
    fields:{shipper:lines(ex.shipper), consignee:lines(ex.consignee), notify:lines(ex.notify), alsoNotify:['-'], description:lines(ex.description), marks:lines(ex.marks),
      booking:[cp.booking.cr49f_booking_no], carrier:['TSTC'], masterBl:['-'], refNo:['REF-'+cp.invoice], originals:['3'], wayBill:[''], received:[''], freight:['1'], agentSign:['1'], shipperMail:['DOCS@EXAMPLE.TEST'],
      vessel:[vs.join(' ')], voy:[voy], receipt:['TOKYO, JAPAN'], pol:['TOKYO, JAPAN'], pod:['CAT LAI PORT IN VIETNAM'], delivery:['CAT LAI PORT IN VIETNAM'], finalDest:['-'], hsMain:['-']}});
}
/* 합계 칸을 행에 맞춤 (ACL 안에서는 맞는 상태) */
function retotal(spec){
  const r=spec.rows; spec.totals={count:r.length, words:(WORDS[r.length]||String(r.length))+' ('+r.length+') CONTAINERS ONLY.-', bales:r.reduce((s,x)=>s+x.bales,0), weight:r.reduce((s,x)=>s+x.cargo,0), measure:r.length*40};
  return spec;
}
module.exports={g, INV, compass, perfectSpec, retotal, lines};
