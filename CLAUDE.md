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

- 필요: node 18 이상. `acl.js` · `si.js` 는 엔진 원문을 `../../CONTRACT_SEND` 클론에서 `git show` 로 읽고, 없으면 raw 주소에서 받는다 (`ACL_REPO=경로` 로 바꿀 수 있음).
- `theme.js` 는 `../../LEENAI_COMMON` 클론이 있으면 `theme_fx.css` 가 지금 공통 파일과 같은지도 본다 (없으면 생략).

## 4. 지켜야 할 규칙

1. **버전** — `index.html` 의 `const CFG = { … version:'x.y' … }` **1곳** + `<title>` 을 같이 올린다. `tests/run_all.js` 의 check 버전도. (v0.3 = 2026-11-20 · v0.4 = 2026-11-21 · v0.5 ~ v0.9 = 2026-11-22 · v0.10 = 2026-11-23)
2. **푸터** 「✦ Powered by LEENAI Automation System」 유지.
3. 고칠 때마다 **전체 문법 · 앞뒤 흐름을 다시 검토** (`node tests/check.js` + 해당 화면 흐름 시험).
4. **기존 TOOL 은 건드리지 않는다** — D-01 · D-02 · D-03 · D-04 · C-01 · `CONTRACT_SEND` (acl_bench · a1_bench · compass_write_test) 는 새 창으로 여는 것만.
5. **쓰기 문지기**
   - SharePoint 쓰기 = `spPut` 하나 → `DOC.guardOut` (`古紙/-. AI 活用/D-00/doc_tool/` 아래만 · `conflictBehavior=fail` · 덮어쓰지 않음).
   - COMPASS 쓰기 = `dvWrite` 하나 → `DOC.guardDv` (S/I · S/I 명세 · 이 계약 · 정해진 칸 · PATCH(`If-Match:*`)/POST 만 · DELETE 없음). S/I 탭 「COMPASS に書き込む」 만 쓴다.
   - **v0.9 ACL 保存** = 같은 `spPut` 에 `save={iv, folder, test}` → `DOC.guardSave` — 시험 = `doc_tool/save_test/{IV}/` · 본번 = 그 Invoice 폴더 (書類作成中 · _OLD_DOC) · 이름은 `{IV}_ACL.pdf` / `{IV}_ACL REV.pdf` / `REV2` … 만. 새 파일만 (`conflictBehavior=fail` · 409 → 다음 이름을 다시 확인).
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
| ACL 대조 (acl_bench v0.10) | `CONTRACT_SEND/acl_bench.html` `<script id="acl-core">` | `af46667bc4f4fcc4585180cfb8aeb76f26ff9c02` | `0bd7f29d19c417f2dedf2932e42630ed50db75b25dd2f21f10bf40783d9250dd` |
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
