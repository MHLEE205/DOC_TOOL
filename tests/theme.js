/* #9 색 모드 4가지 (v0.2 형님 D4) — 공통 파일의 테마 버튼을 그대로 쓰고 (숨기지 않음 · data-theme 고정 없음),
   이 TOOL 의 색 = 공통 테마 변수 + 상태 5색 표 2개. 4모드 모두 글자 · 상태 점이 잘 보이는지 변수 값으로 대비 계산 (WCAG: 글자 4.5 · 점/테두리 3).
   공통 변수 = theme_fx.css (LEENAI_COMMON v1 에서 복사 — 로컬 클론이 있으면 같은지도 확인). node theme.js [html] */
const fs=require('fs'),path=require('path');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,500));} };
const vars=block=>{ const o={}; String(block||'').replace(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g,(m,k,v)=>{ o[k]=v; }); return o; };
const FX=fs.readFileSync(path.join(__dirname,'theme_fx.css'),'utf8');
const common={dark:vars(FX.match(/:root\{([\s\S]*?)\}/)[1])};
['light','leenai','focus'].forEach(t=>{ common[t]=vars(FX.match(new RegExp('\\[data-theme="'+t+'"\\]\\{([^}]*)\\}'))[1]); });
try{ const live=fs.readFileSync(path.join(__dirname,'../../LEENAI_COMMON/v1/leenai-common.css'),'utf8'); ok(FX.split('\n').slice(1).every(l=>live.indexOf(l)>=0),'theme_fx.css = 지금 LEENAI_COMMON v1 테마 변수'); }catch(e){ console.log('(참고) LEENAI_COMMON 클론 없음 — 같은지 확인 생략'); }
const css=HTML.match(/<style>([\s\S]*?)<\/style>/)[1];
const toolLight=vars(css.match(/\nhtml\{([\s\S]*?)\}/)[1]), toolDark=vars(css.match(/html:not\(\[data-theme\]\),html\[data-theme="dark"\]\{([\s\S]*?)\}/)[1]);
/* 테마 버튼 · 고정 없음 */
ok(!/data-theme="light"/.test(HTML.split('<style>')[0])&&!/<html[^>]*data-theme/.test(HTML),'html 에 data-theme 고정 없음');
ok(!/themeBtn/.test(css),'공통 테마 버튼을 숨기지 않음 (4모드 전환 = 공통 파일 그대로)');
ok(!/html\[data-theme\]\{[^}]*--accent/.test(css),'공통 변수 (--accent · --bg …) 를 덮어쓰지 않음');
ok(/マスター設定/.test(css),'「マスター設定」 버튼 숨김은 그대로 (⚙ 設定 안 링크)');
/* 하드코딩 색 — 표 2개 밖에는 없음 (상태 5색 · 배경 · 글자는 변수로) */
const outside=css.replace(/\nhtml\{[\s\S]*?\}/,'').replace(/html:not\(\[data-theme\]\),html\[data-theme="dark"\]\{[\s\S]*?\}/,''), app=HTML.split('<script id="doc-app">')[1]||'';
ok(!/#[0-9a-fA-F]{6}\b/.test(outside),'CSS 의 색은 변수만 (표 2개 밖 #RRGGBB 0)',(outside.match(/#[0-9a-fA-F]{6}\b/g)||[]));
ok(!/#[0-9a-fA-F]{6}\b/.test(app.replace(/\/\*[\s\S]*?\*\//g,'')),'화면 코드 (doc-app) 의 색도 변수만',(app.match(/#[0-9a-fA-F]{6}\b/g)||[]).slice(0,10));
/* 대비 */
const lum=h=>{ const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
const cr=(a,b)=>{ const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
const table=[];
for(const t of ['dark','light','leenai','focus']){
  const V=Object.assign({},common[t],t==='dark'?toolDark:toolLight), get=k=>{ if(!V[k]) throw new Error(t+' 변수 없음 --'+k); return V[k]; };
  const need=[['text','surface',4.5,'글자'],['text2','surface',4.5,'글자 2'],['text3','surface',4.5,'글자 3 (설명)'],['text3','bg',4.5,'글자 3 / 배경'],['text','bg',4.5,'글자 / 배경'],['accent','surface',4.5,'링크'],['dt-on-accent','accent-btn',4.5,'버튼 글자'],
    ['st-done-fg','st-done-bg',4.5,'済'],['st-todo-fg','st-todo-bg',4.5,'確認'],['st-diff-fg','st-diff-bg',4.5,'相違'],['st-wait-fg','st-wait-bg',4.5,'待ち'],['st-unk-fg','st-unk-bg',4.5,'?'],['st-na-fg','surface',4.5,'— 대상 외'],
    ['st-diff-fg','surface',4.5,'오류 글자'],['st-done-fg','surface',4.5,'완료 글자'],['st-todo-fg','st-todo-bg',4.5,'XX 칸'],['text','dt-hl',4.5,'요확인 줄 글자'],['text','dt-now',4.5,'いまここ 탭 글자'],['st-done-fg','dt-now',4.5,'いまここ 표시'],
    ['st-done-fg','surface',3,'점 済'],['st-todo-fg','surface',3,'점 確認'],['st-diff-fg','surface',3,'점 相違'],['dt-dot-wait','surface',3,'점 待ち · ?'],['st-unk-fg','st-unk-bg',3,'? 테두리'],['st-todo-fg','surface',3,'요확인 입력칸 테두리'],['accent-btn','surface',3,'선택 탭 밑줄']];
  need.forEach(([f,b,min,l])=>{ const r=cr(get(f),get(b)); table.push([t,l,r.toFixed(2)]); ok(r>=min,t+' · '+l+' 대비 '+r.toFixed(2)+' ≥ '+min,[f,get(f),b,get(b)]); });
}
if(process.env.THEME_TABLE) table.forEach(r=>console.log(r.join('\t')));
console.log((fail?'FAIL':'PASS')+' theme — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
