/* v0.27 시험 (지시서 THOR_25 · 묶음 v0.17 N30 · N31 · N28 · N29 · N27) — 가짜 데이터 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v27.js [html]
   N30 下書き = C-01 모양 (본문 HTML · 줄바꿈 <br> · Meiryo · 서명 · 꼬리말 · 인사 · 실제 To/CC · 다시 읽기 확인) · N31 버튼 하나 · 参考 = 버튼 없음 · N27 S/I = 계약 1 줄 · 회색 「—」 · N28 · N29 엔진 고정 · 낱말 표 FREIGHT 빨강 0 */
const fs=require('fs'),path=require('path');
const X=require('./fake');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const M=DOC.MAIL30, T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z';
(async()=>{
console.log('버전 · 엔진');
ok(/<title>LEENAI D-00 書類ツール v0\.2[789]<\/title>/.test(HTML)&&/version:'0\.2[789]'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.27 · 푸터');
ok(/const ACL_ENGINE = \{commit:'249317df8aaa5b48b63b75c59570168a57f9a923'.*ver:'0\.22'\}/.test(HTML)&&/const BL_ENGINE = \{commit:'d733fb51bbf7500fce1c1e6aecbf774233025481'.*ver:'0\.7'\}/.test(HTML),'엔진 = acl v0.22 (N28 · N29) · bl v0.7');

console.log('N30 인사 · 본문 · HTML (C-01 과 같은 규칙)');
eq(DOC.mailGreeting('SAMPLE 倉庫九州\n田中様\nいつも大変お世話になっております。\n新規通関依頼'),{company:'SAMPLE 倉庫九州', person:'田中'},'인사 읽기 = 회사 / ○○様');
eq(DOC.mailGreeting('SAMPLE 倉庫株式会社 田中 様\nいつも'),{company:'SAMPLE 倉庫株式会社', person:'田中'},'한 줄 「会社 名前 様」');
eq(DOC.mailGreeting('いつもお世話になっております。\n田中様'),{company:'', person:''},'「いつも」 뒤 = 인사 아님');
const conv=[{from:'a@leenearcorp.example', to:['tanaka@fwd.example.test'], cc:[], text:'SAMPLE 倉庫九州\n田中様\nいつも大変お世話になっております。'},{from:'tanaka@fwd.example.test', to:['a@leenearcorp.example'], cc:[], text:'株式会社サンプル\nA 様\nお世話になります。'}];
let g=DOC.mailGuess({conv, our:'leenearcorp.example', dom:'fwd.example.test', formal:'SAMPLE 倉庫九州株式会社', formalDom:'fwd.example.test', src:{fromName:'tanaka@fwd.example.test', text:''}});
eq([g.company,g.person],['SAMPLE 倉庫九州株式会社','田中'],'회사 = COMPASS 乙仲 정식 이름 (도메인 같음) · 담당 = 지난 메일 인사 (NDH2611-03 과 같은 모양)');
g=DOC.mailGuess({conv, our:'leenearcorp.example', dom:'fwd.example.test', formal:'OTHER CO', formalDom:'other.example.test', src:null}); eq([g.company,g.person],['SAMPLE 倉庫九州','田中'],'정식 이름 도메인이 다르면 = 지난 인사');
g=DOC.mailGuess({conv:[], our:'leenearcorp.example', dom:'x.example.test', src:{fromName:'Taro Sample', text:'Best regards\nSAMPLE LINE CO., LTD.\nTEL 00'}, ourRe:/LEENEAR/i}); eq([g.company,g.person],['SAMPLE LINE CO., LTD.','Taro Sample'],'못 찾으면 = 상대 서명 회사 · 보낸 이 이름');
g=DOC.mailGuess({conv:[], our:'leenearcorp.example', dom:'x.example.test', src:{fromName:'desk@x.example.test', text:''}}); eq([g.company,g.person],['',''],'아무것도 없음 = 빈칸 (고치기 표시)');
ok(DOC.greetOk('A','B')&&!DOC.greetOk('','B')&&!DOC.greetOk(M.CO_PH,'B')&&!DOC.greetOk('A',M.PS_PH),'인사가 비거나 표시 그대로 = 만들지 않음');
const txt=DOC.mailCompose({greet:true, company:'SAMPLE 倉庫九州株式会社', person:'田中', body:'いつもお世話になっております。\n本登録をお願いいたします。', name:'山田 太郎', email:'tester@example.test'});
eq(txt,'SAMPLE 倉庫九州株式会社\n田中 様\n\nいつもお世話になっております。\n本登録をお願いいたします。\n\n----------------------------------------\n山田 太郎\n株式会社リニア (LEENEAR CORPORATION)\nTEL : +81-3-3528-9850 / FAX : +81-3-3528-9851\ntester@example.test\n\n✦ Powered by LEENAI Automation System','본문 = 인사 + 본문 + 서명 (C-01 과 같은 글자) + 꼬리말');
const h=DOC.mailHtml('A < B\nC');
eq(h,'<div style="font-family:\'Meiryo\',\'Yu Gothic\',sans-serif;font-size:10.5pt">A &lt; B<br>C</div>','HTML = escape · 줄바꿈 <br> · Meiryo 10.5pt (C-01 bodyHtml 과 같음)');
eq(DOC.mailInsert('<html><body class="x"><hr>OLD</body></html>','<div>NEW</div>'),'<html><body class="x"><div>NEW</div><hr>OLD</body></html>','답장 = <body> 바로 뒤 (원문 인용 그대로)');
eq(DOC.replyAllTo({from:'tanaka@fwd.example.test', to:['me@leenearcorp.example','b@leenearcorp.example'], cc:['c@fwd.example.test','ME@leenearcorp.example']}, 'me@leenearcorp.example'),{to:['tanaka@fwd.example.test','b@leenearcorp.example'], cc:['c@fwd.example.test']},'실제 받는 사람 = 전원 답장 (보낸 이 + To · CC · 나 빼고)');
const back=html=>({html:'<html><body>'+html+'<hr><div>From: tanaka · QUOTE LINE ORIGINAL</div></body></html>', to:['tanaka@fwd.example.test'], cc:['rcp@example.test'], subject:'S'});
const E={text:txt, to:['tanaka@fwd.example.test'], cc:['rcp@example.test'], subject:'S', quote:'From: tanaka · QUOTE LINE ORIGINAL'};
eq(DOC.mailVerify(back(DOC.mailHtml(txt)),E),[],'다시 읽기 = 줄바꿈 · 서명 · 꼬리말 · 인용 · 받는 사람 모두 맞음');
ok(DOC.mailVerify(back(M.FONT+txt.replace(/\n/g,' ')+'</div>'),E).some(x=>/改行/.test(x)),'줄바꿈이 사라져 한 줄 = 「形が崩れています」 (형님 화면과 같은 고장)');
ok(DOC.mailVerify(back(DOC.mailHtml(txt.split('\n\n----')[0])),E).some(x=>/署名|改行/.test(x)),'서명 없음 = 알림');
ok(DOC.mailVerify(Object.assign(back(DOC.mailHtml(txt)),{html:'<html><body>'+DOC.mailHtml(txt)+'</body></html>'}),E).some(x=>/引用/.test(x)),'원문 인용 없음 = 알림');
ok(DOC.mailVerify(Object.assign(back(DOC.mailHtml(txt)),{to:['x@example.test']}),E).some(x=>/To/.test(x)),'받는 사람 다름 = 알림');

console.log('N30 화면 — 확인 창 → Outlook 下書き (가짜 메일함 · 보내기 0)');
{ const W=X.world();
  W.messages=(W.messages||[]).concat([
    {id:'m1', subject:'【ACL確認依頼】 NAA2611-01', from:{emailAddress:{address:'tanaka@fwd.example.test',name:'tanaka@fwd.example.test'}}, toRecipients:[{emailAddress:{address:'tester@example.test'}}], ccRecipients:[{emailAddress:{address:'sub@fwd.example.test'}}], receivedDateTime:D(-1).replace('T00','T05'), bodyPreview:'株式会社サンプル\n山田様\nACL を送付します', hasAttachments:true, attachments:[]},
    {id:'m0', subject:'通関依頼 NAA2611-01', from:{emailAddress:{address:'tester@example.test',name:'山田'}}, toRecipients:[{emailAddress:{address:'tanaka@fwd.example.test'}}], ccRecipients:[], receivedDateTime:D(-3).replace('T00','T05'), bodyPreview:'SAMPLE 倉庫九州\n田中様\nいつも大変お世話になっております。', hasAttachments:false, attachments:[]}]);
  const w=await X.page(W,{ls:{doc_tool_who:'all'}});
  w.eval("window.__d={title:'メールの下書き — 本登録依頼 · NAA2611-01', kind:'acl', type:'hon', iv:'NAA2611-01', subject:'[本登録依頼] Re: 【ACL確認依頼】 NAA2611-01', body:'いつもお世話になっております。\\n許可書とACLのご送付ありがとうございます。\\n内容相違ございませんので、こちらで本登録をお願いいたします。', to:[], cc:['rcp@example.test'], srcId:'m1', greet:true, formal:'SAMPLE 倉庫九州株式会社', formalDom:'fwd.example.test', att:[]}; mail30Modal(window.__d);");
  await X.until(()=>!!w.document.getElementById('dtMdMake'),5000);
  const v=id=>w.document.getElementById(id).value;
  eq([v('dtMdCo'),v('dtMdPs')],['SAMPLE 倉庫九州株式会社','田中'],'인사 = 정식 회사 이름 / 지난 메일의 담당 (자동)');
  ok(v('dtMdToIn')==='tanaka@fwd.example.test'&&/sub@fwd\.example\.test/.test(v('dtMdCcIn'))&&/rcp@example\.test/.test(v('dtMdCcIn'))&&/To: tanaka@fwd\.example\.test/.test(w.document.getElementById('dtMdTo').textContent)&&!/返信先）$/.test(w.document.getElementById('dtMdTo').textContent),'실제 To · CC 주소 (「（返信先）」 0 · 고칠 수 있음)',[v('dtMdToIn'),v('dtMdCcIn')]);
  ok(/株式会社リニア \(LEENEAR CORPORATION\)/.test(w.document.querySelector('.md-sig').textContent)&&/✦ Powered by/.test(w.document.querySelector('.md-sig').textContent),'확인 창에 서명 · 꼬리말 미리 보기');
  /* 인사를 지우면 만들지 않음 */
  w.document.getElementById('dtMdPs').value=''; w.document.getElementById('dtMdMake').click(); await X.sleep(30);
  ok(/宛名/.test(w.document.getElementById('dtMdSt').textContent)&&!(W.mailWrites||[]).length,'담당자 빈칸 = 「宛名…」 · 下書き 안 만듦');
  w.document.getElementById('dtMdPs').value='田中'; w.document.getElementById('dtMdMake').click();
  await X.until(()=>/作りました|崩れて|作れません/.test(w.document.getElementById('dtMdSt').textContent),5000);
  const dr=Object.values(W.drafts||{})[0]||{}, body=(dr.body||{}).content||'';
  ok(dr.body&&dr.body.contentType==='HTML'&&/^<html><head><meta charset="utf-8"><\/head><body><div><div style="font-family:'Meiryo','Yu Gothic',sans-serif;font-size:10\.5pt">SAMPLE 倉庫九州株式会社<br>田中 様<br><br>いつもお世話になっております。<br>/.test(body),'下書き 본문 = HTML · <body> 바로 뒤 · 인사 · 줄바꿈 <br>',body.slice(0,300));
  ok(/----------------------------------------<br>山田 太郎<br>株式会社リニア \(LEENEAR CORPORATION\)<br>TEL : \+81-3-3528-9850 \/ FAX : \+81-3-3528-9851<br>tester@example\.test<br><br>✦ Powered by LEENAI Automation System<\/div><\/div><hr><div id="divRplyFwdMsg">/.test(body),'서명 (職員マスター 이름 · 메일) · 꼬리말 · 그 뒤 원문 인용 그대로',body.slice(-400));
  ok((dr.toRecipients||[]).map(x=>x.emailAddress.address).join()==='tanaka@fwd.example.test'&&(dr.ccRecipients||[]).length===2,'받는 사람 = 확인 창 그대로',[dr.toRecipients,dr.ccRecipients]);
  ok(/読み直して確かめました/.test(w.document.getElementById('dtMdSt').textContent),'다시 읽기 확인 = OK 표시',w.document.getElementById('dtMdSt').textContent);
  const mw=(W.mailWrites||[]).map(x=>x.method+' '+x.url.replace('https://graph.microsoft.com/v1.0/',''));
  ok(mw.length===2&&/^POST me\/messages\/m1\/createReplyAll$/.test(mw[0])&&/^PATCH me\/messages\/draft1$/.test(mw[1])&&!mw.some(x=>/send|forward/i.test(x)),'메일함 쓰기 = 下書き (전원 답장) · 고치기만 · 보내기 0',mw);
  /* 고장 흉내 — 다시 읽은 下書き 의 줄바꿈이 없어짐 → 「下書きの形が崩れています」 */
  const W2=X.world(); W2.messages=W.messages; const w2=await X.page(W2,{ls:{doc_tool_who:'all'}});
  w2.eval("const o=window.fetch; window.fetch=async(u,i)=>{ const r=await o(u,i); if(/me\\/messages\\/draft1\\?/.test(String(u))&&(!i||!i.method||i.method==='GET')){ const j=await r.json(); j.body.content=String(j.body.content).replace(/<br>/g,' '); return {ok:true, status:200, headers:{get:()=>null}, json:async()=>j}; } return r; };");
  w2.eval("mail30Modal({title:'T', kind:'depo', type:'depo', iv:'NAA2611-01', subject:'S', body:'L1\\nL2', to:['a@buyer.example.test'], cc:[], srcId:'', greet:false, att:[]})"); await X.until(()=>!!w2.document.getElementById('dtMdMake'),5000);
  w2.document.getElementById('dtMdMake').click(); await X.until(()=>/作りました|崩れて|作れません/.test(w2.document.getElementById('dtMdSt').textContent),5000);
  ok(/下書きの形が崩れています/.test(w2.document.getElementById('dtMdSt').textContent)&&/改行/.test(w2.document.getElementById('dtMdSt').textContent),'다시 읽은 下書き 줄바꿈 없음 = 「下書きの形が崩れています」',w2.document.getElementById('dtMdSt').textContent);
  const nd=Object.values(W2.drafts||{})[0]||{}; ok(/^<html><body><div><div style="font-family:'Meiryo'/.test((nd.body||{}).content||'')&&nd.body.contentType==='HTML','새 메일 下書き 도 같은 HTML',(nd.body||{}).content);
}

console.log('N31 버튼 하나');
ok(!/id="dtAclMail"/.test(HTML)&&!/function aclMail\(/.test(HTML)&&!/Outlook で元の ACL メールを開く/.test(HTML),'ACL 탭 옛 버튼 · 복사 창 없음');
ok(/\(fresh&&!c\.ref\?'<button class="dt-btn" id="dtAclOutlook">'\+\(g\.diff\.length\?'訂正依頼の下書きを作る':'本登録依頼の下書きを作る'\)/.test(HTML),'ACL = 「本登録依頼の下書きを作る」 / 「訂正依頼の下書きを作る」 하나 · 参考 (B/L で訂正済み · 後の段階) = 없음');
ok(!/Outlook で元の Draft メールを開く/.test(HTML)&&/function blMail\(iv, type\)\{[\s\S]{0,200}mail30Modal|mail30Modal\(\{kind:'bl'/.test(HTML),'B/L Draft 下書き = 같은 확인 창 (복사 창 없음)');
ok(/async function lgMailOpen\(cur\)\{[\s\S]{0,1500}mail30Modal\(\{kind:'lg'/.test(HTML)&&!/function lgMailCreate/.test(HTML),'LG 下書き = 같은 확인 창 (첨부 = 만든 LG)');
ok((HTML.match(/contentType:'Text'/g)||[]).length===0,'Text 본문 下書き 0 (모두 HTML)');

console.log('N27 S/I = 계약 1 줄');
{ const ci={no:'LRS-2699XS1', ivs:['NXS2699-02','NXS2699-03','NXS2699-04','NXS2699-05'], due:DOC.at(X.addDays(T,4),'18:00'), allShipped:false};
  let x=DOC.todoExtra({iv:'NXS2699-02', ct:'LRS-2699XS1', otherCt:['LRS-2699XS2'], ctInfo:ci}, DOC.at(T,'09:00'));
  ok(x.length===1&&x[0].ctRow&&x[0].ctRow.no==='LRS-2699XS1'&&!x[0].red&&x[0].due===ci.due&&DOC.todoGroup(x[0],DOC.at(T,'09:00'))!=='late','계약 줄 · 기한 = 안 나간 선적의 가장 이른 CY_CUT · 빨강 아님',x[0]);
  eq(DOC.ctIvsLabel(ci.ivs),'NXS2699-02 ほか 3 件','Invoice = 작은 글씨 「… ほか 3 件」');
  ok(/^期限 /.test(DOC.whenLabel(x[0],DOC.at(T,'09:00'))),'왼쪽 칸 = 期限 m/d',DOC.whenLabel(x[0],DOC.at(T,'09:00')));
  x=DOC.todoExtra({iv:'NXS2699-02', ct:'LRS-2699XS1', otherCt:['LRS-2699XS2'], ctInfo:Object.assign({},ci,{due:null})}, DOC.at(T,'09:00'));
  ok(x[0].due==null&&DOC.todoGroup(x[0],DOC.at(T,'09:00'))==='none'&&DOC.whenLabel(x[0],DOC.at(T,'09:00'))==='—','CY_CUT 없음 = 회색 「—」 (빨강 · 期限切れ 셈 0)');
  x=DOC.todoExtra({iv:'NXS2699-02', ct:'LRS-2699XS1', otherCt:['LRS-2699XS2'], lcStale:true, ctInfo:Object.assign({},ci,{allShipped:true})}, DOC.at(T,'09:00'));
  ok(!x.length,'모두 나간 계약 = 参考 (今日やること 에 없음)');
  x=DOC.todoExtra({iv:'NXS2699-02', ct:'LRS-2699XS1', lcStale:true, ctInfo:ci}, DOC.at(T,'09:00')); ok(x.length===1&&x[0].gkey==='si'&&x[0].ctRow,'「L/C 着 · S/I 未更新」 도 계약 줄');
  /* 화면 — 같은 계약 Invoice 2 개 → 1 줄 · 계약번호 · S/I を開く */
  const W=X.world(); W.sis[0].crcf9_bencert_text='WE CERTIFY … CONTRACT NUMBER (LRS-2609ZZ9)';
  W.bookings[0].cr49f_cy_cut=D(2); W.bookings[1].cr49f_cy_cut=D(8);
  const w=await X.page(W,{first:true, ls:{doc_tool_board_v28:'todo', doc_tool_who:'all'}}); await X.until(()=>!!w.document.querySelector('.tl-zone'),10000);
  const rows=[...w.document.querySelectorAll('.tl-row')].filter(r=>/別の契約番号: LRS-2609ZZ9/.test(r.textContent));
  ok(rows.length===1&&/LRS-2611AA1/.test(rows[0].querySelector('.tl-iv').textContent)&&/NAA2611-01 ほか 1 件/.test(rows[0].querySelector('.tl-iv').textContent)&&!!rows[0].querySelector('.tl-iv [data-tdct]'),'같은 계약 Invoice 2 개 = 1 줄 · 계약번호 · Invoice 작게 · 누르면 계약 S/I',rows.map(r=>r.textContent));
  ok(rows[0]&&/^期限 /.test(rows[0].querySelector('.tl-due').textContent),'기한 = 가장 이른 CY_CUT',rows[0]&&rows[0].querySelector('.tl-due').textContent);
}

console.log('N29 낱말 표 — D-03 고정 문언 빨강 0');
{ const t=DOC.wordDiffTable('SAMPLE PAPER CO\nFREIGHT PREPAID AS ARRANGED','SAMPLE PAPER CO'); ok(t.n===0&&!/av-hl/.test(t.html),'FREIGHT PREPAID AS ARRANGED = 빨강 0',t.html); }

console.log((fail?'FAIL':'PASS')+' v27 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v27 예외',e.stack); process.exitCode=1; });
