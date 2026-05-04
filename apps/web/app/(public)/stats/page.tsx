import { PageHeader } from '@/components/DayBadge';

type Stat = { id: number; name: string; desc: string; tool: string; star?: boolean };
const STATS: readonly Stat[] = [
  { id: 1, name: '나이별 분포', desc: '10대 단위 막대그래프', tool: 'Recharts' },
  { id: 2, name: '세별 인구 피라미드', desc: '좌우 대칭 (남/여)', tool: 'Recharts', star: true },
  { id: 3, name: '출생년별 추이', desc: '라인 차트 + 연도 입력', tool: 'Recharts' },
  { id: 4, name: '사망년별 추이', desc: '라인 차트', tool: 'Recharts' },
  { id: 5, name: '문중별 생존수', desc: '도넛 차트', tool: 'Recharts' },
  { id: 6, name: '문중별 전체수', desc: '도넛 차트', tool: 'Recharts' },
  { id: 7, name: '혼인 네트워크', desc: '며느리 ↔ 행주기씨 ↔ 사위', tool: 'Sankey (자체 SVG)', star: true },
  { id: 8, name: '흔한 이름', desc: '워드클라우드 + 막대그래프', tool: 'react-d3-cloud' },
  { id: 9, name: '지역별 가구수', desc: '시·도 단위 히트맵', tool: 'react-kakao-maps-sdk' },
];

export default function StatsPage() {
  return (
    <main className="container mx-auto max-w-[1280px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F07"
        title="통계 대시보드"
        desc="9종 통계 메뉴 — 인구 피라미드, Sankey 혼인 네트워크, 카카오맵 지역 분포 등."
        day={5}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-border bg-bg-card p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs text-ink-dim">통계 {s.id}</span>
              {s.star && (
                <span className="inline-flex items-center gap-1 rounded bg-accent-bg px-2 py-0.5 text-xs text-accent">
                  핵심
                </span>
              )}
            </div>
            <h3 className="mt-2 text-lg font-medium text-ink">{s.name}</h3>
            <p className="mt-1 text-sm text-ink-mute">{s.desc}</p>
            <p className="mt-3 font-mono text-xs text-ink-dim">{s.tool}</p>
            <div className="mt-4 flex h-24 items-center justify-center rounded border border-dashed border-border bg-bg-soft text-xs text-ink-dim">
              차트 영역 (Day 5)
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-lg border border-dashed border-border-strong bg-bg-soft p-6 text-sm text-ink-soft">
        <h3 className="font-medium text-ink">Day 5 구현 예정</h3>
        <p className="mt-2">
          더미 100명 통계로 시작하여, 마이그레이션 후 실제 42,924명 데이터로 교체.
          행주기씨 실제 33세대 분포 시뮬레이션.
        </p>
      </section>
    </main>
  );
}
