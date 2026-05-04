# 행주기씨대종중 통합 시스템 — 개발 사양서 일체

> Claude Code에 바로 먹일 수 있는 프로젝트 사양 문서 9종.

## 사용 방법

### 1. Claude Code 프로젝트 진입 시

```bash
# 프로젝트 루트에 docs/ 폴더로 통째 복사
cp -r hjkee_docs/* /path/to/hjkee/docs/

# Claude Code 시작 시 가장 먼저 읽혀야 할 파일
docs/CLAUDE.md
```

### 2. Claude Code에 첫 명령

```
"docs/CLAUDE.md 를 먼저 읽고, 그 안의 우선순위에 따라 SPEC.md → DOMAIN.md → DATABASE.md 순서로 읽은 다음, Week 1 작업을 시작해줘."
```

또는 단순히:

```
"docs/ 폴더에 있는 모든 문서를 읽고 프로젝트를 파악해줘."
```

## 문서 9종 개요

| 파일 | 용도 | 분량 | 우선순위 |
|------|------|------|---------|
| `CLAUDE.md` | Claude Code 진입점 / 작업 지침 | 9.7KB | 1 (최우선) |
| `SPEC.md` | 프로젝트 개요 / 12주 일정 / 기술 스택 | 8KB | 2 |
| `DOMAIN.md` | 한국 족보 도메인 (양자·촌수·항렬자 등) | 14KB | 3 |
| `DATABASE.md` | DB 스키마 / 8개 테이블 / RPC 함수 | 21KB | 4 |
| `FEATURES.md` | 13개 기능 명세 (Phase 1: 8 + Phase 2: 5) | 13KB | 5 |
| `UI_UX.md` | 디자인 시스템 / 컴포넌트 / 한자 폰트 | 12KB | 6 |
| `MIGRATION.md` | 으뜸족보 → Supabase 이전 절차 | 15KB | 7 |
| `POLICY.md` | 권한 / RLS / 정합성 / 개인정보 | 12KB | 8 |
| `PHASE2_YOUTH.md` | 청년 확장 5개 기능 (별도 발주) | 15KB | 9 |

**총 분량**: 약 120KB의 마크다운 (Claude Code에 한 번에 로드 가능한 크기)

## 핵심 정보 요약

### 프로젝트
- **클라이언트**: 행주기씨대종중 족보위원회
- **데이터 규모**: 42,924명, 33세대, 분파 3단계 트리, 양자 200건+, 혼인 29,000건
- **기간 / 견적**: Phase 1 — 12주 / 7,550만원 + Phase 2 (선택) — 8주 / 4,500만원
- **개발 도구**: Claude Code

### 기술 스택
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL 15 + Auth + Storage + RLS)
- Tailwind + shadcn/ui
- Capacitor (iOS / Android)
- D3.js (가계도) + Recharts (통계)
- PostgreSQL: ltree (분파), pg_trgm (검색), 재귀 CTE (촌수)

### 핵심 의사결정
- ❌ NICE 본인인증 사용 안 함 → 위원회 수동 검증
- ❌ Toss Payments 사용 안 함 → 농협 입금 + 매칭 코드
- ✅ 모바일 first
- ✅ 어르신 친화 (큰 글씨, 한자 병기)
- ✅ 청년 친화 콘텐츠 레이어 (Phase 2)

## 작업 흐름

```
Week 1  자료 진단 → 마이그레이션 스크립트 1차
Week 2  데이터 마이그레이션 + 검증 보고서
Week 3  인물 검색 + 상세 페이지
Week 4  ⭐ 가계도 시각화 (데스크톱)
Week 5  모바일 가계도 + 반응형
Week 6  양자 출입현황 + 촌수 계산
Week 7  ⭐ 신규 등록 + 위원회 인증
Week 8  관리자 통합 대시보드
Week 9  통계 대시보드 (9종)
Week 10 ⭐ Capacitor 앱 + 가승보 PDF
Week 11 QA + 사용성 테스트
Week 12 ⭐ 정식 출시 + 인수 인계
```

## 다음 작업

1. **클라이언트로부터 자료 수령 대기**:
   - 으뜸족보 DB 백업 (.sql)
   - 업로드 사진 폴더
   - 으뜸족보 코드 + 라이선스 자료

2. **자료 도착 즉시**:
   ```bash
   # 5분 진단
   file backup.sql
   head -100 backup.sql
   grep "CREATE TABLE" backup.sql
   ```

3. **본 문서를 Claude Code에 먹이고 Week 1 시작**

## 문서 갱신 이력

- v1.0 (2026-05-04): 초안 작성, 9개 문서 완성

---

**개발사**: 비즈스타트 (Bizstart)
**대표**: 이강석 · kslee@bizstart.co.kr · 031-282-1921
