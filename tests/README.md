# DOC_TOOL 시험 (tests/)

`DOC_TOOL/index.html` (D-00 書類ツール) 을 node 로 시험한다. **네트워크 없음** — LEENAI 공통 · Dataverse · Graph(SharePoint) 를 가짜로 바꾼다. **가짜 데이터만** (example.test · TEST 번호).

```bash
cd tests && npm install && node run_all.js
```

- 필요: node 18 이상 · jsdom 30.1.2 · pdf-lib 1.17.1 · pdfjs-dist 3.11.174 (package.json 에 고정)
- 마지막 줄이 `✅ ALL PASS` 면 통과

| 파일 | 내용 |
|---|---|
| `check.js` | 문법 · `version:'0.3'` 1곳 · 공통 파일 1회 · confirm/alert 0 · 보안 grep 0 · 푸터 · 쓰기 경로 문지기 (SharePoint PUT 은 `spPut` 하나 · `DOC.guardOut` 먼저) |
| `core.js` | 상태 규칙 표 (칸마다 済 · 確認 · 相違 · 待ち · — · ?) · 대상 외 · 담당 기호 · 정렬 · 범위 · B/L 파일 고르기 |
| `app.js` | jsdom 화면 흐름 — 현황판 → 상세 → 탭 → 돌아가기 · 검색 → 상세 · 담당 기억 · 관리자 · 설정 · P1 쓰기 0 |
| `acl.js` | #6 ACL 탭 — acl_bench 엔진 (v0.3: v0.5 `903d923`) 을 커밋 고정 + sha256 으로 공유 · 한 건 대조 = 엔진 직접 (판정 · 항목 하나하나) · 쓰기 doc_tool/ 아래 PUT 2건 · 메일 열기만 · sha256 다르면 멈춤 · acl_bench 그대로. 엔진 원문은 `CONTRACT_SEND` 클론 (`ACL_REPO=` · 기본 `../../CONTRACT_SEND`) 의 git show, 없으면 raw 주소 |
| `si.js` | #7 S/I 탭 — a1_bench v0.12 엔진 (커밋 고정 + sha256) 으로 계약 1건 추천 (가짜 Anthropic · LC 는 글자) → 고침 → 취소하면 0 → 쓰기 전 控え → POST/PATCH (문지기) → 다시 읽기 일치 · 履歴 (推薦 ↔ 最終) · sha256 다르면 AI 0 |
| `si_fx.js` | a1_bench 시험 harness 의 가짜 LC · S/I · Anthropic 응답 (CONTRACT_SEND/tests/a1_bench/harness.js @435799c 에서 줄 그대로 복사 · 가짜 데이터) |
| `acl_fx/` | acl_bench 시험의 가짜 NACCS · 가짜 COMPASS (CONTRACT_SEND/tests/acl_bench @243897d 에서 복사 · 가짜 데이터) |
| `fake.js` | 가짜 세계 (COMPASS · SharePoint · LEENAI) |
| `v02.js` | v0.2 수정 9건 — #1 「FD済みは表示しない」 (기본 ON · 끄기 · 기억 · 契約別 규칙 · 건수) · #2 탭 상태 점 · 「いまここ」 · 상태 칸을 누르면 그 탭 · #3 ACL 이름 (DR · ACL-번호 · 本登録 · 仮 · 제외 · 우선순위) · #5 T/T 추천 (AI 0 · 직전 S/I · PO 5경우 · 명세 · 쓰기 순서) · #6 出港済 · #7 관리자 버튼 · #8 전환 순서 |
| `theme.js` | v0.2 #9 색 모드 4가지 — 공통 테마 버튼 그대로 · 색은 변수만 · 4모드 대비 계산 (글자 4.5 · 점 3) |
| `v03.js` | v0.3 — #4 ACL 화면 (결론 1줄 · 확인한 항목 전부 · 相違만 펼침 · 내부 이름 관리자만) · #5 本登録 메일 (메일함 me/messages 읽기만 · 회사 도메인만 · 相違 + 本登録 → 済 「相違のまま本登録」 · 읽기 실패 → 메일 CSV 로 대체 + 표시) · #6 FD 이름 흔들림 · 임시본 제외 · 대만향 하위 폴더 IV · PL · B/L 묶음 · #7 契約別 (계약일 역순 · 기간 4 · 열 · TEST01 제외 · ETD/FD 조작 숨김) · #8 처음 색 LEENAI (키 안 씀) · 엔진 못 읽음 → ? |
| `v04.js` | v0.4 — #6 현황판 ACL 상태 4경우 (待ち · 相違 = 足りない · セット違う · Description 외 칸별 相違 · 確認 · 済) · `ACL_RULE` 표 · `aclJudge` (final 없는 옛 결과 = v0.3 규칙) · 엔진 고정 v0.6 · ACL 탭 맨 위 最終確認 (+ 本登録) · 툴팁 「最終確認 ✓ / ✗ n」 · 내부 이름 관리자만 |
| `v05.js` | v0.5 — 상세를 누른 순간 「読み込み中…」 (탭 · 내용은 그 뒤) · 큰 결과 (가짜 results.json 23 MB 이상) 로 현황판 · 상세 열기 시간 (2 초 기준) · 두 번 빨리 누름 → 마지막 것만 · 계약 상세도 「読み込み中…」 · `S.perf` 기록 · コンテナ別記載の指示 ✗ = 相違 (aclJudge · 2 번 세지 않음 · ✓/ー 는 相違 아님) · 엔진 고정 v0.7 |
| `engine.js` | 시험용 — `index.html` 에 고정한 acl_bench 엔진 원문 (CONTRACT_SEND 클론 `git show` → 없으면 raw) · sha256 확인 · `useAclEngine` 에 넣을 엔진 |
| `theme_fx.css` | LEENAI_COMMON v1 테마 4모드 변수 (복사 — 로컬 클론이 있으면 같은지 확인) |
| `v14.js` | v0.14 사용성 — 판단 1-1 (지불일 = 송금 처리 끝 · 「送金 予定」) · 1-2 (베트남 Deposit 회답 대기 = 待ち · バイヤー) · 1-3 (대기 늘 보임 · 催促) · 1-4 (乙仲 ACL 訂正依頼 제목 · 訂正 ACL 待ち · 새 ACL → ACL 確認) · 그룹 순서 · 색 · 今日終わったもの · 화면 (세 구역 · 한 줄 · ？ 매뉴얼 · 0 건 한 줄 · 폴더 전 먼저) · 保存の入口 (할 일만 펼침 · 済み · 0 건 한 줄 · 取消/重複 기억 → 다시 열어도 안 나옴 · 이름+크기 같으면 안 내려받음 · 못 읽으면 再確認) · `$batch` (GET 만 · 실패 → 1 건씩) · 폴더 기억 (두 번째 = 바뀐 폴더만 · 깨진 기억 → 전부) |
| `v16.js` | v0.16 Invoice 別 = PORTAL 船積書類 — 열 순서 (PORTAL 글자) · 줄 조건 (L · FD送付日 · ETD -30 · 빈 ETD · 순서) · 担当者 (PORTAL 방식 · 다르면 표시) · DEP 우선순위 · 저장 = 그 칸만 (나머지 바이트) · eTag 412 → 1 번 재시도 (두 저장 남음) · 두 번 412 → 안내 · 提案 자동 저장 0 · 試験モード = 사본만 · 문지기 · ETD 範囲 버튼 = v0.15 표 |
| `width.js` | v0.16.1 한 화면 — 실제 Chrome (headless · puppeteer-core · 가짜 세계 99 줄 · 네트워크 0) 1,920 · 1,905 · 1,366 · 1,351 폭에서 페이지 가로 넘침 0 · 표 ≤ 틀 · 줄 높이 ≤ 34px · 1,920 접기 0 (19 열) · 열 머리 sticky · 備考 넓어짐 · ETD 範囲 = 원래 폭. Chrome / puppeteer-core 없으면 SKIP (`npm i --no-save puppeteer-core@23.11.1` · Chrome 경로 = `CHROME`) |
| `v15.js` | v0.15 수정 묶음 — A1 待ち 처음 접힘 · 펼침 기억 · A2 対象外 기억 (다시 안 나옴 · 첨부 안 내려받음) · B1 L/C 未着 (推薦 끔 · 안내 · D-01/a1_bench 문구 없음 · a1_bench 버튼 관리자만) · B2 待ち 이유 「L/C 未着 · PO 着」 · B3 仮 S/I (XXX · 「仮 — L/C 着で確認」 · 쓰기 확인 화면) · B4 XXX = 仮 S/I (XX · XXXX 아님 · ACL 参考) · B5 L/C 칸 먼저 · ACL 再確認 · B6 L/C 着 · S/I 未更新 · B7 FD 메일 검색 (`$search` · state/fd 기억 · 두 번째는 안 찾음 · 현황판 FD 済) · B8 선적서류 · B10 번호 違い (参考 · この Invoice のファイル → FD 済) · B11 添付名 (여러 Invoice 한 메일 = 違い 아님) · 초안 검사 · B12 試験 줄 관리자만 |
