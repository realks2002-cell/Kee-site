# DATABASE 스키마

> **DBMS**: PostgreSQL 15 (Supabase)  
> **확장**: ltree, pg_trgm, postgis (Phase 1.5), uuid-ossp

---

## 핵심 테이블 8개

### 1. `persons` — 인물 마스터

```sql
CREATE TABLE persons (
  id BIGSERIAL PRIMARY KEY,
  legacy_id INTEGER UNIQUE,                    -- 으뜸족보 원본 ID 보존

  -- 식별
  generation INTEGER NOT NULL,                 -- 세(世): 1~33
  branch_id BIGINT REFERENCES branches(id),    -- 분파
  
  -- 이름 (한글/한자 분리)
  name_ko VARCHAR NOT NULL,                    -- 성도
  name_hanja VARCHAR,                          -- 成度
  child_label VARCHAR,                         -- '아들', '딸', '○씨처' 자동
  
  -- 별칭
  ja_ko VARCHAR,                               -- 자(字) 한글
  ja_hanja VARCHAR,                            -- 자(字) 한자 (예: 成道)
  ho VARCHAR,                                  -- 호, 별호
  ho_hanja VARCHAR,
  siho VARCHAR,                                -- 시호
  siho_hanja VARCHAR,
  
  -- 성별
  gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  
  -- 생몰 (음력 + 간지 + 양력 변환)
  birth_date_western DATE,                     -- 양력 변환 결과
  birth_year INTEGER,
  birth_lunar_month INTEGER,
  birth_lunar_day INTEGER,
  birth_ganji VARCHAR(8),                      -- 壬寅 등
  birth_is_lunar BOOLEAN DEFAULT TRUE,
  
  death_date_western DATE,
  death_year INTEGER,
  death_lunar_month INTEGER,
  death_lunar_day INTEGER,
  death_ganji VARCHAR(8),
  death_is_lunar BOOLEAN,
  
  -- 사회적 정보
  gyeongryeok TEXT,                            -- 경력 (관직, 직업)
  yagryeok TEXT,                               -- 약력
  occupation VARCHAR,                          -- 현대 직업 (선택)
  
  -- 묘소
  tomb_address VARCHAR,
  tomb_location GEOMETRY(POINT, 4326),         -- PostGIS (Phase 1.5)
  tomb_direction VARCHAR,                      -- 좌향: 申坐艮向 등
  tomb_description TEXT,                       -- 비문, 행장
  
  -- 족보 원문/번역
  jokbo_wonmun TEXT,                           -- 한문 원문
  jokbo_translation TEXT,                      -- 한글 번역
  
  -- 검색 인덱스 (자동 갱신 트리거)
  search_text tsvector,
  
  -- 메타
  is_alive BOOLEAN GENERATED ALWAYS AS (death_year IS NULL) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검색 인덱스
CREATE INDEX idx_persons_search ON persons USING gin(search_text);
CREATE INDEX idx_persons_name_ko ON persons USING gin(name_ko gin_trgm_ops);
CREATE INDEX idx_persons_name_hanja ON persons USING gin(name_hanja gin_trgm_ops);
CREATE INDEX idx_persons_gen_branch ON persons (generation, branch_id);
CREATE INDEX idx_persons_alive ON persons (is_alive) WHERE is_alive = TRUE;
CREATE INDEX idx_persons_legacy ON persons (legacy_id);

-- search_text 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_person_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := to_tsvector('simple',
    COALESCE(NEW.name_ko, '') || ' ' ||
    COALESCE(NEW.name_hanja, '') || ' ' ||
    COALESCE(NEW.ja_ko, '') || ' ' ||
    COALESCE(NEW.ja_hanja, '') || ' ' ||
    COALESCE(NEW.ho, '') || ' ' ||
    COALESCE(NEW.ho_hanja, '') || ' ' ||
    COALESCE(NEW.gyeongryeok, '')
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER persons_search_update
BEFORE INSERT OR UPDATE ON persons
FOR EACH ROW EXECUTE FUNCTION update_person_search();
```

