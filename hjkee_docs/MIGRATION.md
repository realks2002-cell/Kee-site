# MIGRATION — 으뜸족보 → Supabase

> 으뜸족보(Uttom Internet Pedigree, PHP + MySQL) DB 백업을 Supabase PostgreSQL로 이전하는 절차.

---

## 사전 정보

### 으뜸족보 시스템 정보

- **개발사**: Uttom Korea
- **운영 시작**: 2016년 (행주기씨대종중)
- **호스팅**: 카페24 (추정)
- **DBMS**: MySQL 5.x (추정)
- **인코딩**: EUC-KR 또는 UTF-8 (확인 필요)

### 받기로 한 자료

- [ ] DB 백업 파일 (`.sql` 덤프, 가능성 99%)
- [ ] 업로드 파일 폴더 (이미지, 문서)
- [ ] 으뜸족보 코드 (라이선스 확인 필수)
- [ ] 인물 5명 화면 캡처 (DB 값 ↔ 표시 정합성 확인용)
- [ ] 항렬자 표 (있는 경우)

---

## 1단계: 5분 진단 (자료 수령 즉시)

```bash
# 작업 디렉토리
cd hjkee/scripts/migration

# 받은 파일 확인
ls -lh /path/to/uttom_backup.sql

# 1. 파일 종류 확인
file uttom_backup.sql
# 결과 예시:
#   "ASCII text" → UTF-8 텍스트 (좋음)
#   "ISO-8859 text" → EUC-KR 가능성, iconv 변환 필요
#   "gzip compressed" → 압축 파일 (gunzip 필요)

# 2. 첫 부분 확인
head -100 uttom_backup.sql

# 3. 테이블 구조 추출
grep "CREATE TABLE" uttom_backup.sql

# 4. 한자 깨짐 샘플 확인
grep -a "李\|金\|朴\|奇" uttom_backup.sql | head -10
# 깨졌으면 \xXX 형태로 보임

# 5. 크기, 행 수
wc -l uttom_backup.sql
ls -lh uttom_backup.sql

# 6. INSERT INTO 로 데이터 양 추정
grep -c "INSERT INTO" uttom_backup.sql
```

### 예상 시나리오 분기

**시나리오 A: UTF-8 + 정규화 잘됨** (작업 1주)
- iconv 변환 불필요
- 외래키 깔끔
- 한자 손실 없음

**시나리오 B: EUC-KR + 부분 정규화** (작업 2주)
- iconv 변환 필요
- 자유 텍스트 일부 파싱 필요
- 일부 한자 손실 가능

**시나리오 C: 자유 텍스트 위주** (작업 4주)
- 분파, 양자관계가 비고란에 묻혀 있음
- LLM 파싱 필요 (Gemini Flash)

---

## 2단계: 로컬 환경 복원

```bash
# Docker MySQL 5.7 컨테이너 (한글 환경)
docker run -d \
  --name hjkee-uttom-mysql \
  -e MYSQL_ROOT_PASSWORD=local \
  -e MYSQL_DATABASE=uttom_jokbo \
  -e MYSQL_CHARACTER_SET_SERVER=utf8mb4 \
  -e MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci \
  -p 3306:3306 \
  mysql:5.7

# EUC-KR이면 변환 후 복원
iconv -f EUC-KR -t UTF-8 uttom_backup.sql > uttom_utf8.sql

# SET NAMES utf8 강제 추가
sed -i '1i SET NAMES utf8mb4;' uttom_utf8.sql

# 복원
docker exec -i hjkee-uttom-mysql mysql -uroot -plocal uttom_jokbo < uttom_utf8.sql
```

---

## 3단계: 스키마 분석

```bash
# 스키마 추출
docker exec hjkee-uttom-mysql mysqldump \
  --no-data \
  -uroot -plocal \
  uttom_jokbo > uttom_schema.sql

# Claude Code에 던져서 ERD 자동 생성
# - 핵심 테이블 식별 (persons, relationships, branches 등 추정)
# - 컬럼 의미 매핑
```

### 핵심 테이블 식별 (추정)

으뜸족보에 있을 것으로 예상되는 테이블:

