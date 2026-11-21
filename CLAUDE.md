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

1. **버전** — `index.html` 의 `const CFG = { … version:'x.y' … }` **1곳** + `<title>` 을 같이 올린다. `tests/run_all.js` 의 check 버전도. (v0.3 = 2026-11-20 · v0.4 = 2026-11-21)
2. **푸터** 「✦ Powered by LEENAI Automation System」 유지.
3. 고칠 때마다 **전체 문법 · 앞뒤 흐름을 다시 검토** (`node tests/check.js` + 해당 화면 흐름 시험).
4. **기존 TOOL 은 건드리지 않는다** — D-01 · D-02 · D-03 · D-04 · C-01 · `CONTRACT_SEND` (acl_bench · a1_bench · compass_write_test) 는 새 창으로 여는 것만.
5. **쓰기 문지기**
   - SharePoint 쓰기 = `spPut` 하나 → `DOC.guardOut` (`古紙/-. AI 活用/D-00/doc_tool/` 아래만 · `conflictBehavior=fail` · 덮어쓰지 않음).
   - COMPASS 쓰기 = `dvWrite` 하나 → `DOC.guardDv` (S/I · S/I 명세 · 이 계약 · 정해진 칸 · PATCH(`If-Match:*`)/POST 만 · DELETE 없음). S/I 탭 「COMPASS に書き込む」 만 쓴다.
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
| ACL 대조 (acl_bench v0.6) | `CONTRACT_SEND/acl_bench.html` `<script id="acl-core">` | `7df63d17288cba2d2e96553b5ea4f8c1a19174f9` | `8425c88030dc369efbfc5c8a9bb6afa51f1f516722ccc9ee266f2aed2bd92345` |
| S/I 추천 (a1_bench v0.12) | `CONTRACT_SEND/a1_bench.html` (a1-core · a1-d01 · a1-master · a1-app) | `435799c54de2718d069c6a9fe1090eb0148ae70f` | `4afe49f70c9389e5ce0cbe13df276fe2ca9b1a300d82076b2b6b8e83e5887efd` |

- 엔진을 못 읽으면 (raw 막힘 · sha256 다름) 직원 화면은 「今は使えません。社長に連絡してください」 만, 이유와 시험 페이지 버튼은 관리자에게만.
- v0.3: ACL 파일 고르기 (`aclPick` — DR · ACL-번호 · 本登録 · 仮 …) · 本登録 메일 판단 (`mailKind`) · 결과 화면 (`viewHtml` — acl_bench 결과 화면과 같은 것) 도 엔진에서. 엔진은 **현황판을 열 때** 읽는다 (못 읽으면 ACL 칸 = ?).
- 엔진을 바꾸면 `tests/engine.js` 가 새 커밋 원문을 읽는다 (CONTRACT_SEND 클론 or raw) — `acl.js` 의 「CONTRACT_SEND/acl_bench.html 그대로」 시험은 클론이 고정 커밋일 때 통과.
- v0.4: 엔진 v0.6 의 **最終確認** (`res.final` — S/I 내용 항목이 ACL 어딘가에 다 있는가 + 컨테이너 세트) 를 ACL 탭 맨 위에 · 현황판 ACL 상태는 doc-core 표 `ACL_RULE` · `aclJudge` (相違 = 本登録 메일 없음 + 足りない · 세트 違う · Description 외 칸별 相違 / final 없는 옛 결과는 v0.3 규칙).
- T/T 계약 S/I 추천은 AI 없이 이 TOOL 안에서 (`DOC.ttRecommend`).

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
