# CLAUDE.md — 행주기씨 프로젝트 작업 지침

> Claude Code가 이 프로젝트에 진입할 때 가장 먼저 읽어야 할 문서.

---

## 즉시 읽어야 할 문서 (우선순위 순)

```
1. SPEC.md          — 프로젝트 개요, 기술 스택, 일정 (필수, 첫 진입 시)
2. DOMAIN.md        — 한국 족보 도메인 (작업 전 필수)
3. DATABASE.md      — DB 스키마 (DB 작업 시)
4. FEATURES.md      — 기능 명세 (구현 시)
5. UI_UX.md         — 디자인 시스템 (UI 작업 시)
6. POLICY.md        — 권한·정합성 (보안·검증 시)
7. MIGRATION.md     — 으뜸족보 → Supabase (Week 1-2)
8. PHASE2_YOUTH.md  — 청년 확장 (Phase 2 시작 시)
```

---

## 프로젝트 한 줄 요약

**행주기씨대종중**의 기존 **으뜸족보(Uttom)** 시스템을 **Next.js + Supabase**로 리뉴얼하는 프로젝트. 데이터 42,924명, 33세대, 양자관계 200건+, 혼인관계 29,000건+. 12주 / 7,550만원.

---

## 결정적 의사결정 사항 (반드시 준수)

### 사용 안 함 (명시적 제외)

```
❌ NICE 본인인증 — 위원회 수동 검증으로 대체
❌ Toss Payments — 농협 입금 + 매칭 코드로 대체
❌ GEDCOM 표준 모델 — 한국 족보 도메인에 부적합 (export만 지원)
❌ 일반 트리 라이브러리만으로 가계도 — 양자관계 표현 불가
```

### 핵심 제약

```
✓ 모바일 first
✓ 어르신 친화 (큰 글씨, 명료한 메뉴, 한자 병기)
✓ 데이터 100% 보존 (마이그레이션 시 검증 보고서 필수)
✓ 모든 변경은 audit log 기록
✓ 한자는 UTF-8 통일
✓ 한국 도메인 (음력, 간지, 항렬자, 양자관계) 정확 처리
```

---

## 작업 패턴

### Week 1 시작 시

```bash
# 1. 자료 수령 즉시 5분 진단
cd hjkee/scripts/migration
./diagnose.sh /path/to/uttom_backup.sql

# 2. 분석 환경 세팅
docker-compose -f docker/uttom-mysql.yml up -d

# 3. 스키마 추출 → ERD
./extract_schema.sh

# 4. Supabase 프로젝트 생성
supabase init
supabase db push
```

### 각 기능 구현 시

```
1. FEATURES.md에서 해당 F번호 기능 명세 확인
2. DATABASE.md에서 관련 테이블·RPC 확인
3. UI_UX.md에서 디자인 패턴 확인
4. POLICY.md에서 권한·RLS 확인
5. 구현
6. 테스트 (어르신 + 청년 양 시나리오)
7. PR 생성 + 검토
```

### DB 변경 시

```
1. supabase/migrations/ 에 새 마이그레이션 파일
2. RLS 정책 동시 작성
3. 변경 이력 트리거 추가
4. TypeScript 타입 자동 재생성
   supabase gen types typescript --local > packages/db/types.ts
```

---

## 폴더 구조

```
hjkee/
├── apps/
│   ├── web/              # 메인 웹 (Next.js 15 App Router)
│   │   ├── app/
│   │   │   ├── (public)/         # 공개 페이지
│   │   │   ├── (auth)/           # 로그인 후
│   │   │   ├── (admin)/          # 관리자
│   │   │   └── api/
│   │   └── components/
│   ├── public-site/      # 문중 대표 사이트 (hjkee.com)
│   └── mobile/           # Capacitor (Phase 1 Week 10)
├── packages/
│   ├── ui/               # 디자인 시스템
│   │   └── components/
│   │       ├── primitives/   # shadcn/ui
│   │       └── domain/       # 도메인 특화 (PersonName, TreeNode 등)
│   ├── db/               # Supabase 클라이언트 + 타입
│   ├── domain/           # 비즈니스 로직 (촌수, 항렬자, 양자)
│   └── hanja/            # 한자 처리
├── supabase/
│   ├── migrations/       # SQL 마이그레이션
│   ├── functions/        # Edge Functions
│   └── seed.sql          # 시드 데이터
├── scripts/
│   ├── migration/        # 으뜸족보 → Supabase
│   └── analysis/         # 데이터 분석
├── docs/                 # 본 문서 일체
└── docker/               # 로컬 개발 환경
```

---

## 자주 쓰는 명령어

```bash
# 개발 서버
pnpm dev

# 타입 체크
pnpm typecheck

# 린트
pnpm lint

# 테스트
pnpm test

# Supabase 마이그레이션
supabase db reset       # 로컬 초기화
supabase db push        # 프로덕션 적용
supabase gen types typescript --local > packages/db/types.ts

# 데이터 마이그레이션
pnpm tsx scripts/migration/migrate.ts

# 빌드
pnpm build

# Capacitor (Phase 1 Week 10)
pnpm cap sync
pnpm cap open ios
pnpm cap open android
```

---

## 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini (마이그레이션용)
GEMINI_API_KEY=

# 카카오맵
NEXT_PUBLIC_KAKAO_MAPS_KEY=

# 이메일 (위원회 알림용)
RESEND_API_KEY=

# 개발 환경
DATABASE_URL=postgresql://localhost:54322/postgres
UTTOM_MYSQL_URL=mysql://root:local@localhost:3306/uttom_jokbo
```

---

## 코드 스타일

### TypeScript

```typescript
// ✅ Good
type Person = {
  id: bigint;
  generation: number;
  nameKo: string;
  nameHanja: string | null;
};

