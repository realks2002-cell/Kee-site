# UI / UX — 디자인 시스템

> 행주기씨 통합 시스템의 시각 언어, 컴포넌트 패턴, 화면 명세.

---

## 디자인 원칙

1. **양방향 톤** — 어르신께 격조, 청년에게 모던
2. **모바일 우선** — 모든 화면을 모바일에서 먼저 검증
3. **한자 병기** — 한글 옆에 작은 한자 (인지·검색 보조)
4. **명료한 위계** — 3단계 깊이 이내 IA
5. **데이터 밀도** — 어르신은 정보 압축, 청년은 시각 강조

---

## 컬러 시스템

### Phase 1 (어르신 친화 — 현대 비즈니스)

```css
:root {
  /* 베이스 */
  --bg: #ffffff;
  --bg-soft: #fafaf9;
  --bg-card: #ffffff;
  --bg-elevated: #f5f5f4;
  --border: #e7e5e4;
  --border-strong: #d6d3d1;
  
  /* 텍스트 */
  --ink: #0c0a09;          /* 본문 */
  --ink-soft: #292524;     /* 부제목 */
  --ink-mute: #57534e;     /* 보조 텍스트 */
  --ink-dim: #78716c;      /* 비활성 */
  
  /* 포인트 컬러 */
  --accent: #7c2d12;       /* 깊은 적색 (격조) */
  --accent-soft: #9a3412;
  --accent-bg: #fef7f5;    /* 강조 배경 */
  
  /* 보조 컬러 */
  --gold: #a16207;         /* 한자 강조 */
  --green: #166534;        /* 성공 */
  --blue: #1e40af;         /* 정보 */
  --warning: #ca8a04;      /* 주의 */
  --danger: #b91c1c;       /* 위험 */
}
```

### Phase 2 (청년 친화 — 추가 컬러)

```css
:root {
  /* 다크 카드용 */
  --dark-card: #1c1917;
  --dark-elevated: #292524;
  
  /* 그라데이션 (게이미피케이션) */
  --gradient-gold: linear-gradient(135deg, #a16207, #d97706);
  --gradient-rare: linear-gradient(135deg, var(--accent), var(--accent-soft));
  --gradient-epic: linear-gradient(135deg, #7c3aed, #a855f7);
  
  /* SNS 브랜드 */
  --instagram: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  --kakao: #fee500;
  --kakao-text: #371D1E;
}
```

---

## 타이포그래피

### 폰트 스택

```css
:root {
  --sans: 'Pretendard', sans-serif;                          /* 본문 */
  --serif: 'Instrument Serif', serif;                        /* 강조 (영문 이탤릭) */
  --serif-cjk: 'Noto Serif KR', 'Gowun Batang', serif;       /* 한글·한자 격조 */
  --serif-hanja: 'Noto Serif CJK KR', serif;                 /* 확장 한자 폰트 */
  --mono: 'JetBrains Mono', monospace;                       /* 데이터·라벨 */
}
```

### 폰트 로드

```html
<!-- Pretendard -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap" 
      rel="stylesheet">
```

### 폰트 크기 (어르신 친화 — 큰 글씨)

```css
/* 데스크톱 */
--text-xs:   12px;    /* 라벨, 메타 */
--text-sm:   14px;    /* 부속 정보 */
--text-base: 16px;    /* 본문 (어르신 기준 최소) */
--text-lg:   18px;    /* 강조 본문 */
--text-xl:   22px;    /* 카드 제목 */
--text-2xl:  28px;    /* 섹션 제목 */
--text-3xl:  36px;    /* 페이지 제목 */
--text-4xl:  48px;    /* 영웅 제목 */

/* 모바일 (어르신 친화 — 더 큼) */
@media (max-width: 768px) {
  --text-base: 17px;  /* 본문 1px 더 */
  --text-xl:   24px;  /* 카드 제목 더 큼 */
}
```

### 한자 표기 패턴

```html
<!-- 인라인 -->
<span class="name">
  기성도 <span class="hanja">奇成度</span>
</span>

<style>
.hanja {
  font-family: var(--serif-cjk);
  font-style: italic;
  color: var(--gold);
  font-size: 0.85em;
  margin-left: 4px;
}
</style>

<!-- 또는 ruby 태그 (음 자동 표시 가능) -->
<ruby>奇成度<rt>기성도</rt></ruby>
```

---

## 레이아웃 그리드

### 컨테이너

```css
.container {
  max-width: 1080px;     /* 표준 */
  margin: 0 auto;
  padding: 0 32px;
}

.container-narrow {
  max-width: 880px;      /* 텍스트 위주 */
}

.container-wide {
  max-width: 1280px;     /* 대시보드 */
}

@media (max-width: 768px) {
  .container { padding: 0 20px; }
}
```

