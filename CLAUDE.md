# CLAUDE.md — DOC_TOOL (D-00 書類ツール)

> 어느 PC 의 토르 (회사 Windows · 집 Mac) 든 이 레포를 열면 이 파일을 먼저 읽는다.
> **이 파일 · 레포에는 키 · 토큰 · 비밀번호 · 실제 거래 값 (계약 · Invoice · LC · 바이어 실명 …) 을 넣지 않는다.** 공개 레포다.

✦ Powered by LEENAI Automation System

---

## 1. 이 TOOL

| 항목 | 내용 |
|---|---|
| 이름 | D-00 書類ツール (서류 담당 통합 TOOL · 시험 운용판) |
| 주소 | https://mhlee205.github.io/DOC_TOOL/ (GitHub Pages · `main` 직접) |
| 쓰는 사람 | 형님 (관리자 · `portal_admin`) · 서류 담당자 (마스터 「書類担当」) |
| 설계 · 지시서 | 리나이 (LEENAI CHAT) → Drive `LEENAI(CLAUDE)/1. THOR/` 의 지시서 → 끝나면 `D-00 D영역통합/` 에 보고서 |
| 공통 파일 | LEENAI_COMMON v1 (`leenai-common.js` · `.css`) — 로그인 · 마스터 · 헤더 · **테마 4모드** (v0.3: 한 번도 고르지 않은 브라우저는 LEENAI 모드로 시작 — 키 `leenai_theme` 는 쓰지 않음) |

## 2. 레포 구조

```
index.html        ← TOOL 전부 (script 3개: 공통 로더 · doc-core (순수 로직 · node 시험 대상) · doc-app (통신 · 화면))
tests/            ← node 시험 (네트워크 없음 · 가짜 데이터만)
CLAUDE.md         ← 이 파일
README.md
```

## 3. 시험

```bash
cd tests && npm install && node run_all.js     # 마지막 줄 ✅ ALL PASS 면 통과
```

- **Windows 는 `git clone -c core.autocrlf=false`** (줄 끝이 바뀌면 sha256 시험이 깨짐 — v0.16 토르_8). **CONTRACT_SEND 는 고정 커밋으로 시험** — 클론을 아래 §5 의 ACL 엔진 커밋 (`git checkout 980b6f4`) 에 맞춘 뒤 `node run_all.js` (v0.17).

- 필요: node 18 이상. `acl.js` · `si.js` 는 엔진 원문을 `../../CONTRACT_SEND` 클론에서 `git show` 로 읽고, 없으면 raw 주소에서 받는다 (`ACL_REPO=경로` 로 바꿀 수 있음).
- `theme.js` 는 `../../LEENAI_COMMON` 클론이 있으면 `theme_fx.css` 가 지금 공통 파일과 같은지도 본다 (없으면 생략).

## 4. 지켜야 할 규칙

1. **버전** — `index.html` 의 `const CFG = { … version:'x.y' … }` **1곳** + `<title>` 을 같이 올린다. `tests/run_all.js` 의 check 버전도. (v0.3 = 2026-11-20 · v0.4 = 2026-11-21 · v0.5 ~ v0.9 = 2026-11-22 · v0.10 ~ v0.15 = 2026-11-23 · v0.16 · v0.16.1 · v0.17 · v0.18 = 2026-11-24)
2. **푸터** 「✦ Powered by LEENAI Automation System」 유지.
3. 고칠 때마다 **전체 문법 · 앞뒤 흐름을 다시 검토** (`node tests/check.js` + 해당 화면 흐름 시험).
4. **기존 TOOL 은 건드리지 않는다** — D-01 · D-02 · D-03 · D-04 · C-01 · `CONTRACT_SEND` (acl_bench · a1_bench · compass_write_test) 는 새 창으로 여는 것만.
5. **쓰기 문지기**
   - SharePoint 쓰기 = `spPut` 하나 → `DOC.guardOut` (`古紙/-. AI 活用/D-00/doc_tool/` 아래만 · `conflictBehavior=fail` · 덮어쓰지 않음).
   - **v0.15 상태 기억** = `doc_tool/state/{fd|fname|si_lc}/{키}_{UTC}[_rand].json` (`DOC.statePath` · 문지기 `V15.STATE_RE` · 새 파일만) — 今日やること 코드의 SharePoint 쓰기는 `stateWrite` 한 곳.
   - COMPASS 쓰기 = `dvWrite` 하나 → `DOC.guardDv` (S/I · S/I 명세 · 이 계약 · 정해진 칸 · PATCH(`If-Match:*`)/POST 만 · DELETE 없음). S/I 탭 「COMPASS に書き込む」 만 쓴다.
   - **v0.9 ACL 保存** = 같은 `spPut` 에 `save={iv, folder, test}` → `DOC.guardSave` — 시험 = `doc_tool/save_test/{IV}/` · 본번 = 그 Invoice 폴더 (書類作成中 · _OLD_DOC) · 이름은 `{IV}_ACL.pdf` / `{IV}_ACL REV.pdf` / `REV2` … 만 (v0.12: B/L Draft 는 `save.kind='BL'` → `{IV}_FRT MEMO.pdf` / `… REV.pdf` / `REV2` 만). 새 파일만 (`conflictBehavior=fail` · 409 → 다음 이름을 다시 확인).
   - MASTER (`master_*.json`) 는 쓰지 않는다. confirm / alert 쓰지 않는다.
