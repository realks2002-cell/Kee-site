'use client';

import { cn } from '../../lib/utils.js';
import { PersonName } from './PersonName.js';
import { GenerationLabel } from './GenerationLabel.js';
import { AdoptionBadge } from './AdoptionBadge.js';
import type { Generation } from '@hjkee/domain';

type Props = {
  nameKo: string;
  nameHanja?: string | null;
  generation: Generation;
  branchName?: string | null;
  fatherName?: string | null;
  grandfatherName?: string | null;
  greatGrandfatherName?: string | null;
  isAlive?: boolean;
  isAdopted?: boolean; // 양자 표시
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
  className?: string;
};

/**
 * 인물 카드 (UI_UX.md PersonCard 명세)
 * - compact: 검색 결과 / 리스트 행
 * - detailed: 가계도 노드 / 상세 미리보기
 */
export function PersonCard({
  nameKo,
  nameHanja,
  generation,
  branchName,
  fatherName,
  grandfatherName,
  greatGrandfatherName,
  isAlive,
  isAdopted,
  variant = 'compact',
  onClick,
  className,
}: Props) {
  const interactive = !!onClick;
  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border bg-bg-card text-left transition-colors',
        interactive && 'hover:border-border-strong hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variant === 'compact' ? 'p-3' : 'p-5',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <PersonName
            ko={nameKo}
            hanja={nameHanja}
            size={variant === 'detailed' ? 'lg' : 'base'}
          />
          {isAdopted && <AdoptionBadge type="adopted" />}
        </div>
        {isAlive === false && (
          <span className="font-mono text-xs text-ink-dim">사망</span>
        )}
      </div>

      <dl
        className={cn(
          'mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-mute',
          variant === 'detailed' && 'mt-3',
        )}
      >
        <div className="flex items-baseline gap-1.5">
          <GenerationLabel generation={generation} hanja={variant === 'detailed'} />
          {branchName && (
            <>
              <span aria-hidden>·</span>
              <span>{branchName}</span>
            </>
          )}
        </div>
        {fatherName && (
          <div>
            <dt className="hanja inline">父</dt>
            <dd className="ml-1 inline">{fatherName}</dd>
          </div>
        )}
        {variant === 'detailed' && grandfatherName && (
          <div>
            <dt className="hanja inline">祖</dt>
            <dd className="ml-1 inline">{grandfatherName}</dd>
          </div>
        )}
        {variant === 'detailed' && greatGrandfatherName && (
          <div>
            <dt className="hanja inline">曾祖</dt>
            <dd className="ml-1 inline">{greatGrandfatherName}</dd>
          </div>
        )}
      </dl>
    </Component>
  );
}