// ❌ Bad
interface IPerson {
  ID: number;
  Gen: any;
  name_ko: string;  // snake_case는 DB에서만
}
```

### 한국 도메인 용어

영어 변수명에도 한국 용어 일부는 의미 보존:

```typescript
// ✅ Good
type Generation = number;          // 세(世)
type Hangryeolja = string;          // 항렬자
type Branch = { /*...*/ };          // 분파(派)
type ChonsuResult = { /*...*/ };    // 촌수

// ❌ Bad
type Lineage = number;  // 세대를 lineage로 번역하면 의미 모호
```

### 컴포넌트 작성

```tsx
// ✅ Good
export function PersonName({ ko, hanja }: { ko: string; hanja?: string }) {
  return (
    <span className="person-name">
      {ko}
      {hanja && <span className="hanja">{hanja}</span>}
    </span>
  );
}

// 사용
<PersonName ko="기성도" hanja="奇成度" />
```

---

## 자주 만드는 실수

### ❌ 일반 트리로 가계도 그리기

```typescript
// ❌ 양자관계 표현 불가
type TreeNode = {
  id: number;
  parentId: number | null;
  children: TreeNode[];
};
```

```typescript
// ✅ 그래프(DAG) 모델
type Person = {
  id: number;
};

type Relationship = {
  personId: number;
  relatedId: number;
  type: 'biological_father' | 'adoptive_father' | /* ... */;
  isPrimary: boolean;
};
```

### ❌ 한자 검색 무시

```typescript
// ❌ 한글만 검색
WHERE name_ko ILIKE '%성도%'
```

```typescript
// ✅ 통합 검색
WHERE search_text @@ to_tsquery('성도')
   OR name_hanja ILIKE '%成度%'
```

### ❌ EUC-KR 인코딩 무시

```typescript
// ❌ 그대로 import
mysql -uroot uttom_jokbo < backup.sql
// → 한자 깨짐 발생

// ✅ 변환 후 import
iconv -f EUC-KR -t UTF-8 backup.sql > backup_utf8.sql
sed -i '1i SET NAMES utf8mb4;' backup_utf8.sql
mysql -uroot uttom_jokbo < backup_utf8.sql
```

### ❌ 직접 수정

```typescript
// ❌ 인물 정보 직접 수정
await supabase.from('persons').update({ name_ko: '성도' }).eq('id', 12345);
```

```typescript
// ✅ 신청서 통해 수정 (audit log 자동)
await supabase.from('sudan_applications').insert({
  applicant_user_id: userId,
  target_person_id: 12345,
  application_type: 'edit_existing',
  payload: { name_ko: '성도' }
});
```

---

## 어르신 vs 청년 양면 톤

```
[어르신용 페이지]
- 명조체 + 큰 글씨
- 한자 병기 강조
- 단순한 메뉴
- "삼가 등록하시기 바랍니다" 격조 있는 문구

[청년용 페이지 (Phase 2)]
- 다크 모드 카드
- 강력한 시각 임팩트
- 게임 메커닉
- "5분 만에 내 조상 찾기" 캐주얼 문구
```

---

## 위기 의식

**31~33세대 등록 인원**: 952명 (전체의 2.2%)

```
30세 → 31세: -73.6% 급감
31세 → 32세: -91.2% 급감
32세 → 33세: -98.7% 급감
```

→ **이 위기를 해결하지 못하면 30년 후 행주기씨는 디지털 세계에서 소멸**

→ **Phase 2 청년 확장이 단순 부가 기능이 아닌 가문의 미래 전략**

---

## Phase 1 → Phase 2 전환 신호

다음 조건 중 2개 이상 충족 시 Phase 2 발주 검토:

```
✓ Phase 1 출시 후 3개월 이상 안정 운영
✓ 위원회 부담 절감 효과 측정 가능
✓ 청년 종친 5명 이상 베타 테스트 의향 표명
✓ 운영 비용 안정화
```

---

## 클라이언트 소통 원칙

### 위원회 어르신께

```
✓ 격조 있는 어조
✓ 한자 병기
✓ "삼가 보고드립니다" 등 정중한 표현
✓ 데이터 안전성·정합성 우선 강조
✓ 가문 전통 존중 표현
```

### 청년 종친께

```
✓ 캐주얼한 어조 (그러나 가문 격조 유지)
✓ 시각적 자료 우선
✓ 5분 내 결론
✓ 게임·SNS 친화 메시지
```

---

## 비상 시 연락

```
프로젝트 책임자: 이강석 (Bizstart)
이메일: kslee@bizstart.co.kr
전화: 031-282-1921

클라이언트 측: 행주기씨대종중 족보위원회
이메일: sd.ki5306@gmail.com
주소: 경기 고양시 덕양구 고양대로 1445-46
계좌: 농협 351-0833-9286-23 (예금주: 행주기씨대종중)
```

---

## 본 문서 위치

```
/docs/
├── CLAUDE.md          ← 본 문서 (진입점)
├── SPEC.md            ← 프로젝트 개요
├── DATABASE.md        ← DB 스키마
├── DOMAIN.md          ← 한국 족보 도메인
├── FEATURES.md        ← 기능 명세
├── UI_UX.md           ← 디자인 시스템
├── POLICY.md          ← 권한·정합성·개인정보
├── MIGRATION.md       ← 마이그레이션 절차
└── PHASE2_YOUTH.md    ← Phase 2 청년 확장
```
