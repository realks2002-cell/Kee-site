# 행주기씨대종중 통합 시스템 — 진행 현황

> Phase 1 W1 목업 스프린트. **새 세션 진입 시 이 파일 먼저 읽고 시작.**
> 마지막 갱신: 2026-05-04

---

## 한 줄 요약

행주기씨대종중의 기존 시스템(MySQL 42,924명) → **Next.js 15 + Supabase** 리뉴얼 12주 / 7,550만원. 현재 **Phase 1 W1 목업 스프린트** 진행 중 (Day 1 + 검색·등록 mockup 완료, Day 2 진입 직전).

---

## 현재 상태 스냅샷

| 항목 | 값 |
|---|---|
| **단계** | Phase 1 W1 mockup, Day 1 100% + 보너스 작업 완료 |
| **Pipeline phase** | 3 (Do / Mockup) |
| **Level** | Dynamic (Supabase Auth + RLS) |
| **DB 인물 데이터** | 0건 (분파 6개 seed만) |
| **dev 서버** | http://localhost:4000 (포트 4000) |
| **Supabase Studio** | http://127.0.0.1:54323 |
| **GitHub** | https://github.com/realks2002-cell/Kee-site |
| **로컬 폴더** | `/Users/kenny/Desktop/Task/Kee-site` (이전 Ki-site에서 rename) |

---

## 완료된 작업 (시간순)

### Day 1 — Foundation
1. **Turborepo monorepo** + pnpm workspaces (apps/web + 4 packages)
2. **Next.js 15 App Router** + TypeScript strict + Tailwind CSS
3. **디자인 시스템**: `@hjkee/ui` Tailwind preset (어르신 친화 컬러·폰트·44px 터치 영역) + Pretendard / Instrument Serif / JetBrains Mono / Noto Serif KR
4. **도메인 패키지**: `@hjkee/domain`
   - branded types (PersonId, BranchId, ClanId 등)
   - `calculateGanji(year)` — 60갑자 자동 계산
   - `parseJokboBirthText` — "1962壬寅6월12일" 파싱
   - `chonsuToLabel` — 촌수 → 한국식 호칭
   - `suggestHanjaName` — 항렬자 자동 추천
5. **DB 패키지**: `@hjkee/db`
   - `createClient()` — 브라우저 (BrowserClient)
   - `createServerClientWithCookies()` — RSC/Route Handler
   - `createServiceClient()` — 서비스 롤 (RLS 우회, server-only)
6. **한자 패키지**: `@hjkee/hanja`
   - CJK Unified + Ext A~F 범위 판별
   - `requiresExtendedFont()` — 폰트 fallback 결정용
   - `collectUniqueHanja()` — 폰트 서브셋 collector
7. **Supabase 로컬** (Colima 기반):
   - 마이그레이션 5개: extensions / core_schema / search_trigger / rpc_functions / demo_helpers
   - 11개 `kee_*` 테이블 + 분파 6개 seed
   - 4개 함수: `kee_search_persons` / `kee_calculate_chonsu` / `kee_get_direct_lineage` / `kee_update_person_search` (trigger)
   - 자동 생성 TypeScript 타입 1002 라인
8. **도메인 컴포넌트 6개**: `PersonName`, `PersonCard`, `GenerationLabel`, `GanjiDisplay`, `AdoptionBadge`, `TreeNode`

### 기능 페이지 (8개 placeholder + 일부 동작)
9. 8개 라우트: `/persons/[id]/tree` (F01) / `/search` (F02) / `/adoptions` (F03) / `/chonsu` (F04) / `/sudan/new` (F05) / `/admin` (F06) / `/stats` (F07) / `/gaseungbo` (F08)
10. `/` 랜딩 + `/showcase` 디자인 시스템 검수 + 상단 sticky nav
11. 공통 PageHeader + DayBadge (planned/inprogress/done)
12. `/persons/[id]` 인물 상세 placeholder

### 기능 부분 동작
13. **F02 검색**: `kee_search_persons` RPC 실연동 + **한자 IME 호환** (uncontrolled input + FormData) + 안내 도움말
14. **F05 신규 등록**: 5단계 마법사 (본인확인/가지찾기/본인정보/사진/입금) + 완료 화면, 한자 자동 추천 sketch (30세 度 항렬), 매칭 코드 자동 생성

