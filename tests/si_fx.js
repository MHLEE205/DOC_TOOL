/* source: CONTRACT_SEND/tests/a1_bench/harness.js @435799c — 가짜 LC · 가짜 S/I · 가짜 Anthropic 응답 (가짜 데이터 · DOC_TOOL #7 시험용으로 줄 그대로 복사 — 고치지 않음) */
const prompts=[];
const LCS={
  'LRS-2603SG1':{lcNo:'ILC0001',d:'260306',po:'PO11111',lic:'156/GPMT-BTNMT'},
  'LRS-2604SG1':{lcNo:'ILC0002',d:'260406',po:'PO22222',lic:'156/GPMT-BTNMT'},
  'LRS-2605SG1':{lcNo:'ILC0003',d:'260506',po:'PO33333',lic:'157/GPMT-BTNMT'},
  'LRS-2603CA1':{lcNo:'KB0001',d:'260310',po:'CAS111',app:'A.B.C. PAPER MILL CO., LTD.\n     99/9 MOO 9, SAMPLE HIGHWAY ROAD,\n     SAMPLEPROV 16000 THAILAND',bank:'BANKTHBKXXX'},
  'LRS-2605CA1':{lcNo:'KB0002',d:'260510',po:'CAS222',app:'A.B.C.PAPER CO.,LTD.\n     10 EXAMPLE RD.\n     BANGKOK 10600 THAILAND',bank:'BANKTHBKXXX'},
  'LRS-2606CA1':{lcNo:'KB0003',d:'260610',po:'CAS333',app:'A.B.C. PAPER MILL CO., LTD.\n     99/9 MOO 9, SAMPLE HIGHWAY ROAD,\n     SAMPLEPROV 16000 THAILAND',bank:'BANKTHBKXXX'}
};
function lcText(no){ const x=LCS[no], sg=/SG/.test(no);
  return ['700  ISSUE OF A DOCUMENTARY CREDIT',
  ' SEQUENCE OF TOTAL :27 1/1',' DOCUMENTARY CREDIT NUMBER :20 '+x.lcNo,' DATE OF ISSUE :31C '+x.d,
  ' APPLICANT :50 '+(sg?'DELTA PAPER CORPORATION\n     SAMPLE A INDUSTRIAL PARK\n     SAMPLE WARD, HO CHI MINH CITY, VIET NAM':x.app),
  ' ISSUING BANK :52A '+(sg?'BANKVNVXXXX':x.bank),' CURRENCY CODE AMOUNT :32B USD100000,00',
  ' PORT OF DISCHARGE :44F '+(sg?'HO CHI MINH CITY, VIET NAM':'BANGKOK, THAILAND'),
  ' DESCRIPTION OF GOODS :45A WASTE PAPER OCC 500 MT\n     HS CODE: 4707.10.00\n     PO NO.: '+x.po,
  ' DOCUMENTS REQUIRED :46A 1. SIGNED COMMERCIAL INVOICE IN 3 COPIES\n     2. FULL SET OF CLEAN ON BOARD OCEAN BILLS OF LADING MADE OUT TO ORDER OF '+(sg?'SAMPLE BANK TOKYO':'APPLICANT')+' MARKED FREIGHT PREPAID AND NOTIFY APPLICANT',
  ' ADDITIONAL CONDITIONS :47A 1. ALL DOCUMENTS MUST SHOW LC NUMBER'+(sg?'\n     2. IMPORT LICENSE NO: '+x.lic+' MUST BE SHOWN ON B/L':'')].join('\n');
}
const fmtD=d=>{ const M=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']; return M[+d.slice(2,4)-1]+' '+d.slice(4,6)+', 20'+d.slice(0,2); };
function siOf(no){ const x=LCS[no], sg=/SG/.test(no), mill=/MILL/.test(x.app||'');
  const s1={crcf9_sino:1, cr49f_lc_no:x.lcNo+' DATED ON '+fmtD(x.d), crcf9_po_vo:x.po, crcf9_payment_classification:'LC',
    crcf9_consignee:sg?'0300000002#156/GPMT-BTNMT#DEPOSIT#DELTA PAPER CORPORATION***':'TO ORDER OF '+(mill?'A.B.C. PAPER MILL CO., LTD.':'A.B.C.PAPER CO.,LTD.'),
    crcf9_notify_party:sg?'0300000002#156/GPMT-BTNMT#DEPOSIT':(mill?'A.B.C. PAPER MILL CO., LTD.':'A.B.C.PAPER CO.,LTD.'),
    crcf9_address:sg?'#DELTA PAPER CORPORATION***':(mill?'99/9 MOO 9, SAMPLE HIGHWAY ROAD,\nSAMPLEPROV 16000 THAILAND':'10 EXAMPLE RD.\nBANGKOK 10600 THAILAND'),
    crcf9_bl_text1:sg?'WASTE PAPER#47071000#XXKGS#XXBALES\nDEPOSIT NUMBER : XXX':(no==='LRS-2606CA1'?'PO NUMBER: '+x.po:''), crcf9_remark:'',
    crcf9_place_of_delivery_1:sg?'HO CHI MINH CITY, VIET NAM':'BANGKOK, THAILAND'};
  const out=[s1]; if(sg) out.push({crcf9_sino:2, cr49f_lc_no:s1.cr49f_lc_no, crcf9_notify_party:'DELTA PAPER CORPORATION', crcf9_address:'SAMPLE A INDUSTRIAL PARK, SAMPLE WARD, HO CHI MINH CITY, VIET NAM', crcf9_tel:'TEL +84 200 1234567'});
  return out.map(h=>Object.assign({cr49f_s_iid:'si-'+no+'-'+h.crcf9_sino, createdon:'2026-0'+no.slice(7,8)+'-15T00:00:00Z', modifiedon:'2026-0'+no.slice(7,8)+'-16T00:00:00Z'},h));
}
const NOS=Object.keys(LCS);
const BUYERS=[{cr49f_buyerid:'b-sg',cr49f_buyer:'DELTA',cr49f_buyer_name:'DELTA PAPER CORPORATION',cr49f_buyer_code:'SG',crcf9_country:'VIETNAM'},{cr49f_buyerid:'b-ca',cr49f_buyer:'CAS',cr49f_buyer_name:'A.B.C. PAPER MILL CO., LTD.',cr49f_buyer_code:'CA',crcf9_country:'THAILAND'}];
const SC=NOS.map(no=>({cr49f_sale_contractid:'c-'+no, cr49f_sale_contract_no:no, cr49f_sale_contract_date:'2026-0'+no.slice(7,8)+'-01', cr49f_pay_cls:'LC', cr49f_pay_days:'AT SIGHT', cr49f_terms_conditions:'CIF', cr49f_po_no:LCS[no].po, _cr49f_buyer_id_value:/SG/.test(no)?'b-sg':'b-ca', _cr49f_pod1_value:/SG/.test(no)?'r-cl':'r-bk'}));   // v0.9: POD lookup (표시값 주석 없음 → R1 의 「POD:」 는 이전과 같이 빈칸)
function sse(text){ const ev=[{type:'message_start',message:{model:'mock',usage:{input_tokens:100}}},{type:'content_block_delta',delta:{type:'text_delta',text}},{type:'message_delta',delta:{stop_reason:'end_turn'},usage:{output_tokens:50}}];
  return new Response(ev.map(e=>'data: '+JSON.stringify(e)+'\n\n').join(''),{status:200,headers:{'Content-Type':'text/event-stream'}}); }
function claudeReply(body){
  const sys=String(body.system||''), msg=body.messages[body.messages.length-1], txt=typeof msg.content==='string'?msg.content:msg.content.filter(c=>c.type==='text').map(c=>c.text).join('\n');
  const lcNo=(txt.match(/ILC\d{4}|KB\d{4}/)||['ILC0001'])[0];
  prompts.push({kind:/判読担当/.test(sys)?'r2_extract':/ベテラン/.test(sys)?'r2_assemble':/正解/.test(txt)?'judge':'other',lcNo,txt});
  if(/判読担当/.test(sys)){ const q=v=>({value:v,loc:'x',quote:v,note:null});
    return {lc_no:q(lcNo),applicant_name:q(/KB/.test(lcNo)?'A.B.C. PAPER MILL CO., LTD.':'DELTA PAPER CORPORATION'),port_discharge:q(/KB/.test(lcNo)?'BANGKOK, THAILAND':'HO CHI MINH CITY, VIET NAM'),hs:q('4707.10.00'),po:{value:'PO-NA',loc:'45A',quote:'NOT IN LC',note:null},goods:[{grade:'OCC',quantity:'500 MT',unit_price:null,amount:null,loc:'45A',quote:'WASTE PAPER OCC 500 MT'}],docs:[],conditions_47A:[{no:'47A-1',quote:'ALL DOCUMENTS MUST SHOW LC NUMBER'}]}; }
  if(/ベテラン/.test(sys)) return {sinos:[{sino:1,fields:{crcf9_consignee:{value:'TO ORDER OF APPLICANT',source:'LC(46A-2)',note:''},cr49f_lc_no:{value:lcNo+' DATED ON XX',source:'LC(20)'},crcf9_notify_party:{value:'DELTA PAPER CORPORATION',source:'LC(50)'},crcf9_vo_no:{value:'XX',source:'PLACEHOLDER'},crcf9_bl_text1:{value:'WASTE PAPER#4707.10.00#XXKGS 999999',source:'PRIOR'},
    ...(/バイヤー × 銀行 マスター/.test(txt)?{crcf9_address:{value:'#DELTA PAPER CORPORATION***',source:'MASTER'},
      ...(/ILC000[23]/.test(lcNo)?{crcf9_place_of_delivery_1:{value:'HO CHI MINH OR CAT LAI, VIET NAM',source:'LC(44F)'},crcf9_place_of_delivery_2:{value:'',source:''},crcf9_place_of_delivery_3:{value:'',source:''},crcf9_po_vo:{value:'PO-NA',source:'LC(45A)'}}:{})}:{})}}],details:[{crcf9_productname:{value:'OCC',source:'CONTRACT'},crcf9_hs_code:{value:'HS CODE: 47071000',source:'LC(45A)'}}],notes:'n'};
  if(/正解/.test(txt)){ const ids=[...txt.matchAll(/^\[(\d+)\]/gm)].map(m=>+m[1]); return {results:ids.map(i=>({id:i,verdict:i%2?'表記差':'内容差',reason:'r'+i,evidence:i%2?'e'+i:''}))}; }
  if(/S\/I|sinos/.test(txt) && /直前|販売契約/.test(txt)) return {sinos:[{sino:1,fields:{crcf9_consignee:{value:'TO ORDER OF '+(/KB/.test(lcNo)?'A.B.C. PAPER MILL CO., LTD.':'DELTA PAPER CORPORATION'),basis:'46A',confidence:'high'},cr49f_lc_no:{value:lcNo+' DATED ON MAR 06, 2026',basis:'20'},crcf9_address:{value:'10 EXAMPLE RD. 12345678',basis:'50'}}},{sino:2,fields:{crcf9_notify_party:{value:'DELTA PAPER CORP',basis:'50'}}}],details:[{crcf9_productname:{value:'OCC',basis:'c'},crcf9_hs_code:{value:'HS CODE: 4707.10',basis:'45A'}}],notes:'x'};
  return {lcNo,applicant:'DELTA PAPER CORPORATION',applicantAddress:'SAMPLE A INDUSTRIAL PARK',country:'VIETNAM',notifyParty46A:'APPLICANT',consignee46A:'TO ORDER OF SAMPLE BANK TOKYO',commodity45A:'WASTE PAPER OCC HS CODE: 4707.10.00',term42C:'AT SIGHT',pod:'HO CHI MINH CITY, VIET NAM',lcDate:'2026-03-06',docs46A:['1. SIGNED COMMERCIAL INVOICE'],addCond47A:'1. ALL DOCUMENTS MUST SHOW LC NUMBER',consignee:'TO ORDER OF SAMPLE BANK TOKYO',blText1:'WASTE PAPER'};
}
module.exports={LCS, lcText, fmtD, siOf, NOS, BUYERS, SC, sse, claudeReply, prompts};
