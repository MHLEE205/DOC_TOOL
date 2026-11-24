/* v0.10 시험 (지시서 D00 L/C 보관소 · ACL 전환 v1.0 Step 4 · 5) — 가짜 데이터만 · 네트워크 없음 · 실제 거래처 · L/C 값 0. node v10.js [html]
   1 SRC.lc = 古紙/LC/_READ · 契約行 문구 「L/C 判読 (保管所)」 · MD → HTML (escape · 표 · 굵게)
   2 화면: 목록 (_index · _old 건너뜀) · 「LC 読み取り」 = 보관소 MD (선적기한 · 유효기한) · LC 원본 열기 = source.lc_pdf · D-01 폴더 GET 0
   3 ACL 照合 쪽 COMPASS: 부킹에 cr49f_etd · crcf9_bl_etd · L/C = lc_read/1 · 엔진 v0.10 고정 (sha256) · 쓰기 0 */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const click=(w,sel)=>{ const e=w.document.querySelector(sel); if(!e) throw new Error('없음 '+sel); e.click(); };
const txt=(w,id)=>w.document.getElementById(id).textContent;
const P=(W,o)=>X.page(W,Object.assign({},o,{ls:Object.assign({doc_tool_hide_fd:'0',doc_tool_who:'all'},(o||{}).ls)}));

(async()=>{
console.log('1 규칙 · MD');
eq(DOC.SRC.lc,'古紙/LC/_READ','L/C 는 보관소에서 (D-01 폴더 아님)');
eq([DOC.judgeCt({pay:'LC',lcFiles:['LRS-2611AA1.json'],sis:[]}).lc.why,DOC.judgeCt({pay:'LC',lcFiles:[],sis:[]}).lc.why],['L/C の読み取り結果あり','L/C の読み取り結果なし（L/C 未着 · 未登録）'],'契約行 문구 = 「L/C の読み取り結果」 (v0.17 D9)');
{ const h=DOC.mdHtml('# T <x>\n\n> note\n\n| 項目 | 値 |\n|---|---|\n| **船積期限** | **2026-12-15** |\n| A \\| B | <script>alert(1)</script> |\n\n- `f` — r\n\n---\n✦ Powered by LEENAI Automation System');
  ok(/<table class="dt-md-t"><tr><th>項目<\/th><th>値<\/th><\/tr><tr><td><b>船積期限<\/b><\/td><td><b>2026-12-15<\/b><\/td><\/tr>/.test(h),'표 (머리 · 굵게)',h);
  ok(h.indexOf('<script>')<0&&/&lt;script&gt;/.test(h)&&/&lt;x&gt;/.test(h),'글자는 전부 escape (HTML 주입 없음)');
  ok(/<td>A \| B<\/td>/.test(h)&&/<li><code>f<\/code> — r<\/li>/.test(h)&&/<hr>/.test(h)&&/dt-md-h1/.test(h)&&/dt-note/.test(h),'칸 안 \\| · 목록 · code · 구분선 · 제목 · 인용'); }

console.log('2 화면');
const W=X.world(), w=await P(W,{html:HFILE});
await X.until(()=>w.document.querySelector('#dtTable button[data-iv="NAA2611-01"]'));
ok(W.req.some(r=>/GET .*%E5%8F%A4%E7%B4%99\/LC\/_READ:\/children|GET .*古紙\/LC\/_READ:\/children/.test(decodeURIComponent(r))),'보관소 목록 읽음');
const S=w.eval('S'); eq(Object.keys(S.lcFiles),['LRS-2611AA1'],'목록 = 계약 파일만 (_index.json · _old 건너뜀)'); ok(/LRS-2611AA1\.md/.test(S.lcFiles['LRS-2611AA1'][0].mdUrl),'MD 의 주소도 기억');
click(w,'#dtTable button[data-iv="NAA2611-01"]'); await X.until(()=>w.document.querySelector('#dtIvSum button[data-lcjson]'));
ok(w.document.querySelector('#dtIvSum button[data-lcjson]').textContent==='L/C の読み取り結果','버튼 이름 「L/C の読み取り結果」 (v0.17 D9)');
click(w,'#dtIvSum button[data-lcjson]'); await X.until(()=>!w.document.getElementById('dtModal').hidden);
const mt=txt(w,'dtModalBox'); ok(/^L\/C の読み取り結果/.test(mt)&&!/_READ|lc_read\//.test(mt)&&/船積期限/.test(mt)&&/2026-12-15/.test(mt)&&/有効期限/.test(mt)&&/2026-12-31/.test(mt)&&/SAMPLE BANK/.test(mt),'「LC 読み取り」 = 보관소 MD (선적기한 · 유효기한 보임)',mt.slice(0,300));
ok(!!w.document.querySelector('#dtModalBox table.dt-md-t')&&!/D-01/.test(mt),'MD 표가 표로 · 「D-01」 문구 없음');
click(w,'#dtModalBox button[data-close]');
click(w,'#dtIvSum button[data-lcorig]'); await X.until(()=>W.opened.length); ok(/TESTLC001\.pdf/.test(W.opened.pop()),'LC 原本を開く = source.lc_pdf 의 이름으로 찾음');
ok(!W.req.some(r=>/D-01-LC_FD_CHECKER/.test(decodeURIComponent(r))),'D-01 폴더는 한 번도 읽지 않음 (GET 0)',W.req.filter(r=>/D-01/.test(decodeURIComponent(r))));

console.log('3 ACL 照合 쪽');
const cp=await w.eval('aclFetchCompass("NAA2611-01")');
ok(cp&&cp.ok&&cp.lc&&cp.lc.schema==='lc_read/1'&&cp.lc.lc_no==='TESTLC001','ACL 照合에 넘기는 L/C = 보관소 lc_read/1',cp&&cp.lc);
ok(W.req.some(r=>/cr49f_bookings\?.*cr49f_etd,crcf9_bl_etd/.test(decodeURIComponent(r))),'부킹 조회에 cr49f_etd · crcf9_bl_etd (엔진과 같게)');
ok(typeof cp.meta.etd==='string'&&'etdSrc' in cp.meta,'meta.etd · etdSrc',cp.meta);
const Pn=ENG.pin(HTML), E=ENG.engine(HTML); ok(ENG.vnum(Pn.ver)>=ENG.vnum('0.10')&&typeof E.lcConsigneeBank==='function'&&typeof E.lcDays==='function','엔진 고정 = acl_bench v0.10 이상 (커밋 '+Pn.commit.slice(0,7)+' · sha256 확인)',Pn);
const it=E.lcItems(cp.lc, {si:{cr49f_lc_no:'TESTLC001'}, description:'', consignee:'TO THE ORDER OF SAMPLE BANK', notify:'SAMPLE PAPER CO., LTD.', pol:'TOKYO'}, {consignee:{text:'TO THE ORDER OF SAMPLE BANK',conf:'SURE'},originals:{text:'3',conf:'SURE'}}, null, null, {etd:'2026-12-16'});
eq(['lc:no','lc:consignee','lc:consignee_acl','lc:shipment'].map(k=>(it.find(i=>i.key===k)||{}).status),['MATCH','MATCH','MATCH','DIFF'],'가짜 보관소 판독 → 엔진 v0.10 L/C 항목 (선적기한 초과 = 相違)');
ok(!W.writes.length,'쓰기 0',W.writes);
console.log((fail?'FAIL':'PASS')+' v10 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v10 예외',e.stack); process.exitCode=1; });