### 인프라 / 환경
15. **Colima** (Docker Desktop 대체) — sudo 불필요, 4 CPU / 6 GB / 30 GB
16. **DOCKER_HOST 환경변수** ~/.zshrc 영구 등록
17. **Supabase config**: `analytics.enabled = false` (vector 컨테이너 docker.sock 충돌 회피)
18. **scripts/sync-env.sh** — Supabase 상태 → `apps/web/.env.local` 자동 동기화
19. **scripts/migration/diagnose.sh** — 5분 진단 스크립트 (자료 도착 시 실행)
20. **docker-compose**: MySQL 5.7 utf8mb4 컨테이너 (자료 분석용, Docker 설치 후 사용)

### 운영
21. 폴더 `Ki-site` → `Kee-site` rename + supabase project_id 일관성
22. GitHub `realks2002-cell/Kee-site` 첫 push (89 파일)

---

## 핵심 결정 사항

| 항목 | 결정 | 이유 |
|---|---|---|
| **DB prefix** | `kee_` 소문자 (kee_persons, kee_branches…) | Postgres unquoted identifier는 자동 lowercase. `Kee_*` 써도 동일 |
| **package namespace** | `@hjkee/*` 그대로 | CLAUDE.md/SPEC.md 코드명 일관성 |
| **Docker** | Docker Desktop 대신 **Colima** | sudo 불필요, GUI 없이 동등 동작 |
| **DOCKER_HOST** | `unix://$HOME/.colima/docker.sock` | Supabase CLI가 default sock 위치 추정 실패 |
| **dev 포트** | 4000 (3000 회피) | 사용자 다른 작업이 3000 점유 |
| **앱 통합** | admin → web의 (admin) 라우트 그룹 | 단일 앱으로 시연 단순화 |
| **UI 라이브러리** | shadcn CLI 안 씀, 직접 컴포넌트 | 작은 mockup 규모 |
| **input 패턴** | uncontrolled (defaultValue + FormData) | macOS 한자 IME 충돌 회피 |
| **시연 환경** | 로컬 (`pnpm dev`) | Vercel 미배포 |
| **양자 모델** | DAG (`kee_relationships` 테이블, type enum 8개) | 일반 트리 X — 친부+양부 4명 부모 가능 |

---

## 디버깅 노하우 (다시 마주칠 가능성 높음)

1. **Colima docker.sock 경로** — Supabase CLI가 `~/.colima/default/docker.sock` 가정, Colima는 `~/.colima/docker.sock`. → `DOCKER_HOST` 명시 + `[analytics] enabled = false`
2. **한자 IME 충돌** — React controlled input은 macOS ⌥+↩ 한자 변환 시 한글이 안 지워짐 (replace 누적). → uncontrolled (`defaultValue` + form `FormData`)
3. **typed routes + dynamic segment** — `/persons/[id]/tree` 는 `as Route` 캐스트 필요
4. **'use client' 누락** — `onClick` 받는 컴포넌트는 `'use client'` 필수, 부모 page도 client 또는 prop을 안 넘겨야
5. **dev/build .next 충돌** — build 전 dev 서버 종료 + `rm -rf .next` 필수
6. **폴더 rename** — `supabase/config.toml`의 `project_id` 도 같이 바꿔야 컨테이너 prefix 일관 (안 그러면 새 폴더에서 `supabase start` 시 포트 충돌)
7. **schema 추론 실패** — `Database` 타입에 `graphql_public` 같은 추가 schema 있으면 supabase-js가 default schema 못 골라서 RPC `Args` 타입 'undefined'. → `.schema('public').rpc(...)` 명시
8. **dev 백그라운드 정리 누락** — task system이 "completed" 표시해도 child node 살아있음. PID 파일 + 명시적 kill로 정리

---

## 미해결 결정 (수회 반복 미답)

1. **마이그레이션 도구 흔적 정리** — 옵션
   - 🅰️ 그대로 (현재 유지, 시연 무관) ← 가장 가벼움
   - 🅱️ 변수만 일반화 (`uttom` → `legacy`)
   - 🅲️ 완전 정리 (파일명·스크립트·환경변수 모두)
2. **Day 2 진입 여부** — 더미 100명 + D3 가계도 (검색·통계·가계도 모두 진짜 데이터 시연)

---

## 다음 단계 (Day 2)

### Step A. 더미 100명 생성기 (40~60분)
**파일**: `scripts/migration/seed-dummy.ts`

- 6세대 (25~30세), 가족당 자녀 2~3
- 항렬자 패턴: 27세 老 (앞), 29세 宇 (앞), 30세 度 (뒤)
- 양자관계 3건 (출계 1, 입후 2)
- 배우자 ~50%, 자(字)·호(號) 일부
- 음력 + 간지 + 양력 (`calculateGanji`)
- 족보 원문 일부 (한문)
- 분파: 정무공파(2)에 80% 집중
- 마이그레이션 `20260504000400_demo_helpers.sql`의 `kee_truncate_demo()` 함수 활용