```
ut_members         -- 인물 (가장 큰 테이블, 약 42,924행)
ut_relationships   -- 관계
ut_branches        -- 분파
ut_photos          -- 사진
ut_clans           -- 본관 (혼인 가문)
ut_admins          -- 관리자
g4_*               -- 그누보드 (게시판)
```

`ut_*` 또는 비슷한 prefix가 으뜸족보 데이터, `g4_*`는 그누보드.

---

## 4단계: 샘플 검증 (받은 5명 스크린샷 활용)

```sql
-- 클라이언트가 캡처해준 인물 5명 DB에서 조회
SELECT * FROM ut_members 
WHERE name_ko IN ('성도', '호준', '노준', '익삼', '민행')
LIMIT 50;

-- 화면에 보이는 값과 비교
-- ✓ 한자 깨짐 없는지
-- ✓ 부친·조부 정보 일치하는지
-- ✓ 양자관계 표시 일치하는지
-- ✓ 사진 경로 살아있는지
```

---

## 5단계: 마이그레이션 스크립트

```typescript
// hjkee/scripts/migration/migrate.ts

import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const uttom = await mysql.createConnection({
  host: 'localhost', user: 'root', password: 'local', database: 'uttom_jokbo'
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);

// ─────────────────────────────────────────
// Step 1: 본관 정규화 (Gemini Flash)
// ─────────────────────────────────────────
async function normalizeClans() {
  // 으뜸족보에서 모든 배우자 본관 추출
  const [rows] = await uttom.execute(`
    SELECT DISTINCT spouse_clan_raw 
    FROM ut_members 
    WHERE spouse_clan_raw IS NOT NULL
  `);
  
  // 약 800종을 Gemini로 정규화
  const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `다음 한국 본관 표기를 표준화하라. JSON 배열로만 답하라.
