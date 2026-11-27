/* v0.31 시험 (지시서 THOR_29 · W1 ~ W4 · R2 · L1 · H1 ~ H4) — 가짜 데이터 · 가짜 번호 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v31.js [html]
   W1 ~ W3: B/L 待ち 催促 = ETD 당일부터 (ETD 전 ◐ 「出港後発行」 · ETD 당일부터 催促 · ETD 0:00 부터 세기 · ETD 모름 = 그대로)
   R2: 선사 Web 접수 메일 새 모양 (KMTC Pending · 興亜 / SINOKOR Pending · CNC B/L処理申請 · CNC カウンター訪問) · 발행 알림 · 입금 = 依頼 아님
   L1: ETD 옆 회색 = 「B/L MM/DD」 · 「計画 MM/DD」
   H1: 같은 가짜 메일함에 v0.30 · v0.31 loadHon → S.honRaw 같음 (본문 · 순서) · 같은 날 다시 (기억) · 회사 검색 실패 · 페이지 넘김 · 본문 1 통 실패 */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,900));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const at=DOC.at, V=DOC.V31;
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.3[1-3]<\/title>/.test(HTML)&&/version:'0\.3[1-3]'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.31 · 푸터');

console.log('W1 ~ W4 B/L 待ち 催促 = ETD 당일부터');
const S0=o=>Object.assign({sub:null, subKnown:false, acl:null, hon:null, vchg:false, depoReq:null, depoRep:null, bmail:null, drafts:[], cmail:null, pay:null, payPlan:false, bl:null, ins:null, rr:null, fd:null},o||{});
const X0=o=>Object.assign({iv:'NTE2699-01', country:'INDONESIA', term:'CFR', pay:'TT', carrier:'SAMPLE LINE', otsu:'', buyer:'', cut:'2026-11-24', cutAm:false, blDate:'', etd:'2026-11-28'},o||{});
const row=(x,s,now)=>{ const r=DOC.todoRow(X0(x),S0(s),now,null); if(r){ r.group=DOC.todoGroup(r,now); r.when=DOC.whenLabel(r,now); } return r; };
const req=at('2026-11-18','16:16'), sB={drafts:[at('2026-11-14','10:00')], pay:at('2026-11-17','15:00'), bmail:req};
/* W1 · W2: ETD 전 (11/27) = ◐ 「B/L 待ち（出港後発行 · ETD 11/28）」 · 催促 아님 · 要対応 아님 · 빨강 0 (依頼 뒤 9 일 지나도) */
const w2=row({},sB,at('2026-11-27','17:00'));
ok(w2&&w2.what==='B/L 待ち（出港後発行 · ETD 11/28）'&&w2.zone==='wait'&&w2.group==='wait'&&!w2.nudge&&!w2.action&&!DOC.reqRow(w2)&&w2.when==='出港後'&&w2.due==null,'W2 ETD 전 = ◐ 出港後発行 · 催促 아님 · 要対応 아님',w2);
ok(/^B\/L 依頼済 11\/18 · 未着$/.test(w2.why),'W2 이유 = 依頼済 날짜 (그대로)',w2.why);
const w2r=row({},Object.assign({},sB,{bmail:req}),at('2026-11-20','10:00')); ok(w2r.group==='wait'&&!DOC.reqRow(w2r),'W2 依頼 바로 뒤 (11/20) 도 ◐',w2r);
/* W3: ETD 당일 = 지금의 催促 규칙 · ETD 0:00 부터 세기 (依頼 시각 아님) */
const thBL=DOC.todoRow(X0(),S0(sB),at('2026-11-28','09:00'),null).nudge.th;
const w3a=row({},sB,at('2026-11-28','09:00'));
ok(w3a&&w3a.what==='B/L 待ち'&&w3a.nudge&&Math.abs(w3a.nudge.el-DOC.bhours(at('2026-11-28','00:00'),at('2026-11-28','09:00')))<0.01&&/催促は ETD 11\/28 から/.test(w3a.why),'W3 ETD 당일 = ETD 0:00 부터 셈 (依頼 11/18 부터 아님)',w3a);
const later=at('2026-12-03','17:00'), w3b=row({},sB,later), el=DOC.bhours(at('2026-11-28','00:00'),later);
ok(w3b.nudge&&Math.abs(w3b.nudge.el-el)<0.01&&w3b.nudge.over===(el>thBL)&&(w3b.nudge.over?w3b.group==='chase'&&DOC.reqRow(w3b):w3b.group==='wait'),'W3 「いつもは n 時間」 넘으면 催促 (= 要対応)',{w3b,th:thBL});
/* ETD 뒤에 依頼 = 依頼 시각부터 (ETD 0:00 이 더 앞) */
const late=at('2026-11-29','11:00'), w3c=row({},Object.assign({},sB,{bmail:late}),at('2026-11-30','11:00'));
ok(w3c.what==='B/L 待ち'&&Math.abs(w3c.nudge.el-DOC.bhours(late,at('2026-11-30','11:00')))<0.01&&!/催促は ETD/.test(w3c.why),'W3 ETD 뒤 依頼 = 依頼 시각부터 (v0.30 과 같음)',w3c);
/* ETD 모름 = 지금 그대로 (依頼 시각부터) */
const w3n=row({etd:''},sB,at('2026-11-20','10:00')), v30n=w3n&&DOC.bhours(req,at('2026-11-20','10:00'));
ok(w3n&&w3n.what==='B/L 待ち'&&Math.abs(w3n.nudge.el-v30n)<0.01&&w3n.why==='B/L 依頼済 11/18 · 未着','W3 ETD 모름 = 그대로 (依頼 시각부터)',w3n);
/* 모든 선사 · 後払い · FOB 같음 */
const wp=row({carrier:'KMTC', term:'FOB'},{bmail:req},at('2026-11-27','10:00')); ok(wp&&wp.what==='B/L 待ち（出港後発行 · ETD 11/28）','W1 後払い · FOB 도 같음',wp);
/* W4: ETD = N37 늦은 쪽 (etdOf) — 실례 NA2611-01 (計画 11/25 · B/L date 11/28) */
ok(DOC.etdOf({cr49f_etd:'2026-11-25T00:00:00Z', crcf9_bl_etd:'2026-11-28T00:00:00Z'})==='2026-11-28','W4 NA2611-01 ETD = 11/28 (늦은 쪽)');
const na=row({etd:'2026-11-28'},Object.assign({},sB),at('2026-11-27','23:00')), na2=row({etd:'2026-11-28'},sB,at('2026-11-28','00:00'));
ok(na.group==='wait'&&/出港後発行/.test(na.what)&&na2.what==='B/L 待ち'&&na2.nudge,'W4 NA2611-01 = 11/27 까지 ◐ · 11/28 부터 催促 대상',{na,na2});
/* 다른 待ち 는 그대로 (訂正 Draft 待ち · Deposit) */
const cd=row({},{drafts:[at('2026-11-20','10:00')], cmail:at('2026-11-21','10:00')},at('2026-11-25','10:00')); ok(cd.what==='訂正 Draft 待ち'&&cd.nudge,'다른 待ち (訂正 Draft) 그대로',cd);
ok(/V31\.BLW_PRE/.test(HTML)&&(HTML.match(/'B\/L 待ち'/g)||[]).length>=1,'코드 한 곳 (todoRow ⑤)');

