import { cn } from '../../lib/utils.js';

type Props = {
  ko: string;
  hanja?: string | null;
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
};

const sizeMap = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
} as const;

/** 한글 이름 + 한자 병기. 어르신 친화의 핵심 컴포넌트. */
export function PersonName({ ko, hanja, className, size = 'base' }: Props) {
  return (
    <span className={cn('person-name inline-flex items-baseline', sizeMap[size], className)}>
      <span className="font-medium">{ko}</span>
      {hanja && <span className="hanja">{hanja}</span>}
    </span>
  );
}
