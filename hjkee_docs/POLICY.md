# POLICY — 권한·정합성·개인정보 정책

---

## 1. 사용자 역할 (Role)

```typescript
type Role =
  | 'guest'           // 미인증 게스트 (로그인 안 함)
  | 'member'          // 인증 종친
  | 'branch_admin'    // 분파 임원
  | 'committee'       // 대종중 위원
  | 'super_admin'     // 시스템 관리자 (개발자)
```

### 역할별 권한

| 권한 | guest | member | branch_admin | committee | super_admin |
|------|-------|--------|--------------|-----------|-------------|
| 인물 조회 (공개 필드) | ✓ | ✓ | ✓ | ✓ | ✓ |
| 인물 상세 조회 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 가계도 조회 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 통계 조회 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 본인 가지 수정 신청 | ✗ | ✓ | ✓ | ✓ | ✓ |
| 본인 분파 종친 연락처 | ✗ | △¹ | ✓ | ✓ | ✓ |
| 타 분파 종친 연락처 | ✗ | ✗ | ✗ | ✓ | ✓ |
| 신청 검토·승인 | ✗ | ✗ | △² | ✓ | ✓ |
| 사망자 정보 직접 수정 | ✗ | ✗ | ✗ | ✗ | ✓³ |
| 변경 이력 조회 | ✗ | ✗ | ✓ | ✓ | ✓ |
| 사용자 관리 | ✗ | ✗ | ✗ | ✓ | ✓ |
| 시스템 설정 | ✗ | ✗ | ✗ | ✗ | ✓ |

¹ 회원이 동의한 종친만 (`users.is_public = TRUE`)  
² 본인 분파 1차 검토만, 최종 승인은 위원회  
³ 위원회 결의 + 이사회 의결 후에만

---

## 2. RLS (Row-Level Security) 정책

### `persons` (인물)

```sql
-- 모든 사용자: 인물 조회 가능
CREATE POLICY "persons_select_all" ON persons
  FOR SELECT USING (TRUE);

-- 위원회만 직접 수정 (audit log 거치지 않음 — 응급 시)
CREATE POLICY "persons_update_committee" ON persons
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role IN ('committee', 'super_admin')
    )
  );

-- 일반 회원은 sudan_applications를 통해서만 수정 (직접 수정 차단)
```

### `users` (사용자 정보)

```sql
-- 본인 정보는 본인만, 분파 정보는 같은 분파 임원만
CREATE POLICY "users_select_own_or_branch" ON users
  FOR SELECT USING (
    -- 본인
    id = auth.uid()
    OR
    -- 같은 분파 임원
    branch_id IN (
      SELECT branch_id FROM users
      WHERE id = auth.uid() 
        AND role IN ('branch_admin', 'committee', 'super_admin')
    )
    OR
    -- 위원회는 모든 사용자
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role IN ('committee', 'super_admin')
    )
  );

-- 본인 정보 수정은 본인만
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());
```

### `sudan_applications` (수단 신청)

```sql
-- 본인 신청 또는 위원회만
CREATE POLICY "sudan_select" ON sudan_applications
  FOR SELECT USING (
    applicant_user_id = auth.uid()
    OR
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role IN ('committee', 'super_admin', 'branch_admin')
    )
  );

-- 신청은 본인만 생성
CREATE POLICY "sudan_insert_own" ON sudan_applications
  FOR INSERT WITH CHECK (applicant_user_id = auth.uid());

-- 검토는 위원회만 수정
CREATE POLICY "sudan_update_committee" ON sudan_applications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role IN ('committee', 'super_admin')
    )
  );
```

### `person_change_log` (변경 이력)

```sql
-- 임원·위원회만 조회 (감사 목적)
CREATE POLICY "changelog_select_admin" ON person_change_log
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role IN ('branch_admin', 'committee', 'super_admin')
    )
  );

-- 시스템만 INSERT (트리거로 자동 기록)
-- 직접 INSERT는 모두 거부 → 트리거에서 SECURITY DEFINER로
```

---

## 3. 정합성 정책 (위원회 합의)

### 핵심 원칙

> "**한 번의 입력으로 영구히 유지되는 우리들의 역사 기록**"

### 수정 가능 범위

#### 신규 등록자 (본인이 신규 등록한 인물)

```
✓ 본인 정보 모두 수정 가능
✓ 본인 가지의 자녀·배우자 추가 가능
✓ 위원회 검토 거침
```

#### 2004년 9차 대동보 등록자

