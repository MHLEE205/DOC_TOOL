/* DOC_TOOL 시험 전부 — node run_all.js [html]. 마지막 줄 ✅ ALL PASS 면 통과. 네트워크 없음 · 가짜 데이터만 */
const cp=require('child_process'),path=require('path');
const html=process.argv[2]||path.join(__dirname,'../index.html');
const T=[['check.js','#8 기본 점검 (문법 · version · 공통 파일 · confirm/alert · 보안 grep · 푸터 · 쓰기 경로 문지기)',[html,'0.27']],
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
  ['v11.js','v0.11 チェックポイント — 규칙 (보고 이름 · 문지기 · 목록 · 거르기 · 새 체크 띠) · 직원/관리자 一覧 · 설명 · 見落とし報告 저장 · 배지 · 確認済み · ACL CP 번호 · 試験 줄 관리자만 · 엔진 v0.11 고정'],
  ['v13.js','v0.13 B/L 照合 결과 저장 (doc_tool/bl/ · 문지기 · 내용 · 前回の照合 · 試験モード 저장 없음) · 직원 화면 · 결과 JSON 한글 0'],
  ['v14.js','v0.14 사용성 — 판단 1-1~1-4 · やること / 待ち 그룹 · 한 줄 · ？ 매뉴얼 · 保存の入口 접기 · 기억 (取消 · 重複 · 同じ内容) · 再確認 · $batch · 폴더 기억'],
  ['v15.js','v0.15 수정 묶음 — A1 待ち 접기 · A2 対象外 기억 · B1~B6 L/C 未着 · 仮 S/I (XXX) · L/C 도착 갱신 · B7 FD 메일 검색 · B8 선적서류 · B10 · B11 파일 이름 번호 · B12 試験 줄'],
  ['v16.js','v0.16 Invoice 別 = PORTAL 船積書類 — 열 순서 · 줄 조건 · DEP 우선순위 · 저장 = 그 칸만 · eTag 충돌 재시도 · 提案 자동 저장 없음 · 문지기 · ETD 범위 버튼'],
  ['v17.js','v0.17 수정 묶음 — H1 通関依頼済 · H2 ✓ 保存 · H4 nextLink · G3 参考 · G4 XX = 仮 · E1 別の契約番号 · G10 엔진 6d57a01 + 스캔 ACL · B9 FD · TO BANK · IV · PL · F1 待ち/未 · F2 · F4 일본 시간 · F6 L/C 요약 · F8 実例 · 1-2 문구 표'],
  ['v18.js','v0.18 — T-1 엔진 v0.16 · bl v0.4 고정 · 乙仲様式 저장본 대조 · T-2 FD 済 계약 仮 S/I = 参考 · T-3 담당 FD · TO BANK (添付名が違う) · T-4 B/L 別の契約番号 · T-5 乙仲の過去の誤記'],
  ['v19.js','v0.19 — 업체 메일 下書き (大場 방식) · 本登録 · ACL訂正 · Deposit · Shipping docs en/ko/ja · 받는 사람 마스터/候補 · 첨부 번호 다름 = 안 만듦 · 문지기 (보내기 0) · 권한 없음 = コピー'],
  ['v20.js','v0.20 — 받는 사람 doc_to · doc_cc (비면 to · cc · 候補 없음) · 바이어별 제목 형 · 못 쓰면 기본 + 확인 · zip · 다른 번호 zip = 안 만듦 · 일본어 실제 원문 · 빈 칸 · 보내기 0'],
  ['v21.js','v0.21 — FD 탭 (fd_bench v0.1 · 試験 · 읽은 PDF) · TO BANK AI 자동 (키 없음 = 관리자 「AI 未実行」 · 2 회 · 저장본 · 비용 · 다시 안 부름) · 誤検知 기록 · 今日やること 배지 · 실적표 · S/I · ACL · B/L 試験 줄 · 문지기 · 엔진 고정'],
  ['v22.js','v0.22 — V1 서류 보기 (왼쪽 PDF · 오른쪽 결과 · ← → · 확대 · ⟲ ⟳ 180° 기억 · 글자 찾기) · V2 「👁 見る」 · V3 잘라낸 그림 · V4 순서 · V5 5 색 · V7 완료 접기 · V8 国内 한 곳 · 자동 기록 (fdHash) · K3 보험 AI · K4 FD送付日 · 문지기 · 엔진 고정'],
  ['v221.js','v0.22.1 — ②-1 試験 줄 1 묶음 (탭 3 번 오가도) · ②-2 CP-A04 相違 「L/C の文言で直す」 (확인 창 · 控え → payment_deadline 만 → 다시 읽기 → 履歴 · 문지기) · ②-3 推薦 · 仮 S/I = L/C 42C 원문'],
  ['v23.js','v0.23 — N8 메일 읽는 중 · 못 읽음 = 「メール確認中 / 未確認」 · 구간 다시 읽기 · N9 B/L 번호 연결 (접두어 · 여러 건) · B/L 受領 (폴더 · 후불 사본 · 발행 메일) · 「期限なし」 → 目安 · N10 「済にする」 · 元に戻す · 다른 창 · 관리자 모음 · N1 · N2 S/I 칸 빨강 · ✏ 直す (그 칸만 · 미리 채움) · N3 保存の入口 · N4 S/I 確認（相違）',[html]],
  ['v24.js','v0.24 — N15 Deposit 依頼 기한 = 通関依頼済 + 1 영업일 · 날짜 없음 = CY_CUT · 체크 전 = 通関待ち (빨강 0) · 新規通関依頼 메일 무시 · 通関 칸 · N11 lc42 = payTerm · N12 L/C 원문 · L/C と違います · L/C の文言に戻す',[html]],
  ['v25.js','v0.25 — LG 訂正依頼 · 선사별 칸 채우기 (시트 XML 만 · 서식 · 인감 그대로) · 모르는 칸 = 確認 · Deposit 찾기 · 넣기 · 판 번호 · 문지기 · 下書き 받는 사람 · 제목 · 첨부 검사 · 보내기 0 · 가짜 거래처',[html]],
  ['v26.js','v0.26 — N17 Invoice 別 通関依頼済 체크 (그 칸만 · at · off_at · eTag · C-01 · 통관 전 줄 스위치 · 試験モード) · N18 ACL 相違 → 参考 (B/L 訂正済み · 後の段階 · 本登録) · N19 낱말 단위 · N21 서명 (sign_ok · 관리자 확인 · 그 그림만 교체) · N23 name_en · N26 제목 · 본문 · 가짜 거래처',[html]],
  ['v27.js','v0.27 — N30 下書き = C-01 모양 (HTML · <br> · Meiryo · 서명 · 꼬리말 · 인사 · 실제 To/CC · 다시 읽기 확인 · 고장 = 「下書きの形が崩れています」) · N31 버튼 하나 · 参考 = 없음 · N27 S/I 계약 1 줄 · 회색 「—」 · 다 나간 계약 = 参考 · N28 · N29 엔진 · 가짜 거래처',[html]],
  ['width.js','v0.16.1 한 화면 — 실제 Chrome (headless) 1,920 · 1,366 폭에서 Invoice 別 가로 넘침 0 · 1 줄 높이 · 열 머리 고정 (Chrome · puppeteer-core 없으면 SKIP)'],
  ['hangul.js','v0.13 한글 0 — 화면에 나갈 수 있는 문자열 · HTML 본문 (주석 · 정규식 제외)'],
  ['v12.js','v0.12 B/L Draft 탭 — 保存の入口 B/L Draft (FRT MEMO · N版目 · 문지기) · 메일 下書き 3 · 엔진 고정 (ACL v0.12 · bl_bench v0.2) · 照合 화면 · CP 번호 · 試験 줄 관리자만 · バイヤー用 확인 · 쓰기 0'],
  ['v09.js','v0.9 保存の入口 — 종류 · Invoice 정하기 · 중복 / 같은 내용 / 새 판 · 이름 · 문지기 · 메일 (읽기만 · ED 제외 · 기록 건너뜀) · 놓기 · 409 · 기록 · 스위치 · 쓰기 범위']];
const fs=require('fs'); extra.forEach(([f,d])=>{ if(fs.existsSync(path.join(__dirname,f))) T.push([f,d,[html]]); });
let bad=0;
T.forEach(([f,d,a])=>{ let out='', okk=true; try{ out=cp.execFileSync(process.execPath,[path.join(__dirname,f)].concat(a),{encoding:'utf8',timeout:600000}); }catch(e){ okk=false; out=String(e.stdout||'')+String(e.stderr||''); }
  const last=out.trim().split('\n').pop(); if(!okk) bad++; console.log((okk?'PASS':'FAIL')+'  '+d+'  — '+last); if(!okk) console.log(out.split('\n').filter(l=>/FAIL/.test(l)).slice(0,20).join('\n')); });
console.log(bad?'❌ FAIL ('+bad+' / '+T.length+')':'\n✅ ALL PASS ('+T.length+' 항목)'); process.exitCode=bad?1:0;