### Step B. F01 D3 가계도 실제 구현 (1.5~2시간)
**파일**: `apps/web/app/(public)/persons/[id]/tree/page.tsx`

- `kee_get_direct_lineage` RPC 호출 (위 4세대 + 아래 1세대)
- D3.js (`d3-hierarchy` + `d3-zoom`) 또는 자체 SVG (양자관계 표현 시 자체 SVG fallback)
- **양자 시각**: 점선 (생부 라인) + 호박색 박스 (#fef3c7, 양자 본인)
- 줌·드래그·클릭 (다른 인물로 이동)
- 모바일 카드 스택 (Day 3 후반)

---

## 다음 세션 첫 명령

```bash
cd /Users/kenny/Desktop/Task/Kee-site

# 환경 자동 적용 확인
echo $DOCKER_HOST   # → unix:///Users/kenny/.colima/docker.sock

# Supabase 살아있나
docker ps --format "{{.Names}}" | grep Kee-site
# 없으면: pnpm supa:start

# dev 살아있나
ls /tmp/kee-site-dev.pid 2>/dev/null && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/ \
  || echo "dev 죽어있음 → pnpm dev"

# 진행 상태 확인
cat PROGRESS.md         # 이 파일
git log --oneline | head -10
```

---

## 환경 / 인프라

- macOS 15.7.4 arm64
- Node 24.13.0, pnpm 10.33.0
- Docker via **Colima** (4 CPU / 6 GB / 30 GB)
- Supabase CLI 2.84.2
- DB: PostgreSQL 15 (Supabase 컨테이너)

## 폴더 구조

```
Kee-site/
├── apps/web/                    # Next.js 15 (포트 4000)
│   ├── app/(public)/            # 9개 공개 페이지
│   ├── app/(admin)/admin/       # 위원회 대시보드
│   └── components/              # DayBadge 등
├── packages/
│   ├── ui/                      # 디자인 시스템 + 6 도메인 컴포넌트
│   ├── domain/                  # 한국 족보 타입 + 60갑자 + 항렬자
│   ├── db/                      # Supabase 클라이언트 (browser/server/service)
│   └── hanja/                   # CJK 한자 처리
├── supabase/
│   ├── config.toml              # project_id = "Kee-site"
│   ├── seed.sql                 # 분파 6개
│   └── migrations/              # 5개 (extensions / core_schema / search_trigger / rpc / demo_helpers)
├── scripts/
│   ├── sync-env.sh              # Supabase env → .env.local 자동
│   └── migration/               # diagnose.sh / migrate.ts (자료 도착 시)
├── docker/
│   └── uttom-mysql.yml          # MySQL 5.7 (자료 분석용, 미사용)
├── docs/
│   ├── .bkit-memory.json        # bkit 메타
│   └── .pdca-status.json        # bkit PDCA 추적
├── hjkee_docs/                  # 클라이언트 도메인 사양서 8개
└── CLAUDE.md                    # 프로젝트 진입 시 자동 로드
```

## 클라이언트 정보

- **클라이언트**: 행주기씨대종중 족보위원회 (sd.ki5306@gmail.com)
- **개발사**: Bizstart 이강석 (kslee@bizstart.co.kr / 031-282-1921)
- **시스템 코드명**: hjkee (코드 안), Kee-site (폴더), kee_ (DB)
- **데이터 규모**: 42,924명 / 33세대 / 양자 200건+ / 혼인 29,000건
- **계좌**: 농협 351-0833-9286-23 (예금주: 행주기씨대종중)

## 참고 문서 (`hjkee_docs/`)

| 파일 | 우선순위 | 용도 |
|---|---|---|
| SPEC.md | 1 | 프로젝트 개요, 기술 스택, 일정 |
| DOMAIN.md | 2 | 한국 족보 도메인 (양자, 촌수, 항렬자, 음력 간지) |
| DATABASE.md | 3 | DB 스키마 상세 |
| FEATURES.md | 4 | 13개 기능 명세 (Phase 1: 8개 + Phase 2: 5개) |
| UI_UX.md | 5 | 디자인 시스템 + 화면 명세 |
| POLICY.md | 6 | 권한·정합성·개인정보 |
| MIGRATION.md | 7 | 기존 시스템 → Supabase (W1~W2) |
| PHASE2_YOUTH.md | 8 | 청년 확장 (별도 발주) |
