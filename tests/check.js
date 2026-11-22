/* 기본 점검 (#8) — 문법 · version 1곳 · 공통 파일 1회 · confirm/alert 0 · 보안 grep 0 · 푸터 · 쓰기 경로 문지기
   node check.js [html] [version] */
const fs=require('fs'),cp=require('child_process'),path=require('path'),os=require('os');
const file=process.argv[2]||path.join(__dirname,'../index.html'), ver=process.argv[3]||'0.1';
const html=fs.readFileSync(file,'utf8');
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g; let m,n=0,fail=0;
while((m=re.exec(html))){ n++; const f=path.join(os.tmpdir(),'dtchk_'+n+'.js'); fs.writeFileSync(f,m[1]); try{ cp.execFileSync(process.execPath,['--check',f],{stdio:'pipe'}); }catch(e){ fail++; console.log('FAIL script',n,String(e.stderr).slice(0,500)); } }
const code=html.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`])\/\/[^\n]*/g,'$1');   // 주석 제외
/* 쓰기 경로: SharePoint PUT 은 spPut 하나 (DOC.guardOut 먼저) · COMPASS 쓰기 (PATCH/POST) 는 dvWrite 하나 (DOC.guardDv 먼저) · DELETE 없음 */
const sp=code.match(/async function spPut\([^)]*\)\{\s*\/?\/?[^\n]*\n?\s*DOC\.guardOut\(p(?:, ?save)?\);/);   // v0.9: save (ACL の保存) も同じ門番
const putCalls=(code.match(/method:'PUT'/g)||[]).length;
const sendLines=code.split('\n').filter(l=>/[fF]etch\(/.test(l)&&/\bmethod\b/.test(l)), dvWrites=sendLines.filter(l=>!/method:'PUT'/.test(l)).length;   // 보내는 요청 (fetch 에 method) 줄
const dvWriteFns=(code.match(/async function dvWrite\(/g)||[]).length;
const dvGuarded=/async function dvWrite\([^)]*\)\{[^\n]*\n\s*DOC\.guardDv\(method, set, id, body, ctx\);/.test(code);
const deletes=(code.match(/'DELETE'/g)||[]).length;
const res={scripts:n, syntaxFail:fail,
  versionTarget:(html.match(new RegExp("version:'"+ver.replace(/\./g,'\\.')+"'",'g'))||[]).length,
  versionAny:(html.match(/version:'\d+(?:\.\d+)+'/g)||[]).length,
  commonJs:(html.match(/leenai-common\.js/g)||[]).length,
  confirmAlertCalls:(code.match(/\b(?:window\.)?(?:confirm|alert|prompt)\s*\(/g)||[]).length,
  secrets:(html.match(/ghp_|github_pat_|sk-ant|client_secret|AKIA[0-9A-Z]{12}/g)||[]).length,
  footer:/✦ Powered by LEENAI Automation System/.test(html),
  spPutGuarded:!!sp, putCalls, sendLines:sendLines.length, dvWrites, dvWriteFns, dvGuarded, deletes};   // 실제 거래 값 점검은 레포 밖 목록으로 (실제 이름을 공개 레포에 두지 않음)
console.log(JSON.stringify(res));
const ok=!fail&&res.versionTarget===1&&res.versionAny===1&&res.commonJs===1&&!res.confirmAlertCalls&&!res.secrets&&res.footer&&res.spPutGuarded&&putCalls===1&&
  sendLines.length===1+dvWrites&&dvWrites===dvWriteFns&&dvWriteFns<=1&&(dvWriteFns===0||dvGuarded)&&!deletes;
console.log(ok?'CHECK PASS':'CHECK FAIL'); process.exitCode=ok?0:1;
