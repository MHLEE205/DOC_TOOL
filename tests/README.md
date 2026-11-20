# DOC_TOOL 시험 (tests/)

`DOC_TOOL/index.html` (D-00 書類ツール) 을 node 로 시험한다. **네트워크 없음** — LEENAI 공통 · Dataverse · Graph(SharePoint) 를 가짜로 바꾼다. **가짜 데이터만** (example.test · TEST 번호).

```bash
cd tests && npm install && node run_all.js
```

- 필요: node 18 이상 · jsdom 30.1.2 · pdf-lib 1.17.1 · pdfjs-dist 3.11.174 (package.json 에 고정)
- 마지막 줄이 `✅ ALL PASS` 면 통과

| 파일 | 내용 |
|---|---|
| `check.js` | 문법 · `version:'0.1'` 1곳 · 공통 파일 1회 · confirm/alert 0 · 보안 grep 0 · 푸터 · 쓰기 경로 문지기 (SharePoint PUT 은 `spPut` 하나 · `DOC.guardOut` 먼저) |
| `core.js` | 상태 규칙 표 (칸마다 済 · 確認 · 相違 · 待ち · — · ?) · 대상 외 · 담당 기호 · 정렬 · 범위 · B/L 파일 고르기 |
| `app.js` | jsdom 화면 흐름 — 현황판 → 상세 → 탭 → 돌아가기 · 검색 → 상세 · 담당 기억 · 관리자 · 설정 · P1 쓰기 0 |
| `acl.js` | #6 ACL 탭 — acl_bench v0.4 엔진을 커밋 고정 + sha256 으로 공유 · 한 건 대조 = 엔진 직접 (판정 · 항목 하나하나) · 쓰기 doc_tool/ 아래 PUT 2건 · 메일 열기만 · sha256 다르면 멈춤 · acl_bench 그대로. 엔진 원문은 `CONTRACT_SEND` 클론 (`ACL_REPO=` · 기본 `../../CONTRACT_SEND`) 의 git show, 없으면 raw 주소 |
| `acl_fx/` | acl_bench 시험의 가짜 NACCS · 가짜 COMPASS (CONTRACT_SEND/tests/acl_bench @243897d 에서 복사 · 가짜 데이터) |
| `fake.js` | 가짜 세계 (COMPASS · SharePoint · LEENAI) |