console.log('R2 선사 Web 접수 메일 (가짜 번호)');
const L=(subj,skind,fromDom,body)=>DOC.blRcvLink({subj, skind, fromDom, body});
eq(L('[KMTC] Your B/L Issue Request Has Been Pending. (B/L No.TST0000001)','carrier','ekmtc.example.test',''),{rcv:true,req:true,ticket:''},'KMTC 「Issue Request Has Been Pending」 = 依頼 受付');
eq(L('B/L Issue Pending Notice [TESTBK0000000001]','carrier','heungaline.example.test','B/L Type: Sea-way Bill'),{rcv:true,req:true,ticket:''},'興亜 · SINOKOR 「B/L Issue Pending Notice」 = 依頼 受付');
eq(L('RE: [9/9]TST0000002【輸出】B/L処理申請・入金連絡通知（東京、カウンター訪問、11月02日/9999999）[SDL-DOC]','carrier','cma.example.test',''),{rcv:true,req:true,ticket:''},'CNC 「B/L処理申請・入金連絡通知」 (선사 답장) = 依頼 受付');
const ctr='■申請内容\nカウンター訪問\n■ご来社目的・カウンター予約\nOriginal B/L発行\n■カウンター訪問予約\n2026年11月09日\n■B/L番号 1\nTST0000003';
eq(L('[CNC] カウンター訪問のご依頼を承りました (SDL-DOC)','other','formzu.com',ctr),{rcv:true,req:true,ticket:''},'CNC カウンター訪問 (formzu) · ご来社目的 = Original B/L発行 = 依頼 受付');
eq(L('[CNC] カウンター訪問のご依頼を承りました (SDL-DOC)','other','formzu.com',ctr.replace('Original B/L発行','書類受け取り')),{rcv:true,req:false,ticket:''},'カウンター訪問 · B/L 발행이 아님 = 依頼 아님');
eq(L('[CNC] カウンター訪問のご依頼を承りました (SDL-DOC)','other','formzu.com',''),{rcv:true,req:false,ticket:''},'カウンター訪問 · 본문 읽기 전 = 依頼 아님 (본문을 읽고 정함)');
eq([L('[KMTC] Your B/L Issue Request Has Been Confirmed. (B/L No.TST0000001)','carrier','ekmtc.example.test','').rcv,L('B/L Issue Approval Notice [TESTBK0000000001]','carrier','heungaline.example.test','').rcv,
    L('Proof of payment accepted','carrier','maersk.example.test','').rcv,L('Payer details verification for Tpdoc number 999999999','carrier','maersk.example.test','').rcv],[false,false,true,false],'발행 알림 (Confirmed · Approval) · Payer details = 접수 아님 · v0.33 (M1): Maersk Proof of payment accepted = 依頼 済');