---

### 2. `relationships` — 관계 (양자 포함)

```sql
CREATE TABLE relationships (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  related_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  
  type VARCHAR NOT NULL CHECK (type IN (
    'biological_father',    -- 친부 (生父)
    'biological_mother',    -- 친모 (生母)
    'adoptive_father',      -- 양부 (養父 / 系父)
    'adoptive_mother',      -- 양모
    'out_adoption',         -- 출계 (다른 가문으로 보냄)
    'in_adoption',          -- 입후 (양자로 받음)
    'spouse',               -- 배우자
    'child'                 -- 자녀 (역방향 캐시)
  )),
  
  is_primary BOOLEAN DEFAULT TRUE,             -- 가계도상 표시할 주 관계
  child_order INTEGER,                         -- 형제 순서 (장남=1)
  is_legitimate BOOLEAN DEFAULT TRUE,          -- 적자/서자 구분
  
  note TEXT,
  evidence_documents JSONB,                    -- 인우보증 등
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rel_person ON relationships (person_id, type);
CREATE INDEX idx_rel_related ON relationships (related_id, type);
CREATE INDEX idx_rel_primary ON relationships (person_id, is_primary) WHERE is_primary = TRUE;

-- 양자관계 빠른 조회 뷰 (양자 출입현황 화면용)
CREATE VIEW adoption_view AS
SELECT 
  p.id AS person_id,
  p.generation,
  p.name_ko AS bio_self_name_ko,
  p.name_hanja AS ado_self_name_hanja,
  -- 생부 라인
  bf.id AS bio_father_id,
  bf.name_ko AS bio_father_name,
  bgf.name_ko AS bio_grandfather_name,
  bggf.name_ko AS bio_great_grandfather_name,
  -- 양부 라인
  af.id AS adoptive_father_id,
  af.name_ko AS adoptive_father_name,
  agf.name_ko AS adoptive_grandfather_name,
  aggf.name_ko AS adoptive_great_grandfather_name
FROM persons p
JOIN relationships rb ON p.id = rb.person_id AND rb.type = 'biological_father'
JOIN persons bf ON rb.related_id = bf.id
LEFT JOIN relationships rgf ON bf.id = rgf.person_id AND rgf.type = 'biological_father'
LEFT JOIN persons bgf ON rgf.related_id = bgf.id
LEFT JOIN relationships rggf ON bgf.id = rggf.person_id AND rggf.type = 'biological_father'
LEFT JOIN persons bggf ON rggf.related_id = bggf.id
JOIN relationships ra ON p.id = ra.person_id AND ra.type = 'adoptive_father'
JOIN persons af ON ra.related_id = af.id
LEFT JOIN relationships ragf ON af.id = ragf.person_id AND ragf.type = 'biological_father'
LEFT JOIN persons agf ON ragf.related_id = agf.id
LEFT JOIN relationships raggf ON agf.id = raggf.person_id AND raggf.type = 'biological_father'
LEFT JOIN persons aggf ON raggf.related_id = aggf.id;
```

---

### 3. `branches` — 분파 트리

```sql
CREATE TABLE branches (
  id BIGSERIAL PRIMARY KEY,
  
  -- 기본 정보
  name_ko VARCHAR NOT NULL,                    -- 정무공파, 광주문중
  name_alt VARCHAR,                            -- 별칭 (덕성군, 참판공)
  founder_title VARCHAR,                       -- 諱대림 (시조 휘)
  founder_alias VARCHAR,                       -- 度, 仲敏
  founder_alias_hanja VARCHAR,
  founder_person_id BIGINT REFERENCES persons(id),
  
  -- 트리 구조
  parent_branch_id BIGINT REFERENCES branches(id),
  level INTEGER NOT NULL,                      -- 1, 2, 3
  path ltree NOT NULL,                         -- '정무공.광주.승지공.기은문중'
  
  generation_split INTEGER,                    -- 분파 시점 세대
  display_order INTEGER,
  description TEXT,
  lineage_name VARCHAR,                        -- "고흥군 諱대유 계통"
  
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 통계 캐시 (cron으로 갱신)
  total_count INTEGER DEFAULT 0,
  alive_count INTEGER DEFAULT 0,
  stats_updated_at TIMESTAMPTZ
);

CREATE INDEX idx_branches_path ON branches USING GIST (path);
CREATE INDEX idx_branches_parent ON branches (parent_branch_id, level);
```

