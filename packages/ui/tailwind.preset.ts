// 행주기씨 디자인 토큰 (UI_UX.md Phase 1 어르신 친화 컬러)
// apps/web, apps/admin, packages/ui 모두 이 preset을 공유.

import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // 베이스
        bg: 'hsl(var(--bg))',
        'bg-soft': 'hsl(var(--bg-soft))',
        'bg-card': 'hsl(var(--bg-card))',
        'bg-elevated': 'hsl(var(--bg-elevated))',
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        // 텍스트
        ink: 'hsl(var(--ink))',
        'ink-soft': 'hsl(var(--ink-soft))',
        'ink-mute': 'hsl(var(--ink-mute))',
        'ink-dim': 'hsl(var(--ink-dim))',
        // 포인트
        accent: 'hsl(var(--accent))',
        'accent-soft': 'hsl(var(--accent-soft))',
        'accent-bg': 'hsl(var(--accent-bg))',
        // 보조
        gold: 'hsl(var(--gold))',
        success: 'hsl(var(--success))',
        info: 'hsl(var(--info))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        'serif-cjk': ['Noto Serif KR', 'Gowun Batang', 'serif'],
        'serif-hanja': ['Noto Serif CJK KR', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // 어르신 친화 — 본문 최소 16px, 모바일 17px (UI_UX.md 참조)
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.625rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.375rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '4xl': ['3rem', { lineHeight: '1' }],
      },
    },
  },
};

export default preset;