6. **실제 값은 레포에 넣지 않는다** — 시험은 가짜 번호 (`TEST…` · `2699` · `example.test`). 실제 자료 확인 스크립트는 레포 밖 (PC 의 작업 폴더) 에서 돌리고, 결과는 숫자만 보고서에.
7. **보안 grep** — push 전에 `ghp_ · github_pat_ · sk-ant · client_secret · AKIA` 0 (check.js 가 index.html 을 본다 · 새 파일도 직접 grep).
8. 상태 규칙은 `doc-core` 의 표 (`NAME` · `NA` · `REQ_SI` · `FD_TENT` · `CT_REAL` · `CT_PERIODS` · `TT_PO`) 에 모은다 — 직접 판단은 보고서 「⚠️ 자체 판단」 에 적는다.
   - **ACL 이름 규칙은 이 레포에 두지 않는다** (v0.3) — acl_bench 엔진의 `aclScan` · `aclPick` 을 `DOC.useAclEngine(E)` 로 받아 쓴다 (규칙 1곳). 고칠 때는 CONTRACT_SEND 에서 고치고 아래 커밋 · sha256 을 바꾼다.
   - **ACL 済 = 本登録 메일** (v0.3 형님 D3) — 로그인한 사람의 메일함 (`me/messages` · `$search "本登録"` · **읽기만**) 에서 회사 도메인 사람이 보낸 「本登録お願いします」 (엔진 `mailKind`) + 메일 CSV (`mail_docstaff` · 本登録依頼). 메일 주소 · 이름은 코드에 넣지 않는다 (도메인 = 로그인한 사람에게서).
9. 색은 CSS 변수만 (`theme.js` 가 하드코딩 색 0 · 4모드 대비를 계산). 상태 5색은 `<style>` 맨 위 표 2개.

## 5. 엔진 출처 (복사하지 않고 커밋 고정 + sha256 으로 불러 씀)

| 엔진 | 파일 | 커밋 | sha256 |
|---|---|---|---|
| ACL 대조 (acl_bench v0.16 · v0.18 T-1) | `CONTRACT_SEND/acl_bench.html` `<script id="acl-core">` | `980b6f46cd64766cf914d0edaa7caad8695cbb24` | `5ea7f23aa2c3957d2af9eee7e81c1b290d16a14406798f32f06fc1c6fe25048f` |
| B/L Draft 대조 (bl_bench v0.4 · v0.18 T-4) | `CONTRACT_SEND/bl_bench.html` `<script id="bl-core">` (+ ACL 엔진을 `BL.useEngine`) | `980b6f46cd64766cf914d0edaa7caad8695cbb24` | `1b650b00eff5a912af021236cade2244363fbe67ad93591edbe912a9ff34f5c6` |
| S/I 추천 (a1_bench v0.12) | `CONTRACT_SEND/a1_bench.html` (a1-core · a1-d01 · a1-master · a1-app) | `435799c54de2718d069c6a9fe1090eb0148ae70f` | `4afe49f70c9389e5ce0cbe13df276fe2ca9b1a300d82076b2b6b8e83e5887efd` |

- 엔진을 못 읽으면 (raw 막힘 · sha256 다름) 직원 화면은 「今は使えません。社長に連絡してください」 만, 이유와 시험 페이지 버튼은 관리자에게만.
- v0.3: ACL 파일 고르기 (`aclPick` — DR · ACL-번호 · 本登録 · 仮 …) · 本登録 메일 판단 (`mailKind`) · 결과 화면 (`viewHtml` — acl_bench 결과 화면과 같은 것) 도 엔진에서. 엔진은 **현황판을 열 때** 읽는다 (못 읽으면 ACL 칸 = ?).
- 엔진을 바꾸면 `tests/engine.js` 가 새 커밋 원문을 읽는다 (CONTRACT_SEND 클론 or raw) — `acl.js` 의 「CONTRACT_SEND/acl_bench.html 그대로」 시험은 클론이 고정 커밋일 때 통과.
- v0.4: 엔진 v0.6 의 **最終確認** (`res.final` — S/I 내용 항목이 ACL 어딘가에 다 있는가 + 컨테이너 세트) 를 ACL 탭 맨 위에 · 현황판 ACL 상태는 doc-core 표 `ACL_RULE` · `aclJudge` (相違 = 本登録 메일 없음 + 足りない · 세트 違う · Description 외 칸별 相違 / final 없는 옛 결과는 v0.3 규칙).
- T/T 계약 S/I 추천은 AI 없이 이 TOOL 안에서 (`DOC.ttRecommend`).
- v0.6: 엔진 v0.8 — コンテナ別記載の指示 ✓ 면 S/I 컨테이너 줄 = 있음 (`final.byCntr`) · S/I `（仮）` = 미확정 (`res.siTentative` · 판정 그대로 · 「参考」 한 줄 — 書類ツール 은 `viewHtml(…,{noTent:true})` 로 받고 자기 줄을 냄 · 같은 모양 `DOC.SI_TENT` = 엔진 `TENT_RE`).
- **COMPASS 조회 칸 (lookup) 의 표시값 (FormattedValue) 을 이름으로 쓰지 않는다** (v0.6) — 판매계약의 国 · POD · Buyer, 명세의 品目, 부킹의 선사 · 乙仲 은 상대 표의 이름 칸이 `cr49f_id` (번호) 라 표시값이 `7` · `31` 같은 번호. 이름은 상대 표에서 읽는다 (国 = `cr49f_buyers.crcf9_country` · POD = `cr49f_regions.cr49f_pod` · ITEM = `cr49f_items.cr49f_item` — PORTAL 「販売契約」 과 같음). 선택지 칸 (`cr49f_pay_cls` 등) 의 표시값은 괜찮다.