입력: ${JSON.stringify(rows.map(r => r.spouse_clan_raw))}
출력 형식: [{"raw": "원본", "surname_ko": "김", "surname_hanja": "金",
              "origin_ko": "김해", "origin_hanja": "金海",
              "canonical_ko": "김해김씨", "canonical_hanja": "金海金氏"}]`;
  
  const result = await model.generateContent(prompt);
  const normalized = JSON.parse(result.response.text());
  
  // Supabase clans 테이블에 적재
  const clansData = deduplicateClans(normalized);
  await supabase.from('clans').insert(clansData);
}

// ─────────────────────────────────────────
// Step 2: 분파 트리 구축
// ─────────────────────────────────────────
async function buildBranchTree() {
  // 1단계 대분파 6개
  const level1 = [
    { name: '재신공파', alias: '廉', count: 542 },
    { name: '정무공파', alias: '度', count: 32916 },
    { name: '낭장공파', alias: '仲敏', count: 5304 },
    { name: '규정공파', alias: '仲齊', count: 136 },
    { name: '지평공파', alias: '仲修', count: 3576 },
    { name: '군수공파', alias: '元義', count: 326 },
  ];
  
  for (const b of level1) {
    await supabase.from('branches').insert({
      name_ko: b.name,
      founder_alias: b.alias,
      level: 1,
      path: b.name.replace('파', '')
    });
  }
  
  // 2단계, 3단계 동일 패턴
}

// ─────────────────────────────────────────
// Step 3: 인물 마이그레이션 (배치)
// ─────────────────────────────────────────
async function migratePersons() {
  const BATCH_SIZE = 1000;
  let offset = 0;
  
  while (true) {
    const [rows] = await uttom.execute(`
      SELECT * FROM ut_members 
      ORDER BY member_id 
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `);
    
    if (rows.length === 0) break;
    
    const persons = rows.map(row => ({
      legacy_id: row.member_id,
      generation: row.generation,
      branch_id: branchMap[row.branch_name],  // 사전 빌드한 매핑
      
      name_ko: row.name_ko,
      name_hanja: row.name_hanja,
      child_label: row.child_label,  // '아들', '딸', '○씨처'
      
      ja_ko: row.ja_ko,
      ja_hanja: row.ja_hanja,
      ho: row.ho,
      ho_hanja: row.ho_hanja,
      siho: row.siho,
      siho_hanja: row.siho_hanja,
      
      gender: row.gender || (row.child_label === '아들' ? 'M' : 'F'),
      
      // 생몰 (간지 자동 추출)
      birth_year: parseYear(row.birth_text),
      birth_lunar_month: parseMonth(row.birth_text),
      birth_lunar_day: parseDay(row.birth_text),
      birth_ganji: parseGanji(row.birth_text) || calculateGanji(row.birth_year),
      
      death_year: parseYear(row.death_text),
      // ... 동일 패턴
      
      gyeongryeok: row.gyeongryeok,
      
      tomb_address: row.tomb_text,
      tomb_direction: extractDirection(row.tomb_text),
      
      jokbo_wonmun: row.original_text,
      jokbo_translation: row.translated_text,
    }));
    
    const { error } = await supabase.from('persons').insert(persons);
    if (error) console.error(`Batch ${offset} error:`, error);
    
    offset += BATCH_SIZE;
    console.log(`Migrated ${offset}/${TOTAL}`);
  }
}

// ─────────────────────────────────────────
// Step 4: 관계 (양자 포함)
// ─────────────────────────────────────────
async function migrateRelationships() {
  const [rows] = await uttom.execute(`SELECT * FROM ut_relationships`);
  
  const relationships = rows.flatMap(row => {
    const rels = [];
    
    // 친부
    if (row.bio_father_id) {
      rels.push({
        person_id: legacyMap[row.member_id],
        related_id: legacyMap[row.bio_father_id],
        type: 'biological_father',
        is_primary: !row.adoptive_father_id  // 양부 없으면 친부가 primary
      });
    }
    
    // 양부
    if (row.adoptive_father_id) {
      rels.push({
        person_id: legacyMap[row.member_id],
        related_id: legacyMap[row.adoptive_father_id],
        type: 'adoptive_father',
        is_primary: true  // 양부가 가계도상 primary
      });
    }
    
    // 출계 (다른 가문으로 보냄)
    if (row.is_outgoing_adoption) {
      rels.push({
        person_id: legacyMap[row.member_id],
        related_id: null,  // 외부 가문
        type: 'out_adoption',
        note: row.adoption_target_clan
      });
    }
    
    return rels;
  });
  
  // 배치 적재
  await batchInsert('relationships', relationships, 5000);
}

// ─────────────────────────────────────────
// Step 5: 항렬자 자동 추출
// ─────────────────────────────────────────
async function extractHangryeolja() {
  // 각 세대별로 이름 한자 빈도 분석
  const { data: byGen } = await supabase.rpc('analyze_name_patterns');
  
  for (const genStat of byGen) {
    // 첫 글자 빈도 vs 두 번째 글자 빈도 비교
    // 80% 이상 일치하는 글자 = 항렬자
    
    const hangryeol = identifyHangryeolja(genStat);
    if (!hangryeol) continue;
    
    await supabase.from('hangryeolja_table').insert({
      generation: genStat.generation,
      character_hanja: hangryeol.character,
      character_ko: hangryeol.korean,
      position: hangryeol.position,
      confidence: hangryeol.confidence,
      is_verified: false  // 위원회 검수 대기
    });
  }
}

// ─────────────────────────────────────────
// Step 6: 무결성 검증
// ─────────────────────────────────────────
async function validate() {
  // 6.1 인물 수 일치
  const [{ count: uttomCount }] = await uttom.execute(`SELECT COUNT(*) as count FROM ut_members`);
  const { count: supabaseCount } = await supabase.from('persons').select('*', { count: 'exact', head: true });
  
  console.log(`인물 수: ${uttomCount} → ${supabaseCount}`);
  if (uttomCount !== supabaseCount) throw new Error('인물 수 불일치');
  
  // 6.2 세대별 인원 일치 (행주기씨 통계와 비교)
  const expectedByGen = {
    1: 1, 2: 1, 3: 4, 4: 7, 5: 17, /* ... */ 33: 1
  };
  
  const { data: actual } = await supabase
    .from('persons')
    .select('generation, count(*)')
    .group('generation');
  
  // 각 세대 일치 검증
  for (const gen of Object.keys(expectedByGen)) {
    if (expectedByGen[gen] !== actual[gen]) {
      console.warn(`${gen}세 불일치: 기대 ${expectedByGen[gen]}, 실제 ${actual[gen]}`);
    }
  }
  
  // 6.3 외래키 무결성
  const { data: orphans } = await supabase.rpc('find_orphan_relationships');
  console.log(`고아 관계: ${orphans.length}건`);
  
  // 6.4 한자 깨짐 검출
  const { data: broken } = await supabase
    .from('persons')
    .select('id, name_hanja')
    .like('name_hanja', '%?%');
  
  console.log(`한자 깨짐 의심: ${broken.length}건`);
  
  // 6.5 보고서 생성
  await generateReport({
    totalCount: supabaseCount,
    byGeneration: actual,
    orphanCount: orphans.length,
    brokenHanjaCount: broken.length
  });
}
```

