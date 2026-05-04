#!/usr/bin/env bash
# 으뜸족보 백업 5분 진단 — 자료 수령 즉시 실행
#
# Usage:
#   bash scripts/migration/diagnose.sh /path/to/uttom_backup.sql
#   pnpm uttom:diagnose /path/to/uttom_backup.sql
#
# Output:
#   1. 파일 종류·크기·인코딩
#   2. 테이블 목록 (CREATE TABLE 추출)
#   3. INSERT INTO 행 추정
#   4. 한자 깨짐 샘플
#   5. 시나리오 분기 추천 (A/B/C)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-uttom-backup.sql>"
  exit 64
fi

SQL="$1"

if [[ ! -f "$SQL" ]]; then
  echo "ERROR: File not found: $SQL"
  exit 66
fi

# 색상
if [[ -t 1 ]]; then
  C_BOLD=$'\033[1m'
  C_DIM=$'\033[2m'
  C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_BLUE=$'\033[34m'
  C_RESET=$'\033[0m'
else
  C_BOLD='' C_DIM='' C_RED='' C_GREEN='' C_YELLOW='' C_BLUE='' C_RESET=''
fi

section() {
  echo ""
  echo "${C_BOLD}${C_BLUE}━━━ $1 ━━━${C_RESET}"
}

ok()    { echo "${C_GREEN}✓${C_RESET} $1"; }
warn()  { echo "${C_YELLOW}⚠${C_RESET} $1"; }
err()   { echo "${C_RED}✗${C_RESET} $1"; }

# ─────────────────────────────────────────
section "1. 파일 메타"
# ─────────────────────────────────────────

SIZE_HUMAN=$(ls -lh "$SQL" | awk '{print $5}')
SIZE_BYTES=$(wc -c < "$SQL" | tr -d ' ')
LINES=$(wc -l < "$SQL" | tr -d ' ')

echo "  경로:      $SQL"
echo "  크기:      $SIZE_HUMAN ($SIZE_BYTES bytes)"
echo "  행 수:     $LINES"

FILE_TYPE=$(file -b "$SQL")
echo "  파일 타입: $FILE_TYPE"

# 압축 여부
COMPRESSED=false
case "$FILE_TYPE" in
  *gzip*) COMPRESSED=true; warn "gzip 압축됨 — 'gunzip $SQL' 실행 후 재진단" ;;
  *bzip2*) COMPRESSED=true; warn "bzip2 압축됨 — 'bunzip2 $SQL' 실행 후 재진단" ;;
  *Zip*) COMPRESSED=true; warn "zip 압축됨 — unzip 후 재진단" ;;
esac

if [[ "$COMPRESSED" == "true" ]]; then
  exit 0
fi

# ─────────────────────────────────────────
section "2. 인코딩 추정"
# ─────────────────────────────────────────

ENCODING="UTF-8"
case "$FILE_TYPE" in
  *UTF-8*)        ENCODING="UTF-8";        ok "UTF-8 (변환 불필요)" ;;
  *ASCII*)        ENCODING="ASCII/UTF-8";  ok "ASCII (UTF-8 호환)" ;;
  *ISO-8859*)     ENCODING="EUC-KR(?)";    warn "ISO-8859 — EUC-KR 가능성. iconv 변환 필요" ;;
  *Non-ISO*)      ENCODING="EUC-KR(?)";    warn "Non-ISO — EUC-KR 가능성. iconv 변환 필요" ;;
  *)              ENCODING="UNKNOWN";      warn "인코딩 불명 — 샘플 확인 후 결정" ;;
esac

# 첫 200줄에서 SET NAMES 또는 charset 선언 찾기
CHARSET_DECL=$(head -n 200 "$SQL" 2>/dev/null | grep -iE "(SET NAMES|DEFAULT CHARSET|CHARACTER SET)" | head -3 || true)
if [[ -n "$CHARSET_DECL" ]]; then
  echo "  Charset 선언:"
  echo "$CHARSET_DECL" | sed 's/^/    /'
fi

# ─────────────────────────────────────────
section "3. 테이블 구조"
# ─────────────────────────────────────────

TABLE_COUNT=$(grep -ciE "^CREATE TABLE" "$SQL" || true)
echo "  CREATE TABLE 개수: $TABLE_COUNT"

if [[ "$TABLE_COUNT" -gt 0 ]]; then
  echo "  테이블 목록 (상위 30개):"
  grep -iE "^CREATE TABLE" "$SQL" \
    | sed -E 's/CREATE TABLE (IF NOT EXISTS )?[`"]?([^ `";(]+)[`"]?.*/\2/I' \
    | head -30 \
    | sed 's/^/    /'

  # ut_* (으뜸족보) vs g4_* (그누보드 게시판) 분류
  UT_COUNT=$(grep -ciE "^CREATE TABLE.*[\`'\"]?ut_" "$SQL" || true)
  G4_COUNT=$(grep -ciE "^CREATE TABLE.*[\`'\"]?g4_" "$SQL" || true)
  echo ""
  echo "  분류 추정:"
  echo "    ut_*  (으뜸족보 본 데이터): $UT_COUNT"
  echo "    g4_*  (그누보드 게시판):    $G4_COUNT"
  if [[ "$G4_COUNT" -gt 0 ]]; then
    warn "그누보드 테이블 발견 — 게시판은 read-only 아카이브로 분리 검토"
  fi
