import { cn } from '../../lib/utils.js';
import { calculateGanji, type Ganji } from '@hjkee/domain';

type Props = {
  year?: number; // 양력 연도 (제공 시 자동 계산)
  ganji?: Ganji; // 또는 직접 ganji 객체 전달
  showYear?: boolean;
  className?: string;
};

/** 간지(干支) 표시 — "1962년 임인(壬寅)" */
export function GanjiDisplay({ year, ganji, showYear = true, className }: Props) {
  const resolved = ganji ?? (year != null ? calculateGanji(year) : null);
  if (!resolved) return null;

  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      {showYear && year != null && <span className="font-mono">{year}년</span>}
      <span className="font-medium">{resolved.ko}</span>
      <span className="hanja">{resolved.hanja}</span>
    </span>
  );
}
