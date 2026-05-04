// 한국 족보 도메인 타입 — DOMAIN.md / DATABASE.md 기반

// ─────────────────────────────────────────
// 기본 식별자
// ─────────────────────────────────────────

export type PersonId = number & { readonly __brand: 'PersonId' };
export type BranchId = number & { readonly __brand: 'BranchId' };
export type ClanId = number & { readonly __brand: 'ClanId' };
export type UserId = number & { readonly __brand: 'UserId' };
export type ApplicationId = number & { readonly __brand: 'ApplicationId' };

// ─────────────────────────────────────────
// 세대(世) · 분파(派) · 항렬자(行列字)
// ─────────────────────────────────────────

/** 세(世) — 시조 1세부터 33세까지 */
export type Generation = number;

/** 항렬자 — 같은 세대 종친 이름에 공통으로 들어가는 한자 */
export type Hangryeolja = {
  generation: Generation;
  characterHanja: string; // 度, 老, 宇 등
  characterKo: string; // 도, 노, 우
  position: 'first' | 'second'; // 앞·뒤 교대 항렬
  confidence: number; // 0.00~1.00 (자동 추출 신뢰도)
  isVerified: boolean; // 위원회 검수 완료
};

/** 분파(派) 트리 — 3단계 (대분파 → 중분파 → 세분파) */
export type Branch = {
  id: BranchId;
  nameKo: string; // 정무공파, 광주문중
  nameAlt: string | null; // 별칭 (덕성군, 참판공)
  founderTitle: string | null; // 諱대림 (시조 휘)
  founderAlias: string | null; // 度, 仲敏
  founderAliasHanja: string | null;
  founderPersonId: PersonId | null;
  parentBranchId: BranchId | null;
  level: 1 | 2 | 3;
  path: string; // ltree: '정무공.광주.승지공.기은문중'
  generationSplit: number | null;
  totalCount: number;
  aliveCount: number;
};

// ─────────────────────────────────────────
// 인물(人物)
// ─────────────────────────────────────────

export type Gender = 'M' | 'F';

/** 음력 + 간지 + 양력 변환 */
export type LunarBirth = {
  dateWestern: string | null; // 양력 변환 결과 (YYYY-MM-DD)
  year: number | null;
  lunarMonth: number | null;
  lunarDay: number | null;
  ganji: string | null; // 壬寅 등
  isLunar: boolean;
};

/** 묘소(墓所) */
export type Tomb = {
  address: string | null;
  direction: string | null; // 좌향: 申坐艮向
  description: string | null; // 비문, 행장
  // tomb_location은 PostGIS GEOMETRY → 클라이언트에서는 {lat, lng}로 변환
  location: { lat: number; lng: number } | null;
};