- **v0.7 今日やること (첫 화면)** — 규칙 · 표 · 낱말은 doc-core `DOC.TODO_RULES` **한 곳** (영업시간 · 공휴일 · 고정 마감 · FD +2/+1 · 후불 7곳 · 75% 상수 (선사만) · 메일 용도 / 종류 낱말 · 묶음 · 버튼). 계산 = `todoSignals` (신호 시각) → `todoRow` (Invoice 마다 지금 단계 하나 · 규칙표 v0.4) → `todoGroup` · `todoSort`. 乙仲 · 바이어별 75% 값은 SharePoint `D-00/todo_replay/thresholds_75.json` 을 읽음 (이름을 코드에 넣지 않음).
  - 메일은 **로그인한 사람의 메일함 GET 만** (35일 · 10조각 병렬 · 보내기 · 초안 · 읽음 0). 공유 메일함 (사진 · Draft 받는 곳) 은 주소 · 권한이 없어 읽지 않고 폴더 Draft 파일로 대신.
  - `crcf9_bl_etd` (B/L date) 는 **미리 들어 있는 일이 많다** (실측 200 건 중 193 · 앞날 71) — 「B/L 받음」 = 선사 B/L 메일 · 또는 B/L date 18:00 지남 + 앞 단계 신호 (선불 = 송금 · 후불/FOB = B/L 의뢰 · Draft). 지불일도 앞날이면 안 씀 (지금보다 뒤 신호 0).
  - `?asof=YYYY-MM-DDTHH:MM` (관리자만) = 그 시각 전 신호만으로 계산 (시험 · 비교용).

