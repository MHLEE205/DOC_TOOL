/* v0.8 시험 (지시서 D00 acl_bench v0.9 · 書類ツール v0.8 · 자체 확인 6 · 7 + 엔진 고정 v0.9) — 가짜 데이터만 · 실제 거래처 · 메일함 이름 0. node v08.js [html]
   6 메일 초안: 本登録 / 정정 A / B · 本船変更 · 제목 태그 · 여러 칸 블록 · S/I ↔ L/C 는 넣지 않음 · 보내기 코드 0
   7 이름 전체 · 補助 표시 (master staff doc_role) · FD 本日 · 昨日 B/L 受領 · 원본 통수 함수 (엔진과 같음) */
const fs=require('fs'),path=require('path');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const P=ENG.pin(HTML), E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const qa=(w,s)=>[...w.document.querySelectorAll(s)];
(async()=>{
ok(/^0\.(9|1\d)$/.test(P.ver)&&typeof E.lcItems==='function'&&typeof E.mailKindOf==='function','엔진 고정 = acl_bench v0.9 (커밋 '+P.commit.slice(0,7)+' · sha256)',P);

console.log('6 메일 초안');
{ const it=(o)=>Object.assign({group:'S/I 文面', key:'x', label:'X', status:'MATCH', expected:'', actual:'', detail:'', kind:''},o);
  const ctx={subject:'RE: 【ACL確認依頼】 RE: 【通関書類送付_TEST2699-01】', company:'TEST 乙仲', person:'担当 太郎', iv:'TEST2699-01'};
  const h=DOC.aclMailDraft({invoice:'TEST2699-01', items:[it({status:'MATCH'}),it({status:'NOTATION'}),it({status:'INFO'})]}, ctx);
  ok(h.type==='hon'&&h.subject==='[本登録依頼] Re: 【ACL確認依頼】 RE: 【通関書類送付_TEST2699-01】'&&/^TEST 乙仲 担当 太郎 様/.test(h.body)&&/本登録をお願いいたします。/.test(h.body)&&/許可書とACLのご送付ありがとうございます。/.test(h.body),'問題なし (一致 · 表記差 · 参考) → 本登録 A · 제목 태그 [本登録依頼] Re: {元の件名} (앞 RE: 정리)',h);
  const f=DOC.aclMailDraft({invoice:'TEST2699-01', items:[it({key:'consignee', label:'Consignee', status:'DIFF', expected:'TO ORDER OF SAMPLE BANK', actual:'TO ORDER OF SAMPLE BNK'}),it({key:'set:TSTU0000001', label:'セット', group:'コンテナ', status:'DIFF', expected:'シール SL1', actual:'シール SL9'}),
    it({key:'disp:agentSign', label:'Agent Signature Request Identifier', group:'NACCS 表示欄', status:'DIFF', expected:'1', actual:'(空欄)'}),it({key:'lc:pod', label:'揚地 (S/I ↔ L/C)', group:'L/C', status:'DIFF', expected:'X', actual:'Y'})]}, ctx);
  ok(f.type==='fix'&&/^\[ACL訂正依頼\] Re: /.test(f.subject)&&f.blocks===3,'相違 → 정정 · 제목 [ACL訂正依頼] · 블록 3 (S/I ↔ L/C 는 빼고)',f);
  ok(/ACL Consignee欄\nTO ORDER OF SAMPLE BNK\n→TO ORDER OF SAMPLE BANK/.test(f.body)&&/ACL コンテナ TSTU0000001欄\nシール SL9\n→シール SL1/.test(f.body),'정정 A — 칸마다 {訂正欄}欄 · {訂正前 (ACL)} → {訂正後 (S/I)} 블록',f.body);
  ok(/ACL Agent Signature Request Identifier欄へ 1 のご入力をお願いできますでしょうか。/.test(f.body),'표시 칸 → 정정 B 「欄へ {値} のご入力」',f.body);
  ok(/赤字部分へご訂正をお願いできますでしょうか。/.test(f.body)&&/何卒よろしくお願い申し上げます。/.test(f.body)&&f.skipped.join()==='揚地 (S/I ↔ L/C)','끝 문구 · S/I ↔ L/C 차이는 메일에 넣지 않고 따로 표시',f.skipped);
  const v=DOC.aclMailDraft({invoice:'TEST2699-01', items:[it({key:'vessel', label:'Ocean Vessel + Voy.No.', group:'本船・港', status:'DIFF', expected:'NEW STAR 102W', actual:'OLD STAR 101W', action:'本船変更依頼'})]}, ctx);
  ok(v.type==='vessel'&&/^\[本船変更依頼\] Re: /.test(v.subject)&&/\(OLD STAR 101W → NEW STAR 102W\)/.test(v.body),'本船変更 → 정정 B [本船変更依頼] · (旧本船 航海 → 新本船 航海)',v);
  ok(!/赤字部分/.test(v.body)&&/何卒よろしくお願い申し上げます。$/.test(v.body),'本船変更 만 → 정정 B 끝맺음 (赤字 문구 없음)',v.body);
  const ad=DOC.aclMailDraft({invoice:'TEST2699-01', items:[]},{company:'TEST 乙仲', person:'someone@example.test'}); ok(/^TEST 乙仲 様/.test(ad.body),'보낸 사람 표시 이름이 주소 → 이름 칸에 쓰지 않음',ad.body.split('\n')[0]);
  const d=DOC.aclMailDraft({invoice:'TEST2699-01', items:[it({key:'disp:freight', label:'Freight As Arranged', group:'NACCS 表示欄', status:'DIFF', expected:'1', actual:'(空欄)'})]}, {});
  ok(d.type==='fix'&&/^ご担当者様/.test(d.body)&&!/赤字部分/.test(d.body)&&/^\[ACL訂正依頼\] Re: TEST2699-01 ACL$/.test(d.subject),'표시 칸만 → 정정 B 만 · 宛名 모르면 「ご担当者様」 · 원 제목 모르면 Invoice',d);
  const o=DOC.aclMailDraft({invoice:'TEST2699-01', items:[it({key:'lc:originals', label:'原本通数 (L/C 46A ↔ ACL)', group:'L/C', status:'DIFF', expected:'1', actual:'3'})]}, {});
  ok(/Number of Original B\(S\)\/L欄へ 1 のご入力/.test(o.body),'L/C 46A 원본 통수 다름 → ACL 표시 칸 정정 (乙仲에게)',o.body);
  const app=HTML.split('<script id="doc-app">')[1]||'';
  ok(!/sendMail|createReply|\/send\b|\/messages\/[^'"]*\/(?:reply|forward)|method\s*:\s*['"]POST['"][^}]*messages/.test(app)&&!/mailto:/.test(app.slice(app.indexOf('function aclMail(iv)'),app.indexOf('function aclTabAfter'))),'보내기 · 답장 · mailto 코드 0 (下書き · 복사 · Outlook 원본 열기 까지)'); }

console.log('6 화면 — ACL 탭 下書き');
{ const W=X.world(), w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all',doc_tool_hide_fd:'0'}});
  w.document.querySelector('#dtTable button[data-iv="NAA2611-01"][data-tab="acl"]').click();
  await X.until(()=>w.document.getElementById('dtIv').style.display==='flex'&&!!w.document.getElementById('dtAclMail'));
  const op0=W.opened.length; w.document.getElementById('dtAclMail').click(); await X.sleep(20);
  const dr=w.document.getElementById('dtAclDraft'); ok(dr&&/メールの下書き/.test(dr.textContent)&&/^\[ACL訂正依頼\] Re: /.test(dr.querySelector('input').value)&&W.opened.length===op0,'ACL 탭 → 下書き 패널 (창 안 열림)',dr&&dr.textContent.slice(0,200));
  ok(/元の ACL メールが見つかりません/.test(dr.textContent),'원본 메일을 못 찾음 → 본문 복사만 안내');
  ok(!W.writes.some(x=>/graph\.microsoft\.com\/v1\.0\/me\//.test(x.url)),'메일함 쓰기 0'); }

console.log('7 이름 · 補助 · FD 本日');
{ const W=X.world(); W.staff.push({code:'STAFF_C',name_ja:'補助 一郎',email:'c@example.test',active:true,portal_admin:false,doc_role:'書類補助'});
  const w=await X.page(W,{html:HFILE, ls:{doc_tool_who:'all'}});
  const chips=qa(w,'#dtWho button').map(b=>b.textContent);
  ok(chips.includes('山田 太郎')&&chips.includes('佐藤 花子')&&chips.includes('補助 一郎・補助'),'담당 칩 = master staff 이름 전체 · doc_role 書類補助 → 「{이름}・補助」',chips);
  const W2=X.world(), w2=await X.page(W2,{html:HFILE, ls:{doc_tool_who:'all'}}); ok(qa(w2,'#dtWho button').some(b=>b.textContent===DOC.TODO_RULES.ASSIST_LABEL),'표시 없음 → 「補助（書類全体）」');
  ok(DOC.TODO_RULES.ASSIST_ROLE==='書類補助'&&DOC.TODO_RULES.ASSIST_FIELD==='doc_role'&&!/period|期間/.test(JSON.stringify([DOC.TODO_RULES.ASSIST_ROLE,DOC.TODO_RULES.ASSIST_FIELD])),'보조 표시 = staff.doc_role 「書類補助」 (기간 칸 없음 — D6)');
  const at=DOC.at, S0=o=>Object.assign({sub:1,acl:1,hon:1,drafts:[1],pay:1,bmail:1,bl:null,ins:null,rr:null,fd:null,depoReq:null,depoRep:null,vchg:false,cmail:null},o);
  const X0=o=>Object.assign({iv:'NTE2699-01', country:'INDONESIA', term:'CFR', pay:'LC', carrier:'ONE', blDate:''},o);
  const row=(x,s,now)=>{ const r=DOC.todoRow(X0(x),S0(s),now,null); r.group=DOC.todoGroup(r,now); r.when=DOC.whenLabel(r,now); r.whenSub=DOC.whenSub(r,now); return r; };
  const now=at('2026-11-24','10:00');
  const a=row({blDate:'2026-11-24'},{bl:at('2026-11-24','09:30')},now); ok(a.group==='today'&&a.gkey==='fdlc'&&a.when==='期限 11/26'&&a.whenSub==='B/L 受領 11/24 · 18:00 宅配'&&DOC.dayOf(a.due)==='2026-11-26','B/L 오늘 받음 → 맨 위 묶음 · 왼쪽 = 期限 (v0.17 D4) · 2 행 = B/L 受領',a);
  const b=row({blDate:'2026-11-20'},{bl:at('2026-11-20','18:00')},now); ok(b.group==='today'&&b.when==='期限 11/25'&&b.whenSub==='B/L 受領 11/20 · 18:00 宅配','다음 영업일 (11/20 금 → 11/24 화 · 주말 · 11/23 건너뜀) → 期限 11/25 · 2 행 B/L 受領 11/20 (v0.17 D4)',b);
  const c=row({blDate:'2026-11-18'},{bl:at('2026-11-18','18:00')},now); ok(c.group==='late','마감 지남 → 期限切れ',c);
  ok(DOC.TODO_RULES.TGROUPS.filter(g=>g[1]==='do').map(g=>g[0]).join()==='si,fname,acl,depo,draft,blreq,insrr,fd,fdlc','v0.14 묶음 순서 (v0.15: 앞에 S/I 更新 · ファイル名) = 일의 순서 (ACL → Deposit → Draft → B/L 依頼 → 保険・RR → FD → L/C 原本)'); }
console.log('7 원본 통수 (엔진과 같은 함수)');
/* v0.10: 保管所の判読 (lc_read/1) は エンジン lcOriginalsText で出した bl.originals を持つ → 書類ツールはそれを読む (같은 규칙 · 한 곳) */
const RO=t=>({bl:{originals:E.lcOriginalsText(t)}});
eq([DOC.lcOriginals(RO('FULL SET OF CLEAN ON BOARD B/L')),DOC.lcOriginals(RO('B/L TELEX RELEASED OR SURRENDERED')),DOC.lcOriginals(RO('COPY'))],[3,1,null],'L/C 46A → 원본 통수 (TELEX / SURRENDER 1 · FULL SET 3)');
ok(DOC.lcOriginals(RO('FULL SET'))===E.lcOriginalsText('FULL SET')&&DOC.lcOriginals(null)===null,'書類ツール 의 값 = 엔진 lcOriginalsText (v0.10)');
console.log((fail?'FAIL':'PASS')+' v08 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v08 예외',e.stack); process.exitCode=1; });
