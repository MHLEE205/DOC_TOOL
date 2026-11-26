/* v0.26 시험 (지시서 THOR_24 · 수정 묶음 v0.12 N17 · N18 · N19 · N21 · N23 · N24 · N26) — 가짜 데이터 · 가짜 거래처 (example.test) · 네트워크 없음 · 메일 보내기 0. node v26.js [html]
   N17 Invoice 別 「通関依頼済」 보조 체크 (체크 / 해제 · tsukan_irai_at · tsukan_irai_off_at · 그 칸만 · eTag · C-01 표시 · 「通関依頼の前の行も出す」)
   N18 ACL 相違 → 「参考（B/L で訂正済み）」 · 後の段階 · 本登録 「—（後の段階で確認済み）」 · N19 낱말 단위 (빠진 낱말만 빨강)
   N21 서명 그림 (sign_ok false = 안 만듦 · 관리자 확인 · 그림 교체 = 그 그림만) · N23 依頼者名 = name_en · N26 제목 (실적 모양 + B/L + 本船 · 航海 + Invoice) · 본문 (정정 목록 없음) */
const fs=require('fs'),path=require('path'), JSZip=require('jszip');
const X=require('./fake'), ENG=require('./engine');
const HFILE=process.argv[2]||path.join(__dirname,'../index.html'), HTML=fs.readFileSync(HFILE,'utf8');
const DOC=new Function('module',HTML.match(/<script id="doc-core">([\s\S]*?)<\/script>/)[1]+';return DOC;')(undefined);
const E=ENG.engine(HTML); DOC.useAclEngine(E);
let pass=0,fail=0; const ok=(c,m,info)=>{ if(c){pass++;} else {fail++;console.log('FAIL',m,info===undefined?'':JSON.stringify(info).slice(0,700));} };
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m,{got:a,want:b});
const V=DOC.V26, PT=DOC.PT, T=X.todayIso(), D=n=>X.addDays(T,n)+'T00:00:00Z';
const qa=(w,s)=>[...w.document.querySelectorAll(s)];
(async()=>{
console.log('버전 · 푸터');
ok(/<title>LEENAI D-00 書類ツール v0\.(?:2[6789]|3[01])<\/title>/.test(HTML)&&/version:'0\.(?:2[6789]|3[01])'/.test(HTML)&&/✦ Powered by LEENAI Automation System/.test(HTML),'버전 0.26 (title · CFG) · 푸터');

console.log('N17 「通関依頼済」 — 그 칸만 (records) · 시각 · 해제 시각');
{ const base={last_updated:'2026-11-20T00:00:00.000Z', records:{'TST2699-01':{tsukan_irai:true, tsukan_status:'ED未', tsukan_irai_at:'2026-11-19T01:00:00.000Z', updated_by:'PORTAL USER'}, 'TST2699-09':{tsukan_irai:false, tsukan_status:'未'}}, cotecna:{'K':{report_status:'済'}}, shipping:{'TST2699-01':{dep:'確認',furikomi:'未',fd_date:'',fd_note:'メモ'}}};
  const t0=JSON.stringify(base,null,2), NOW='2026-11-26T03:00:00.000Z';
  let M=DOC.ptMergeTs(t0,'TST2699-02',true,'TEST USER',NOW), o=JSON.parse(M.text), e=o.records['TST2699-02'];
  ok(M.changed&&e.tsukan_irai===true&&e.tsukan_irai_at===NOW&&e.tsukan_irai_off_at===''&&e.tsukan_status==='ED未'&&e.updated_by==='TEST USER'&&e.updated_at===NOW,'체크 = true · at 지금 · off_at "" · 상태 未 → ED未 (PORTAL 과 같음)',e);
  ok(JSON.stringify(o.records['TST2699-01'])===JSON.stringify(base.records['TST2699-01'])&&JSON.stringify(o.shipping)===JSON.stringify(base.shipping)&&JSON.stringify(o.cotecna)===JSON.stringify(base.cotecna),'다른 줄 · shipping · cotecna 그대로');
  M=DOC.ptMergeTs(t0,'TST2699-01',false,'TEST USER',NOW); e=JSON.parse(M.text).records['TST2699-01'];
  ok(M.changed&&e.tsukan_irai===false&&e.tsukan_irai_at===''&&e.tsukan_irai_off_at===NOW&&e.tsukan_status==='未','해제 = false · at "" · off_at 지금 (N20) · ED未 → 未',e);
  const t1=JSON.stringify(Object.assign({},base,{records:Object.assign({},base.records,{'TST2699-01':{tsukan_irai:true, tsukan_status:'ED済', tsukan_irai_at:'x'}})}));
  ok(JSON.parse(DOC.ptMergeTs(t1,'TST2699-01',false,'U',NOW).text).records['TST2699-01'].tsukan_status==='ED済','해제해도 ED済 는 그대로');
  M=DOC.ptMergeTs(t0,'TST2699-01',true,'U',NOW); ok(!M.changed&&M.text===t0,'이미 체크 = 바뀐 것 없음 (쓰지 않음)');
  M=DOC.ptMergeTs(t0,'TST2699-09',false,'U',NOW); ok(!M.changed,'처음부터 꺼진 줄 해제 = 쓰지 않음 (off_at 안 씀)');
  let th=''; try{ DOC.ptMergeTs('{bad','TST2699-01',true); }catch(x){ th=x.message; } ok(/JSON/.test(th),'깨진 파일 = 예외 (쓰지 않음)');
  ok(DOC.ptByC01({tsukan_irai:true, updated_by:'C-01'})&&!DOC.ptByC01({tsukan_irai:true, updated_by:'TEST USER'})&&!DOC.ptByC01({tsukan_irai:false, updated_by:'C-01'}),'C-01 이 쓴 줄 = 「C-01」');
  ok(DOC.guardPortal(PT.PATH,{portal:true, ifMatch:'"e1"'})&&(()=>{ try{ DOC.guardPortal(PT.PATH,{portal:true}); return false; }catch(x){ return true; } })(),'문지기 = PORTAL 파일 · eTag 없이는 안 씀');
}
/* 화면 — Invoice 別 (PORTAL と同じ表) */
function world26(){
  const W=X.world(), b0=W.bookings[0];
  W.regions[0].cr49f_region='VIETNAM'; W.pols[0].crcf9_pol='SAMPLE POL, JAPAN';
  W.carriers=[{crcf9_carrierid:X.g('5',1),crcf9_carrier:'TEST LINE'}]; W.bookings.forEach(b=>{ b._cr49f_carrier_id_value=X.g('5',1); });
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',15),cr49f_invoice_no:'NAA2611-15',cr49f_booking_no:'TESTBK15',cr49f_etd:D(9),crcf9_bl_etd:D(9),cr49f_cy_cut:D(7)}));   // 通関依頼 前 · CY_CUT 7 日後
  W.bookings.push(Object.assign({},b0,{cr49f_bookingid:X.g('e',16),cr49f_invoice_no:'NAA2611-16',cr49f_booking_no:'TESTBK16',cr49f_etd:D(40),crcf9_bl_etd:D(40),cr49f_cy_cut:D(38)}));   // 通関依頼 前 · CY_CUT 遠い
  W.content[PT.PATH]=JSON.stringify({last_updated:'2026-11-20T00:00:00.000Z',records:{'NAA2611-01':{tsukan_irai:true,tsukan_status:'ED未',tsukan_irai_at:'2026-11-19T01:00:00.000Z'},'NBB2611-01':{tsukan_irai:true},'NAA2611-02':{tsukan_irai:true,tsukan_status:'ED未',updated_by:'C-01'},'NCC2611-01':{tsukan_irai:true},'NAA2611-15':{tsukan_irai:false,tsukan_status:'未'}},cotecna:{},
    shipping:{'NAA2611-01':{dep:'確認',furikomi:'未',fd_date:'',fd_note:'メモA',updated_by:'PORTAL USER'}}},null,2);
  W.etag={}; W.etag[PT.PATH]='"e0"'; return W;
}
const ivList=w=>qa(w,'#dtTable tbody tr').map(tr=>tr.cells[5].textContent.replace(/LRS-.*$/,'').trim());
const box=(w,iv)=>w.document.querySelector('input[data-ptts="'+iv+'"]');
const flip=async(w,el,on)=>{ el.checked=on; el.dispatchEvent(new w.Event('change')); await X.until(()=>!el.isConnected||!el.disabled); await X.sleep(40); };
{ console.log('N17 화면 — Invoice 別 체크 칸');
  const W=world26(), w=await X.page(W,{ls:{doc_tool_iv_mode_v16:'',doc_tool_who:'all'}});
  ok(box(w,'NAA2611-01')&&box(w,'NAA2611-01').checked,'通関依頼済 줄 = 체크된 칸');
  ok(!ivList(w).includes('NAA2611-15')&&!!w.document.getElementById('dtPtPre')&&!w.document.getElementById('dtPtPre').checked,'기본 = 지금처럼 (통관 전 줄 안 보임) · 스위치 꺼짐');
  ok(!!w.document.querySelector('input[data-ptts="NAA2611-02"] + .pt-c01'),'C-01 이 쓴 줄 = 「C-01」 작은 표시');
  const pre=w.document.getElementById('dtPtPre'); pre.checked=true; pre.dispatchEvent(new w.Event('change')); await X.sleep(50);
  ok(ivList(w).includes('NAA2611-15')&&!ivList(w).includes('NAA2611-16')&&box(w,'NAA2611-15')&&!box(w,'NAA2611-15').checked,'「通関依頼の前の行も出す」 = CY_CUT 10 일 안의 통관 전 줄 (먼 줄은 안 보임)',ivList(w));
  W.writes.length=0; await flip(w,box(w,'NAA2611-15'),true);
  let P=JSON.parse(W.content[PT.PATH]), r=P.records['NAA2611-15'];
  ok(W.writes.length===1&&W.writes[0].method==='PUT'&&decodeURIComponent(W.writes[0].url).indexOf(PT.PATH)>0,'쓰기 1 번 = PORTAL 파일 (eTag 조건)',W.writes.map(x=>x.method+' '+decodeURIComponent(x.url).slice(-60)));
  ok(r.tsukan_irai===true&&!!r.tsukan_irai_at&&r.tsukan_irai_off_at===''&&r.tsukan_status==='ED未','체크 → records 그 줄 (at · off_at "" · ED未)',r);
  ok(P.records['NAA2611-01'].tsukan_irai_at==='2026-11-19T01:00:00.000Z'&&P.shipping['NAA2611-01'].fd_note==='メモA','다른 줄 · shipping 그대로');
  ok(qa(w,'.pt-ok').length===1,'「✓ 保存」');
  pre.checked=false; w.document.getElementById('dtPtPre').checked=false; w.document.getElementById('dtPtPre').dispatchEvent(new w.Event('change')); await X.sleep(50);
  ok(ivList(w).includes('NAA2611-15'),'체크한 줄 = 스위치를 꺼도 남음 (通関依頼済)');
  await flip(w,box(w,'NAA2611-01'),false); P=JSON.parse(W.content[PT.PATH]); r=P.records['NAA2611-01'];
  ok(r.tsukan_irai===false&&r.tsukan_irai_at===''&&!!r.tsukan_irai_off_at&&r.tsukan_status==='未','해제 → off_at = 지금 (N20) · at ""',r);
  ok(ivList(w).includes('NAA2611-01')&&box(w,'NAA2611-01')&&!box(w,'NAA2611-01').checked,'해제한 줄 = 이 화면에서는 남음 (다시 체크할 수 있게)');
  /* eTag 충돌 — 다른 사람이 먼저 저장 → 다시 읽고 1 번 더 */
  let n=0; W.beforePut=async p=>{ if(p===PT.PATH&&!n++){ const o=JSON.parse(W.content[p]); o.records['NCC2611-01'].updated_by='OTHER'; W.content[p]=JSON.stringify(o,null,2); W.etag[p]='"e99"'; } };
  await flip(w,box(w,'NAA2611-01'),true); P=JSON.parse(W.content[PT.PATH]);
  ok(P.records['NAA2611-01'].tsukan_irai===true&&P.records['NCC2611-01'].updated_by==='OTHER','eTag 충돌 = 다시 읽고 그 칸만 (다른 사람 변경 그대로)');
  W.beforePut=null; ok(!W.writes.some(x=>/MASTER|Invoice|書類作成中/.test(decodeURIComponent(x.url))),'쓰기 = PORTAL 파일만');
  /* 試験モード = 試験の写し */
  const W2=world26(); W2.content[PT.TEST_PATH]=W2.content[PT.PATH]; W2.etag[PT.TEST_PATH]='"t0"';
  const w2=await X.page(W2,{email:'boss@example.test', ls:{doc_tool_iv_mode_v16:'',doc_tool_who:'all',doc_tool_save_test:'1'}}); const before=W2.content[PT.PATH];
  await flip(w2,box(w2,'NAA2611-01'),false);
  ok(W2.content[PT.PATH]===before&&JSON.parse(W2.content[PT.TEST_PATH]).records['NAA2611-01'].tsukan_irai===false,'試験モード = 試験の写しだけ (PORTAL 실파일 0)');
}

console.log('N18 ACL 相違 → 参考');
{ const res={items:[{group:'S/I 文面',key:'notify',status:'DROP',label:'Notify Party'},{group:'S/I 文面',key:'shipper',status:'NOTATION'}], final:{missing:[{text:'SAMPLE PAPER JOINT STOCK COMPANY',src:'notify',srcs:['notify']}], sets:{diff:[],aclOnly:[],cpOnly:[],allOk:true}}};
  const A=[{field:'Notify',class:'SAME'},{field:'Shipper',class:'DIFF'},{field:'Consignee',class:'SAME'}];
  eq(DOC.aclBlFixed(res,A),{ok:true,fields:['Notify'],why:''},'Notify 가 B/L Draft 최신판에서 S/I 와 같음 = 訂正済み');
  ok(DOC.aclBlFixed(res,[{field:'Notify',class:'DIFF'}]).ok===false,'Draft 에서도 다름 = 아님');
  ok(DOC.aclBlFixed(res,[{field:'Notify',class:'NOTATION'}]).ok===true,'表記差 = 같음으로');
  ok(DOC.aclBlFixed(Object.assign({},res,{final:Object.assign({},res.final,{sets:{diff:['x'],aclOnly:[],cpOnly:[]}})}),A).ok===false,'컨테이너 세트 相違 = 아님 (B/L 로 못 봄)');
  ok(DOC.aclBlFixed(res,[])===null&&DOC.aclBlFixed({items:[],final:{}},A)===null,'비교할 것 없음 = null');
  const cell=(s,o)=>Object.assign({s, why:'최終確認 ✗ 1 · 照合 相違あり', files:[], pick:{f:{name:'TST2699-01_ACL.pdf'}}, fresh:true},o||{});
  let out={acl:cell('diff'), bl:{s:'todo', why:'REV'}, fd:{s:'wait', why:'FD 未作成'}}; DOC.aclLater(out,{blFix:{ok:true, fields:['Notify'], file:'TST2699-01_DRAFT REV.pdf'}});
  ok(out.acl.s==='done'&&out.acl.ref===V.BL_FIXED&&/^参考（B\/L で訂正済み） — Notify は B\/L Draft \(TST2699-01_DRAFT REV\.pdf\) で S\/I と同じ/.test(out.acl.why),'相違 + B/L 訂正済み = 「参考（B/L で訂正済み）」 (빨강 내림)',out.acl);
  out={acl:cell('diff'), bl:{s:'done', why:'FD 作成済 (B/L 確定後)'}, fd:{s:'done', why:'FINAL DOCUMENT あり'}}; DOC.aclLater(out,{blFix:{ok:false}});
  ok(out.acl.s==='done'&&out.acl.ref===V.LATER&&out.acl.honLater===true&&/FINAL DOCUMENT/.test(out.acl.why),'B/L 로 못 정해도 FD 済 = 参考（後の段階で確認済み）',out.acl);
  out={acl:cell('todo',{why:'照合結果なし · 本登録まだ'}), bl:{s:'done', why:'B/L 発行済'}, fd:{s:'wait'}}; DOC.aclLater(out,{});
  ok(out.acl.s==='done'&&out.acl.honLater&&!/本登録まだ/.test(out.acl.why),'本登録 まだ + B/L 発行 = 「—（後の段階で確認済み）」');
  out={acl:cell('diff'), bl:{s:'todo'}, fd:{s:'wait'}}; DOC.aclLater(out,{}); ok(out.acl.s==='diff'&&!out.acl.ref,'뒤 단계 없음 · B/L 확인 없음 = 相違 그대로');
  out={acl:cell('done',{hon:{at:'x'}}), bl:{s:'done'}, fd:{s:'done'}}; DOC.aclLater(out,{}); ok(!out.acl.ref,'本登録 済 = 그대로');
  out={acl:{s:'wait', why:'ACL (DR) 未着'}, bl:{s:'done'}, fd:{s:'done'}}; DOC.aclLater(out,{}); ok(out.acl.s==='wait','ACL 파일 없음 = 그대로');
  ok(V.HON_LATER==='本登録: —（後の段階で確認済み）'&&/c&&c\.honLater\?DOC\.V26\.HON_LATER/.test(HTML),'ACL 탭 本登録 줄 = 「—（後の段階で確認済み）」');
  ok(/aclRefFix\(DOC\.aclWordFix\(aclViewFix\(/.test(HTML)&&/av-concl av-note">参考 — 直すところだった/.test(HTML),'ACL 탭 = 参考 띠 · 「直すところ」 빨강 내림');
  ok(/if\(seq===S\.loadSeq\) await aclBlFixRun\(seq\)/.test(HTML)&&/if\(!had&&S\.blRes\) delete S\.blRes\[iv\]/.test(HTML),'뒤따라 B/L 확인 (ACL 보다 새 Draft) · B/L 탭 결과에는 남기지 않음');
}

console.log('N19 낱말 단위 — 빠진 낱말만 빨강');
{ const si='1234567890#418/GPMT-BTNMT#DEPOSIT#SAMPLE-HOA PAPER JOINT STOCK COMPANY\n#ADD : LOT 1, SAMPLE PARK, SAMPLE PROVINCE, VIETNAM#+ 84 900000000#EMAIL:SAMPLE@EXAMPLE.TEST';
  const acl='1234567890#418/GPMT-BTNMT#DEPOSIT\n#SAMPLE-HOA PAPER JOINT STOCK\n#ADD : LOT 1, SAMPLE\nPARK, SAMPLE PROVINCE, VIETNAM\n#+ 84 900000000\n#EMAIL:SAMPLE@EXAMPLE.TEST';
  const t=DOC.wordDiffTable(acl, si); ok(t.n===1&&(t.html.match(/av-hl/g)||[]).length===1&&/<span class="av-hl">COMPANY<\/span>/.test(t.html)&&!/なし/.test(t.html),'「COMPANY」 하나만 빨강 · 주소 · 전화 · 메일 줄 빨강 0 · （なし） 0',t.html);
  ok(DOC.wordDiffTable('ABC  DEF\nGHI','abc#def ghi').n===0,'# · 줄바꿈 · 공백 · 대소문자 = 같음');
  ok(DOC.wordDiffTable('SAMPLE CO LTD','SAMPLE CO., LTD').n===2,'다른 낱말 = 양쪽 빨강');
  const res={verdict:'相違', items:[{group:'S/I 文面',key:'notify',label:'Notify Party',status:'DROP',expected:si,actual:acl,detail:'脱落「COMPANY」 … JOINT STOCK [COMPANY] #ADD',kind:'脱落:Notify Party'},{group:'S/I 文面',key:'shipper',label:'Shipper',status:'NOTATION',expected:'LEENEAR CORPORATION\nTEL: +81-3-0000-0000',actual:'LEENEAR CORPORATION\n\nTEL: +81-3-0000-0000',detail:'改行・空白のみ違う',kind:'表記差:Shipper'}],
    final:{total:3, found:2, missing:[{text:'SAMPLE-HOA PAPER JOINT STOCK COMPANY',type:'text',kind:'文',group:'当事者',src:'notify',srcs:['notify'],srcLabel:'通知先',similar:'#SAMPLE-HOA PAPER JOINT STOCK',similarField:'notify'}], aclOnly:[], moved:[], sets:{total:0,ok:0,diff:[],read:[],aclOnly:[],cpOnly:[],allOk:true}, unread:[], byCntr:[], instr:{list:[],cntr:null,tent:[]}}, meta:{}, read:{fields:{}}, cp:{}};
  let h=''; try{ h=E.viewHtml(res,{admin:false, hon:'本登録: まだ', noTent:true, v22:true}); }catch(e){ h=''; }
  ok(!!h&&/（なし）/.test(h),'엔진 표시 (줄 맞춤) = 주소 줄까지 （なし） — 고치기 전',h.slice(0,200));
  const f=DOC.aclWordFix(h,res), blk=(f.match(/<div class="av-diff" data-key="notify">[\s\S]*?<\/table>/)||[''])[0];
  ok(blk&&(blk.match(/av-hl/g)||[]).length===1&&/>COMPANY</.test(blk)&&!/なし/.test(blk),'書類ツール = 「COMPANY」 만 빨강',blk.slice(0,400));
  ok(f.replace(/<table class="av-cols[\s\S]*?<\/table>/g,'')===h.replace(/<table class="av-cols[\s\S]*?<\/table>/g,''),'표 밖 (툴팁 · 결론 · 最終確認) 그대로');
  ok(/av-words/.test(f)&&(f.match(/av-words/g)||[]).length===2,'S/I 文面 표 2 개 (相違 · 表記差) = 낱말 표');
  let ha=''; try{ ha=E.viewHtml(res,{admin:true, hon:'本登録: まだ', noTent:true, v22:true}); }catch(e){}
  const fa=DOC.aclWordFix(ha,res), ba=(fa.match(/<div class="av-diff"[^>]*data-key="notify"[^>]*>[\s\S]*?<\/table>/)||[''])[0];
  ok(ba&&(ba.match(/av-hl/g)||[]).length===1&&/title="脱落「COMPANY」/.test(ba),'관리자 화면 (title 이 data-key 앞) 도 낱말 표 · 툴팁 그대로',ba.slice(0,300));
  ok(/blWordFix\(uiFix\(BLX\.viewHtml/.test(HTML)&&/wordDiffTable\(dr, si, 'B\/L Draft'/.test(HTML),'B/L Draft 탭도 같은 표시 (Draft 의 그 칸 ↔ S/I)');
}

console.log('N21 서명 그림 — 확인된 사람만');
{ const st=[{code:'BOSS',email:'boss@example.test',portal_admin:true,name_en:'Boss Kanri',sign_img:'D-00/lg/signatures/boss@example.test.png',sign_ok:true},
    {code:'STAFF_A',email:'tester@example.test',portal_admin:false,name_en:'Taro Yamada',sign_img:'D-00/lg/signatures/tester@example.test.png',sign_ok:true},
    {code:'STAFF_B',email:'b@example.test',portal_admin:false,name_en:'Hanako Sato',sign_img:'D-00/lg/signatures/b@example.test.png',sign_ok:false},
    {code:'STAFF_C',email:'c@example.test',portal_admin:false,name_en:'C',sign_img:''},
    {code:'STAFF_D',email:'d@example.test',portal_admin:false,name_en:'D',sign_img:'../MASTER/x.png',sign_ok:true}];
  const by={BOSS:'boss@example.test', STAFF_A:'boss@example.test', STAFF_B:'boss@example.test'};
  let s=DOC.signState(st,'TESTER@example.test',by); ok(s.ok&&s.path==='古紙/-. AI 活用/D-00/lg/signatures/tester@example.test.png'&&s.row.code==='STAFF_A','확인됨 (관리자가 마지막으로 바꿈) = 만듦 · 자기 그림',s);
  s=DOC.signState(st,'b@example.test',by); ok(!s.ok&&s.why===V.SIGN_NOT_OK,'sign_ok false = 「署名の画像がまだ確認されていません（管理者）」 → 안 만듦');
  s=DOC.signState(st,'tester@example.test',{STAFF_A:'tester@example.test'}); ok(!s.ok&&/管理者でない/.test(s.why),'직원이 ⚙ 로 true = 효과 없음 (마지막 변경자 = 관리자 아님)');
  s=DOC.signState(st,'tester@example.test',null); ok(!s.ok&&/版の記録/.test(s.why),'판 기록을 못 읽음 = 안 만듦 (안전 쪽)');
  ok(DOC.signState(st,'c@example.test',by).why===V.SIGN_NO_IMG,'그림 없음 = 「署名の画像を登録してください」');
  ok(!DOC.signState(st,'d@example.test',{STAFF_D:'boss@example.test'}).ok,'정해진 곳 (D-00/lg/signatures/) 밖 = 안 씀');
  ok(DOC.signState(st,'nobody@example.test',by).why===V.SIGN_NO_ME&&DOC.signState(st,'',by).why===V.SIGN_NO_ME,'마스터에 없는 사람 = 안 만듦');
  const vs=[{by:'boss@example.test',items:[{code:'A',x:2},{code:'B',x:1}]},{by:'staff@example.test',items:[{code:'A',x:1},{code:'B',x:1}]},{by:'boss@example.test',items:[{code:'A',x:1},{code:'B',x:0}]}];
  eq(DOC.rowLastChangers(vs),{A:'boss@example.test',B:'staff@example.test'},'줄마다 마지막으로 바꾼 사람 (판 기록)');
  eq(DOC.lgSignTarget({sign:'xl/media/image2.png'},['xl/media/image1.png','xl/media/image2.png']),'xl/media/image2.png','양식의 서명 그림 (cells.json sign)');
  ok(DOC.lgSignTarget({},['xl/media/image1.png'])===''&&DOC.lgSignTarget({sign:'xl/media/image9.png'},['xl/media/image1.png'])===''&&DOC.lgSignTarget({sign:'xl/worksheets/sheet1.xml'},['xl/worksheets/sheet1.xml'])==='','서명 자리 모름 = 안 만듦');
  eq(DOC.signFit(217,103,306,246),{cw:518,ch:246,dx:0,dy:0,dw:306,dh:246},'세로로 큰 그림 = 양식 비율의 판 (왼쪽 · 눌리지 않음)');
  eq(DOC.signFit(124,59,816,435),{cw:914,ch:435,dx:0,dy:0,dw:816,dh:435},'비율 맞춤 (가로 늘림)');
  eq(DOC.signFit(100,50,400,100),{cw:400,ch:200,dx:0,dy:50,dw:400,dh:100},'가로로 긴 그림 = 위아래 가운데');
  ok(/if\(!sg\.ok\) return \{stop:sg\.why\};/.test(HTML)&&/if\(!tpl\.sign\) return \{stop:DOC\.V26\.SIGN_NO_PLACE/.test(HTML),'앱: 확인 안 됨 · 서명 자리 모름 = LG 를 만들지 않음 (lgPrepare)');
  ok(/if\(!cur\.sign\|\|!cur\.sign\.bytes\|\|!cur\.sign\.target\|\|!z\.file\(cur\.sign\.target\)\) throw new Error\(DOC\.V26\.SIGN_NOT_OK\); z\.file\(cur\.sign\.target, cur\.sign\.bytes\);/.test(HTML),'앱: lgBuild = 서명 없으면 예외 · 있으면 그 그림만 바꿈 (다른 사람 서명으로 나가는 일 0)');
  /* 바꿈 — 앱의 lgBuild 와 같은 순서 (그 그림만 · 社印 · 그림 위치 · 시트 그대로) */
  const z=new JSZip(), seal=Buffer.from('89504e470d0a1a0a0000000d49484452000000cd000000ce0806000000','hex'), old=Buffer.from('89504e470d0a1a0a0000000d49484452000000d9000000670806000000','hex'), mine=Buffer.from('89504e470d0a1a0a0000000d494844520000013200000f60806000000aa','hex');
  const drw='<xdr:wsDr><xdr:twoCellAnchor><xdr:from><xdr:col>7</xdr:col></xdr:from><xdr:pic><a:blip r:embed="rId1"/></xdr:pic></xdr:twoCellAnchor><xdr:twoCellAnchor><xdr:from><xdr:col>8</xdr:col></xdr:from><xdr:pic><a:blip r:embed="rId2"/></xdr:pic></xdr:twoCellAnchor></xdr:wsDr>';
  z.file('xl/media/image1.png',seal); z.file('xl/media/image2.png',old); z.file('xl/drawings/drawing1.xml',drw); z.file('xl/worksheets/sheet1.xml','<worksheet/>');
  const media=Object.keys(z.files).filter(n=>/^xl\/media\/[^/]+$/.test(n)), tg=DOC.lgSignTarget({sign:'xl/media/image2.png'},media); z.file(tg,mine);
  const re=await JSZip.loadAsync(await z.generateAsync({type:'nodebuffer'}));
  ok(Buffer.compare(await re.file('xl/media/image2.png').async('nodebuffer'),mine)===0&&Buffer.compare(await re.file('xl/media/image1.png').async('nodebuffer'),seal)===0&&(await re.file('xl/drawings/drawing1.xml').async('string'))===drw,'서명 그림만 바뀜 · 社印 · 그림 위치 (drawing) 그대로');
  /* 관리자 화면 — 확인 표 · 「確認済みにする」 = 그 줄의 sign_ok 만 (LEENAI.master.upsert) */
  const W=X.world(); W.staff=[{code:'STAFF_A',name_ja:'山田 太郎',name_en:'Taro Yamada',email:'tester@example.test',active:true,portal_admin:false,sign_img:'D-00/lg/signatures/tester@example.test.png',sign_ok:false},{code:'BOSS',name_ja:'管理 者',name_en:'Boss',email:'boss@example.test',active:true,portal_admin:true}];
  W.metaId={'古紙/-. AI 活用/MASTER/master_staff.json':'MS1'}; W.versions={MS1:[{id:'v2',by:'boss@example.test',items:W.staff}]};
  const w=await X.page(W,{email:'boss@example.test'}); const set=w.__btns.find(b=>/設定/.test(b.label)); set.onClick(); await X.sleep(20);
  ok(!!w.document.getElementById('dtSignAdm'),'관리자 설정 = 「署名の画像の確認（管理者）」');
  w.document.getElementById('dtSignAdm').click(); await X.until(()=>qa(w,'[data-signok]').length>0);
  ok(/TARO YAMADA/.test(w.document.getElementById('dtModalBox').textContent)&&/まだ確認されていません/.test(w.document.getElementById('dtModalBox').textContent),'표 = 직원 · 영문 이름 · 그림 · 상태');
  qa(w,'[data-signok]')[0].click(); await X.until(()=>(W.upserts||[]).length>0);
  const u=W.upserts[0]; ok(u.n==='staff'&&JSON.stringify(u.k)==='{"code":"STAFF_A"}'&&u.row.sign_ok===true&&u.row.sign_img===W.staff[0].sign_img&&u.row.email==='tester@example.test','確認済みにする = master_staff 의 그 줄 sign_ok 만 (다른 칸 그대로)',u);
  const W3=X.world(); const w3=await X.page(W3,{email:'tester@example.test'}); w3.__btns.find(b=>/設定/.test(b.label)).onClick(); await X.sleep(20);
  ok(!w3.document.getElementById('dtSignAdm')&&!(W3.upserts||[]).length,'직원 = 버튼 없음 · 마스터 쓰기 0');
}

console.log('N23 依頼者名 = name_en');
{ eq(DOC.lgPerson({name_en:'Miyu  Oba '}),'MIYU OBA','대문자 · 공백 정리 (실제 ONE LG 와 같은 모양)'); eq(DOC.lgPerson({}),'','없으면 빈칸');
  const cells={vessel:'D10', bl:'D12', person:['A37','依頼者名: {v}']};
  let v=DOC.lgValues({cells, blocks:[], bl:'TST000001', vessel:'SAMPLE STAR', today:'2026-11-26', person:'TARO YAMADA'}); ok(v.person.v==='TARO YAMADA'&&!v.person.need,'name_en 있음 = 그 이름 · 確認 아님');
  v=DOC.lgValues({cells, blocks:[], bl:'TST000001', vessel:'SAMPLE STAR', today:'2026-11-26', person:''}); ok(v.person.v===''&&v.person.need,'없음 = 빈칸 + 確認 (지금처럼)');
  ok(/person:\(cur\.sign&&cur\.sign\.person\)\|\|''/.test(HTML),'앱: 로그인한 사람의 name_en');
}

console.log('N26 제목 · 본문');
{ const pat={mail:{mode:'new', head:['テストライン株式会社','ご担当者様',''], subj:'[LG付き訂正依頼:{BL}]', body:['BL NO.{BL}につきまして、','LG通りご訂正をお願いできますでしょうか。'], att:'LG({BL}).xlsx', to:['amend@carrier.example.test'], cc:[]}};
  let m=DOC.lgMailDraft({pat, carrier:'TESTLINE', iv:'TST2699-01', bl:'TST000001', bkg:'TSTBK01', vessel:'SAMPLE STAR S434', blocks:[{label:'NOTIFY PARTY', before:'A', after:'B'}], att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
  eq(m.subject,'[LG付き訂正依頼:BL#TST000001] SAMPLE STAR S434 / TST2699-01','제목 = 실적 모양 + B/L + 本船 · 航海 + Invoice');
  ok(!/■|（訂正前）|（訂正後）/.test(m.body)&&/^テストライン株式会社\nご担当者様\n\nいつもお世話になっております。\n\nBL NO.TST000001につきまして、\nLG通りご訂正をお願いできますでしょうか。\n\n何卒よろしくお願い申し上げます。$/.test(m.body),'본문 = 大場 방식 그대로 (정정 목록 없음)',m.body);
  m=DOC.lgMailDraft({pat:{mail:Object.assign({},pat.mail,{subj:'[LG訂正依頼]BKG#{BKG}', att:'TESTLINE_LG({BKG}).xlsx'})}, iv:'TST2699-01', bl:'', bkg:'TSTBK01', vessel:'SAMPLE STAR S434', blocks:[], att:'x', rcpDom:'example.test'});
  eq([m.subject,m.block],['[LG付き訂正依頼:BL#TSTBK01] SAMPLE STAR S434 / TST2699-01',''],'B/L 없음 = BKG (v0.28 N34: 모든 선사 같은 머리)');
  m=DOC.lgMailDraft({pat:{mail:Object.assign({},pat.mail,{subj:'[LG付き訂正依頼]'})}, iv:'TST2699-01', bl:'TST000001', vessel:'SAMPLE STAR S434', blocks:[], att:'x', rcpDom:'example.test'});
  eq(m.subject,'[LG付き訂正依頼:BL#TST000001] SAMPLE STAR S434 / TST2699-01','번호 없는 모양 = BL# 를 붙임');
  const rp={mail:{mode:'reply', head:['{CARRIER}','ご担当者様',''], subj:'<LG訂正の依頼>', body:['BL#{BL}'], att:'REPLYLINE_LG({BL}).xlsx', to:[], cc:[]}};
  m=DOC.lgMailDraft({pat:rp, carrier:'REPLYLINE', iv:'TST2699-01', bl:'TST000001', vessel:'SAMPLE STAR S434', blocks:[], src:{id:'MSG1', subj:'RE: Draft B/L TST000001'}, att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
  eq([m.mode,m.subject,m.block],['reply','[LG付き訂正依頼:BL#TST000001] SAMPLE STAR S434 / TST2699-01 Re: Draft B/L TST000001',''],'Draft 스레드 답장 = 「Re:」 앞에 같은 머리');
  m=DOC.lgMailDraft({pat:rp, carrier:'REPLYLINE', iv:'TST2699-01', bl:'TST000001', vessel:'SAMPLE STAR S434', blocks:[], src:{id:'MSG1', subj:'Re: <LG訂正の依頼> BL#TST000001 SAMPLE STAR S434 / TST2699-01 Re: Draft'}, att:'TST2699-01_LG.xlsx', rcpDom:'example.test'});
  eq(m.subject,'[LG付き訂正依頼:BL#TST000001] SAMPLE STAR S434 / TST2699-01','이미 머리 (옛 선사 모양 포함) = 두 번 안 붙임');
  ok(/件名に別の Invoice/.test(DOC.lgAttCheck('LG(TST000001).xlsx','[X:TST000001] V / TST2699-02',{bl:'TST000001', iv:'TST2699-01'},'[X:TST000001] V / TST2699-02')),'첨부 검사 = 제목 머리의 Invoice (다른 Invoice = 막음)');
  eq(DOC.lgAttCheck('LG(TST000001).xlsx','[X:TST000001] V / TST2699-01 Re: TST2699-09',{bl:'TST000001', iv:'TST2699-01'},'[X:TST000001] V / TST2699-01'),'','머리 밖 (원래 메일 제목) 의 번호는 보지 않음');
  ok(/vessel:cur\.vessel, blocks:cur\.blocks/.test(HTML),'앱: 本船 · 航海 = S/I 의 本船');
}

console.log('쓰기 · 보내기');
{ const app=HTML.split('<script id="doc-app">')[1]||'';
  ok((app.match(/LEENAI\.master\.upsert\(/g)||[]).length===1&&/upsert\('staff',\{code\},Object\.assign\(\{\},cur,\{sign_ok:on\}\)/.test(app),'마스터 쓰기 = 관리자 「確認済みにする」 의 staff sign_ok 한 곳뿐');
  ok(/if\(!S\.me\.admin\)\{ toast\('管理者だけです'/.test(app),'관리자만 (화면 · 함수 둘 다)');
  ok(!/\/send(Mail)?['"]|sendMail\(/.test(HTML.replace(/guardMail[\s\S]{0,400}/,'')),'보내는 코드 없음');
  /* 화면 한글 0 = hangul.js */
}
console.log((fail?'FAIL':'PASS')+' v26 — pass '+pass+' fail '+fail); process.exitCode=fail?1:0;
})().catch(e=>{ console.log('FAIL v26 예외',e.stack); process.exitCode=1; });