### 섹션 간격

```css
section {
  padding: 120px 0;       /* 데스크톱 */
}

@media (max-width: 768px) {
  section { padding: 60px 0; }
}
```

---

## 컴포넌트 패턴

### 1. 인물 카드 (검색 결과)

```tsx
<PersonCard variant="compact|detailed">
  <PersonName ko="기성도" hanja="奇成度" />
  <PersonMeta>
    <span>27세 · 정무공파</span>
    <span>父 우봉</span>
    <span>祖 춘연</span>
  </PersonMeta>
  <PersonStatus alive={false} />
</PersonCard>
```

### 2. 가계도 노드

```tsx
<TreeNode 
  generation={27}
  type="self|ancestor|descendant|sibling|adopted"
  highlight={isCurrentUser}
>
  <NameKo>기성도</NameKo>
  <NameHanja>奇成度</NameHanja>
  <Generation>27世</Generation>
</TreeNode>
```

### 3. 통계 카드

```tsx
<StatCard
  label="총 종친"
  value={42924}
  unit="명"
  description="시조부터 33세대"
  trend={+27}  // 이번 달 증가
/>
```

### 4. 분파 트리 행

```tsx
<BranchRow level={1|2|3}>
  <BranchName ko="정무공파" hanja="度公派" />
  <BranchBar percentage={76.7} />
  <BranchCount>32,916명</BranchCount>
</BranchRow>
```

---

## 화면 명세

### 메인 사이트 (`hjkee.com`)

```
[헤더] 행주기씨대종중 로고 + 메뉴 + 로그인
[히어로] 시조 소개 + 핵심 통계 4개 카드
[섹션 1] 분파 소개 (3단계 트리 시각화)
[섹션 2] 최신 공지 (총회·시제 일정)
[섹션 3] 인물 검색 입구 + 통계 미리보기
[섹션 4] 행주기씨 역사 (기존 페이지)
[푸터] 연락처, 통장 정보, 위원회 명단
```

### 인물 검색 (`/search`)

```
[검색 폼]
이름 [    ]  AND  아버지 [    ]
자(字) [    ]  호(號) [    ]
관직 [    ]  배우자 [    ]
[족보검색] [다시검색]

[필터]
○ 전체 ○ 분파 [드롭다운] ○ 세대 [드롭다운]
○ 생존자만

[결과 테이블]
| 이름(漢字) | 부친 | 조부 | 증조 | 세 | 분파 |
| 성도(成度) | 우봉 | 춘연 | 광국 | 27 | 낭장공 |  ← 클릭 가능
```

### 인물 상세 (`/persons/[id]`)

```
[상단] 5세대 직계 가계도 (가로 흐름)
       23세 → 24세 → 25세 → 26세 → 27세 → 28세
       경순   광국   춘연   우봉   [성도]  자녀

[좌측 60%] 개인자료
  - 본인 한글·한자
  - 자(字), 호(號), 시호
  - 생몰 (음력 + 간지)
  - 경력, 약력
  - 묘소
  - 배우자 (1조, 2조, 3조)
  - 자녀 (목록)

[우측 40%] 사진 4매 슬롯
  본인 / 배우자 / 가족 / 묘소

[하단] 족보 원문 (한문)
[하단] 족보 번역 (한글)

[액션 버튼]
[전체 가계도] [수정 신청] [PDF 가승보] [공유]
```

### 가계도 (`/persons/[id]/tree`)

```
[상단 컨트롤]
[줌 +] [줌 -] [본인으로 이동] [전체 보기]
[필터: 생존자만] [필터: 양자 표시]

[메인 시각화]
- D3.js 인터랙티브 트리
- 본인 강조 (적색)
- 양자 점선 + 호박색
- 클릭 시 상세 페이지로

[모바일]
카드 스택형
↑ 부모로 (스와이프)
[ 본인 카드 — 다크 박스 ]
↓ 자녀로 (스와이프)
↔ 형제 (좌우 스와이프)
```

### 신규 등록 (`/sudan/new`)

5단계 마법사 (FEATURES.md 참조).

각 단계 진행률 표시:
```
[1] [2] [3] [4] [5]
 ●   ●   ○   ○   ○
본인 가지 정보 사진 결제
```

### 관리자 대시보드 (`/admin`)

```
[좌측 사이드바]
- 대시보드
- 신청 관리
- 입금 매칭
- 인물 검색
- 통계
- 변경 이력
- 사용자 관리

[메인 영역]
[KPI 카드 4개]
인증 대기 12 | 입금 대기 8 | 검토중 3 | 이번달 27

[신청 큐 테이블]
| 신청자 | 코드 | 금액 | 상태 | 작업 |

[입금 매칭 도구]
[통장 거래내역 붙여넣기 + 자동 매칭]
```

---

