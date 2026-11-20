/* source: CONTRACT_SEND/tests/acl_bench/pdfread.js @243897d (가짜 데이터 · DOC_TOOL #6 시험용으로 복사 — 고치지 않음) */
/* node 용 pdf.js 읽기 — 도구의 readPdf 와 같은 모양 {page, w, items:[{s,x,y,w}]} 로 돌려준다 (시험 전용) */
const path=require('path');
const pdfjs=require('pdfjs-dist/legacy/build/pdf.js');
const FONTS=path.join(path.dirname(require.resolve('pdfjs-dist/package.json')),'standard_fonts')+path.sep;
async function readItems(bytes){
  const pdf=await pdfjs.getDocument({data:new Uint8Array(bytes), standardFontDataUrl:FONTS, verbosity:0}).promise, pages=[];
  for(let i=1;i<=pdf.numPages;i++){ const pg=await pdf.getPage(i), vp=pg.getViewport({scale:1}), tc=await pg.getTextContent();
    pages.push({page:i, w:vp.width, items:tc.items.filter(it=>it.str&&it.str.trim()).map(it=>({s:it.str, x:Math.round(it.transform[4]*10)/10, y:Math.round(it.transform[5]*10)/10, w:Math.round((it.width||0)*10)/10}))}); }
  return pages;
}
/* jsdom 페이지에 넣을 pdfjsLib (데이터는 node Buffer 로 바꿔 넘김 — realm 이 달라서) */
function pdfjsForWindow(){ return {GlobalWorkerOptions:{}, getDocument:o=>pdfjs.getDocument({data:new Uint8Array(Buffer.from(o.data)), standardFontDataUrl:FONTS, verbosity:0})}; }
module.exports={readItems, pdfjsForWindow};
