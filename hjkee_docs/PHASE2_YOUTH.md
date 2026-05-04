# PHASE 2 — 청년 확장 (별도 발주)

> Phase 1 출시 후 단계적 검토·발주 가능. 8주 / 4,500만원.

---

## 미션

**31~33세대 청년 종친의 등록·참여 활성화**

현 데이터 기준:
- 31세 (40~50대 X세대): 874명
- 32세 (20~30대 밀레니얼): 77명
- 33세 (10대 이하 Z세대): 1명

→ **이대로면 30년 후 행주기씨는 디지털 세계에서 소멸**

---

## 핵심 전략

### 청년에게 어필하는 4가지 후크

```
1. 정체성 (Identity)
   "나는 누구의 후손인가?"
   → AI 조상 발견

2. 자랑 (Pride / Bragging)
   "내 가문이 이렇게 멋지다"
   → SNS 공유 카드

3. 게임 (Game)
   "수집하고 등급을 올리는 재미"
   → 인물 카드 컬렉션

4. 소속 (Belonging)
   "내 또래 종친이 있구나"
   → 동년배 찾기 + 활동 배지
```

### 보수적 정서 존중

```
✗ 직접 메시지 / 1:1 매칭 금지
✗ 휴대폰 번호 노출 금지
✗ 결혼정보 회사 연계 금지
✗ 상업적 광고 금지

✓ 정보 제공만
✓ 행사 참여 알림만
✓ 본인 동의 기반 공유
✓ 개인정보 보호 우선
```

---

## 기능 명세 (5개)

### F09. AI 조상 발견 (온보딩)

**목표**: 청년 첫 가입 5분 안에 강력한 정체성 부여

**플로우**:

```
[Step 1] 본인 정보 입력 (간소화)
- 이름 한글 [    ]
- 생년 [    ]
- 부친 이름 [    ]
- 부친 직업 또는 거주지 (선택, 동명이인 보조)

[Step 2] AI 분석 (5초)
"가계도에서 당신의 위치를 찾고 있습니다..."

[Step 3] 결과 발표 (대화형)
"당신은 [정무공]의 [9대손]입니다"
"행주기씨 33세대 중 [27세]에 해당하시며,
 [정무공파 광주문중 기은문중] 후손이십니다"

[Step 4] 유명 조상 카드 1장
[★★★★★]
[19世 政務公]
[奇虔]
"청백리에 녹선, 영의정 추증"
"당신의 9대 조부 ↑"

[Step 5] CTA
[ 내 가계도 전체 보기 → ]
[ 친구에게 자랑하기 → ]
```

**유명 조상 선정 알고리즘**:

```typescript
function selectFamousAncestor(targetPerson: Person): Person {
  const ancestors = getDirectAncestors(targetPerson, 12);
  
  return ancestors
    .map(p => ({
      person: p,
      score: calculateNotableScore(p)
    }))
    .sort((a, b) => b.score - a.score)[0].person;
}

function calculateNotableScore(p: Person): number {
  let score = 0;
  
  // 시호(諡號) 보유 +50
  if (p.siho) score += 50;
  
  // 군호(君號) 보유 +40
  if (p.gunho) score += 40;
  
  // 관직 점수
  if (p.gyeongryeok?.includes('영의정')) score += 100;
  if (p.gyeongryeok?.includes('좌의정')) score += 80;
  if (p.gyeongryeok?.includes('우의정')) score += 80;
  if (p.gyeongryeok?.includes('판서')) score += 50;
  if (p.gyeongryeok?.includes('대사헌')) score += 60;
  if (p.gyeongryeok?.includes('의병장')) score += 70;
  
  // 위원회 큐레이션
  if (p.curated_notable) score += 100;
  
  return score;
}
```

**큐레이션 작업** (위원회 협조):
```
- 위원회에 "유명 조상 50명 추천" 요청
- persons.notable_score 컬럼에 점수 저장
- 등급별 분류 (★~★★★★★)
- 일러스트 또는 사진 매칭
```

---

### F10. 가문 카드 SNS 공유

**목표**: 한 명의 청년이 가입하면 친·인척 5~10명 자연스레 유입

