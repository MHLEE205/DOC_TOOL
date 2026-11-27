/* v0.25 시험 (지시서 MAC-THOR_23 · LG 訂正依頼) — 가짜 데이터 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v25.js [html]
   선사별 칸 채우기 (셀 지도 · xlsx 의 시트 XML 만 바꿈 · 서식 · 이미지 그대로) · 모르는 칸 = 確認 · Deposit (찾기 · 넣기 · 늘 確認) · 판 번호 ({IV}_LG.xlsx → REV …) · 문지기 ·
   下書き (받는 사람 · 제목 · 본문 · 첨부 이름 · 첨부 검사 · 보내기 0) · NAME.LG 넓힘 · 화면 (「LG を作る」 단추 · 한 화면) */
const fs=require('fs'),path=require('path'), JSZip=require('jszip');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V25;
/* 가짜 선사 (patterns.json 의 모양) */
const P={schema:'lg_patterns/1', carriers:{
  'TESTLINE':{key:'TESTLINE', status:'auto', family:'共通 LG FORM', template:{path:'templates/TESTLINE/TESTLINE.xlsx', from:{invoice:'TST2699-01', name:'LG(TST000001).xls', sent_mail:true}, converted:true}, bracket:'<>',
    mail:{mode:'new', head:['テストライン株式会社','ご担当者様',''], subj:'[LG付き訂正依頼:{BL}]', body:['BL NO.{BL}につきまして、','LG通りご訂正をお願いできますでしょうか。'], att:'LG({BL}).xlsx', to:['amend@carrier.example.test'], cc:['cs@carrier.example.test'], tail:['','何卒よろしくお願い申し上げます。']}},
  'REPLYLINE':{key:'REPLYLINE', status:'auto', template:{path:'templates/REPLYLINE/REPLYLINE.xlsx', from:{}}, bracket:'【】', mail:{mode:'reply', head:['{CARRIER}','ご担当者様',''], subj:'<LG訂正の依頼>', body:['BL#{BL}'], att:'REPLYLINE_LG({BL}).xlsx', to:[], cc:[]}},
  'HOLDLINE':{key:'HOLDLINE', status:'hold', why:'テキストボックスの様式', template:null, mail:null}}};