- **v0.8** — 엔진 v0.9 (표기 P1 · 읽기 P2 · 담당자 메일 판단 · Shipper's Mail 빈칸 = 参考 · 本船変更 = 相違 + 「本船変更依頼」 · L/C JSON 대조 · ACL 이 S/I 보다 더 적은 것 = 参考 · Description `*` 넘침 단락 이어 붙이기).
  - **ACL 메일 下書き** = doc-core `DOC.ACL_MAIL` (문구 표 한 곳) · `DOC.aclMailDraft(res, ctx)` → 本登録 A / 訂正 A (칸마다 前 → 後) / 訂正 B (표시 칸 · 本船変更) · 제목 태그 자동. **보내기 0** — 화면 · 복사 · Outlook 에서 원래 ACL 메일 (webLink) 열기까지. S/I ↔ L/C 차이는 메일에 넣지 않음.
  - 담당 칩 = master `staff` 이름 전체 · 보조 = staff 의 `doc_role` = `書類補助` (기간 칸 없음) → 「{이름}・補助」 (= 서류 일 전체). 표시가 없으면 「補助（書類全体）」.
  - 今日やること: B/L 받은 건의 FD = 「本日」 묶음 (期限切れ 다음) · 다음 영업일이면 「昨日 B/L 受領」.
  - **고칠 때 주의**: 이미 있는 코드 줄 끝에 `//` 주석을 붙이지 말 것 (같은 줄 뒤의 코드가 주석이 되어 사라진 일이 3번) — 주석은 따로 줄로.

- **v0.9 保存の入口** — 규칙 · 종류 표 · 이름은 doc-core `DOC.SAVE_RULES` **한 곳** (`saveKind` · `saveCands` · `saveJudge` · `saveBump` · `guardSave` · `textKeyOf`). 입구 2 개 → 처리 1 개:
  - 입구 A 메일 = 로그인한 사람의 메일함 **GET 만** (최근 5 영업일 · 첫 읽기 후 1 번 + 「メールを確認」) · 회사 도메인 (담당자) 이 보낸 메일은 뺌 · 輸出許可 첨부는 안 냄 · `save_log` 에 있는 메일 id + 첨부는 다시 안 냄.
  - 입구 B 놓기 = 화면 어디든 PDF · ACL 탭에서 놓으면 그 Invoice 먼저 (Booking 다르면 경고).
  - 판단: 같은 해시 = 重複 · 같은 글자 = 同じ内容 · 아니면 다음 판 (옛 이름 파일도 1 판으로 셈). 기본 = 확인 (「保存する」) · 관리자 스위치 「確実なら確認なしで保存」 (기본 끔) · 「試験モード」 (관리자 · 저장 = `save_test/`).
  - 저장 기록 = `doc_tool/save_log/{yyyymmdd}/{stamp}_{IV}_{rand}.json` (1 건 = 새 파일 1 개 · 追記 없음).
  - 메일 확인을 두 번 눌러도 한 번만 (`SAVE.mailSt==='load'` 이면 무시) — 동시에 두 번 돌면 같은 첨부가 2 줄이 된다.

- **v0.11 체크포인트** — 마스터 `master_checkpoint` (基本 = 엔진 항목 `engine_key` · 追加 = 줄의 `left` · `op` · `right` 를 엔진 `CP_OPS` 로 실행) · `master_port_alias` 를 `cpLoad` 가 읽어 `compareOne(…, {checkpoints})` 에 넘긴다 (못 읽으면 넘기지 않음 = 엔진 v0.10 과 같은 결과).
  - 承認の安全装置 = 承認者 + **그 줄의 마지막 변경자** (SharePoint 판 기록 `cpVersions` — 공통 마스터 `history` 에는 「어느 줄」 이 안 남음) 가 `portal_admin`. 가장 새 판은 `versions/{id}/content` 가 400 → 현재 파일 `items/{id}/content` 로 읽는다.
  - 一覧 (`cpListModal` · 직원 = 基本 + 有効 追加 · 관리자 = 전부) · ACL 결과 `data-cp` → `cpDetailModal` · 見落とし報告 = `D-00/checkpoint_reports/{yyyymmdd-hhmmss}_{코드}.json` · 確認済み = `.ack.json` (새 파일만 · `DOC.guardOut`) · 관리자 배지 `#dtCpRep` · 今日やること 띠 (`DOC.cpNewFor` · 7 일 · 「確認した」 = localStorage `doc_tool_cp_seen`). 메일 · Teams 자동 발송 없음.
- **v0.12 B/L Draft 탭** — 기존 「B/L Draft」 탭 = 照合 (bl-core `judgeInvoice` · 기준 = COMPASS + L/C 보관소 · ACL 은 참고 · 운임 금액 비교 없음 · 체크포인트 stage `BL_DRAFT` = `cpLoad` 마스터). v0.13: 결과 = `doc_tool/bl/{IV}_{UTC}.json` (「照合する」 · 保存の入口 본번 뒤 · 새 파일만 · 試験モード는 안 씀 · 今日やること 신호에는 아직 안 씀) · 「前回の照合」 = 가장 새 1 건 (읽기만).
  - 메일 下書き 3 = doc-core `DOC.BL_MAIL` (문구 표 한 곳) · `DOC.blMailDraft(res, type, ctx)` — `fix` 선사 정정 (`[訂正依頼BL#{B/L No}]`) · `ok` 「Draft OK」 (원 Draft 메일 Re:) · `buyer` (`[B/L Draft for {IV}]` · 베트남 = Deposit 한 줄). 받는 사람 = 메일함에서 (선사 = Draft 메일 보낸 사람 · 바이어 = 전에 바이어에게 보낸 메일의 받는 사람) · 없으면 빈칸. **보내기 0**.
  - バイヤー用 Draft = bl_bench bl-app `buildBuyerPdf` 의 사본 (출처 커밋 주석) — 확인 문구 → 운임 가린 이미지 PDF → **이 PC 에 내려받기만**. 当社書類 쪽 뺌 · B/L 쪽 없음 = 「別に取得」.
  - pdf.js `cmaps` = jsdelivr 3.11.174 (`CMAPS` · cdnjs 는 403).
- **v0.13 일본어화** — 직원 화면 · 메일 下書き · 저장 JSON 에 **한글 0** (`tests/hangul.js` 가 index.html 의 문자열 · HTML 을 봄 · 주석 · 정규식 제외). bl-core v0.3 의 판정 = 영문 코드 (class `SAME` · `DIFF` … / L/C `SAME` · `DIFF_ABBR` · `NA_…` …) · 칸 이름 = 코드 (`Consignee bank` · `Vessel/Voyage` · `Container …`) — 화면 글자는 엔진의 표 (`CLASS_JA` · `LC_RES` · `FIELD_JA` · `LC_JA`) · 메일 칸 이름은 `DOC.BL_MAIL` 의 표 (코드가 열쇠).
  - `#dtModal` 은 `#app` 밖 — 공통 파일 init 이 붙이는 `display:none` 을 startPage 에서 뗀다 (v0.12 · 지우면 창이 안 보임).
- **v0.14 사용성 (할 일 화면 · 판단 · 保存の入口 · 속도)** — 지시서 `MAC-THOR_1_지시서_D00_사용성개선_v1_0`.
  - 판단 (doc-core `todoSignals` · `todoRow` — 나머지는 v0.13 그대로): 1-1 COMPASS 지불일이 들어 있으면 (앞날 포함) 송금 처리 끝 = `S.payPlan` → 「B/L 発行依頼」 (「送金 予定 m/d」 · asof 시험은 전과 같음) · 1-2 베트남 Draft + Deposit 회답 대기 = 待ち · バイヤー · 1-3 대기는 늘 「待ち」 (기준 넘으면 `nudge.over` → 催促メール) · 1-4 乙仲 ACL 訂正依頼 (`TODO_RULES.ACLFIX_HEAD` — 담당이 보낸 메일 제목 머리말) 뒤 새 ACL 없음 = 待ち · 乙仲 「訂正 ACL 待ち」 (`S.aclFix` · `S.aclLast`).
  - 화면: `TODO_RULES.TGROUPS` (key · 구역 do/wait · 이름 · 한 줄 안내 · 매뉴얼 장) **한 곳** · `ZONES` · `MANUAL` (직원 매뉴얼 링크만 — 원본은 리나이) · `todoGroup` = 색 (late 빨강 · today 주황 · later 회색 · none / 待ち = chase · wait) · `todoDone` = 今日終わったもの. 줄 = `.tl-row` (기한 · Invoice · 船社 · 国 · 次にやること · 理由 · 버튼) · 진행 칩은 상세 (단계 탭) 에서만.
  - 保存の入口: `SAVE_RULES.OPEN_RE` (펼치는 판단) · `REMEMBER` (取消 · 重複 · 同じ内容 → save_log 에 기록 → 다음엔 그 첨부를 건너뜀) · 이름 + 크기가 폴더 파일과 같으면 안 내려받음 (=重複) · **保存済み 파일을 못 읽으면 「再確認」** (v0.13 까지는 새 판으로 잘못 봄 · 429 때 실제로 생김) · 할 일 0 = 한 줄.
  - 속도: COMPASS 뒤 바로 할 일 화면 (`PERF.mark('first')`) → 폴더 = `graphBatch` (Graph `$batch` · 안은 GET 고정 · 20 개씩 · 4 묶음 동시 · 실패 → 1 건씩) · 폴더 내용 기억 = localStorage `doc_tool_folders_v14` (폴더의 변경 시각 · 크기 · 개수가 같고 24 시간 안이면 안 읽음) · 메일은 첫 화면 직후 (今日やること 35 일 동시 3 · 保存の入口 첨부 2 — 메일함 동시 4 넘으면 429) · `PERF` (longtask) = 할 일 화면 맨 아래 한 줄.
  - `check.js`: `$batch` 줄 1 개 · 안 GET 고정이면 쓰기로 세지 않음. 가짜 세계 (`fake.js`) 도 `$batch` 를 GET 으로 풀어 처리.
- **v0.15 수정 묶음 (지시서 `MAC-THOR_5_지시서_D00_書類ツール_v0.15`)** — 규칙 · 낱말 · 표는 doc-core `DOC.V15` **한 곳**.
  - A1 `TODO_OPEN_DEF.zone_wait:false` (待ち 구역 처음 접힘 · 펼침 = localStorage `doc_tool_todo_open_v14`) · A2 `SAVE_RULES.REMEMBER` 에 `対象外`.
  - L/C 도착 = 보관소 (`_READ`) 또는 `古紙/LC/{年}/` (`loadLcOrig` · 연도 = 계약 번호 · 아니면 계약일 · `DOC.lcArrival` 'na' · 'yes' · 'no' · '?' — 못 읽으면 '?' 로 「未着」 이라 하지 않음). 未着 → 「推薦を作る」 끔 · 안내 `DOC.lcGuide` · 待ち 이유 「L/C 未着 · PO 着 m/d」 (`loadPo` = 바이어 폴더 · ★LC/{cr49f_buyer} 의 `PO…{계약}` 파일 · 뒤에서).
  - 仮 S/I = `DOC.ttRecommend({…, lcTent:true})` (T/T 부품 그대로 · L/C 칸 `XXX` · L/C 로만 정해지는 문장 `V15.LC_ONLY_RE` 는 그대로 + 「仮 — L/C 着で確認」) → 지금의 쓰기 경로. **S/I L/C 번호에 `XXX` 가 들어 있으면 (일부만이라도 · 공백 · 대소문자 무시 · `XX` 만은 아님) = 仮 S/I** (형님 추가 지시 · 실례 `…825XXX DATED ON …`) (`siLcTent` · `siTentAny` — （仮） 와 같은 취급).
  - 仮 S/I + L/C 도착 → S/I 칸 相違 「L/C 着 · S/I 未更新」 + 今日やること `si` 그룹 빨강 · 推薦 뒤 `siLcOrder` (L/C 칸 먼저 · 빨강) · XXX 가 없어지면 `state/si_lc/{계약}` → 그 계약 Invoice 의 ACL 이 그보다 옛 照合이면 「ACL 再確認」.
  - B7 FD 메일 검색 = `fdSearchRun` (현황판 FD 칸 済 아님 · ETD 지남 · 통관 뒤 · 최대 40 · 동시 2 · 같은 Invoice 6 시간에 1 번 = localStorage `doc_tool_fdsearch_v15` · 모든 메일 읽기가 끝난 뒤) → `DOC.fdMailFound` → `state/fd/{IV}` → `x.fdState` (현황판 FD 済 · 今日やること 신호). `?asof` 시험에서는 안 씀.
  - B10 `DOC.fnameCheck` (선사 · 乙仲 이름 = `V15.FNAME_REF` 参考) · 판단 `state/fname` (`this` = 그 Invoice 이름으로 읽음 `fnameFix` · `other` · 메일 `ack`) · B11 `DOC.fdMailBad` (첨부 번호가 **제목의 어느 Invoice 번호와도** 다를 때 · `subjIvs` 가 `NA2610-03/04/06` 줄임 번호를 펼침 — 실자료 헛경보 15 → 0) · `DOC.fdDraftCheck` (FD 메일 초안 기능이 생기면 쓸 검사 · 지금은 초안 없음).
  - 今日やること 의 덧붙임 줄 = `DOC.todoExtra` (Invoice 의 단계 줄과 따로 · `fname` · `si` 그룹 · `red` = 빨강).
- **v0.16 Invoice 別 = PORTAL 「船積書類」 と同じ表 (지시서 `THOR_8_지시서_D00_書類ツール_v0.16_PORTAL동일표`)** — 규칙 · 열 · 선택지 · 경로는 doc-core `DOC.PT` **한 곳**.
  - 기본 = 「PORTAL と同じ」 (`LS.ivMode` = `doc_tool_iv_mode_v16` · 'portal' | 'etd'). 「ETD 範囲で見る」 = v0.15 표 그대로 (ETD 범위 · FD済み 숨김 · 열도 그대로). 담당 칩은 둘 다.
  - 줄 = PORTAL `loadShipping` 과 같음 (`DOC.ptRows`): 부킹 `cr49f_etd` 今日 -90 〜 +180 (`$orderby=cr49f_etd asc&$top=500` · `loadPortalBk` · 첫 화면 뒤) → IV 「L」 시작 뺌 · `shipping[IV].fd_date` 있으면 뺌 · ETD (B/L ETD 우선) 가 今日 -30 보다 앞이면 뺌 · 빈 ETD 남김 · 순서 = ETD (빈 것 먼저). **PORTAL 에는 「通関依頼済」 줄 조건이 없다** (제목 글자뿐 · 通関 열은 ✅ 표시만).
  - 열 = `PT.COLS` (ETD(E) · ETA(E) · CY_CUT · 通関 · POL · IV_NO (아래 작은 글씨 계약번호) · BKG本 · CNTR · SHIP · BKG_NO · 担当者) → 판정 칩 `PT.CHIPS` (ACL · B/L Draft · 保険 · RR) → 입력 `PT.INPUTS` (DEP · 振込 · FD送付日 · 備考). POL = `crcf9_region_japans.crcf9_pol` · 없으면 `crcf9_region_japan` (PORTAL `fetchPolMap` 그대로) · 「, JAPAN」 뺌. 通関 ✅ = `records[IV].tsukan_irai` 또는 CY_CUT ≤ 2026-08-17. BKG本 = `crcf9_container_informations` 수. 担当者 = 書類ツール 마스터 (`docStaff`) · PORTAL 방식 (`DOC.ptStaff`) 과 다르면 「PORTAL: …」 표시만.
  - DEP = 베트남만 선택 (`PT.DEP_OPTS` 未 · 依頼中 · 確認) · 값이 「未」 면 書類ツール 판정 (済 · 待ち · —) 을 밑에. 振込 `PT.FURI_OPTS` (未 · 確認済) · FD送付日 date · 備考 text (`fd_note`) — 칸을 바꾸면 (change) 바로 저장.
  - **저장 = `ptSave`** — 직전에 `?$select=id,eTag` + 내용 다시 읽기 → `DOC.ptMerge` (그 Invoice 그 칸 + `updated_by` + `last_updated` 만 · `JSON.stringify(…,null,2)` = PORTAL 과 같은 문자 모양) → `spPut(path, text, type, {portal:true, ifMatch})` (같은 PUT 한 줄 · `DOC.guardOut` → `guardPortal` = `PT.PATH` · `PT.TEST_PATH` 만 · eTag 없으면 거부). 412 → 다시 읽고 1 번 · 그래도 → 「他の人が更新しました — もう一度」. 같은 값이면 쓰지 않음.
  - 試験モード (관리자 · 保存の入口 과 같은 스위치) = 저장 경로 `doc_tool/save_test/clearance_status_test.json` (사본 — 없으면 저장 안 함 · 실파일로 넘어가지 않음).
  - 提案 = FD送付日 빈칸 + TOOL 이 FD 송부를 찾음 (`todoSignals` 의 `fd` · `fdSrc` — 메일 · 폴더 · 메일 검색) → 흐린 「提案 날짜」 + 「入力」 (누를 때만 저장 · 자동 저장 0).
  - **v0.16.1 한 화면** (추가지시서 `THOR_8_추가지시서_D00_書類ツール_v0.16.1_한화면`) — PORTAL 표일 때만 `#dtMain.pt-full` (max-width 없음 · 양옆 16px) · `#dtTable.pt-wide` (overflow visible → 열 머리 `position:sticky` 가 헤더 (`.ln-header`) 바로 아래 · `--pt-top` = 헤더 높이) · 표 `.dt-t.pt-t` (12px · 칸 여백 4/5px · 줄 높이 약 33px · **CSS 는 `.dt-t.pt-t` 로 써야 `.dt-t th/td` 를 이김**). 날짜 `DOC.ptDateS` (올해 MM/DD · 다른 해 YY/MM/DD). 1 줄: 계약번호 · ETA · CNTR · BKG_NO = IV_NO title · 担当 차이 = ＊ (title) · DEP 판정 · 提案 = 같은 줄. 備考 120px · 누르면 320px (표 폭 그대로).
    · 넘치면 `ptFit` 가 `PT.FOLD` 순서 (ETA → CNTR → BKG_NO · class `f-eta` …) 로 접음 (resize 때 다시). ETD 範囲 · 상세 화면은 원래 폭 (`ptWideUi`). 폭 시험 = `tests/width.js` (실제 Chrome · `npm i --no-save puppeteer-core@23.11.1` · 없으면 SKIP) — 1,920 · 1,905 접기 0 · 1,366 · 1,351 넘침 0.
  - ⚠ PORTAL (v4.8) 은 지금도 **파일 전체를 eTag 없이** 덮어쓴다 — PORTAL 을 열어 둔 채 오래 있다가 저장하면 그 사이 書類ツール 이 저장한 값이 지워질 수 있다 (PORTAL 코드는 이번에 고치지 않음).
- **v0.18 (지시서 `THOR_11_지시서_D00_엔진v0.16_書類ツールv0.18` · 형님 D1 ~ D7)** — 엔진 먼저 (CONTRACT_SEND `980b6f4` · acl_bench v0.16 · bl_bench v0.4) → 그 커밋을 고정. 규칙 · 낱말 = doc-core `DOC.V18`.
  - T-1 乙仲様式 ACL — `scanAiFor(E, raw, fmt)`: 스캔 = `{sha256}.json` (NACCS) → 아니면 `{sha256}.other.json` · 글자 있는 OTHER = `.other.json` 만 (모두 acl_bench 가 만든 저장본 · 書類ツール 은 AI 0) → 「AI 判読 (乙仲様式) · 様式 … · この様式にない欄 n（対象外）」.
  - T-2 FD 까지 끝난 계약 (`ctFdDone` = 읽은 그 계약 선적이 모두 FD 済) 의 仮 S/I = 参考 (`judgeCt({fdDone})` → S/I 칸 済 + 「参考 — FD まで済んだ契約の 仮 S/I」 · 「L/C 着 · S/I 未更新」 안 띄움).
  - T-3 保存の入口 — 담당 (회사 주소) 이 보낸 메일의 **FD · TO BANK 첨부만** (`V18.STAFF_KINDS`) · Invoice = 제목 (묶음 번호 포함) → 첨부 이름 (`DOC.staffDoc`) · 첨부 번호가 제목의 어느 것과도 다르면 저장 안 함: 5 영업일 안 = 빨강 「添付名が違う」 (FD 済여도 · 今日やること 의 「送付済み · 添付名が違う」 도 5 영업일 안이면 FD 済여도 빨강) · 그 전 = 「参考（添付名が違う）」.
  - T-4 bl_bench v0.4 의 `res.otherCt` (Draft 의 다른 계약번호) → B/L 탭 (엔진 화면) · 今日やること 빨강 (`blLatestLoad` = 저장된 최신 B/L 결과 · 이 화면의 照合).
  - T-5 ACL 탭 = 엔진 `pastMistakes` (`ACL_bench/otsunaka_mistakes.json` · 읽기만 · `loadPast`) → 「この乙仲の過去の誤記 n 件（参考）」 + 목록 (乙仲 이름 · 번호 · 양식 이름으로 찾음).
- **v0.17 수정 묶음 (지시서 `THOR_9_지시서_D00_書類ツール_v0.17` · 묶음 v0.5 B9 · D · E1 · F · G + 11/24 형님 결정 H)** — 규칙 · 낱말은 doc-core `DOC.V17` **한 곳** (+ `SAVE_RULES.DOCS`).
  - H1 Invoice 別 (PORTAL と同じ) 줄 = **通関依頼済 만** (`DOC.ptRows(…, records)` · `ptTsukan` = `records[IV].tsukan_irai` 또는 CY_CUT ≤ 2026-08-17) — PORTAL 은 안 고침 → 줄 수가 PORTAL 과 다른 것은 의도. 제목 「船積書類（通関依頼済 / FD送付日未入力）」.
  - H2 저장 = 바로 저장 그대로 + 칸 옆 「✓ 保存」 1.5 초 (`ptMark` · `PTSAVE.marks` — 표를 다시 그려도 `ptMarksApply` 가 붙임) · 실패 = 빨강 「保存できません」. H4 부킹 = `dvAll` (`$top` 없음 · nextLink 끝까지 · PORTAL 은 그대로 500).
  - G3 FD 済 (FD送付日 · FD 메일 · 폴더 FD · 메일 검색 = `ivFdDone`) Invoice 의 「ファイル名の番号違い」 · 「添付名が違う」 = 参考 → 今日やること 에 안 띄움 (`todoExtra` 의 `x.fdDone`) · Invoice 요약에 「参考」 한 줄 (`ivRefLines`).
  - G4 仮 S/I = L/C 번호에 `X` 2 개 이상 연속 (`V17.LC_TENT_XX` · 공백 그대로의 모양) 또는 공백 뺀 `XXX` (v0.15) · 「LC No 未確定 (XX)」 는 仮 S/I 로 합침.
  - E1 S/I · ACL (읽은 칸) 에 이 계약과 다른 `LRS-\d{4}[A-Z]+\d+` → 빨강 「別の契約番号: …」 (`DOC.otherCts` · `judgeCt` 에 `ct` · S/I 탭 · 今日やること `si` 그룹 · ACL 탭 맨 위). B/L Draft 는 아직 (엔진 결과에 글자 없음).
  - G10 ACL 엔진 = acl_bench v0.14 `6d57a01` · **스캔 ACL** = `ACL_bench/_scan_ai/{sha256}.json` (acl_bench 가 AI 2 회로 만든 저장본) 을 읽어 `E.scanMerge` → NACCS 와 같은 대조 (`scanAiFor` · 「AI 判読 (スキャン)」 · 書類ツール 은 AI 를 부르지 않음 · 저장본 없으면 読取対象外 「AI 判読なし」). 토르_10 이 끝나면 그 커밋으로 다시.
  - B9 保存の入口 = ACL · B/L Draft + **FD · TO BANK · IV · PL** (`SAVE_RULES.KINDS` · `DOCS` · `docKind` · 이름 `{IV}_FD.pdf` · `{IV}_TO BANK.pdf` · `{IV}_IV.pdf` · `{IV}_PL.pdf` → `REV` · `REV2` · 덮어쓰기 0 · 문지기 `guardSave` 가 이름 확인). 종류는 이름으로 (FD PDF 에 B/L 쪽이 있어도 FD) · IV+PL 묶음 · 운임 청구서 (`DOC_NOT`) = 저장 안 함. Invoice = 이름 · 제목 → PDF 안 글자 (`saveCands(…, {doc:true})`) → 목록에서 고르기.
  - F1 Invoice 別 칩: 「待ち」 = 상대 차례만 (`turnFix` — ACL = 通関書類 보낸 뒤 · B/L Draft = 本登録 뒤 · DEPO 번호 · LG 뒤) · 나머지 = 「未」 (`ST.not` · 회색 `.st-not`). F2 保険 = 「未（B/L 受領後に申込）」 / B/L 받은 뒤 「確認」.
  - F4 화면 시각 = 일본 시간 `jstHM` (「11/23 21:56」) · 履歴 = `logLabel` · L/C MD 의 ISO 시각도. F6 계약 L/C 탭 = 요약 표 (`DOC.lcSummary` · Amend n (날짜) 反映済み) + Amend PDF (`古紙/LC/{年}/…_AMEND{n}.pdf`). F8 チェックポイント 「実例」 = 마스터 `example` (근거 Invoice · 한글 부분은 안 보임 · `DOC.cpExample`).
  - 1-2 문구 표 = 지시서 일본어 그대로 (D1 ~ D15 · F3 · F5 · F7 · F9 · F10 · B1). 개발 정보 (읽기 완료 내용 · 메일 통수 · 初回表示 · 「表示中」 · L/C 읽기 창 머리 · a1_bench · D-01 버튼 · S/I 추천 엔진 · 비용) = **관리자만** (`S.me.admin`). D15 띄어쓰기: 일본어 글자 사이 공백 없음 (영숫자 앞뒤 · 「·」 · 「＋」 는 그대로) · 엔진 결과 화면은 `uiFix`.
  - 今日やること 왼쪽 칸 = 항상 기한 (`whenLabel` 「期限 11/25」 · 「期限切れ 11/21」 · 「期限なし」) · 시각 · 사건 날짜 = 둘째 줄 (`whenSub`) · 待ち = 「70 時間待ち（いつもは 2 時間）」.
- **v0.10 L/C 보관소** — L/C 는 SharePoint `古紙/LC/_READ/{계약}.json` (schema `lc_read/1` · A1 R2 2 회 판독을 코드로 정리 · 계약마다 1 개 · Amend 오면 다시 판독 → 옛 판은 `_old/`) 에서만 읽는다. **D-01 폴더 (`D-01-LC_FD_CHECKER`) 는 읽지 않는다.**
  - `DOC.SRC.lc` · `loadLcFiles` (`_` 로 시작하는 파일 · 폴더는 건너뜀) · `readLcJson` · 「LC 読み取り」 = `{계약}.md` 를 `DOC.mdHtml` 로 (글자는 전부 escape) · `aclFetchCompass` 의 부킹 `$select` 에 `cr49f_etd,crcf9_bl_etd` (엔진 v0.10 의 船積期限 照合).
  - 보관소 만들기 · 새 L/C 1 건 판독 = CONTRACT_SEND `tools/lc_read_build.mjs` · `tools/lc_read_one.mjs` (토르 · 리나이가 PC 에서 실행 · 이 TOOL 은 읽기만).

## 6. 시작 · 끝 순서 (어느 PC 든)

1. Drive `LEENAI(CLAUDE)/1. THOR/THOR_작업현황.md` 를 **먼저 읽는다**. 다른 PC 가 「작업 중」 이면 **시작하지 않고 형님께 보고**.
2. 작업 현황에 「작업 중: {PC} · {시각} · {무엇}」 한 줄.
3. `git pull origin main` (없으면 `git clone https://github.com/MHLEE205/DOC_TOOL.git`) · `CONTRACT_SEND` 도 pull.
4. 작업 → `node tests/run_all.js` ALL PASS → 보안 grep.
5. 커밋 (`git -c user.name="THOR" -c user.email="…" commit` · 메시지 `[D-00] 書類ツール vX → vY — …`) → `git push origin main`.
6. Pages 크기 = raw 크기 확인 → Drive `D-00 D영역통합/DOC_TOOL_vX_Y.html` 사본 (이전 판은 `OLD-TOOL/`).
7. 보고서 (`D-00 D영역통합/(날짜)THOR_보고서_D00_書類ツール_…md`) · 작업 현황 「끝」 + HEAD.

원칙: **PC 에는 아무것도 남기지 않는다** — 코드 = GitHub · 지시서 · 보고서 · 작업 현황 = Drive · 자료 = SharePoint.

---
✦ Powered by LEENAI Automation System