**카드 디자인** (인스타·카카오 친화):

```
정사각형 (1:1):
┌────────────────────────────┐
│ 幸 州 奇 氏                 │ ← 우상단 작게
│                            │
│ 나는                        │
│ 27세                        │ ← 큰 글씨
│ 정무공파의                   │
│ 후손입니다                   │
│                            │
│                            │
│                       奇   │ ← 하단 한자 워터마크
│                            │
│ 600 YEARS · 33 GENERATIONS │ ← 푸터
│ 시조로부터 27세대            │
└────────────────────────────┘
```

**자동 합성 시스템**:

```typescript
async function generateShareCard(
  user: User, 
  format: 'square' | 'story'
): Promise<Buffer> {
  // 1. 사용자 정보 조회
  const person = await getPerson(user.verified_person_id);
  const branch = await getBranch(person.branch_id);
  
  // 2. 카드 데이터
  const cardData = {
    generation: person.generation,
    branchName: branch.name_ko,
    foundationYears: 600,
    surnameHan: '奇',
    quote: getRandomQuote(person)  // "한 가문에 26대" 등
  };
  
  // 3. SVG 템플릿 → PNG 변환
  return await renderCardSVG(cardData, format);
}
```

**공유 채널**:

```
[인스타그램]
- 스토리 (9:16) 자동 생성
- 피드 (1:1) 자동 생성
- 다이렉트 메시지

[카카오톡]
- 카카오톡 공유 SDK (메시지 카드)
- 친구 / 단톡방

[X (Twitter)]
- 이미지 + 텍스트
- "내가 행주기씨 27세더라 #족보 #뿌리"

[다운로드]
- 스마트폰 갤러리 저장
- 본인이 임의로 활용
```

**바이럴 추적 시스템**:

```sql
CREATE TABLE shares (
  id BIGSERIAL,
  user_id BIGINT REFERENCES users(id),
  share_token VARCHAR(16) UNIQUE,
  channel VARCHAR,                  -- 'instagram', 'kakao', 'twitter', 'download'
  card_format VARCHAR,              -- 'square', 'story'
  shared_at TIMESTAMPTZ,
  
  -- 추적
  click_count INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0     -- 가입한 친구 수
);

-- 공유 링크: hjkee.com/?ref=ABC123XYZ
-- 가입 시 ref 토큰을 user.referrer_share_id에 저장
```

**바이럴 인센티브**:

```
- 공유 시: 배지 1개 자동 수여
- 친구 1명 가입: 인물 카드 1장 해금 + 배지
- 친구 5명 가입: 특별 배지 + 가승보 할인 쿠폰
- 친구 10명 가입: 청년 종친 우수자 인증
```

---

### F11. 조상 인물 카드 컬렉션

**목표**: 게임 메커닉으로 가문 역사 학습 유도

**카드 시스템 설계**:

```
[등급 분류]
★★★★★ Legendary (10장)
- 시조, 분파 시조, 시호 + 영의정급
- 다크 카드 + 골드 테두리

★★★★ Epic (30장)
- 시호 + 정승급, 또는 군호 보유
- 보라색 그라데이션

★★★ Rare (60장)
- 군호, 또는 판서급 관직
- 파란색 그라데이션

★★ Uncommon (100장)
- 일반 관직, 학자
- 회색

★ Common (200장)
- 본인 직계 조상 (모두 자동 보유)
- 흰색
```

**해금 조건**:

```
[자동 보유]
- 본인 직계 조상 12명 (가입 시)
- 본인이 속한 분파 시조

[활동 해금]
- 행사 참여 시: 무작위 1장
- 시제 참여 시: ★★★ 이상 1장
- 친구 1명 가입 시: 무작위 1장
- 친구 5명 가입 시: ★★★★ 카드 1장
- 가승보 주문 시: ★★★★ 카드 5장

[이벤트]
- 추석·설 특별 카드
- 시조 탄신일 한정 카드
```

**컬렉션 화면** (Pokemon GO 영감):

