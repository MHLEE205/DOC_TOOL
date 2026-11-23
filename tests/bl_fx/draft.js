/* 가짜 B/L Draft (pdf-lib · Courier) — 書類ツール v0.12 시험용 · 가짜 세계 (fake.js) 의 NAA2611-01 모양 · 가짜 값만
   (bl_bench 시험 CONTRACT_SEND/tests/bl_bench/fixtures.js 의 draftItems 와 같은 칸 배치) */
const {PDFDocument, StandardFonts, rgb}=require('pdf-lib');
async function mkPdf(pages){ const doc=await PDFDocument.create(), font=await doc.embedFont(StandardFonts.Courier), W=595, H=842;
  for(const items of pages){ const pg=doc.addPage([W,H]); for(const it of items) pg.drawText(String(it.t),{x:it.x, y:H-it.y, size:it.size||9, font, color:rgb(0,0,0)}); }
  return Buffer.from(await doc.save()); }
function draftItems(d){
  d=Object.assign({shipper:['SAMPLE EXPORT CO., LTD.','1-2-3 SAMPLE TOWN, TOKYO, JAPAN'], consignee:['TO THE ORDER OF SAMPLE BANK'], notify:['SAMPLE NOTIFY CO'],
    vessel:'SAMPLE VESSEL 001', receipt:'SAMPLE POL', pol:'SAMPLE POL', pod:'SAMPLE PORT', delivery:'SAMPLE PORT', desc:['TEST ITEM OCC','L/C NO.: TESTLC001'], marks:['NO MARK'],
    booking:'TESTBK1', onboard:'', originals:'THREE (3)', freight:true}, d||{});
  const I=[], add=(x,y,t,size)=>I.push({x,y,t,size});
  add(200,30,'BILL OF LADING',12); add(30,60,'SHIPPER/EXPORTER',7); d.shipper.forEach((t,i)=>add(30,72+i*11,t));
  add(330,60,'BOOKING NO.',7); add(330,72,d.booking);
  add(30,120,'CONSIGNEE',7); d.consignee.forEach((t,i)=>add(30,132+i*11,t));
  add(30,190,'NOTIFY PARTY',7); d.notify.forEach((t,i)=>add(30,202+i*11,t));
  add(30,260,'PRE-CARRIAGE BY',7); add(200,260,'PLACE OF RECEIPT',7); add(200,272,d.receipt);
  add(30,290,'OCEAN VESSEL VOYAGE NO.',7); add(30,302,d.vessel); add(200,290,'PORT OF LOADING',7); add(200,302,d.pol);
  add(30,320,'PORT OF DISCHARGE',7); add(30,332,d.pod); add(200,320,'PLACE OF DELIVERY',7); add(200,332,d.delivery);
  add(30,355,'CONTAINER NO. / SEAL NO.',7); add(200,355,'DESCRIPTION OF GOODS',7);
  ['TSTU0000001','TSTU0000002'].forEach((no,i)=>add(30,370+i*11,no+' / 40HC'));
  add(30,410,'SHIPPER\'S LOAD AND COUNT'); add(30,421,'SAID TO CONTAIN');
  d.marks.forEach((t,i)=>add(30,445+i*11,t)); d.desc.forEach((t,i)=>add(200,445+i*11,t));
  add(30,520,'SAY : TWO (2) CONTAINERS ONLY');
  add(30,545,'NUMBER OF ORIGINAL B/L',7); add(30,557,d.originals); add(330,545,'SHIPPED ON BOARD',7); if(d.onboard) add(330,557,d.onboard);
  if(d.freight) [{x:30,y:600,t:'CODE TARIFF ITEM',size:7},{x:220,y:600,t:'RATE',size:7},{x:310,y:600,t:'PREPAID',size:7},{x:30,y:615,t:'OCEAN FREIGHT'},{x:150,y:615,t:'2.000'},{x:220,y:615,t:'850.00'},{x:270,y:615,t:'USD'},{x:310,y:615,t:'1700.00'},
    {x:30,y:660,t:'TOTAL'},{x:270,y:660,t:'USD'},{x:310,y:660,t:'1700.00'},{x:30,y:700,t:'FREIGHT PREPAID'}].forEach(e=>add(e.x,e.y,e.t,e.size));
  return I;
}
module.exports={mkPdf, draftItems};
