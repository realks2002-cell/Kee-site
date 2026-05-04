import { cn } from '../../lib/utils.js';
import type { Generation } from '@hjkee/domain';

type Props = {
  generation: Generation;
  className?: string;
  hanja?: boolean; // 27세(世) vs 27세
};

export function GenerationLabel({ generation, className, hanja = false }: Props) {
  return (
    <span className={cn('font-mono text-sm text-ink-mute', className)}>
      {generation}세{hanja && <span className="hanja">世</span>}
    </span>
  );
}