```
[생존자(生者)]
- 근거 자료 제시 시 수정 가능
- 본인 동의 + 인우보증(隣友保證) 필수
- 위원회 검토

[사망자(亡者)]
- 원칙적 수정 불가
- 예외 1: 역사적 고증 (학술 자료 등) 시
  → 위원회 심의 → 이사회 의결 후 수정
- 예외 2: 명백한 오타 (행정 오류)
  → 위원회 합의로 수정
```

### 관계 변경 (양자, 출계 등)

```
✓ 두 사람 이상의 관계가 변경되는 경우:
  - 양쪽 가족의 인우보증 필수
  - 위원회 + 이사회 의결
  - 변경 이력에 증거 자료 첨부 필수
```

### 변경 이력 보존

**모든 변경은 `person_change_log` 테이블에 영구 기록**:

```sql
person_change_log (
  person_id,
  field_name,           -- 'name_hanja', 'birth_year' 등
  old_value,
  new_value,
  changed_by,           -- 누가
  application_id,       -- 어떤 신청서로
  evidence_documents,   -- 인우보증 등 (JSONB)
  approved_by,          -- 누가 승인
  approved_at,
  reason,               -- 사유
  created_at
)
```

이 테이블은 **DELETE 금지** (역사적 기록).

---

## 4. 개인정보 보호

### 개인정보 분류

```
[공개 가능 — 누구나]
- 이름 (한글/한자)
- 자(字), 호(號), 시호
- 세대, 분파
- 관직, 경력
- 가계 관계 (부모, 자녀)
- 사망자 출생·사망 정보

[제한 공개 — 같은 분파 종친 + 본인 동의]
- 생존자 출생연도
- 거주 시·도
- 직업

[비공개 — 본인·위원회만]
- 휴대폰 번호
- 이메일
- 상세 주소
- 생일 (월일)

[삭제 가능 — 본인 요청 시]
- 사진
- 직업 정보
- 연락처

※ 단, 가계 관계는 가문 자산이므로 삭제 불가
```

### `users.is_public` 플래그

```sql
-- 본인이 동의한 경우만 분파 종친에게 노출
ALTER TABLE users ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- RLS 정책에서 활용
CREATE POLICY "users_public_visible" ON users
  FOR SELECT USING (is_public = TRUE);
```

### 사망자 vs 생존자

```sql
-- 사망자 정보는 모두 공개 (역사적 자료)
-- 생존자 정보는 마스킹

CREATE VIEW persons_public AS
SELECT 
  id, name_ko, name_hanja, generation, branch_id,
  ja_ko, ja_hanja, ho, ho_hanja, siho,
  
  -- 사망자만 상세 표시
  CASE WHEN death_year IS NOT NULL THEN birth_year ELSE NULL END AS birth_year_public,
  CASE WHEN death_year IS NOT NULL THEN birth_lunar_month ELSE NULL END AS birth_month_public,
  
  death_year, death_lunar_month, death_lunar_day,
  gyeongryeok, tomb_address, tomb_direction,
  jokbo_wonmun, jokbo_translation
  
FROM persons;
```

---

## 5. 신원 인증 정책 (NICE 대체)

### 위원회 수동 검증 워크플로우

```
1. 회원가입 (이메일/휴대폰)
   ↓
2. 본인 정보 입력
   - 이름 (한글)
   - 생년월일
   - 부친 이름
   - 본인이 알고 있는 가까운 종친 이름 (검증용)
   ↓
3. verification_status = 'pending'
   ↓
4. 위원회 대시보드에 자동 추가
   ↓
5. 위원이 종친 명단에서 매칭 확인
   - persons 테이블에서 동일 정보 검색
   - 부친 이름과 가족 관계 확인
   - 이메일·전화 인증 (옵션)
   ↓
6a. 매칭 성공:
    - verification_status = 'verified'
    - verified_person_id = 매칭된 인물 ID
    - role = 'member'
    - 종친 권한 부여
   
6b. 매칭 실패:
    - verification_status = 'rejected'
    - 사유 통보
    - 보완 후 재신청 가능
```

### 가짜 가입 방지

```
- 같은 이메일로 24시간 내 중복 가입 차단
- 휴대폰 SMS 인증 (1회)
- IP 기반 abuse 모니터링
- 매칭 실패 3회 시 임시 차단
```

---

## 6. 입금 매칭 정책 (Toss 대체)

### 매칭 코드 생성 규칙

```typescript
function generatePaymentCode(application: Application): string {
  const personName = application.target_person.name_ko;  // "성도"
  const yymm = formatDate('YYMM');  // "2410"
  const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  
  return `${personName}${yymm}${random}`;  // "성도241023"
}
```