/** 인물 마스터 (persons 테이블 매핑) */
export type Person = {
  id: PersonId;
  legacyId: number | null; // 기존 시스템 원본 ID 보존

  generation: Generation;
  branchId: BranchId | null;

  // 이름 (한글/한자 분리)
  nameKo: string;
  nameHanja: string | null;
  childLabel: string | null; // '아들', '딸', '○씨처'

  // 별칭
  jaKo: string | null; // 자(字) 한글
  jaHanja: string | null; // 자(字) 한자
  ho: string | null; // 호, 별호
  hoHanja: string | null;
  siho: string | null; // 시호
  sihoHanja: string | null;

  gender: Gender;

  // 생몰
  birth: LunarBirth;
  death: LunarBirth;

  // 사회적 정보
  gyeongryeok: string | null; // 경력 (관직, 직업)
  yagryeok: string | null; // 약력
  occupation: string | null;

  tomb: Tomb;

  // 족보 원문/번역
  jokboWonmun: string | null; // 한문 원문
  jokboTranslation: string | null; // 한글 번역

  isAlive: boolean; // GENERATED ALWAYS AS (death.year IS NULL)

  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────
// 관계(關係) — 양자 포함
// ─────────────────────────────────────────

/** 일반 SW와의 결정적 차이: 한 사람이 친부·친모·양부·양모 4명의 부모를 가질 수 있음 */
export type RelationType =
  | 'biological_father' // 친부 (生父)
  | 'biological_mother' // 친모 (生母)
  | 'adoptive_father' // 양부 (養父 / 系父)
  | 'adoptive_mother' // 양모
  | 'out_adoption' // 출계 (다른 가문으로 보냄)
  | 'in_adoption' // 입후 (양자로 받음)
  | 'spouse' // 배우자
  | 'child'; // 자녀 (역방향 캐시)

export type Relationship = {
  id: number;
  personId: PersonId;
  relatedId: PersonId | null; // out_adoption은 외부 가문이라 NULL 가능
  type: RelationType;
  isPrimary: boolean; // 가계도상 표시할 주 관계 (양부·생부 둘 다 있으면 양부가 primary)
  childOrder: number | null; // 형제 순서 (장남=1)
  isLegitimate: boolean; // 적자/서자 구분
  note: string | null;
  evidenceDocuments: unknown | null; // 인우보증 등 (JSONB)
};

/** 양자 출입현황 화면용 (adoption_view 매핑) */
export type AdoptionView = {
  personId: PersonId;
  generation: Generation;
  selfNameKo: string;
  selfNameHanja: string | null;
  // 생부 라인 (出系: 生家)
  bioFatherId: PersonId | null;
  bioFatherName: string | null;
  bioGrandfatherName: string | null;
  bioGreatGrandfatherName: string | null;
  // 양부 라인 (入後: 養家)
  adoptiveFatherId: PersonId | null;
  adoptiveFatherName: string | null;
  adoptiveGrandfatherName: string | null;
  adoptiveGreatGrandfatherName: string | null;
};

// ─────────────────────────────────────────
// 본관(本貫) · 배우자(配偶者)
// ─────────────────────────────────────────

/** 본관 — 혼인 가문 (예: 김해김씨, 全州李氏) */
export type Clan = {
  id: ClanId;
  nameKo: string; // 김해김씨
  nameHanja: string | null; // 金海金氏
  surnameKo: string | null; // 김
  surnameHanja: string | null; // 金
  originPlace: string | null; // 김해
  originPlaceHanja: string | null; // 金海
  aliases: string[];
  daughterInLawCount: number; // 며느리 받은 수
  sonInLawCount: number; // 사위 보낸 수
};

export type Spouse = {
  id: number;
  personId: PersonId;
  orderNum: number; // 1조, 2조, 3조
  spouseNameKo: string | null;
  spouseNameHanja: string | null;
  spouseClanId: ClanId | null;
  spouseClanRaw: string | null; // 원본 텍스트 보존
  spouseBirthDate: string | null;
  spouseDeathDate: string | null;
  spouseFatherName: string | null; // 장인/사돈
  marriageDate: string | null;
  isPrimary: boolean; // 정실 여부
  spouseNationality: string | null;
  spouseIsForeign: boolean;
};

// ─────────────────────────────────────────
// 사용자 · 신청 (수단 워크플로우)
// ─────────────────────────────────────────

export type Role =
  | 'guest' // 미인증 게스트
  | 'member' // 인증 종친
  | 'branch_admin' // 분파 임원
  | 'committee' // 대종중 위원
  | 'super_admin'; // 시스템 관리자

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type User = {
  id: UserId;
  email: string | null;
  phone: string | null;
  nameKo: string;
  nameHanja: string | null;
  verificationStatus: VerificationStatus;
  verifiedPersonId: PersonId | null;
  verifiedBy: UserId | null;
  verifiedAt: string | null;
  verificationNote: string | null;
  role: Role;
  branchId: BranchId | null;
  isPublic: boolean; // 다른 종친에게 노출 동의
  createdAt: string;
  lastLoginAt: string | null;
};

export type SudanApplicationType =
  | 'new_person' // 신규 인물 등록
  | 'edit_existing' // 기존 정보 수정
  | 'add_photo'
  | 'add_spouse'
  | 'add_child';

export type SudanApplicationStatus =
  | 'pending' // 입금 대기
  | 'deposited' // 입금 확인됨
  | 'reviewing' // 위원회 검토 중
  | 'approved'
  | 'rejected'
  | 'returned'; // 보완 요청

export type SudanApplication = {
  id: ApplicationId;
  applicantUserId: UserId;
  targetPersonId: PersonId | null; // 신규는 NULL
  applicationType: SudanApplicationType;
  status: SudanApplicationStatus;
  payload: unknown; // JSONB — 신청 데이터 (타입은 application_type별로 분기)
  photos: unknown | null;
  paymentAmount: number; // 수단비
  paymentCode: string | null; // "성도2410" 매칭 코드
  depositConfirmedAt: string | null;
  reviewerId: UserId | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

// ─────────────────────────────────────────
// Audit Log (정합성 정책 핵심)
// ─────────────────────────────────────────

export type PersonChangeLog = {
  id: number;
  personId: PersonId;
  fieldName: string; // 'name_hanja', 'birth_year' 등
  oldValue: string | null;
  newValue: string | null;
  changedBy: UserId;
  applicationId: ApplicationId | null;
  evidenceDocuments: unknown | null; // 인우보증 등 (JSONB)
  approvedBy: UserId | null;
  approvedAt: string | null;
  reason: string | null;
  createdAt: string;
};
