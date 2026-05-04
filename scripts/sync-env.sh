#!/usr/bin/env bash
# Supabase 로컬 상태 → apps/web/.env.local 자동 동기화
#
# 사용:
#   bash scripts/sync-env.sh
#   pnpm env:sync
#
# 전제: supabase start 실행 중, DOCKER_HOST 환경변수 설정됨

set -euo pipefail

# Colima 환경 자동 감지
if [[ -z "${DOCKER_HOST:-}" ]] && [[ -S "$HOME/.colima/docker.sock" ]]; then
  export DOCKER_HOST="unix://$HOME/.colima/docker.sock"
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ENV_OUT=$(supabase status -o env 2>/dev/null | grep -E '^[A-Z_]+="')

if [[ -z "$ENV_OUT" ]]; then
  echo "ERROR: supabase status 출력 없음. 'supabase start' 먼저 실행."
  exit 1
fi

get() { echo "$ENV_OUT" | grep "^$1=" | cut -d= -f2- | tr -d '"'; }

cat > "$ROOT/apps/web/.env.local" <<EOF
# Supabase 로컬 (자동 생성: scripts/sync-env.sh)
NEXT_PUBLIC_SUPABASE_URL=$(get API_URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(get ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY=$(get SERVICE_ROLE_KEY)
DATABASE_URL=$(get DB_URL)

# Day 5+ 외부 통합 (필요 시 채움)
GEMINI_API_KEY=
NEXT_PUBLIC_KAKAO_MAPS_KEY=
RESEND_API_KEY=
EOF

echo "✓ apps/web/.env.local 갱신 완료"
echo "  Studio: $(get STUDIO_URL)"
echo "  DB:     $(get DB_URL)"
