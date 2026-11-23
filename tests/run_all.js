/* DOC_TOOL 시험 전부 — node run_all.js [html]. 마지막 줄 ✅ ALL PASS 면 통과. 네트워크 없음 · 가짜 데이터만 */
const cp=require('child_process'),path=require('path');
const html=process.argv[2]||path.join(__dirname,'../index.html');
const T=[['check.js','#8 기본 점검 (문법 · version · 공통 파일 · confirm/alert · 보안 grep · 푸터 · 쓰기 경로 문지기)',[html,'0.10']],
  ['core.js','#1~#5 상태 규칙 · 대상 외 · 담당 · 정렬/범위 · B/L 파일 고르기',[html]],
  ['app.js','#3 기억 · #4 · #9 화면 흐름 (현황판 → 상세 → 탭 → 돌아가기 · 검색 → 상세 · 설정 · 쓰기 0)',[html]]];
const extra=[['acl.js','#6 ACL 탭 — acl_bench 엔진 (v0.9) 공유 · 같은 결과 · DR 이름 · 관리자 버튼'],['si.js','#7 S/I 쓰기 — 쓰기 전 저장 → 쓰기 → 다시 읽기 · 취소 · S/I 済 지금 표 먼저'],
  ['v02.js','v0.2 #1 FD済み · #2 いまここ · #3 ACL 이름 · #5 T/T 추천 · #6 出港済 · #7 관리자 · #8 순서'],['theme.js','v0.2 #9 색 모드 4가지 · 대비 계산'],
  ['v03.js','v0.3 #4 ACL 화면 · #5 本登録 메일 · #6 FD 흔들림 · 대만 묶음 · #7 契約別 · #8 처음 색 LEENAI'],
  ['v04.js','v0.4 #6 현황판 ACL 상태 4경우 (最終確認 반영) · ACL 탭 最終確認 맨 위 · 툴팁'],
  ['v05.js','v0.5 상세 「読み込み中…」 먼저 · 큰 결과 (23 MB 규모) 열기 시간 · コンテナ別記載の指示 ✗ = 相違 · 엔진 v0.7 고정'],
  ['v06.js','v0.6 待ち 붉은 굵은 글자 · 契約別 이름 (번호 아님) · PORTAL 모양 · 기간 4 · （仮） 미확정 · 엔진 v0.8 고정'],
  ['v07.js','v0.7 今日やること — 지금 단계 하나 · 대상 외 · 기한 · 재촉 75% · 메일 분류 · 화면 · asof 관리자만 · 메일 쓰기 0'],
  ['v08.js','v0.8 엔진 v0.9 고정 · ACL 메일 下書き (本登録 / 訂正 A · B / 本船変更 · 태그 · 보내기 0) · 이름 전체 · 補助 · FD 本日 · 원본 통수'],
  ['v10.js','v0.10 L/C 保管所 — SRC · 목록 (_index · _old 건너뜀) · LC 読み取り = MD · MD → HTML (escape) · ACL 照合에 lc_read/1 · ETD · D-01 안 읽음 · 엔진 v0.10 고정'],
  ['v09.js','v0.9 保存の入口 — 종류 · Invoice 정하기 · 중복 / 같은 내용 / 새 판 · 이름 · 문지기 · 메일 (읽기만 · ED 제외 · 기록 건너뜀) · 놓기 · 409 · 기록 · 스위치 · 쓰기 범위']];
const fs=require('fs'); extra.forEach(([f,d])=>{ if(fs.existsSync(path.join(__dirname,f))) T.push([f,d,[html]]); });
let bad=0;
T.forEach(([f,d,a])=>{ let out='', okk=true; try{ out=cp.execFileSync(process.execPath,[path.join(__dirname,f)].concat(a),{encoding:'utf8',timeout:600000}); }catch(e){ okk=false; out=String(e.stdout||'')+String(e.stderr||''); }
  const last=out.trim().split('\n').pop(); if(!okk) bad++; console.log((okk?'PASS':'FAIL')+'  '+d+'  — '+last); if(!okk) console.log(out.split('\n').filter(l=>/FAIL/.test(l)).slice(0,20).join('\n')); });
console.log(bad?'❌ FAIL ('+bad+' / '+T.length+')':'\n✅ ALL PASS ('+T.length+' 항목)'); process.exitCode=bad?1:0;