else
  err "CREATE TABLE 미발견 — 데이터 덤프만 있을 가능성"
fi

# ─────────────────────────────────────────
section "4. 데이터 양 추정"
# ─────────────────────────────────────────

INSERT_COUNT=$(grep -ciE "^INSERT INTO" "$SQL" || true)
echo "  INSERT INTO 문장 개수: $INSERT_COUNT"

# 가장 많은 INSERT를 가진 테이블 추정 (간이)
if [[ "$INSERT_COUNT" -gt 0 ]]; then
  echo "  INSERT 빈도 상위 5개 테이블:"
  grep -iE "^INSERT INTO" "$SQL" \
    | sed -E 's/INSERT INTO [`"]?([^ `";(]+)[`"]?.*/\1/I' \
    | sort | uniq -c | sort -rn | head -5 \
    | awk '{printf "    %6d  %s\n", $1, $2}'
fi

# ─────────────────────────────────────────
section "5. 한자 깨짐 샘플"
# ─────────────────────────────────────────

# UTF-8이면 정상 한자가 보여야 함. EUC-KR 그대로면 \xXX 또는 ? 형태.
SAMPLES=$(grep -aE "李|金|朴|奇|尹|崔|鄭|姜" "$SQL" 2>/dev/null | head -3 || true)
if [[ -n "$SAMPLES" ]]; then
  ok "한자 정상 표시 — UTF-8 가능성 높음"
  echo "$SAMPLES" | sed 's/^/    /' | cut -c1-200
else
  warn "기본 한자(李,金,朴,奇,尹,崔,鄭,姜) 미발견"
  echo "    가능성 1: EUC-KR 인코딩 (변환 후 재시도)"
  echo "    가능성 2: 데이터 자체에 한자가 적음"
  # \xXX 패턴 스캔
  if head -c 2000000 "$SQL" | grep -q $'\xb1\xe2\xbc\xba'; then
    warn "EUC-KR 시그니처 감지 (기성 패턴 \\xb1\\xe2\\xbc\\xba = '기성')"
  fi
fi

# ─────────────────────────────────────────
section "6. 외래키·인덱스 추정"
# ─────────────────────────────────────────

FK_COUNT=$(grep -ciE "FOREIGN KEY" "$SQL" || true)
PK_COUNT=$(grep -ciE "PRIMARY KEY" "$SQL" || true)
IDX_COUNT=$(grep -ciE "(KEY|INDEX) [\`'\"]" "$SQL" || true)

echo "  FOREIGN KEY: $FK_COUNT"
echo "  PRIMARY KEY: $PK_COUNT"
echo "  KEY/INDEX:   $IDX_COUNT"

if [[ "$FK_COUNT" -eq 0 ]]; then
  warn "외래키 없음 — 관계 정합성을 데이터로 검증해야 함"
fi

# ─────────────────────────────────────────
section "7. 시나리오 분기"
# ─────────────────────────────────────────

echo ""
if [[ "$ENCODING" == "UTF-8" || "$ENCODING" == "ASCII/UTF-8" ]] && [[ "$FK_COUNT" -gt 0 ]]; then
  ok "${C_BOLD}시나리오 A — UTF-8 + 정규화 잘됨 (작업 약 1주)${C_RESET}"
  echo "    → iconv 변환 불필요"
  echo "    → 곧바로 docker import 후 ERD 매핑 시작"
elif [[ "$ENCODING" == "EUC-KR(?)" ]] || [[ "$ENCODING" == "UNKNOWN" ]]; then
  warn "${C_BOLD}시나리오 B — EUC-KR + 부분 정규화 (작업 약 2주)${C_RESET}"
  echo "    → iconv -f EUC-KR -t UTF-8 backup.sql > backup_utf8.sql"
  echo "    → sed로 'SET NAMES utf8mb4;' 첫 줄에 삽입"
  echo "    → 한자 손실 샘플 검증 후 import"
else
  warn "${C_BOLD}시나리오 C — 자유 텍스트 위주 (작업 약 4주)${C_RESET}"
  echo "    → 분파·양자관계가 비고란에 묻혀 있을 가능성"
  echo "    → Gemini 2.5 Flash로 비정형 파싱 필요"
fi

# ─────────────────────────────────────────
section "다음 단계"
# ─────────────────────────────────────────
cat <<EOF
  1. (필요 시) iconv -f EUC-KR -t UTF-8 "$SQL" > uttom_utf8.sql
  2. pnpm uttom:up                      # MySQL 5.7 컨테이너 기동
  3. docker exec -i hjkee-uttom-mysql mysql -uroot -plocal uttom_jokbo < uttom_utf8.sql
  4. docker exec hjkee-uttom-mysql mysqldump --no-data -uroot -plocal uttom_jokbo > scripts/migration/uttom_schema.sql
  5. ERD 매핑 → packages/db/src/types.generated.ts 후속 작성
  6. 클라이언트로부터 받은 인물 5명 캡처와 DB 값 정합성 1차 검증

진단 완료.
EOF
