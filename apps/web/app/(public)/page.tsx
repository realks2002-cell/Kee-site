import Link from 'next/link';
import type { Route } from 'next';

const NAV = [
  { href: '/search', label: '인물 검색', desc: '한글·한자 통합 검색', kind: 'F02' },
  { href: '/persons/1/tree', label: '가계도', desc: '5세대 인터랙티브 트리', kind: 'F01' },
  { href: '/adoptions', label: '양자 출입현황', desc: '出系·入後 카드', kind: 'F03' },
  { href: '/chonsu', label: '촌수 계산', desc: 'LCA 기반 자동 계산', kind: 'F04' },
  { href: '/stats', label: '통계 대시보드', desc: '인구 피라미드 외 8종', kind: 'F07' },
  { href: '/sudan/new', label: '신규 등록', desc: '5단계 마법사', kind: 'F05' },
  { href: '/gaseungbo', label: '가승보 미리보기', desc: '한문 + 한글 병기', kind: 'F08' },
  { href: '/admin', label: '위원회 대시보드', desc: '신청 큐 + 입금 매칭', kind: 'F06' },
] as const;

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-[1080px] px-5 py-16 md:px-8 md:py-24">
      <header className="mb-16">
        <p className="font-mono text-sm uppercase tracking-wider text-ink-mute">
          幸州 奇氏 · 33 Generations · 42,924 Persons
        </p>
        <h1 className="mt-3 font-serif-cjk text-4xl font-medium text-ink md:text-5xl">
          행주기씨대종중<span className="hanja">幸州奇氏大宗中</span>
        </h1>
        <p className="mt-4 max-w-[640px] text-lg text-ink-soft">
          600년 33세대 가문의 디지털 족보. 시조 1세부터 현재까지, 양자관계와 분파 트리를 정확히
          기록합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/showcase"
            className="inline-flex h-11 items-center rounded-md bg-accent px-4 font-medium text-white hover:bg-accent-soft"
          >
            디자인 시스템 미리보기
          </Link>
          <Link
            href="/search"
            className="inline-flex h-11 items-center rounded-md border border-border-strong px-4 font-medium text-ink hover:bg-bg-elevated"
          >
            인물 검색 시작
          </Link>
        </div>
      </header>

      <section className="border-t border-border pt-12">
        <h2 className="text-2xl font-medium text-ink">기능 진입</h2>
        <p className="mt-1 text-sm text-ink-mute">
          1주 목업 스프린트 — 8개 핵심 기능 (F01~F08).
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href as Route}
                className="block rounded-lg border border-border bg-bg-card p-5 transition-colors hover:border-border-strong hover:bg-bg-elevated"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-medium text-ink">{n.label}</span>
                  <span className="font-mono text-xs text-ink-dim">{n.kind}</span>
                </div>
                <p className="mt-1 text-sm text-ink-mute">{n.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-24 border-t border-border pt-8 text-sm text-ink-mute">
        <p>행주기씨대종중 통합 시스템 — Phase 1 W1 목업</p>
      </footer>
    </main>
  );
}
