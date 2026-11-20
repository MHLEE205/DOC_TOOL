/* source: CONTRACT_SEND/tests/acl_bench/fake_naccs.js @243897d (가짜 데이터 · DOC_TOOL #6 시험용으로 복사 — 고치지 않음) */
/* 가짜 NACCS ACL PDF (v0.2) — 실제 NACCS ACL (2026-11-17 좌표 5건) 의 「위치 관계」 를 그대로 흉내 낸다. 값 · 회사 · 번호는 모두 가짜 (레포 공개).
   실제 양식에서 확인한 관계:
   · 라벨 = 셀 왼쪽 위 (Courier 약 6.9pt) · 값 = 그 아래 줄 (Courier 약 7.7pt — 1글자 약 4.63pt)
   · 라벨과 같은 줄 오른쪽 = 작은 칸의 코드 (UN/LOCODE · 호출 부호 · 「-」) / Ref No. 만 값이 라벨 오른쪽
   · 값 줄 오른쪽 끝에 멀리 떨어진 코드 「51」 (Place of Receipt · Place of Delivery)
   · 컨테이너 머리 = 열 위 가운데 (Seal 값은 머리보다 왼쪽에서 시작) · 1쪽 1줄 + 3쪽부터 (2쪽 = 이어지는 머리 칸)
   · 합계 칸 안의 작은 머리 Gross / Net (값이 그 줄에)
   spec: {fields:{key:[줄…]}, rows:[{container,seal,type,size,bales,cargo,measure,tare}], totals:{count, words, bales, weight, measure},
          order:'valuesFirst'|'shuffle'|'normal', overflow:'설명 칸 다음 줄에 넣을 긴 줄', kind:'NACCS'|'SCAN'|'OTHER', invoice} */
const {PDFDocument, StandardFonts, rgb}=require('pdf-lib');
const W=595.32, H=841.92, LAB=6.86, VAL=7.72;
/* 실제 1쪽 라벨 위치 */
const L1=[['Registration Date',37.7,793.1],['Registrant',248.5,793.1],['B/L Instructions(Container Vessel Only)',371.6,792.8],
  ['Shipper',37.7,776.6],['Carrier/Shipping Agent',257.5,776.6],['Booking No.',355.8,776.6],['Master B/L No.',257.5,748.1],["Forwarder's Name",257.5,730.8],
  ['Consignee',37.7,692.6],['CY/CFS Code',257.5,694.1],['Way Bill',289,677.6],['Received B/L',383.5,677.6],['Freight As Arranged',472.1,677.6],
  ['Agent Signature Request Identifier',259,652.1],['Attached Sheet',448.1,652.1],['Ref No.',257.5,622.8],['Notify Party',37.7,606.4],['Also Notify Party',257.5,606.4],
  ['Pre-Carriage By',37.7,523.1],['Place of Receipt',306.2,523.1],['Ocean Vessel',37.7,499.1],['Voy.No.',224.5,499.1],['Port of Loading',306.2,499.1],
  ['Port of Discharge',37.7,476.5],['Place of Delivery',197.5,476.5],['Final Destination',412.8,476.5],
  ['Number of',37.7,453.2],['Containers',37.7,443.5],['Total Number and Kind of Packages',108.2,453.2],['HS Code(Main)',271.8,453.2],['Total Weight',333.2,453.2],['Gross',333.2,443.5],['Net',333.2,433.8],
  ['Total Measurement',460.1,453.2],['Gross',460.1,443.5],['Net',460.1,433.8],['Marks & No.',37.7,421],['Description of Goods',214.7,421],['HS Code',389.5,421],
  ['Number and Kind of Packages',389.5,397.8],['(AMS)',389.5,370.7],['Gross',389.5,259],['Net',389.5,223.7],
  ['Total Number of Containers',37.7,182.4],['or Packages(In Words)',37.7,173.4],['Place of Payment',37.7,162.1],['Place of B(S)/L Issue',264.2,162.1],['Number of Original B(S)/L',454.1,162.1]];
const HEAD=[['Container No.',48.1,0],['Seal No.',147.2,0],['Size',219.2,0],['Type',250,0],['Number and kind',283,6],['of Packages',283,-6],['Cargo Weight',368.5,0],
  ['Measurement',442.1,0],['Tare',502.8,6],['Weight',502.8,-6],['Temp',540.4,0],['OVER LENGTH',219.2,-19.6],['OVER WIDTH',278.5,-19.6],['OVER HEIGHT',331,-19.6],['Number of Pieces',389.5,-19.6]];
const fmt=(n,d)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
function rng(seed){ let s=seed>>>0||1; return ()=>{ s=(s*1103515245+12345)>>>0; return s/4294967296; }; }

