/* v0.36.1 시험 (지시서 THOR_36 · 형님 N70 · 리나이 (토르_35 Q3)) — 가짜 데이터 · 가짜 번호 · 네트워크 없음 · 메일 0.
   N70 Maersk 44B = 「相違」 만 (今日やること 의 訂正依頼 줄 · 下書き · 訂正依頼 버튼 없음 · 다른 선사 = v0.36 그대로) / Q3 스캔 L/C = 「L/C ですか？」 */
const fs=require('fs'),path=require('path');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b}); const V=DOC.V36;
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.36\.1<\/title>/.test(HTML)&&(HTML.match(/version:'0\.36\.1'/g)||[]).length===1&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.36.1 · 푸터');

console.log('N70 Maersk 44B = 相違 만');
{ const B44={item:V.FD44B_ITEM,result:'DIFF',draft:'(空欄)',lc_quote:'SAMPLE PORT OR OTHER PORT, VIETNAM',si:'S/I SAMPLE PORT, VIETNAM',note:'44B 最終仕向地がない（Place of Delivery 空欄）'};
  const res=c=>({iv:'NTE2699-01', carrier:c, A:[], B:[B44], CP:[]});
  eq([DOC.blMaersk44Only(res('Maersk')),DOC.blMaersk44Only(res('MAERSK A/S')),DOC.blMaersk44Only(res('Sealand')),DOC.blMaersk44Only(res('ONE')),DOC.blMaersk44Only(res(''))],[true,true,true,false,false],'Maersk (MAERSK · SEALAND) 만');
  ok(!DOC.blMaersk44Only({carrier:'Maersk',A:[{class:'DIFF',field:'Vessel/Voyage'}],B:[B44],CP:[]}),'다른 相違 도 있으면 = 보통 (下書き 있음 · 44B 줄만 빠짐)');
  const m=DOC.blMailDraft(res('Maersk'),'fix',{iv:'NTE2699-01',carrier:'Maersk'}); ok(!/Place of Delivery/.test(m.body)&&m.blocks===0,'Maersk 下書き = 44B 블록 · 줄 0',m);
  const m2=DOC.blMailDraft({iv:'NTE2699-01',carrier:'Maersk',A:[{class:'DIFF',field:'Vessel/Voyage',draft:'A',si:'B'}],B:[B44],CP:[]},'fix',{iv:'NTE2699-01',carrier:'Maersk'}); ok(m2.blocks===1&&!/Place of Delivery/.test(m2.body)&&/Ocean Vessel/.test(m2.body),'Maersk + 다른 相違 = 그 블록만');
  const o=DOC.blMailDraft(res('ONE'),'fix',{iv:'NTE2699-01',carrier:'ONE'}); ok(/Place of Delivery に SAMPLE PORT, VIETNAM を記載してください/.test(o.body)&&o.blocks===1,'다른 선사 = v0.36 그대로 (44B 블록 + 1 줄)');
  ok(/function blConcl\(res\)\{ if\(!res\) return ''; if\(res\.verdict==='相違'&&DOC\.blMaersk44Only\(res\)\) return DOC\.V36\.FD44B_ONLY;/.test(HTML)&&V.FD44B_ONLY==='相違 · 44B 最終仕向地がない（Place of Delivery 空欄）','결론 = 「相違 · 44B 最終仕向地がない（Place of Delivery 空欄）」 만 (船社に訂正依頼 없음)');
  ok(/const fix=res&&res\.verdict==='相違'&&!DOC\.blMaersk44Only\(res\)/.test(HTML),'「船社への訂正依頼の下書きを作る」 버튼 없음');
  ok(/if\(f4&&!DOC\.V36\.MAERSK_RE\.test\(String\(car\)\)\) x\.bl44b=/.test(HTML),'今日やること — Maersk = 「B/L Draft 訂正依頼 — Place of Delivery」 줄 없음');
  ok(!/LG で|銀行に LG/.test(V.FD44B_ONLY),'다른 문구 (LG 등) 0');
  const T=DOC.todoExtra({iv:'NTE2699-01', ct:'LRS-2699ZZ1', bl44b:'x'}, Date.now()); ok(T.some(r=>r.what===V.FD44B_TODO),'다른 선사 = 줄 그대로 (v0.36)'); }

console.log('Q3 스캔 L/C = 「L/C ですか？」');
{ eq([DOC.lcScanAsk('LC 0999IL2699001.pdf',[{items:[]}]),DOC.lcScanAsk('L/C SAMPLE.pdf',[{items:[{s:' '}]}]),DOC.lcScanAsk('CREDIT ADVICE.pdf',[]),DOC.lcScanAsk('photo.pdf',[{items:[]}]),DOC.lcScanAsk('LC x.pdf',[{items:[{s:'ISSUE'}]}]),DOC.lcScanAsk('BLCOPY.pdf',[{items:[]}])],[true,true,true,false,false,false],'이름에 LC · L/C · CREDIT + 글자 없음 = 물음 · 글자 있음 · 다른 이름 = 아님');
  eq([DOC.lcNoFromName('LC 0999IL2699001 - SAMPLE.pdf'),DOC.lcNoFromName('LRS-2699ZZ1 scan.pdf'),DOC.lcNoFromName('LRS-2699ZZ1_TESTLC12345_AMEND1.pdf'),DOC.lcNoFromName('L/C scan 20261127.pdf')],['0999IL2699001','','TESTLC12345',''],'이름의 L/C 번호 (계약번호 · 날짜 · AMEND 제외)');
  ok(/if\(DOC\.lcScanAsk\(row\.attName\|\|row\.name, row\.pages\)\)\{ row\.kind=\{key:'LC'/.test(HTML)&&/data-svscan="'\+r\.id\+'\|1"/.test(HTML)&&/data-svscan="'\+r\.id\+'\|0"/.test(HTML),'입구 — 「はい（L/C）」 · 「いいえ」');
  ok(/async function lcScanAnswer\(r, yes\)\{ if\(!yes\)\{ r\.res='対象外';[^\n]*await saveLog\(r,'対象外'\)/.test(HTML),'「いいえ」 = 対象外 (기록 · 다음부터 안 냄)');
  ok(/image:true\};/.test(HTML)&&/data-svlcno=/.test(HTML),'「はい」 = 계약 고르기 · L/C 번호를 못 읽으면 입력 · 판독 = 이미지 (a1_bench イメージ L/C)');
  ok(V.OPEN_RE===undefined&&/OPEN_RE:\/\^\(新規\|\\d\+版目\|Invoice 不明\|フォルダなし\|再確認\|添付名が違う\|どの契約？\|L\\\/C ですか？\)\$\//.test(HTML),'물음 줄 = 할 일 (펼침)'); }

console.log((fail?'FAIL':'PASS')+' v361 — pass '+pass+' fail '+fail); process.exit(fail?1:0);