```
[탭 메뉴]
[전체] [내 직계] [내 분파] [Legendary] [Epic] [Rare]

[그리드]
- 6열 카드 그리드
- 보유 카드: 컬러
- 미보유 카드: 흑백 + 자물쇠 + 해금 조건

[진행도]
"23 / 200 (11.5%)"

[필터]
- 등급별
- 시대별 (조선 전기, 후기, 근대)
- 관직별
- 본인과의 관계

[교환] (Phase 2.5)
- 친구와 카드 교환 (중복 카드)
- 단톡방에서 자랑
```

**수집 보상**:

```
50장 수집: 청동 트로피 배지
100장 수집: 은 트로피
200장 수집: 금 트로피
전 카드 수집: 다이아몬드 트로피 + 종친회 명예 회원 표창
```

---

### F12. 동년배 종친 찾기

**목표**: 청년의 고립감 해소, 모임 참여 동기 부여

**대시보드 화면**:

```
┌───────────────────────────────────┐
│ MY GENERATION · 31世               │
│                                   │
│ 내 또래 종친                        │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 전국 31세 생존    874명         │ │
│ │ ●●●●●●●●●●●●●●●●●●●●●●●●●●     │ │ ← 점 그래프
│ │ ●●●●●●●●●●●●●●●●●●●●          │ │
│ │ ●●●●●●●●                      │ │
│ │                                │ │
│ │ ● 정무공파 612                  │ │
│ │ ● 광주문중 178                  │ │
│ │ ● 기타 84                       │ │
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 📍 비슷한 지역 (서울)            │ │
│ │ 128명                          │ │
│ │ 강남 32 · 강북 24 · 마포 18    │ │
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 🎉 UPCOMING                    │ │
│ │ 2026 정기 총회                  │ │
│ │ 5월 15일 · 31세 종친 23명 참석  │ │
│ │ [ 참석 RSVP → ]                │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘
```

**개인정보 보호**:

```
✓ 표시
- 시·도 단위 거주 지역 (서울, 경기 등)
- 같은 세대 인원 통계
- 행사 참여 예정 인원

✗ 비공개
- 개인 신원
- 휴대폰 번호
- 정확한 주소
- 직접 메시지 기능 없음
```

**RSVP 시스템**:

```typescript
// 행사 참석 의사 표명
async function rsvpEvent(eventId: number, userId: number) {
  await supabase.from('event_rsvps').insert({
    event_id: eventId,
    user_id: userId,
    status: 'attending',
    created_at: new Date()
  });
  
  // 자동 통계 업데이트
  await updateEventStats(eventId);
}

// 같은 세대 통계 (실시간)
async function getGenerationAttendance(eventId, generation) {
  return await supabase
    .from('event_rsvps')
    .select('count(*)', { count: 'exact' })
    .eq('event_id', eventId)
    .filter('user.verified_person.generation', 'eq', generation);
}
```

---

### F13. 활동 배지 + 연간 리포트

**목표**: 지속 참여 유도, Spotify Wrapped 스타일 연말 캠페인

**배지 시스템**:

```
[참여 배지]
🏛 시제 참여 (참여 횟수별 등급)
📜 신규 등록 (본인 등록)
👨‍👩‍👧 가족 등록 (배우자/자녀 추가)
🎉 총회 참석
✍️ 정보 수정 신청

[수집 배지]
🎴 인물 카드 수집 (50/100/200장)
🌳 가계도 5세대 완성
📷 사진 업로드 4매

[소셜 배지]
🤝 친구 초대 (1/5/10/20명)
📱 SNS 공유 첫 사용
⭐ 청년 종친 우수자

[특별 배지]
🌸 봄철 시제 참여
🍁 가을 시제 참여
🎊 신년 인사
🎂 시조 탄신일 인사
```

**연간 리포트 (12월)**:

```
[ 행주기씨 종친 2026 Wrapped ]

올해 당신은
[조상 12분께] 인사드렸습니다

━━━━━━━━━━━━━━━━━━━━

📊 활동 통계
- 시제 참여: 3회
- 기일 인사: 8건
- 총회 참석: 2회
- 수정 신청: 4건
- 친구 초대: 3명

🎴 카드 컬렉션
- 신규 획득: 12장
- 현재 보유: 23/200 (11.5%)
- 가장 자주 본 카드: 政務公 (15회)

🌳 가계도 활동
- 가계도 조회: 47회
- 가장 많이 본 분파: 정무공파
- 가장 많이 본 조상: 高祖 敬舜公

🎉 다음 해 목표
"내년에는 ●●배지에 도전해보세요"

[ 친구에게 공유 → ]
```

