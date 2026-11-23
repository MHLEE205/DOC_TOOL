/* 한글 검사 (v0.3 · 지시서 D00 B/L 照合結果の保存 · 日本語化 Step 3) — 화면에 나갈 수 있는 문자열 (JS 문자열 · 템플릿) 과 HTML 본문 글자에 한글 0
   주석 · 정규식 (자료를 찾는 모양) 은 보지 않음 (acorn 토큰) · <style> · HTML 주석도 제외 — node hangul.js [html …] */
const fs=require('fs'), path=require('path'), acorn=require('acorn');
const HG=/[ᄀ-ᇿ㄰-㆏가-힯]/;
function scan(file){ const h=fs.readFileSync(file,'utf8'), out=[], re=/<script(?: id="([^"]+)")?>([\s\S]*?)<\/script>/g; let m;
  while((m=re.exec(h))){ const base=h.slice(0,m.index+m[0].indexOf(m[2])).split('\n').length-1;
    for(const t of acorn.tokenizer(m[2],{ecmaVersion:'latest',locations:true})) if((t.type.label==='string'||t.type.label==='template')&&HG.test(String(t.value))) out.push((m[1]||'-')+':'+(base+t.loc.start.line)+' '+String(t.value).slice(0,60)); }
  const body=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<!--[\s\S]*?-->/g,'');
  (body.match(/[^<>]*[가-힯][^<>]*/g)||[]).forEach(x=>out.push('HTML '+x.trim().slice(0,60)));
  return out; }
const files=process.argv.slice(2).length?process.argv.slice(2):[path.join(__dirname,'../index.html')];
let bad=0; files.forEach(f=>{ const o=scan(f); bad+=o.length; console.log((o.length?'FAIL':'PASS')+' 한글 0 — '+path.basename(f)+(o.length?' '+o.length+'\n  '+o.slice(0,20).join('\n  '):'')); });
console.log('hangul pass '+(files.length-(bad?1:0))+' fail '+(bad?1:0)); process.exit(bad?1:0);