**분파 데이터 (확정)**:
```
1단계 (대분파):
  재신공(廉)        542명
  정무공(度)      32,916명 ← 주류
  낭장공(仲敏)    5,304명
  규정공(仲齊)      136명
  지평공(仲修)    3,576명
  군수공(元義)      326명

2단계 (정무공 산하):
  도승지공(逈)      1,719명
  장성/참판공(遠)   8,418명
  별좌공(适)        3,869명
  광주/덕성군(進)  13,945명 ← 주류
  복재공(遵)        4,252명
  현감공(襒)          180명
  감역공(碩)          510명

3단계 (광주/덕성군 산하 — 휘대림 계통):
  왕심봉문중(邦獻)    702명
  만수재문중(昌獻)  1,527명
  기은문중(義獻)    4,356명
  곡성공문중(孝荃)    205명

3단계 (광주/덕성군 산하 — 휘대승 계통):
  너부실문중(琡)    3,675명
  함평문중(海柱)       66명
  나정문중(齡獻)    2,725명
  파주문중(東獻)      651명
```

---

### 4. `clans` — 본관 (혼인 관계용)

```sql
CREATE TABLE clans (
  id BIGSERIAL PRIMARY KEY,
  name_ko VARCHAR NOT NULL,                    -- 김해김씨
  name_hanja VARCHAR,                          -- 金海金氏
  surname_ko CHAR(1),                          -- 김
  surname_hanja CHAR(1),                       -- 金
  origin_place VARCHAR,                        -- 김해 (본관)
  origin_place_hanja VARCHAR,                  -- 金海
  
  aliases TEXT[],                              -- 표기 변형 모음
  
  -- 통계 캐시
  daughter_in_law_count INTEGER DEFAULT 0,
  son_in_law_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0
);

CREATE INDEX idx_clans_name ON clans USING gin(name_ko gin_trgm_ops);
CREATE INDEX idx_clans_aliases ON clans USING gin(aliases);
```

---

### 5. `spouses` — 배우자 (1조, 2조, 3조)

```sql
CREATE TABLE spouses (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,                  -- 1조, 2조, 3조
  
  spouse_name_ko VARCHAR,
  spouse_name_hanja VARCHAR,
  spouse_clan_id BIGINT REFERENCES clans(id),
  spouse_clan_raw TEXT,                        -- 원본 텍스트 보존
  spouse_birth_date DATE,
  spouse_death_date DATE,
  spouse_father_name VARCHAR,                  -- 장인/사돈
  
  marriage_date DATE,
  is_primary BOOLEAN DEFAULT TRUE,             -- 정실 여부
  
  -- 외국인 배우자
  spouse_nationality VARCHAR,                  -- '한국', '일본' 등
  spouse_is_foreign BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spouses_person ON spouses (person_id, order_num);
```

---

### 6. `person_photos` — 사진 (4매 슬롯)

```sql
CREATE TABLE person_photos (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 4),
  category VARCHAR NOT NULL CHECK (category IN ('self', 'spouse', 'family', 'tomb')),
  
  storage_path VARCHAR NOT NULL,               -- Supabase Storage 경로
  thumbnail_path VARCHAR,                      -- 자동 생성 썸네일
  original_size INTEGER,                       -- bytes
  
  uploaded_by BIGINT REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (person_id, slot)
);
```

---

