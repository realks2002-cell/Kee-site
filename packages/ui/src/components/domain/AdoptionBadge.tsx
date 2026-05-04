import { cn } from '../../lib/utils.js';

type Props = {
  type: 'adopted' | 'out_adoption'; // 양자 / 출계
  className?: string;
};

/**
 * 양자관계 시각화 — 호박색 박스 (UI_UX.md / DOMAIN.md 합의)
 * - adopted: 入後 (양자로 받음)
 * - out_adoption: 出系 (다른 가문으로 보냄)
 */
export function AdoptionBadge({ type, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium',
        'border-amber-300 bg-amber-100 text-amber-900',
        className,
      )}
      title={type === 'adopted' ? '양자(入後)' : '출계(出系)'}
    >
      {type === 'adopted' ? '入後' : '出系'}
    </span>
  );
}
