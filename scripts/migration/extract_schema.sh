#!/usr/bin/env bash
# 으뜸족보 MySQL 컨테이너에서 스키마(데이터 제외) 추출
#
# Usage:
#   bash scripts/migration/extract_schema.sh
#   결과: scripts/migration/uttom_schema.sql

set -euo pipefail

OUT="$(dirname "$0")/uttom_schema.sql"

if ! docker ps --format '{{.Names}}' | grep -q '^hjkee-uttom-mysql$'; then
  echo "ERROR: hjkee-uttom-mysql 컨테이너가 실행 중이 아닙니다."
  echo "       먼저: pnpm uttom:up"
  exit 1
fi

echo "Extracting schema → $OUT"
docker exec hjkee-uttom-mysql mysqldump \
  --no-data \
  --skip-add-drop-table \
  --skip-comments \
  -uroot -plocal \
  uttom_jokbo > "$OUT"

echo ""
echo "✓ 스키마 추출 완료. 다음 단계:"
echo "  1. cat $OUT | head -100"
echo "  2. ERD 생성 (Claude Code에 던지기)"
echo "  3. packages/db/src/types.generated.ts 매핑"