### 7. `users` — 사용자 (NICE 대체, 위원회 인증)

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  
  email VARCHAR UNIQUE,
  phone VARCHAR,
  password_hash VARCHAR,                       -- Supabase Auth가 관리
  
  name_ko VARCHAR NOT NULL,
  name_hanja VARCHAR,
  
  -- 종친 인증 상태 (NICE 대신 위원회 수동)
  verification_status VARCHAR DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'verified', 'rejected'
  )),
  verified_person_id BIGINT REFERENCES persons(id),  -- 어떤 인물과 매칭됐는지
  verified_by BIGINT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  verification_note TEXT,
  
  -- 권한
  role VARCHAR DEFAULT 'member' CHECK (role IN (
    'guest',           -- 미인증 게스트
    'member',          -- 인증 종친
    'branch_admin',    -- 분파 임원
    'committee',       -- 대종중 위원
    'super_admin'      -- 시스템 관리자
  )),
  branch_id BIGINT REFERENCES branches(id),    -- 본인 분파
  
  -- 개인정보
  is_public BOOLEAN DEFAULT FALSE,             -- 다른 종친에게 노출 동의
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (verification_status, role);
CREATE INDEX idx_users_branch ON users (branch_id, role);
```

---

### 8. `sudan_applications` — 수단(신규 등록) 신청

```sql
CREATE TABLE sudan_applications (
  id BIGSERIAL PRIMARY KEY,
  applicant_user_id BIGINT NOT NULL REFERENCES users(id),
  target_person_id BIGINT REFERENCES persons(id),  -- 신규는 NULL
  
  application_type VARCHAR NOT NULL CHECK (application_type IN (
    'new_person',         -- 신규 인물 등록
    'edit_existing',      -- 기존 정보 수정
    'add_photo',          -- 사진 추가
    'add_spouse',         -- 배우자 추가
    'add_child'           -- 자녀 추가
  )),
  
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',            -- 입금 대기
    'deposited',          -- 입금 확인됨
    'reviewing',          -- 위원회 검토 중
    'approved',           -- 승인 완료
    'rejected',           -- 반려
    'returned'            -- 보완 요청
  )),
  
  -- 신청 데이터 (스키마 유연)
  payload JSONB NOT NULL,
  photos JSONB,                                -- [{slot, category, temp_path}]
  
  -- 입금 (Toss 대체)
  payment_amount INTEGER NOT NULL,             -- 수단비
  payment_code VARCHAR UNIQUE,                 -- "성도2410" 매칭 코드
  payment_status VARCHAR DEFAULT 'pending',
  deposit_confirmed_at TIMESTAMPTZ,
  deposit_confirmed_by BIGINT REFERENCES users(id),
  deposit_note TEXT,
  
  -- 검토
  reviewer_id BIGINT REFERENCES users(id),
  review_note TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sudan_status ON sudan_applications (status, created_at DESC);
