// 한자(漢字) 처리 유틸리티
//
// 책임:
// 1. 한자 범위 판별 (BMP + CJK Ext B~F)
// 2. 한글 → 한자 후보 조회 (DB 빈도 + 사전)
// 3. 폰트 서브셋 대상 한자 수집 (빌드 타임)
//
// 폰트 전략 (UI_UX.md 참조):
// - 일반 한자 → Noto Serif KR (4,888자)
// - 확장 한자 → Noto Serif CJK KR (서브셋 추출 권장, 3.5MB+)

const CJK_UNIFIED_START = 0x4e00;
const CJK_UNIFIED_END = 0x9fff;
const CJK_EXT_A_START = 0x3400;
const CJK_EXT_A_END = 0x4dbf;
const CJK_EXT_B_START = 0x20000;
const CJK_EXT_B_END = 0x2a6df;
const CJK_EXT_C_START = 0x2a700;
const CJK_EXT_C_END = 0x2b73f;
const CJK_EXT_D_START = 0x2b740;
const CJK_EXT_D_END = 0x2b81f;
const CJK_EXT_E_START = 0x2b820;
const CJK_EXT_E_END = 0x2ceaf;
const CJK_EXT_F_START = 0x2ceb0;
const CJK_EXT_F_END = 0x2ebef;

export type HanjaRange =
  | 'CJK_Unified'
  | 'CJK_Ext_A'
  | 'CJK_Ext_B'
  | 'CJK_Ext_C'
  | 'CJK_Ext_D'
  | 'CJK_Ext_E'
  | 'CJK_Ext_F'
  | 'Not_Hanja';

export function classifyHanja(char: string): HanjaRange {
  const cp = char.codePointAt(0);
  if (cp === undefined) return 'Not_Hanja';
  if (cp >= CJK_UNIFIED_START && cp <= CJK_UNIFIED_END) return 'CJK_Unified';
  if (cp >= CJK_EXT_A_START && cp <= CJK_EXT_A_END) return 'CJK_Ext_A';
  if (cp >= CJK_EXT_B_START && cp <= CJK_EXT_B_END) return 'CJK_Ext_B';
  if (cp >= CJK_EXT_C_START && cp <= CJK_EXT_C_END) return 'CJK_Ext_C';
  if (cp >= CJK_EXT_D_START && cp <= CJK_EXT_D_END) return 'CJK_Ext_D';
  if (cp >= CJK_EXT_E_START && cp <= CJK_EXT_E_END) return 'CJK_Ext_E';
  if (cp >= CJK_EXT_F_START && cp <= CJK_EXT_F_END) return 'CJK_Ext_F';
  return 'Not_Hanja';
}

/** 확장 한자(Ext B~F) 포함 여부 — 폰트 fallback 결정용 */
export function requiresExtendedFont(text: string): boolean {
  for (const ch of text) {
    const range = classifyHanja(ch);
    if (
      range === 'CJK_Ext_B' ||
      range === 'CJK_Ext_C' ||
      range === 'CJK_Ext_D' ||
      range === 'CJK_Ext_E' ||
      range === 'CJK_Ext_F'
    ) {
      return true;
    }
  }
  return false;
}

/** 한자만 추출 (CJK 통합 + 확장) */
export function extractHanja(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    if (classifyHanja(ch) !== 'Not_Hanja') {
      out.push(ch);
    }
  }
  return out;
}

/** 폰트 서브셋용: 프로젝트 전체 한자 set 수집 */
export function collectUniqueHanja(texts: Iterable<string>): Set<string> {
  const set = new Set<string>();
  for (const text of texts) {
    for (const ch of extractHanja(text)) {
      set.add(ch);
    }
  }
  return set;
}
