import { PageHeader } from '@/components/DayBadge';

export default function ChonsuPage() {
  return (
    <main className="container mx-auto max-w-[880px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F04"
        title="촌수 계산"
        desc="두 사람 사이의 가족 거리. LCA + 재귀 CTE (kee_calculate_chonsu RPC, 최대 12대)."
        day={4}
      />

      <section className="grid gap-5 md:grid-cols-2">
        <PersonPicker label="사람 A" />
        <PersonPicker label="사람 B" />
      </section>

      <section className="mt-8 rounded-lg border border-border bg-bg-card p-6">
        <h3 className="text-base font-medium text-ink">계산 기준</h3>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center gap-3">
            <input type="radio" name="line" defaultChecked disabled />
            <span>
              <strong className="text-ink">가계도 기준 (양부 라인)</strong>
              <span className="ml-2 text-ink-mute">— 입후 받은 양가의 가계 거리</span>
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="line" disabled />
            <span>
              <strong className="text-ink">친혈통 기준 (생부 라인)</strong>
              <span className="ml-2 text-ink-mute">— 생물학적 부친 라인</span>
            </span>
          </label>
        </div>
        <button
          className="mt-6 inline-flex h-12 items-center rounded-md bg-accent px-6 font-medium text-white opacity-50"
          disabled
        >
          계산 실행
        </button>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-border-strong bg-bg-soft p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-dim">결과</p>
        <p className="mt-3 text-2xl text-ink-mute">두 분은 ─촌 관계입니다</p>
        <p className="mt-2 text-sm text-ink-mute">공통 조상: ─</p>
        <p className="mt-6 text-xs text-ink-dim">Day 4 구현 — 더미 데이터 적재 후 실제 계산</p>
      </section>
    </main>
  );
}

function PersonPicker({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-5">
      <p className="text-sm font-medium text-ink">{label}</p>
      <input
        type="text"
        placeholder="이름 자동완성 검색 …"
        disabled
        className="mt-2 block h-11 w-full rounded border border-border-strong bg-bg-soft px-3 text-base placeholder:text-ink-dim"
      />
      <dl className="mt-3 space-y-1 text-sm text-ink-mute">
        <div className="flex justify-between"><dt>세</dt><dd>─</dd></div>
        <div className="flex justify-between"><dt>이름</dt><dd>─</dd></div>
        <div className="flex justify-between"><dt>부친</dt><dd>─</dd></div>
        <div className="flex justify-between"><dt>조부</dt><dd>─</dd></div>
      </dl>
    </div>
  );
}
