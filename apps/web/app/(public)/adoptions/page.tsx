import { PageHeader } from '@/components/DayBadge';
import { PersonName, AdoptionBadge, GenerationLabel } from '@hjkee/ui';

const SAMPLE = [
  {
    gen: 17,
    out: ['대이', '효지', '민헌', '게선'],
    in: ['繼善', '유헌', '효상', '대이'],
  },
  {
    gen: 27,
    out: ['덕보', '치손', '한', '심'],
    in: ['譜', '형', '치강', '덕보'],
  },
];

export default function AdoptionsPage() {
  return (
    <main className="container mx-auto max-w-[1080px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F03"
        title="양자 출입현황"
        desc="出系 (생가에서 보냄) → 入後 (양가로 받음). adoption_view 기반 카드형."
        day={4}
      />

      <div className="space-y-5">
        {SAMPLE.map((s, i) => (
          <article key={i} className="rounded-lg border border-amber-300 bg-amber-50/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GenerationLabel generation={s.gen} hanja />
                <AdoptionBadge type="adopted" />
              </div>
              <span className="font-mono text-xs text-amber-700">사례 #{i + 1}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded border border-amber-200 bg-bg-card p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-700">
                  生家 (출계 라인)
                </p>
                <Lineage names={s.out} />
              </div>
              <div className="rounded border border-amber-200 bg-bg-card p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-700">
                  養家 (입후 라인)
                </p>
                <Lineage names={s.in} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <button className="rounded border border-border-strong px-3 py-1.5 text-ink-mute" disabled>
                상세 보기
              </button>
              <button className="rounded border border-border-strong px-3 py-1.5 text-ink-mute" disabled>
                가계도에서 보기
              </button>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-dashed border-border-strong bg-bg-soft p-6 text-sm text-ink-soft">
        <h3 className="font-medium text-ink">Day 4 구현 예정</h3>
        <p className="mt-2">
          DATABASE.md 의 <code className="font-mono">adoption_view</code> 그대로 매핑.
          더미 100명에 양자 3건 (출계 1, 입후 2) 적재하여 시연.
        </p>
      </section>
    </main>
  );
}

function Lineage({ names }: { names: string[] }) {
  const isHanja = (s: string) => /[一-鿿]/.test(s);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {names.map((n, i) => (
        <span key={i} className="contents">
          <PersonName ko={isHanja(n) ? '' : n} hanja={isHanja(n) ? n : undefined} size="sm" />
          {i < names.length - 1 && <span className="text-amber-700">→</span>}
        </span>
      ))}
    </div>
  );
}
