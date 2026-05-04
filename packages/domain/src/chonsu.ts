// 촌수(寸數) — 두 사람 사이의 가족 거리 (한국 특화 개념)
//
// 알고리즘: LCA (Lowest Common Ancestor) — 두 사람의 최근접 공통조상까지의 거리 합
// DB 구현: calculate_chonsu(person_a, person_b, use_adoptive) RPC (재귀 CTE)
//
// 같은 두 사람 사이에도 친혈통 촌수 vs 가계도 촌수가 다를 수 있으므로
// use_adoptive 플래그로 라인 선택 (UI 라디오 버튼).

import type { PersonId } from './types.js';

export type ChonsuLine = 'adoptive' | 'biological';

export type ChonsuResult = {
  chonsu: number; // 촌수 (예: 4촌)
  commonAncestorId: PersonId;
  commonAncestorName: string;
  line: ChonsuLine;
};

/**
 * 클라이언트 측 호출용 시그니처. 실제 계산은 Supabase RPC `calculate_chonsu`에 위임.
 *
 * ```sql
 * SELECT * FROM calculate_chonsu(person_a, person_b, use_adoptive);
 * ```
 *
 * 행주기씨 시스템은 직계 12대 + 방계 12촌까지 계산.
 */
export type CalculateChonsuFn = (args: {
  personA: PersonId;
  personB: PersonId;
  line: ChonsuLine; // 'adoptive': 양부 라인 (가계도 기준), 'biological': 친부 라인 (친혈통 기준)
}) => Promise<ChonsuResult | null>;

/** 촌수 → 한국식 호칭 (대략) */
export function chonsuToLabel(chonsu: number): string {
  const labels: Record<number, string> = {
    1: '부모/자녀',
    2: '형제/조부모/손자',
    3: '삼촌/고모/조카',
    4: '사촌',
    5: '5촌(당숙·당고모)',
    6: '6촌(재종)',
    7: '7촌',
    8: '8촌(삼종)',
    9: '9촌',
    10: '10촌(사종)',
  };
  return labels[chonsu] ?? `${chonsu}촌`;
}