---

## 6단계: 보고서 클라이언트 제출

```markdown
# 마이그레이션 검증 보고서

## 인원 수 검증
- 으뜸족보 원본: 42,924명
- 신규 시스템: 42,924명 ✅

## 세대별 분포 (기존 통계와 100% 일치)
- 1세: 1명 ✅
- 2세: 1명 ✅
- ... (33개 세대 모두 일치)
- 33세: 1명 ✅

## 분파별 분포
- 정무공파: 32,916명 ✅
- 광주문중: 13,945명 ✅
- (모두 일치)

## 검출된 이슈
- 외래키 고아: ●건 (조치: ●●)
- 한자 깨짐 의심: ●건 (조치: ●●)
- 자유 텍스트 미파싱: ●건 (LLM 추가 처리 진행)

## 결론
데이터 손실 없음. Phase 1 진행 가능.
```

---

## 사진 마이그레이션

```bash
# 으뜸족보 사진 폴더 (FTP 백업 받음)
/path/to/uttom_uploads/
├── members/
│   ├── 12345_self.jpg
│   ├── 12345_spouse.jpg
│   ├── 12345_family.jpg
│   └── 12345_tomb.jpg

# Supabase Storage 업로드
ts-node scripts/migration/migrate_photos.ts
```

```typescript
async function migratePhotos() {
  for (const file of glob.sync('uttom_uploads/members/*.jpg')) {
    const [legacyId, category] = path.basename(file, '.jpg').split('_');
    const personId = legacyMap[legacyId];
    
    if (!personId) continue;
    
    // Supabase Storage 업로드
    const { data } = await supabase.storage
      .from('person-photos')
      .upload(`${personId}/${category}.jpg`, fs.readFileSync(file));
    
    // DB 레코드
    await supabase.from('person_photos').insert({
      person_id: personId,
      slot: SLOT_MAP[category],
      category,
      storage_path: data.path,
      original_size: fs.statSync(file).size
    });
  }
}
```

---

## 게시판 처리 (그누보드)

으뜸족보 DB에 그누보드 테이블(`g4_*`)이 섞여 있을 가능성 높음.

**전략**: 게시판 데이터는 신규 시스템에 이전하지 않고 **읽기 전용 아카이브**로 보관.

```typescript
// 1. 그누보드 테이블 export
mysqldump --tables g4_board g4_write_* g4_member \
  uttom_jokbo > gnuboard_archive.sql

// 2. 별도 read-only 인스턴스로 운영 (Phase 2 검토)
// 또는 핵심 글만 신규 게시판으로 수동 이전
```

---

## 마이그레이션 일정

```
Day 1 (Week 1, 월): 5분 진단 + Docker 복원
Day 2 (Week 1, 화): 스키마 분석 + ERD 매핑
Day 3 (Week 1, 수): 본관 정규화 (Gemini)
Day 4-5 (Week 1, 목금): 인물·관계 마이그레이션 스크립트 작성

Week 2: 본격 마이그레이션 + 검증
Day 1-2: 스크립트 실행 (배치)
Day 3: 양자관계 보정
Day 4: 항렬자 추출
Day 5: 무결성 검증 + 보고서
```

---

## 비상 시 롤백

```bash
# Supabase는 PITR (Point-in-Time Recovery) 지원
# 마이그레이션 시작 전 백업 시점 명시 → 문제 시 즉시 롤백 가능

# 또는 마이그레이션을 트랜잭션으로 묶기
BEGIN;
-- 모든 INSERT
-- 검증 SELECT
COMMIT;  -- 또는 ROLLBACK
```