(async()=>{
console.log('선사 찾기');
eq(DOC.lgCarrier('TESTLINE',P).key,'TESTLINE','그대로'); eq(DOC.lgCarrier('TESTLINE(N)',P).key,'TESTLINE','(N) 뗌'); eq(DOC.lgCarrier('NOLINE',P),null,'없는 선사 = null'); eq(DOC.lgCarrier('',P),null,'빈 이름');
eq(DOC.lgCarrier('HOLDLINE',P).pat.status,'hold','보류 선사');

console.log('Deposit 찾기 · 넣기');
let d=DOC.lgDepoFind(['Dear Oba san,\nPls be informed the Deposit number is 720908492 - 08 for TST2699-01 shipment.\nThanks'],'TST2699-01'); eq(d.pick,'720908492 - 08','번호 (하이픈 · 공백)'); ok(d.sure,'하나 = 확실');
d=DOC.lgDepoFind(['1. Deposit Number: 902-TST269901/ABC.\n2. Buyer Name'],'TST2699-01'); eq(d.pick,'902-TST269901/ABC','끝 점 뗌 · Invoice 가 번호 안');
d=DOC.lgDepoFind(['deposit number of TST2699-02 is 889-TST269902/AB\ndeposit number of TST2699-01 is 890-TST269901/AB'],'TST2699-01'); eq(d.pick,'890-TST269901/AB','여러 Invoice → 이 Invoice 의 번호');
d=DOC.lgDepoFind(['Bank deposit no. for TST2699-01 is 449/TB-TGI-DVKH Please revise BL'],'TST2699-01'); eq(d.pick,'449/TB-TGI-DVKH','for {IV} is');
d=DOC.lgDepoFind(['Please refer deposit cert attached with SDN 218/BDU-VSIP.'],'TST2699-01'); eq(d.pick,'218/BDU-VSIP','SDN');
d=DOC.lgDepoFind(['Thank you for the draft.'],'TST2699-01'); eq([d.pick,d.cands.length],['',0],'없음 = 빈칸');
eq(DOC.lgDepoApply('1234567890#156/GPMT-BTNMT#DEPOSIT','320764831 - 597').text,'1234567890#156/GPMT-BTNMT#320764831 - 597','#DEPOSIT 끝');
eq(DOC.lgDepoApply('1234567890#418/GPMT-BTNMT#DEPOSIT#SAMPLE PAPER JSC','902-X/Y').text,'1234567890#418/GPMT-BTNMT#902-X/Y#SAMPLE PAPER JSC','#DEPOSIT# 가운데');
eq(DOC.lgDepoApply('SECURITY DEPOSIT NUMBER:XX','1').text,'SECURITY DEPOSIT NUMBER:1','DEPOSIT NUMBER:XX');
eq(DOC.lgDepoApply('NUMBER OF BANK DEPOSIT CERTIFICATE: XXX','7').text,'NUMBER OF BANK DEPOSIT CERTIFICATE: 7','CERTIFICATE: XXX');
eq(DOC.lgDepoApply('#BANK DEPOSIT NUMBER#SAMPLE','04/A').text,'#04/A#SAMPLE','#BANK DEPOSIT NUMBER#');
eq(DOC.lgDepoApply('#DEPOSIT#','').n,0,'번호 없으면 그대로');
ok(DOC.lgHasDepo('X#DEPOSIT')&&DOC.lgHasDepo('DEPOSIT NUMBER : XXX')&&!DOC.lgHasDepo('DEPOSIT NUMBER: 123')&&!DOC.lgHasDepo('SAMPLE'),'자리표 판단');

console.log('訂正の欄 (행 단위)');
const items=[{key:'consignee', expected:'1234567890#156/GPMT-BTNMT#DEPOSIT\n#SAMPLE PAPER CORPORATION\n#SAMPLE ROAD, SAMPLE CITY'},{key:'notify', expected:'1234567890#156/GPMT-BTNMT#DEPOSIT\n#SAMPLE PAPER CORPORATION\n#SAMPLE ROAD, SAMPLE CITY'},{key:'description', expected:'WASTE PAPER\nSECURITY DEPOSIT NUMBER:XX'}];
const lines=[{t:'1234567890#156/GPMT-BTNMT#DEPOSIT',k:'consignee'},{t:'#SAMPLE PAPER CORPORATION',k:'consignee'},{t:'#SAMPLE ROAD, SAMPLE CITY',k:'consignee'},{t:'1234567890#156/GPMT-BTNMT#DEPOSIT',k:'notify'},{t:'#SAMPLE PAPER CORPORATION',k:'notify'},{t:'#SAMPLE ROAD, SAMPLE CITY',k:'notify'},{t:'WASTE PAPER',k:'description'},{t:'SECURITY DEPOSIT NUMBER:XX',k:'description'}];
let B=DOC.lgBlocks({A:[], B:[], items, lines, depo:'320764831 - 597', vietnam:true});
eq(B.map(b=>[b.label,b.before,b.after]),[['CONSIGNEE/NOTIFY','1234567890#156/GPMT-BTNMT#DEPOSIT','1234567890#156/GPMT-BTNMT#320764831 - 597'],['DESCRIPTION OF GOODS','SECURITY DEPOSIT NUMBER:XX','SECURITY DEPOSIT NUMBER:320764831 - 597']],'Deposit = 그 행만 · Consignee/Notify 합침');
ok(B.every(b=>!b.need),'번호 있음 = 確認 아님 (블록)');
B=DOC.lgBlocks({A:[], B:[], items, lines, depo:'', vietnam:true}); ok(B.length===2&&B.every(b=>b.need),'번호 없음 = 確認');
B=DOC.lgBlocks({A:[], B:[], items, lines, depo:'1', vietnam:false}); eq(B.length,0,'베트남 아님 = Deposit 없음');
/* 상위 회사 이름이 빠진 Notify (NHK2611-02 와 같은 모양 · 가짜 이름) */
const it2=[{key:'notify', expected:'1234567890#418/GPMT-BTNMT#DEPOSIT\n#SAMPLE PAPER JOINT STOCK COMPANY\n#ADD : LOT 1, SAMPLE PARK'}];
const ln2=[{t:'1234567890#418/GPMT-BTNMT#DEPOSIT',k:'notify'},{t:'#SAMPLE PAPER JOINT STOCK',k:'notify'},{t:'#ADD : LOT 1, SAMPLE PARK',k:'notify'}];
B=DOC.lgBlocks({A:[{field:'Notify', class:'DIFF', si:'3行', draft:'2行', miss:[['#SAMPLE PAPER JOINT STOCK COMPANY',false]]}], B:[], items:it2, lines:ln2, depo:'902-TST269901/ABC', vietnam:true});
eq(B.map(b=>[b.label,b.before,b.after,b.why]),[['NOTIFY PARTY','1234567890#418/GPMT-BTNMT#DEPOSIT\n#SAMPLE PAPER JOINT STOCK','1234567890#418/GPMT-BTNMT#902-TST269901/ABC\n#SAMPLE PAPER JOINT STOCK COMPANY',['diff','depo']]],'相違 (빠진 COMPANY) + Deposit = Draft 순서 · 바뀐 행만');
B=DOC.lgBlocks({A:[{field:'Shipper', class:'DIFF', miss:[['SAMPLE TEL',false]]}], B:[], items:[{key:'shipper', expected:'X'}], lines:[{t:'X SH>',k:'shipper'}], vietnam:false}); eq(B.length,0,'Shipper (당사) = LG 에 안 씀');
B=DOC.lgBlocks({A:[{field:'Notify', class:'DIFF', miss:[['#SAMPLE PAPER CO., LTD',false]]}], B:[], items:[{key:'notify', expected:'#SAMPLE PAPER CO., LTD'}], lines:[], vietnam:false}); ok(B.length===1&&B[0].before===''&&B[0].need,'Draft 의 칸 못 읽음 = 前 빈칸 · 確認');
const BT=DOC.lgBlockText([{label:'NOTIFY PARTY', before:'A', after:'B'},{label:'DESCRIPTION OF GOODS', before:'C', after:'D'}],'【】'); eq(BT,{before:'【NOTIFY PARTY】\nA\n\n【DESCRIPTION OF GOODS】\nC', after:'【NOTIFY PARTY】\nB\n\n【DESCRIPTION OF GOODS】\nD'},'선사 괄호 【】');
eq(DOC.lgVessel('SAMPLE STAR 0110W'),['SAMPLE STAR','0110W'],'본선 · 항해 나눔'); eq(DOC.lgVessel('SAMPLE STAR'),['SAMPLE STAR',''],'항해 없음');

console.log('값 · 確認');
const cells={date:'J4', vessel:'D10', voyage:'I10', bl:'D12', pol:'D14', pod:'H14', before:'B21', after:'F21', person:['A37','依頼者名: {v}']};
let vals=DOC.lgValues({cells, blocks:DOC.lgBlocks({A:[], B:[], items, lines, depo:'1', vietnam:true}), br:'<>', bl:'TST000001', vessel:'SAMPLE STAR 0110W', pol:'TOKYO, JAPAN', pod:'', today:'2026-11-25', person:''});
eq(vals.date,{ref:'J4', v:46351, fmt:'{v}', kind:'date', need:false},'날짜 = 2026-11-25 의 Excel 수');
eq([vals.vessel.v, vals.voyage.v, vals.bl.v, vals.pol.v],['SAMPLE STAR','0110W','TST000001','TOKYO, JAPAN'],'머리 칸');
ok(vals.pod.need&&vals.person.need&&!vals.vessel.need,'모르는 칸 (POD 빈칸 · 依頼者) = 確認');

console.log('xlsx — 시트 XML 만 바꿈 (서식 · 이미지 · 병합 그대로)');
const z=new JSZip(); const png=Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000','hex');
z.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/calcChain.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml"/></Types>');
z.file('xl/workbook.xml','<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="LG FORM" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029"/></workbook>');
z.file('xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="rId1" Type="worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId9" Type="calcChain" Target="calcChain.xml"/></Relationships>');
const sheet0='<worksheet><sheetData><row r="4"><c r="I4" s="3" t="s"><v>0</v></c><c r="J4" s="7"><f>TODAY()</f><v>45000</v></c></row><row r="10"><c r="C10" s="2" t="s"><v>1</v></c><c r="D10" s="5" t="s"><v>2</v></c></row><row r="21"><c r="B21" s="9" t="s"><v>3</v></c><c r="F21" s="9" t="s"><v>4</v></c></row></sheetData><mergeCells count="2"><mergeCell ref="B21:E24"/><mergeCell ref="F21:J24"/></mergeCells><drawing r:id="rId1"/></worksheet>';
z.file('xl/worksheets/sheet1.xml',sheet0); z.file('xl/media/image1.png',png); z.file('xl/calcChain.xml','<calcChain><c r="J4" i="1"/></calcChain>'); z.file('xl/styles.xml','<styleSheet/>');
const tplBuf=await z.generateAsync({type:'nodebuffer'});
const out=DOC.xlsxFill({sheet:sheet0, workbook:await z.file('xl/workbook.xml').async('string')}, vals);
ok(/<c r="J4" s="7"><f>TODAY\(\)<\/f><v>46351<\/v><\/c>/.test(out.sheet),'날짜 = 式 그대로 · 값만 오늘');
ok(/<c r="D10" s="5" t="inlineStr"><is><t xml:space="preserve">SAMPLE STAR<\/t><\/is><\/c>/.test(out.sheet),'본선 = 서식 s="5" 그대로 · 문자');
ok(/<row r="10"><c r="C10"[^]*<c r="D10"[^]*<c r="I10"/.test(out.sheet),'없던 셀 (I10) = 열 순서대로 끼움');
ok(/<row r="12"><c r="D12" t="inlineStr"><is><t xml:space="preserve">TST000001<\/t>/.test(out.sheet)&&out.sheet.indexOf('<row r="12">')>out.sheet.indexOf('<row r="10">')&&out.sheet.indexOf('<row r="12">')<out.sheet.indexOf('<row r="21">'),'없던 행 = 행 순서대로');
ok(/<c r="B21" s="9" t="inlineStr"><is><r><rPr><b\/><\/rPr><t xml:space="preserve">&lt;CONSIGNEE\/NOTIFY&gt;<\/t><\/r><r><rPr><\/rPr><t xml:space="preserve">\n<\/t><\/r><r><rPr><\/rPr><t xml:space="preserve">1234567890#156\/GPMT-BTNMT#DEPOSIT/.test(out.sheet),'訂正前 = 見出し 太字 · 괄호 escape · 줄바꿈 그대로');
ok(/<c r="F21" s="9" t="inlineStr"><is>[^]*?<r><rPr><color rgb="FFFF0000"\/><\/rPr><t xml:space="preserve">1<\/t><\/r>/.test(out.sheet),'訂正後 = 바뀐 말 (Deposit 번호) 빨강 — 실제 LG 와 같은 방식');
const st='<styleSheet><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="9"/><color theme="1"/><name val="MS PGothic"/><family val="3"/><charset val="128"/></font></fonts><cellXfs count="2"><xf fontId="0"/><xf fontId="1"/></cellXfs></styleSheet>';
eq(DOC.xlsxRPr(DOC.xlsxFontOf(st,1),{red:true}),'<rPr><rFont val="MS PGothic"/><charset val="128"/><family val="3"/><b/><color rgb="FFFF0000"/><sz val="9"/></rPr>','셀 글꼴 그대로 + 빨강 (Excel 의 순서)');
const ed=Object.assign({},vals.after,{v:'직접 고침'}); ok(/<t xml:space="preserve">직접 고침<\/t><\/is>/.test(DOC.xlsxFill({sheet:sheet0},{after:ed}).sheet),'직원이 고친 글 = 그대로 (빨강 · 굵게 없음)');
ok(/<mergeCell ref="B21:E24"\/>/.test(out.sheet)&&/<drawing r:id="rId1"\/>/.test(out.sheet),'병합 · 그림 (인감) 그대로');
ok(/<row r="37"><c r="A37"\/><\/row>/.test(out.sheet),'빈 값 = 빈 셀 (모르는 칸은 비움 · 「依頼者名: 」 도 안 씀)');
ok(/fullCalcOnLoad="1"/.test(out.workbook),'열 때 다시 계산');
eq(DOC.xlsxCellSet('<worksheet><sheetData/></worksheet>','B2','X','text'),'<worksheet><sheetData><row r="2"><c r="B2" t="inlineStr"><is><t xml:space="preserve">X</t></is></c></row></sheetData></worksheet>','빈 sheetData');
let thr=''; try{ DOC.xlsxCellSet(sheet0,'bad','x','text'); }catch(e){ thr=e.message; } ok(/セル/.test(thr),'잘못된 셀 이름 = 예외');
/* 앱의 lgBuild 와 같은 순서로 zip 을 다시 만들어 열어 봄 */
const z2=await JSZip.loadAsync(tplBuf); z2.file('xl/worksheets/sheet1.xml', out.sheet); z2.file('xl/workbook.xml', out.workbook); z2.remove('xl/calcChain.xml');
const re=await JSZip.loadAsync(await z2.generateAsync({type:'nodebuffer'}));
ok(Buffer.compare(await re.file('xl/media/image1.png').async('nodebuffer'),png)===0,'인감 이미지 = 바이트 그대로');
ok((await re.file('xl/styles.xml').async('string'))==='<styleSheet/>','서식 파일 그대로');
ok(/lgBuild[\s\S]*calcChain\.xml[\s\S]*Content_Types/.test(HTML),'앱: calcChain 지우면 Content_Types · rels 도');

console.log('판 번호 · 문지기');
eq(DOC.lgName('TST2699-01',[]),'TST2699-01_LG.xlsx','첫 판'); eq(DOC.lgName('TST2699-01',['tst2699-01_lg.xlsx']),'TST2699-01_LG_REV.xlsx','두 번째 = REV (v0.36 「_」)'); eq(DOC.lgName('TST2699-01',['TST2699-01_LG.xlsx','TST2699-01_LG REV.xlsx']),'TST2699-01_LG_REV2.xlsx','세 번째 = REV2 (옛 _LG REV 를 같은 이름으로 셈)');
const W='古紙/-. 古紙書類/▲ 書類作成中/TST2699-01';
ok(DOC.guardSave(W+'/TST2699-01_LG REV.xlsx',{iv:'TST2699-01', folder:W, kind:'LG'}),'본번 = Invoice 폴더 · 정해진 이름');
ok(DOC.guardSave(DOC.OUT_ROOT+'save_test/TST2699-01/TST2699-01_LG.xlsx',{iv:'TST2699-01', test:true, kind:'LG'}),'시험 = save_test/{IV}/');
const bad=[[W+'/LG(TST000001).xlsx',{iv:'TST2699-01', folder:W, kind:'LG'}],[W+'/TST2699-02_LG.xlsx',{iv:'TST2699-01', folder:W, kind:'LG'}],['古紙/X/TST2699-01/TST2699-01_LG.xlsx',{iv:'TST2699-01', folder:'古紙/X/TST2699-01', kind:'LG'}],[W+'/TST2699-01_LG.xlsx',{iv:'TST2699-01', test:true, kind:'LG'}],[W+'/TST2699-01_ACL.pdf',{iv:'TST2699-01', folder:W, kind:'LG'}]];
bad.forEach(([p,sv],i)=>{ let e=''; try{ DOC.guardSave(p,sv); }catch(x){ e=x.message; } ok(!!e,'막힘 '+i,p); });
ok(DOC.NAME.LG.test('TST2699-01_LG.xlsx')&&DOC.NAME.LG.test('TST2699-01_LG REV2.xlsx')&&DOC.NAME.LG.test('LG(TST000001).xlsx')&&DOC.NAME.LG.test('TESTLINE_LG(TST000001).xls')&&!DOC.NAME.LG.test('TST2699-01_FD.pdf')&&!DOC.NAME.LG.test('TST2699-01_LG.pdf'),'NAME.LG = 새 이름도 (Deposit 칸 「LG 作成済」)');

console.log('下書き');
let m=DOC.lgMailDraft({pat:P.carriers.TESTLINE, carrier:'TESTLINE', iv:'TST2699-01', bl:'TST000001', bkg:'BKTST01', blocks:[{label:'NOTIFY PARTY', before:'A#DEPOSIT', after:'A#1'}], src:null, att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
eq([m.subject, m.to, m.cc, m.att, m.block, m.mode],['[LG付き訂正依頼:BL#TST000001] / TST2699-01',['amend@carrier.example.test'],['cs@carrier.example.test','rcp@example.test'],[{name:'TST2699-01_LG.xlsx', as:'LG(TST000001).xlsx'}],'','new'],'새 메일 — 실적 받는 사람 · 제목 · 첨부 이름 (선사 모양) · CC rcp@ (v0.28 N34: 모든 선사 같은 머리)');
ok(/^テストライン株式会社\nご担当者様\n\nいつもお世話になっております。\n\nBL NO.TST000001につきまして、\nLG通りご訂正をお願いできますでしょうか。/.test(m.body)&&!/■|（訂正前）/.test(m.body)&&/何卒よろしくお願い申し上げます。$/.test(m.body),'본문 = 大場 방식 + 정정 목록',m.body);
m=DOC.lgMailDraft({pat:P.carriers.REPLYLINE, carrier:'REPLYLINE', iv:'TST2699-01', bl:'TST000001', blocks:[], src:{id:'MSG1', subj:'RE: Draft B/L TST000001'}, att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
eq([m.mode, m.srcId, m.subject, m.to],['reply','MSG1','[LG付き訂正依頼:BL#TST000001] / TST2699-01 Re: Draft B/L TST000001',[]],'답장 선사 = Draft 메일에 답장 · 제목 앞 태그 (v0.28 N34: 모든 선사 같은 머리)');
ok(/^REPLYLINE\nご担当者様/.test(m.body),'{CARRIER} 머리');
m=DOC.lgMailDraft({pat:P.carriers.REPLYLINE, carrier:'REPLYLINE', iv:'TST2699-01', bl:'TST000001', blocks:[], src:null, att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
ok(m.mode==='new'&&m.warn.some(w=>/元の B\/L Draft/.test(w))&&m.warn.some(w=>/宛先が分かりません/.test(w)),'Draft 메일 없음 = 새 메일 + 안내 · 받는 사람 없음 경고');
eq(DOC.lgMailDraft({pat:P.carriers.HOLDLINE, iv:'TST2699-01'}).block,V.NO_TPL,'메일 틀 없음 = 막음');
eq(DOC.lgAttCheck('LG(TST000001).xlsx','[LG付き訂正依頼:TST000001]',{bl:'TST000001', iv:'TST2699-01'}),'','첨부 = 제목의 B/L');
ok(/添付名が違う/.test(DOC.lgAttCheck('LG(TST000009).xlsx','[LG付き訂正依頼:TST000001]',{bl:'TST000001', iv:'TST2699-01'})),'첨부 번호 다름 = 막음');
ok(/別の Invoice/.test(DOC.lgAttCheck('TST2699-02_LG(TST000001).xlsx','[LG付き訂正依頼:TST000001]',{bl:'TST000001', iv:'TST2699-01'})),'다른 Invoice = 막음');
ok(/件名/.test(DOC.lgAttCheck('LG(TST000001).xlsx','[LG付き訂正依頼]',{bl:'TST000001', iv:'TST2699-01'})),'제목에 이 선적 번호 없음 = 막음');
m=DOC.lgMailDraft({pat:{mail:{mode:'new', head:[], subj:'[LG付き訂正依頼]', body:[], att:'TESTLINE_LG({BL}).xlsx', to:['a@carrier.example.test'], cc:[]}}, iv:'TST2699-01', bl:'TST000001', blocks:[], att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
eq([m.subject, m.block],['[LG付き訂正依頼:BL#TST000001] / TST2699-01',''],'번호 없는 제목 모양 = 「 BL#번호」 를 붙임 (v0.28 N34: 모든 선사 같은 머리)');
['send','sendMail','forward','reply','move','copy'].forEach(v=>{ let e=''; try{ DOC.guardMail('POST','me/messages/ID/'+v); }catch(x){ e=x.message; } ok(!!e,'보내기 막힘 '+v); });
ok(DOC.guardMail('POST','me/messages')&&DOC.guardMail('POST','me/messages/ID/createReplyAll')&&DOC.guardMail('POST','me/messages/ID/attachments')&&DOC.guardMail('PATCH','me/messages/ID'),'下書き 만 허용');
ok(!/\/send(Mail)?['"]|sendMail\(/.test(HTML.replace(/guardMail[\s\S]{0,400}/,'')),'보내는 코드 없음');
ok(DOC.MAIL19.RE.test('TST2699-01_lg_20261125-120000.json')&&/^古紙\/-\. AI 活用\/D-00\/doc_tool\/mail_draft\/TST2699-01_lg_\d{8}-\d{6}\.json$/.test(DOC.lgDraftPath('TST2699-01',new Date('2026-11-25T03:00:00Z'))),'下書き 기록 = mail_draft/{IV}_lg_{UTC}.json');

console.log('화면 · 설정 경로');
ok(/id="dtBlLg">LG を作る</.test(HTML)&&/id="dtDepoLg">LG を作る</.test(HTML),'「LG を作る」 = B/L Draft 탭 · Deposit 탭');
ok(/>LG を保存</.test(HTML)&&/>LG 訂正依頼の下書き</.test(HTML),'「LG を保存」 · 「LG 訂正依頼の下書き」');
ok(V.DIR==='古紙/-. AI 活用/D-00/lg/'&&!/@[a-z0-9.\-]+\.(co\.jp|com)['"]/i.test((HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]).replace(/leenearcorp|example\.test/g,'')),'받는 사람 주소는 코드에 없음 (patterns.json)');
ok(/lg-grid\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.5fr\)/.test(HTML)&&/@media \(max-width:900px\)\{\.lg-grid/.test(HTML),'한 화면 (좁으면 1 열 · 가로 스크롤 0)');
ok(/cdnjs\.cloudflare\.com\/ajax\/libs\/jszip\/3\.10\.1\/jszip\.min\.js/.test(HTML),'JSZip 고정 판 (cdnjs)');
console.log((fail?'FAIL':'PASS')+' v25 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v25 예외',e.stack); process.exitCode=1; });
