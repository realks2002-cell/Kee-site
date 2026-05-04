'use client';

import { cn } from '../../lib/utils.js';
import type { Generation } from '@hjkee/domain';

export type TreeNodeType = 'self' | 'ancestor' | 'descendant' | 'sibling' | 'adopted';

type Props = {
  generation: Generation;
  nameKo: string;
  nameHanja?: string | null;
  type?: TreeNodeType;
  highlight?: boolean; // 본인일 때
  onClick?: () => void;
  className?: string;
};

/**
 * 가계도 노드 (UI_UX.md TreeNode 명세 + DOMAIN.md 양자 시각 규칙)
 * - self / highlight: 다크 박스 (강조)
 * - adopted: 호박색 박스 #fef3c7 (양자관계)
 * - ancestor / descendant / sibling: 흰색 카드
 *
 * D3 가계도(Day 2~3)에서 SVG `foreignObject` 안에 또는 React 트리 레이아웃에서 직접 사용.
 */
export function TreeNode({
  generation,
  nameKo,
  nameHanja,
  type = 'descendant',
  highlight = false,
  onClick,
  className,
}: Props) {
  const isSelf = type === 'self' || highlight;
  const isAdopted = type === 'adopted';
  const interactive = !!onClick;
  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex min-w-[7rem] flex-col items-center rounded-md border px-3 py-2 text-center transition-colors',
        // 기본: 일반 노드
        !isSelf && !isAdopted && 'border-border bg-bg-card text-ink',
        // 양자: 호박색
        isAdopted && 'border-amber-300 bg-amber-100 text-amber-900',
        // 본인: 다크 강조
        isSelf && 'border-ink bg-ink text-white',
        interactive &&
          !isSelf &&
          'hover:border-border-strong hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        interactive && isSelf && 'hover:bg-ink-soft',
        className,
      )}
      title={`${generation}세 ${nameKo}${nameHanja ? ` (${nameHanja})` : ''}`}
    >
      <span
        className={cn(
          'font-mono text-[10px] uppercase tracking-wider',
          isSelf ? 'text-white/70' : isAdopted ? 'text-amber-700' : 'text-ink-mute',
        )}
      >
        {generation}世
      </span>
      <span className="mt-0.5 text-base font-medium leading-tight">{nameKo}</span>
      {nameHanja && (
        <span
          className={cn(
            'font-serif-cjk text-xs italic leading-tight',
            isSelf ? 'text-white/80' : isAdopted ? 'text-amber-800' : 'text-gold',
          )}
        >
          {nameHanja}
        </span>
      )}
    </Component>
  );
}