## 모바일 가계도 (핵심 차별점)

### 카드 스택 패턴

```
┌──────────────────────────┐
│ 27세 · 정무공파 · 본인    │ ← 헤더
│ 기성도 奇成度             │
│ 1962년 임인 6월 12일      │
├──────────────────────────┤
│  ↑                       │ ← 부모 카드 (작게)
│  우봉 宇鳳                │
│  부친 · 26세              │
├──────────────────────────┤
│                          │
│  [ 기성도 奇成度 ]        │ ← 본인 카드 (다크, 강조)
│  자(字) 成道              │
│                          │
├──────────────────────────┤
│  ↓                       │ ← 자녀 카드 (작게)
│  기○○                    │
│  아들 · 28세              │
├──────────────────────────┤
│  ←→ 형제 4명 보기         │ ← 좌우 스와이프 안내
└──────────────────────────┘

↕ 위·아래 스와이프 = 세대 이동
```

### 제스처 매핑

```
↑ 위로 스와이프    → 부모 세대로
↓ 아래로 스와이프  → 자녀 세대로
← 왼쪽 스와이프    → 다음 형제
→ 오른쪽 스와이프  → 이전 형제
탭                → 인물 상세 페이지
길게 누르기        → 컨텍스트 메뉴 (수정 신청 등)
핀치 줌            → 전체 가계도 모드
```

---

## 한자 폰트 전략

### 일반 한자

```css
.hanja-normal {
  font-family: 'Noto Serif KR', 'Gowun Batang', serif;
}
```

- KS X 1001 한자 영역 (4,888자) 모두 지원
- 일반 인명·관직 충분

### 확장 한자 (CJK Ext B~F)

```css
.hanja-extended {
  font-family: 'Noto Serif CJK KR', serif;
}
```

- 시호(諡號), 자(字)의 희귀 한자
- 폰트 크기 큼 (3.5MB+) → 서브셋 추출 권장

### 폰트 서브셋 추출

```bash
# 자주 쓰는 한자만 서브셋
pyftsubset NotoSerifKR.otf \
  --unicodes-file=hjkee_hanja_chars.txt \
  --output-file=hjkee-hanja.woff2
```

---

## 접근성 (어르신 + 일반)

### 의무 사항

- **WCAG 2.1 AA 준수**
- **명도 대비 4.5:1 이상**
- **본문 크기 16px 이상**
- **터치 영역 44px 이상**
- **스크린 리더 대응** (aria-label, alt)
- **키보드 네비게이션 지원**

### 어르신 특화

- 글씨 크기 사용자 조절 (기본/큼/매우 큼)
- 단순한 메뉴 구조 (3단계 깊이 이내)
- 영어·외래어 최소화
- 한자 병기 (본인 이름, 분파명, 인명 등)
- 즉시 도움 (도움말 버튼, FAQ 항상 노출)

---

## 다크 모드

**Phase 1**: 미지원 (어르신 인지 부담)
**Phase 2**: 청년 카드 컴포넌트만 다크 모드 적용 (인스타 공유용)

---

## 인쇄 (PDF 출력)

가승보 PDF 외에도 인물 상세 페이지 인쇄 가능:

```css
@media print {
  /* 헤더·푸터·메뉴 숨김 */
  nav, footer, .actions { display: none; }
  
  /* 흑백 친화 */
  body { color: black; background: white; }
  
  /* 페이지 분할 */
  .page-break { page-break-before: always; }
}
```

---

## 디자인 시안 참고

- **Phase 1 (모던 비즈니스)**: Linear, Stripe, Vercel, Toss
- **Phase 2 (청년 게이미피케이션)**: Spotify Wrapped, Pokemon GO, BeReal
- **한국 전통 격조**: 국립중앙박물관, 한국학중앙연구원, 간송미술관

---

## 컴포넌트 라이브러리

**shadcn/ui** 기반 + 도메인 특화 컴포넌트:

```
packages/ui/components/
├── primitives/         # shadcn 그대로
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── domain/             # 행주기씨 특화
│   ├── PersonName.tsx          # 한글 + 한자
│   ├── PersonCard.tsx          # 인물 카드
│   ├── TreeNode.tsx            # 가계도 노드
│   ├── BranchSelector.tsx      # 분파 선택
│   ├── GenerationLabel.tsx     # 세대 표기
│   ├── HanjaInput.tsx          # 한자 추천 입력
│   ├── GanjiDisplay.tsx        # 간지 표시
│   ├── HangryeolBadge.tsx      # 항렬자 뱃지
│   └── AdoptionBadge.tsx       # 양자 표시
└── pages/              # 페이지 단위
    ├── PersonDetail.tsx
    ├── FamilyTree.tsx
    ├── SudanForm.tsx
    └── AdminDashboard.tsx
```