CREATE INDEX idx_sudan_user ON sudan_applications (applicant_user_id);
CREATE INDEX idx_sudan_payment_code ON sudan_applications (payment_code);
```

---

## 보조 테이블

### `person_change_log` — Audit Log (정합성 정책 핵심)

```sql
CREATE TABLE person_change_log (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES persons(id),
  
  field_name VARCHAR NOT NULL,                 -- 변경된 컬럼
  old_value TEXT,
  new_value TEXT,
  
  changed_by BIGINT NOT NULL REFERENCES users(id),
  application_id BIGINT REFERENCES sudan_applications(id),
  evidence_documents JSONB,                    -- 인우보증 등
  
  approved_by BIGINT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  reason TEXT,                                 -- 변경 사유
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_changelog_person ON person_change_log (person_id, created_at DESC);
```

### `gaseungbo_orders` — 가승보 발행 신청

```sql
CREATE TABLE gaseungbo_orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  person_id BIGINT NOT NULL REFERENCES persons(id),
  
  copies INTEGER NOT NULL CHECK (copies >= 10),
  unit_price INTEGER DEFAULT 30000,
  total_amount INTEGER GENERATED ALWAYS AS (copies * unit_price) STORED,
  
  -- 결제
  payment_code VARCHAR UNIQUE,
  payment_status VARCHAR DEFAULT 'pending',
  
  -- 배송
  shipping_address JSONB,
  shipping_status VARCHAR DEFAULT 'preparing',
  tracking_number VARCHAR,
  
  -- PDF
  pdf_generated_path VARCHAR,
  print_vendor_order_id VARCHAR,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `hangryeolja_table` — 항렬자 표 (자동 추출 + 위원회 검수)

```sql
CREATE TABLE hangryeolja_table (
  id BIGSERIAL PRIMARY KEY,
  generation INTEGER NOT NULL UNIQUE,
  character_hanja VARCHAR(2) NOT NULL,         -- 度, 老, 宇 등
  character_ko VARCHAR(2) NOT NULL,            -- 도, 노, 우
  position VARCHAR NOT NULL CHECK (position IN ('first', 'second')),
  confidence NUMERIC(3,2),                     -- 0.00~1.00 (자동 추출 신뢰도)
  is_verified BOOLEAN DEFAULT FALSE,           -- 위원회 검수 완료
  verified_by BIGINT REFERENCES users(id),
  notes TEXT
);
```

---

## RLS (Row-Level Security) 정책

```sql
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sudan_applications ENABLE ROW LEVEL SECURITY;

-- 인물 조회: 누구나 가능 (생존자 개인정보는 마스킹)
CREATE POLICY "persons_select_all" ON persons
  FOR SELECT USING (TRUE);

-- 인물 수정: super_admin + committee + 본인 (대상 인물의 verified_user)
CREATE POLICY "persons_update_authorized" ON persons
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('super_admin', 'committee')
    )
  );

-- 사용자 정보: 본인 + 같은 분파 임원만
CREATE POLICY "users_select_own_or_branch" ON users
  FOR SELECT USING (
    id = auth.uid() OR
    branch_id IN (
      SELECT branch_id FROM users
      WHERE id = auth.uid() AND role IN ('branch_admin', 'committee', 'super_admin')
    )
  );

-- 신청서: 본인 또는 위원회만
CREATE POLICY "sudan_select_own_or_committee" ON sudan_applications
  FOR SELECT USING (
    applicant_user_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('committee', 'super_admin')
    )
  );
```

---

## 핵심 RPC 함수

### `search_persons` — 통합 검색

```sql
CREATE OR REPLACE FUNCTION search_persons(
  q_name TEXT DEFAULT NULL,
  q_father TEXT DEFAULT NULL,
  q_ja TEXT DEFAULT NULL,
  q_ho TEXT DEFAULT NULL,
  q_gwanjik TEXT DEFAULT NULL,
  q_spouse TEXT DEFAULT NULL,
  q_branch_id BIGINT DEFAULT NULL,
  q_generation INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE (
  id BIGINT,
  name_ko VARCHAR,
  name_hanja VARCHAR,
  generation INTEGER,
  branch_name VARCHAR,
  father_name VARCHAR,
  grandfather_name VARCHAR,
  great_grandfather_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH father_lookup AS (
    SELECT r.person_id, p.name_ko AS f_name
    FROM relationships r
    JOIN persons p ON r.related_id = p.id
    WHERE r.type IN ('biological_father', 'adoptive_father')
      AND r.is_primary = TRUE
  )
  SELECT p.id, p.name_ko, p.name_hanja, p.generation,
         b.name_ko, fl.f_name, NULL::VARCHAR, NULL::VARCHAR
  FROM persons p
  LEFT JOIN branches b ON p.branch_id = b.id
  LEFT JOIN father_lookup fl ON p.id = fl.person_id
  WHERE 
    (q_name IS NULL OR p.name_ko ILIKE '%' || q_name || '%' OR p.name_hanja ILIKE '%' || q_name || '%')
    AND (q_father IS NULL OR fl.f_name ILIKE '%' || q_father || '%')
    AND (q_ja IS NULL OR p.ja_ko ILIKE '%' || q_ja || '%' OR p.ja_hanja ILIKE '%' || q_ja || '%')
    AND (q_ho IS NULL OR p.ho ILIKE '%' || q_ho || '%' OR p.ho_hanja ILIKE '%' || q_ho || '%')
    AND (q_gwanjik IS NULL OR p.gyeongryeok ILIKE '%' || q_gwanjik || '%')
    AND (q_branch_id IS NULL OR p.branch_id = q_branch_id)
    AND (q_generation IS NULL OR p.generation = q_generation)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;
```

### `calculate_chonsu` — 촌수 계산 (LCA)

```sql
CREATE OR REPLACE FUNCTION calculate_chonsu(
  person_a BIGINT,
  person_b BIGINT,
  use_adoptive BOOLEAN DEFAULT TRUE             -- TRUE: 양부 라인, FALSE: 친부 라인
) RETURNS TABLE (
  chonsu INTEGER,
  common_ancestor_id BIGINT,
  common_ancestor_name VARCHAR
) AS $$
WITH RECURSIVE
  ancestors_a AS (
    SELECT person_a AS id, 0 AS distance, ARRAY[person_a] AS path
    UNION ALL
    SELECT r.related_id, a.distance + 1, a.path || r.related_id
    FROM ancestors_a a
    JOIN relationships r ON r.person_id = a.id
    WHERE 
      ((use_adoptive AND r.type = 'adoptive_father') OR 
       (NOT use_adoptive AND r.type = 'biological_father'))
      AND a.distance < 12
      AND r.related_id != ALL(a.path)
  ),
  ancestors_b AS (
    SELECT person_b AS id, 0 AS distance, ARRAY[person_b] AS path
    UNION ALL
    SELECT r.related_id, b.distance + 1, b.path || r.related_id
    FROM ancestors_b b
    JOIN relationships r ON r.person_id = b.id
    WHERE 
      ((use_adoptive AND r.type = 'adoptive_father') OR 
       (NOT use_adoptive AND r.type = 'biological_father'))
      AND b.distance < 12
      AND r.related_id != ALL(b.path)
  )
SELECT 
  (a.distance + b.distance) AS chonsu,
  a.id AS common_ancestor_id,
  p.name_ko AS common_ancestor_name
FROM ancestors_a a
JOIN ancestors_b b ON a.id = b.id
JOIN persons p ON a.id = p.id
ORDER BY (a.distance + b.distance)
LIMIT 1;
$$ LANGUAGE sql STABLE;
```

### `get_direct_lineage` — 직계 5세대 조회

```sql
CREATE OR REPLACE FUNCTION get_direct_lineage(
  target_person_id BIGINT,
  ancestors_levels INTEGER DEFAULT 4,
  descendants_levels INTEGER DEFAULT 1
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- 직계 조상·자손 트리 빌드
  -- (구현 상세는 코드 작성 시)
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 마이그레이션 전 체크리스트

자료 받자마자 **5분 안에 실행**:

```bash
# 1. 인코딩 확인
file /path/to/backup.sql
# 결과: ASCII text → UTF-8 가능
#       ISO-8859 → EUC-KR 가능성, iconv 변환 필요

# 2. 테이블 구조
grep "CREATE TABLE" backup.sql

# 3. 한자 깨짐 샘플
grep -a "李\|金\|朴" backup.sql | head -5
# 깨졌으면 \xXX 형태로 보임

# 4. 크기·행 수
wc -l backup.sql
ls -lh backup.sql

# 5. EUC-KR이면 변환
iconv -f EUC-KR -t UTF-8 backup.sql > backup_utf8.sql
```

상세 마이그레이션 절차는 `MIGRATION.md` 참조.