**기술 구현**:

```typescript
// activities 테이블에 모든 활동 기록
CREATE TABLE activities (
  id BIGSERIAL,
  user_id BIGINT,
  activity_type VARCHAR,    -- 'rsvp', 'view_tree', 'share_card', etc.
  metadata JSONB,
  created_at TIMESTAMPTZ
);

// 연말에 집계 함수 실행
function generateYearlyReport(userId: number, year: number) {
  // 1년간의 activities 집계
  // → JSON으로 저장 + PNG 카드 자동 생성
  // → 푸시 알림 + 이메일 발송
}
```

**캘린더 동기화** (보너스):

```typescript
// iCal 파일 자동 생성
function generateICS(events: Event[]) {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hjkee.com//종친회 일정//KO
${events.map(formatEvent).join('\n')}
END:VCALENDAR`;
}

// 사용자가 다운로드 → iPhone/Android 캘린더 자동 추가
// 시제·기일·총회 자동 알림
```

---

## Phase 2 견적 분해

```
F09 AI 조상 발견:           1.0주 / 600만
F10 SNS 카드 (자동 생성):   1.5주 / 800만
F11 인물 카드 컬렉션:        2.0주 / 1,200만
F12 동년배 종친 찾기:        1.0주 / 600만
F13 배지 + 연간 리포트:      1.5주 / 800만
QA + 통합 테스트:           1.0주 / 500만
─────────────────────────────────────────
소계:                       8.0주 / 4,500만
```

---

## Phase 2 출시 전략

```
[운영 데이터 기반 검토]
Phase 1 출시 후 6개월 운영 데이터 분석:
- 31세 이하 등록 증가율
- 위원회 부담 절감 효과
- 기존 청년의 사용 패턴

[데이터로 정당화]
"Phase 1만으로 청년 등록이 ●●% 증가했습니다.
 Phase 2 청년 확장 기능 추가 시 추가로 ●●% 기대할 수 있습니다."

[단계적 출시]
Phase 2.1: F09 + F10 (정체성 + 자랑)
Phase 2.2: F11 (게임)
Phase 2.3: F12 + F13 (커뮤니티 + 충성도)
```

---

## 청년 친화 디자인 원칙

```
1. 다크 모드 우선 (인스타·SNS 친화)
2. 큰 시각적 임팩트 (한자 워터마크, 그라데이션)
3. 게임 메커닉 (등급, 배지, 진행도)
4. 즉시 피드백 (애니메이션, 푸시)
5. 짧은 흐름 (5분 이내 완결)
6. 공유 가능한 콘텐츠 (이미지 자동 생성)
7. 익명성 + 안전 (개인정보 보호)
```

---

## 실패 시나리오 대비

```
[리스크 1] 어르신 위원회 반대
- 청년 콘텐츠가 가문 정체성 훼손한다 우려
- 대응: 모든 콘텐츠는 위원회 검수 + 톤앤매너 어르신께 사전 보고

[리스크 2] 청년 무관심
- 만들어도 사용 안 함
- 대응: Phase 1 운영 데이터 + 청년 5명 사전 인터뷰로 검증 후 발주

[리스크 3] 바이럴 부족
- 친구 초대 인센티브 작동 안 함
- 대응: A/B 테스트로 인센티브 강도 조정
```

---

## Phase 3 (장기 비전, 미정)

향후 검토 가능한 추가 기능:

```
- 다국어 지원 (해외 종친)
- AR 가계도 (휴대폰 카메라로 시연)
- AI 생애 스토리 자동 생성
- 종친 SNS (페이스북 형태)
- 조상 음성 재현 (TTS)
- VR 시조묘 가상 참배
- DNA 분석 연계 (해외 사례 참고)
```

이는 Phase 1·2 운영 후 시장 검증을 거쳐 결정.
