// 60갑자(六十甲子) — 양력 연도로부터 간지 자동 계산
// 행주기씨 족보 표기: "1962壬寅6월12일" 형식

const HEAVENLY_STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

const EARTHLY_BRANCHES_KO = [
  '자',
  '축',
  '인',
  '묘',
  '진',
  '사',
  '오',
  '미',
  '신',
  '유',
  '술',
  '해',
] as const;
const EARTHLY_BRANCHES_HANJA = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;

export type GanjiPart = {
  ko: string;
  hanja: string;
};

export type Ganji = {
  ko: string; // "임인"
  hanja: string; // "壬寅"
  stem: GanjiPart; // 천간(天干): 임/壬
  branch: GanjiPart; // 지지(地支): 인/寅
};

/** 양력 연도 → 간지 (60갑자 순환) */
export function calculateGanji(year: number): Ganji {
  // 갑자년(甲子) 기준점: 서기 4년
  // (year - 4) % 10 → 천간 인덱스
  // (year - 4) % 12 → 지지 인덱스
  const normalized = ((year - 4) % 60 + 60) % 60;
  const stemIdx = normalized % 10;
  const branchIdx = normalized % 12;

  const stem: GanjiPart = {
    ko: HEAVENLY_STEMS_KO[stemIdx]!,
    hanja: HEAVENLY_STEMS_HANJA[stemIdx]!,
  };
  const branch: GanjiPart = {
    ko: EARTHLY_BRANCHES_KO[branchIdx]!,
    hanja: EARTHLY_BRANCHES_HANJA[branchIdx]!,
  };

  return {
    ko: `${stem.ko}${branch.ko}`,
    hanja: `${stem.hanja}${branch.hanja}`,
    stem,
    branch,
  };
}

/** 간지 한자 → 양력 연도 후보 (60년 주기, 범위 안에서 검색) */
export function ganjiToYears(ganjiHanja: string, fromYear = 1500, toYear = 2100): number[] {
  const target = ganjiHanja.trim();
  const candidates: number[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    if (calculateGanji(y).hanja === target) {
      candidates.push(y);
    }
  }
  return candidates;
}

/** 족보 원문 파싱: "1962壬寅6월12일" → { year, ganji, lunarMonth, lunarDay } */
export function parseJokboBirthText(text: string): {
  year: number | null;
  ganjiHanja: string | null;
  lunarMonth: number | null;
  lunarDay: number | null;
} {
  // 양력 연도 (4자리)
  const yearMatch = text.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]!, 10) : null;

  // 간지 (2자리 한자)
  const ganjiMatch = text.match(
    /([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/,
  );
  const ganjiHanja = ganjiMatch ? `${ganjiMatch[1]}${ganjiMatch[2]}` : null;

  // 음력 월·일 ("6월12일" 또는 "六月十二日")
  const monthMatch = text.match(/(\d+)월/);
  const dayMatch = text.match(/(\d+)일/);

  return {
    year,
    ganjiHanja,
    lunarMonth: monthMatch ? parseInt(monthMatch[1]!, 10) : null,
    lunarDay: dayMatch ? parseInt(dayMatch[1]!, 10) : null,
  };
}