ok(!L('[KMTC] Your B/L Issue Request Has Been Pending. (B/L No.TST0000001)','staff','example.test','').rcv,'선사 · formzu 밖에서 온 같은 제목 = 아님');
/* 접수 메일은 B/L 受領 아님 · 依頼 済 = 다음 단계 B/L 待ち */
const sg=DOC.todoSignals?null:null;
ok(/blr=blBase0==null\?null:first\(M,m=>m\.uses\.indexOf\('BLISSUE'\)>=0&&m\.skind==='carrier'&&!m\.rcv/.test(HTML),'접수 메일 (m.rcv) = 「B/L 受領」 으로 세지 않음 (v0.30 그대로)');
/* v0.30 모양 그대로 */
eq(L('[CMA CGMグループ] B/L発行依頼受付通知メール (チケット番号: 9999-0000-001) [SDL-DOC]','carrier','cma.example.test',''),{rcv:true,req:true,ticket:'9999-0000-001'},'v0.30 CNC 受付通知 그대로');

console.log('L1 회색 날짜 낱말');
const B=(e,b)=>({cr49f_etd:e, crcf9_bl_etd:b});
eq([DOC.etdOtherLabel(B('2026-11-29T00:00:00Z','2026-11-27T00:00:00Z')),DOC.etdOtherLabel(B('2026-12-09','2026-12-02')),DOC.etdOtherLabel(B('2026-11-25','2026-11-28')),DOC.etdOtherLabel(B('2026-12-01','2026-12-01')),DOC.etdOtherLabel(B('2026-12-01',null))],
  ['B/L 11/27','B/L 12/02','計画 11/25','',''],'L1 다른 쪽 = B/L date → 「B/L MM/DD」 · 計画 ETD → 「計画 MM/DD」 (UNF2611-03 · NA2610-11 예)');
ok(/v30-plan" title="'\+esc\(DOC\.V31\.OTHER_TIP\)\+'">'\+esc\(DOC\.etdOtherLabel\(x\.b\)\)/.test(HTML)&&/kv\('ETD',r\.etd\+\(DOC\.etdOther\(b\)\?' \('\+DOC\.etdOtherLabel\(b\)\+'\)':''\)\)/.test(HTML),'L1 표 · 오른쪽 패널 둘 다 · 색 · 크기 (.v30-plan) 그대로');

console.log('H1 本登録 메일 — v0.30 ↔ v0.31 같은 결과');
const old=cp.execFileSync('git',['show','3dc15e3:index.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:64e6});
const fnOf=h=>{ const a=h.indexOf('async function loadHon(){'), b=h.indexOf('function buildHon(){'); return h.slice(a,b); };
/* 가짜 메일함 — 275 통 (검색 상한) · 회사 / 밖 · 날짜 섞음 */
const DOM='example.test', mk=(i)=>{ const comp=i%4!==1, d=new Date(Date.UTC(2026,10,26,12)-i*3.1*3600e3).toISOString();
  return {id:'M'+i, subject:'Re: 本登録 TEST'+i, from:{emailAddress:{address:comp?'s'+(i%5)+'@'+DOM:'x'+i+'@other.example.test'}}, sentDateTime:d, bodyPreview:'本登録 preview '+i, uniqueBody:{content:i%9===0?'':'本登録お願いします TEST'+i+'\n'+'x'.repeat(i%7)}}; };
const BOX=Array.from({length:275},(_,i)=>mk(i));
function graph(opt){ opt=opt||{}; const log=[]; const f=async(url)=>{ const u=decodeURIComponent(url); log.push(u);
    const resp=(o,s)=>({ok:(s||200)===200, status:s||200, json:async()=>JSON.parse(JSON.stringify(o))});
    const sm=u.match(/\$search="([^"]*)"/), sel=(u.match(/\$select=([^&]*)/)||[])[1]||'', top=+((u.match(/\$top=(\d+)/)||[])[1]||100), skip=+((u.match(/skip=(\d+)/)||[])[1]||0);
    const pick=m=>{ const o={}; sel.split(',').forEach(k=>{ if(m[k]!==undefined) o[k]=m[k]; }); return o; };
    if(sm){ let L=BOX; if(/from:/.test(sm[1])){ if(opt.compFail) return resp({},503); L=BOX.filter(m=>m.from.emailAddress.address.endsWith('@'+DOM)); }
      const pg=L.slice(skip,skip+top); return resp({value:pg.map(pick), '@odata.nextLink':skip+top<L.length?url.replace(/&skip=\d+/,'')+'&skip='+(skip+top):undefined}); }
    const id=(u.match(/messages\/([^?]+)\?/)||[])[1]; if(id){ if(opt.singleFail&&opt.singleFail.indexOf(id)>=0) return resp({},500); const m=BOX.find(x=>x.id===id); return resp(pick(m)); }
    return resp({},404); }; return {f, log}; }
async function runHon(src, opt){ const g=graph(opt), store=opt.store||{};
  const env={S:{range:{from:'2026-10-27'}, today:'2026-11-26', honRaw:[], honErr:''}, LEENAI:{user:{email:'me@'+DOM}}, GRAPH:'https://graph.microsoft.com/v1.0/', graphFetch:g.f,
    DOC:{addDays:X.addDays, V31:{HON_CACHE:'k'}}, PERF:{mark(){}}, lsGet:(k,d)=>store[k]==null?d:store[k], lsSet:(k,v)=>{ store[k]=v; },
    mapLimit:async(arr,n,fn)=>{ let i=0; await Promise.all(Array.from({length:Math.min(n,arr.length)},async()=>{ while(i<arr.length){ const k=i++; await fn(arr[k],k); } })); }};
  const names=Object.keys(env); const fn=new Function(...names, src+'\nreturn loadHon;')(...names.map(k=>env[k])); await fn(); return {raw:env.S.honRaw, err:env.S.honErr, log:g.log, store}; }
const a=await runHon(fnOf(old),{}), b=await runHon(fnOf(HTML),{});
ok(a.raw.length>0&&a.raw.length<275,'가짜 메일함 = 회사 · 기간 안만 (v0.30)',a.raw.length);
eq(b.raw,a.raw,'H1 v0.31 = v0.30 (메일 · 본문 · 순서)'); ok(!a.err&&!b.err,'오류 없음');
const bodyCalls=l=>l.filter(u=>/uniqueBody/.test(u)).length;
ok(bodyCalls(a.log)===3&&bodyCalls(b.log)<=3&&b.log.filter(u=>/messages\/M\d+\?/.test(u)).length===0,'H2 (a)(b) 본문 = 회사 검색 페이지만 (1 통씩 GET 0)',{a:bodyCalls(a.log),b:bodyCalls(b.log),log:b.log.slice(0,6)});
const c=await runHon(fnOf(HTML),{store:b.store}); eq(c.raw,a.raw,'H2 (d) 같은 날 다시 = 기억 → 같은 결과'); ok(c.log.filter(u=>/uniqueBody/.test(u)).length===0,'H2 (d) 같은 날 다시 = 본문 읽기 0',c.log);
const st=JSON.parse(b.store.k); ok(st.day==='2026-11-26'&&st.dom===DOM&&Object.keys(st.b).length===a.raw.length,'H2 (d) 기억 = 그날 · 그 도메인 · 그 메일만');
const d1=await runHon(fnOf(HTML),{store:{k:JSON.stringify({day:'2026-11-25',dom:DOM,b:{M0:'옛 본문'}})}}); eq(d1.raw,a.raw,'H2 (d) 다른 날 기억 = 안 씀');
const d2=await runHon(fnOf(HTML),{store:{k:'{깨짐'}}); eq(d2.raw,a.raw,'H2 (d) 기억이 깨져도 처음부터 = 같은 결과');
const e=await runHon(fnOf(HTML),{compFail:true}); eq(e.raw,a.raw,'회사 검색 실패 = 1 통씩 읽어 같은 결과'); ok(!e.err,'회사 검색 실패 = 오류 표시 없음',e.err);
const part={}; Object.assign(part,{k:JSON.stringify({day:'2026-11-26',dom:DOM,b:Object.fromEntries(a.raw.slice(2).map((m,i)=>[null,null]).filter(()=>false))})});
const keepIds=BOX.filter(m=>m.from.emailAddress.address.endsWith('@'+DOM)&&m.sentDateTime.slice(0,10)>='2026-08-28').map(m=>m.id);
const cache2={}; keepIds.slice(2).forEach(id=>{ const m=BOX.find(x=>x.id===id); cache2[id]=m.uniqueBody.content; });
const f2=await runHon(fnOf(HTML),{store:{k:JSON.stringify({day:'2026-11-26',dom:DOM,b:cache2})}}); eq(f2.raw,a.raw,'H2 (d) 새 메일 2 통만 = 1 통씩 읽어 같은 결과');
ok(f2.log.filter(u=>/\$search=".*from:/.test(u)).length===0&&f2.log.filter(u=>/messages\/M\d+\?\$select=uniqueBody/.test(u)).length===2,'H2 (d) 새 메일 2 통 = 회사 검색 없이 2 통만',f2.log.filter(u=>/uniqueBody/.test(u)));
const sf=await runHon(fnOf(HTML),{compFail:true, singleFail:['M0']}); ok(/メール本文を読めない 1 通/.test(sf.err)&&sf.raw.length===a.raw.length&&sf.raw[0].body==='本登録 preview 0','H4 본문 1 통 실패 = 그 메일은 앞부분으로 · S.honErr 표시',{err:sf.err, b0:sf.raw[0]});
ok(/S\.aclE\.mailKind\(m\.body\)!=='本登録'/.test(HTML)&&HTML.indexOf(old.slice(old.indexOf('function buildHon(){'),old.indexOf('const honNote')))>=0,'H1 buildHon = 그대로 (판정 · CSV 本登録 경로)');

console.log('쓰기 · 문구');
ok(!/\$search=[^']*'\s*,\s*\{\s*method\s*:\s*'(?:POST|PUT|PATCH|DELETE)/.test(HTML),'本登録 읽기 = GET 만');
['MAIL30','ACL_MAIL','MAIL19'].forEach(k=>{ const re=new RegExp('const '+k+' *= *\\{[\\s\\S]*?\\n  \\};'); const x=(HTML.match(re)||[''])[0], y=(old.match(re)||[''])[0]; ok(x&&x===y,'문구 '+k+' 문자 단위 같음'); });

console.log(`\nv31 pass ${pass} fail ${fail}`); process.exitCode=fail?1:0;
})().catch(e=>{ console.error(e); process.exit(1); });
