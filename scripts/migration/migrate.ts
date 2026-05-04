// 으뜸족보(MySQL) → Supabase(PostgreSQL) 마이그레이션
//
// 실행:
//   pnpm tsx scripts/migration/migrate.ts
//
// 단계 (MIGRATION.md 참조):
//   1. 본관 정규화 (Gemini Flash, ~800종)
//   2. 분파 트리 (3단계)
//   3. 인물 (배치 1000건씩, ~42,924명)
//   4. 관계 (양자 포함)
//   5. 항렬자 자동 추출
//   6. 무결성 검증
//
// 본 파일은 골격만 작성됨. 으뜸족보 스키마 확정(자료 수령) 후 채운다.

import mysql from 'mysql2/promise';
import { createServiceClient } from '@hjkee/db/server';

const BATCH_SIZE = 1000;

async function main() {
  const uttom = await mysql.createConnection({
    uri: process.env.UTTOM_MYSQL_URL ?? 'mysql://root:local@localhost:3306/uttom_jokbo',
  });
  const supabase = createServiceClient();

  console.log('▶ 1/6 본관 정규화 (Gemini)');
  // await normalizeClans(uttom, supabase);

  console.log('▶ 2/6 분파 트리 빌드');
  // await buildBranchTree(supabase);

  console.log('▶ 3/6 인물 마이그레이션');
  // await migratePersons(uttom, supabase);

  console.log('▶ 4/6 관계 (양자 포함)');
  // await migrateRelationships(uttom, supabase);

  console.log('▶ 5/6 항렬자 자동 추출');
  // await extractHangryeolja(supabase);

  console.log('▶ 6/6 무결성 검증');
  // await validate(uttom, supabase);

  await uttom.end();
  console.log('✓ 완료');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { BATCH_SIZE };