### 자동 매칭 알고리즘

```typescript
function matchDepositToApplication(deposit: Deposit): MatchResult {
  // 1순위: 입금자명에 코드 일치
  const exactMatch = applications.find(app => 
    deposit.depositor.includes(app.payment_code)
  );
  if (exactMatch && exactMatch.payment_amount === deposit.amount) {
    return { confidence: 1.0, application: exactMatch };
  }
  
  // 2순위: 신청자 본인 이름 + 금액 일치
  const nameMatch = applications.find(app =>
    deposit.depositor === app.applicant.name_ko &&
    app.payment_amount === deposit.amount
  );
  if (nameMatch) {
    return { confidence: 0.7, application: nameMatch };
  }
  
  // 3순위: 매칭 실패 → 수동 확인
  return { confidence: 0, requiresManualReview: true };
}
```

### 위원회 작업

```
1. 통장 거래내역 복사 → 시스템에 붙여넣기
2. 자동 매칭 실행
3. 매칭 결과 검토:
   - confidence >= 0.9: 자동 승인
   - confidence 0.5~0.9: 위원 확인 후 승인
   - confidence < 0.5: 수동 처리
4. 승인 시 application.status = 'deposited' → 검토 단계로
```

---

## 7. 데이터 백업·복구 정책

### 자동 백업

```
- Supabase 자동 백업 (Daily, 7일 보관)
- 추가 외부 백업 (S3, Weekly)
- GEDCOM export (Monthly, 종친회 메일 발송)
```

### PITR (Point-in-Time Recovery)

```
- 마지막 7일 내 어느 시점으로든 복구 가능
- 마이그레이션·대규모 작업 전 즉시 백업 시점 명시
```

### 종친회 자체 보관

```
- 분기별 GEDCOM 파일을 종친회 지정 이메일로 자동 발송
- 분기별 SQL 덤프를 USB로 종친회 사무실 보관 (위원회 합의)
```

---

## 8. 콘텐츠 검수 정책

### 청년 SNS 공유 (Phase 2)

```
- 가문 카드: 이름·세대·분파만 노출 (개인정보 제외)
- 인스타·카톡 공유 시 본인 동의 자동 (디폴트 ON)
- 친·인척 외 부적절한 사용 신고 기능
```

### 게시판 (대표 사이트)

```
- 종친만 글쓰기 가능 (verified_member 이상)
- 임원 모니터링
- 부적절한 내용 신고 → 위원회 검토
```

---

## 9. 미성년자 정책

```
- 14세 미만: 부모 동의 필수 (가입 시)
- 청년 SNS 공유: 14세 이상부터
- 사진 업로드: 본인 또는 보호자 동의
```

---

## 10. 데이터 삭제·탈퇴 정책

### 사용자 탈퇴

```
- users.deleted_at 설정 (soft delete)
- 30일 후 개인정보 익명화
  - email, phone → NULL
  - name_ko → "탈퇴 회원"
- 단, verified_person 연결은 유지 (가문 자산)
```

### 인물 정보 삭제

```
- 인물 자체는 삭제 불가 (가문 자산)
- 사진은 본인 요청 시 삭제 가능
- 연락처·주소는 본인 요청 시 즉시 삭제
- 변경 이력은 영구 보존
```

### 사망자 처리

```
- 사망 신고 시 death_* 필드 입력
- 위원회 검토 후 확정
- 휴대폰·이메일 자동 삭제
- 묘소 정보 추가 가능
```

---

## 11. 외국인 종친·다문화 정책

```
- 외국인 배우자 등록 가능 (spouses.spouse_is_foreign)
- 한자 없는 경우 한글만 입력 허용
- 거주 국가 표시 (해외 종친)
- 다국어 지원 검토 (Phase 2)
```

---

## 12. 신청 거부·이의 제기

```
신청 반려 시:
- 사유 명시 (review_note)
- 종친에게 알림
- 보완 후 재신청 가능

이의 제기:
- 위원회 → 이사회 단계적 절차
- 자료 보강 후 재심
```

---

## 13. 윤리 가이드라인 (개발자)

```
✓ 가문 정체성 존중 (위원회 의견 우선)
✓ 어르신 정서 존중 (보수적 접근)
✓ 청년 의견도 청취 (균형)
✓ 데이터 절대 삭제 금지 (마이그레이션 시도 전 백업)
✓ 변경은 모두 audit log에 기록
✗ 가문 갈등 콘텐츠 생성 금지
✗ 정치·종교 색채 배제
✗ 상업적 광고 배제
```
