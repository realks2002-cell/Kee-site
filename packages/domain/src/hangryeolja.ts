// 항렬자(行列字) — 같은 세대 종친의 이름에 공통으로 들어가는 한자
//
// 위치 규칙: 한 세대 건너 항렬자 위치가 바뀜 (앞·뒤 교대 항렬)
//   세대 N:    [항렬자][이름자]    예: 老俊, 宇根
//   세대 N+1:  [이름자][항렬자]    예: 成度, 永舒
//
// 딸 이름은 항렬자 규칙 적용 외부 (전통).

import type { Generation, Hangryeolja } from './types.js';

export type HanjaCandidate = {
  hanja: string;
  frequency: number; // 동일 한글 이름의 한자 빈도
};

export type NameSuggestionAuto = {
  auto: true;
  generation: Generation;
  hangryeolja: Hangryeolja;
  // 항렬자가 앞글자인 경우
  hanjaFirst?: string; // 자동 확정된 항렬자
  hanjaSecondCandidates?: HanjaCandidate[]; // 사용자가 고를 후보
  // 항렬자가 뒷글자인 경우
  hanjaFirstCandidates?: HanjaCandidate[];
  hanjaSecond?: string;
};

export type NameSuggestionManual = {
  auto: false;
  reason: 'no_hangryeolja_for_generation' | 'female_excluded' | 'verification_pending';
};

export type NameSuggestion = NameSuggestionAuto | NameSuggestionManual;

/**
 * 한자 이름 자동 추천. 실제 한자 후보 빈도 조회는 Supabase RPC에 위임.
 *
 * ```ts
 * const suggestion = suggestHanjaName({
 *   parentGeneration: 26,
 *   childKoreanName: '성도',
 *   childGender: 'M',
 *   hangryeolja: lookupHangryeolja(27),
 *   lookupHanjaByKo: (ko) => supabase.rpc('hanja_candidates_by_ko', { ko }),
 * });
 * ```
 */
export async function suggestHanjaName(args: {
  parentGeneration: Generation;
  childKoreanName: string;
  childGender: 'M' | 'F';
  hangryeolja: Hangryeolja | null;
  lookupHanjaByKo: (ko: string) => Promise<HanjaCandidate[]>;
}): Promise<NameSuggestion> {
  if (args.childGender === 'F') {
    return { auto: false, reason: 'female_excluded' };
  }

  if (!args.hangryeolja) {
    return { auto: false, reason: 'no_hangryeolja_for_generation' };
  }

  if (!args.hangryeolja.isVerified) {
    return { auto: false, reason: 'verification_pending' };
  }

  const childGen = args.parentGeneration + 1;
  if (args.hangryeolja.generation !== childGen) {
    return { auto: false, reason: 'no_hangryeolja_for_generation' };
  }

  const [char1, char2] = args.childKoreanName.split('');
  if (!char1 || !char2) {
    return { auto: false, reason: 'no_hangryeolja_for_generation' };
  }

  if (args.hangryeolja.position === 'first') {
    return {
      auto: true,
      generation: childGen,
      hangryeolja: args.hangryeolja,
      hanjaFirst: args.hangryeolja.characterHanja,
      hanjaSecondCandidates: await args.lookupHanjaByKo(char2),
    };
  }

  return {
    auto: true,
    generation: childGen,
    hangryeolja: args.hangryeolja,
    hanjaFirstCandidates: await args.lookupHanjaByKo(char1),
    hanjaSecond: args.hangryeolja.characterHanja,
  };
}