async function build(spec){
  const doc=await PDFDocument.create(), font=await doc.embedFont(StandardFonts.Courier);
  const kind=spec.kind||'NACCS';
  if(kind==='SCAN'){ const p=doc.addPage([W,H]); p.drawRectangle({x:40,y:40,width:500,height:700,borderColor:rgb(0,0,0),borderWidth:1}); return doc.save(); }
  if(kind==='OTHER'){ const p=doc.addPage([W,H]); ['BILL OF LADING (DRAFT) - TEST','SHIPPER: SAMPLE CO','CONSIGNEE: TO ORDER','VESSEL: SAMPLE STAR'].forEach((t,i)=>p.drawText(t,{x:40,y:780-i*14,size:9,font})); return doc.save(); }
  const F=spec.fields||{}, T=spec.totals||{}, ops=[];
  const lab=(pg,s,x,y)=>ops.push({pg,s,x,y,size:LAB,lab:true}), val=(pg,s,x,y)=>{ if(s!=null&&String(s).length) ops.push({pg,s:String(s),x,y,size:VAL}); };
  const one=k=>(F[k]||[])[0];
  const rows=spec.rows||[], rest=rows.slice(1), nAtt=Math.ceil(rest.length/12), pages=2+nAtt;
  // 1쪽 라벨
  L1.forEach(([s,x,y])=>lab(0,s,x,y)); HEAD.forEach(([s,x,dy])=>lab(0,s,x,119.4+dy));
  val(0,'ACL INFO (TEST FORM)',212.4,805.3); val(0,'1 / '+pages,536.6,805.3);
  // 머리 칸 · 작은 코드 (실제 위치)
  val(0,'-',172,793.1); val(0,':',193.4,792.6); val(0,'9TEST',297.4,792.6);
  val(0,'-',179.9,776.2); val(0,'-',179.9,692.2); val(0,'-',179.9,605.9); val(0,'-',401.1,605.9);   // Shipper · Consignee · Notify · Also Notify 라벨 줄의 「-」
  (F.shipper||[]).forEach((l,i)=>val(0,l,40.8,i===0?764.9:745.3-(i-1)*9));
  val(0,one('carrier')||'TSTC',259.2,766.4); val(0,one('booking'),355.9,766.4);
  if(spec.bookingSide) spec.bookingSide.forEach(([s,x])=>val(0,s,x,766.4)); else val(0,'-',435.5,766.6);   // v0.4: Booking 欄の右の小欄 (例 「- 01」 「1」 — 지시서 v0.4 F8)
  if(one('masterBl')&&one('masterBl')!=='-') val(0,one('masterBl'),260.6,738.3);
  (F.consignee||[]).forEach((l,i)=>val(0,l,40.8,679.3-i*9)); val(0,'9TST1',310.9,693.6);
  val(0,one('wayBill'),304.9,668.2); val(0,one('received'),398,668.2); val(0,one('freight'),510.5,668.2); val(0,F.agentSign?one('agentSign'):'1',333.5,638.9);   // v0.3: Agent Signature (빈칸 = 아무것도 없음)
  val(0,one('refNo'),294.4,622.3);
  (F.notify||[]).forEach((l,i)=>val(0,l,40.8,i===0?593.9:574.3-(i-1)*9));
  (F.alsoNotify||[]).filter(l=>l!=='-').forEach((l,i)=>val(0,l,260.6,593.9-i*9));
  val(0,one('receipt'),306.4,512.8); val(0,'JPTYO',394.2,522.6); val(0,'51',454.9,512.8);
  val(0,one('vessel'),37.8,488.8); val(0,'9TST',119.6,498.6); val(0,one('voy'),224.6,488.8); val(0,one('pol'),306.4,488.8); val(0,'JPTYO',393.5,498.6);
  val(0,one('pod'),40.8,466.3); val(0,'VNTST',138.4,476); val(0,one('delivery'),197.6,466.3); val(0,'VNTST',282.4,476); val(0,'51',349.2,466.3);
  if(one('finalDest')&&one('finalDest')!=='-'){ val(0,one('finalDest'),412.9,466.3); val(0,'VNTST',490.9,476); }
  // 합계 줄
  if(T.count!=null) val(0,String(T.count),T.count>9?45.1:49.7,433.3);
  if(T.bales!=null){ val(0,String(T.bales),135,434); val(0,'BL',156.4,434); val(0,'BALE,COMPRESSED',180.4,434); }
  if(one('hsMain')&&one('hsMain')!=='-') val(0,one('hsMain'),271.9,434); else val(0,'-',290.4,434);
  if(T.weight!=null){ val(0,fmt(T.weight,3),373.2,443); val(0,'KGM',431.8,443); }
  if(T.measure!=null){ val(0,fmt(T.measure,3),510.2,443); val(0,'MTQ',548,443); }
  (F.marks||[]).forEach((l,i)=>val(0,l,37.8,410.8-i*9));
  (F.description||[]).forEach((l,i)=>val(0,l,217.9,410.8-i*9));
  if(spec.overflow) val(0,spec.overflow,217.9,410.8-(F.description||[]).length*9);
  val(0,'-',411.3,410.8);
  if(T.bales!=null){ val(0,String(T.bales),427.6,384.5); val(0,'BL',463.2,384.5); val(0,'BALE,COMPRESSED',487.2,384.5); }
  if(T.words) val(0,T.words,171.4,177.5);
  val(0,'1',37.7,151.7); val(0,'JPTYO',49.8,151.2); val(0,'TOKYO,JAPAN',82.8,151.2); val(0,'-',231.2,151.7); val(0,'P',243.4,151.2);
  val(0,'JPTYO',267.4,145.9); val(0,'TOKYO,JAPAN',300.4,145.9); val(0,one('originals'),466.1,145.9);
  // 컨테이너 줄: 1쪽 1줄 (y 86.6) · 3쪽부터 12줄씩 (y 742.4 - 57.7k)
  const drawRow=(pg,r,seq,y,dv)=>{
    val(pg,String(seq),seq>9?38.3:43,y); val(pg,r.container,53.6,y); val(pg,r.seal,136.9,y);
    val(pg,r.size||'45',223.9,y+dv); val(pg,r.type||'GP',253.9,y+dv); val(pg,String(r.bales),314.4,y+dv); val(pg,'BL',333.5,y+dv);
    val(pg,fmt(r.cargo,3),379.3,y+dv); val(pg,fmt(r.measure==null?40:r.measure,3),466.2,y+dv); val(pg,fmt(r.tare,0),507.6,y+dv);
    val(pg,'BALE,COMPRESSED',277.9,y+dv-11.1); val(pg,'KGM',412.9,y+dv-11.1); val(pg,'MTQ',478.2,y+dv-11.1); val(pg,'KGM',515,y+dv-11.1);
    [0.4,-8.6,-17.6,-26.6,-44.6,-35.6].forEach((d,i)=>val(pg,(i+1)+')',121,y+d)); };
  if(rows[0]) drawRow(0,rows[0],1,86.6,0);
  // 2쪽 — 이어지는 머리 칸 (컨테이너 없음)
  [['Fax No.',37.7,778.9],['Shipper\'s Mail Address',37.7,751.8],['Invoice No.',37.7,697.8],['Shipper\'s Section Code',37.7,669.4],["Shipper's Reference No.",212.5,669.4],
   ['Transmitting Code To Shipper',387.2,669.4],['Order No.',37.7,640.8],['L/C No.',212.5,640.8],['Cargo Type Code',387.2,640.8],['Person in Charge',37.7,611.5],['Remarks',241,610.8],
   ['Cargo No.',37.7,497.5],['Nvocc Code And Booking No. For House Loading',37.7,309.2],['Transmission Identifier',434.5,309.2],['Contact User',42.1,118.7],['Booking No.',404.5,794.6]].forEach(([s,x,y])=>lab(1,s,x,y));
  ['1)','2)','3)'].forEach((m,i)=>val(1,m,40.7,739.1-i*11.25)); (F.shipperMail||[]).forEach((l,i)=>val(1,l,56.6,738.6-i*11.25));   // v0.3: Shipper's Mail Address (2쪽 · 1)~3) 칸 · 빈칸 = 표시만)
  val(1,spec.invoice||'',37.8,684.6); val(1,one('booking'),459.5,794.2); val(1,'-',539,794.4); val(1,'2 / '+pages,536.6,805.3);
  for(let a=0;a<nAtt;a++){ const pg=2+a;
    HEAD.forEach(([s,x,dy])=>lab(pg,s,x,774.4+dy)); lab(pg,'Booking No.',404.5,794.6); val(pg,one('booking'),459.5,794.2); val(pg,'-',539,794.4); val(pg,(pg+1)+' / '+pages,536.6,805.3);
    rest.slice(a*12,a*12+12).forEach((r,k)=>drawRow(pg,r,2+a*12+k,742.4-57.7*k,0.8)); }
  // 그리는 순서 (pdf.js 글자 순서)
  let order=ops.slice();
  if(spec.order==='valuesFirst') order=ops.filter(o=>!o.lab).concat(ops.filter(o=>o.lab));
  else if(spec.order==='shuffle'){ const r=rng(spec.seed||7); for(let i=order.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; } }
  const P=[]; for(let i=0;i<pages;i++) P.push(doc.addPage([W,H]));
  order.forEach(o=>P[o.pg].drawText(o.s,{x:o.x, y:o.y, size:o.size, font}));
  return doc.save();
}
module.exports={build, L1, HEAD, W, H};
