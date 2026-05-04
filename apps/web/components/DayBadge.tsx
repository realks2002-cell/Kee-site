// 목업 단계 표시용 — 각 placeholder 페이지에 부착
export function DayBadge({ day, status = 'planned' }: { day: number; status?: 'planned' | 'inprogress' | 'done' }) {
  const palette = {
    planned: 'border-border-strong bg-bg-elevated text-ink-mute',
    inprogress: 'border-warning bg-amber-50 text-amber-900',
    done: 'border-success bg-emerald-50 text-emerald-900',
  } as const;
  const label = { planned: '예정', inprogress: '진행 중', done: '완료' } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs ${palette[status]}`}
    >
      <span className="font-medium">Day {day}</span>
      <span>·</span>
      <span>{label[status]}</span>
    </span>
  );
}

export function PageHeader({
  kind,
  title,
  desc,
  day,
  status = 'planned',
}: {
  kind: string;
  title: string;
  desc: string;
  day: number;
  status?: 'planned' | 'inprogress' | 'done';
}) {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-ink-mute">{kind}</span>
        <DayBadge day={day} status={status} />
      </div>
      <h1 className="mt-2 font-serif-cjk text-3xl font-medium text-ink md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-[640px] text-base text-ink-soft">{desc}</p>
    </header>
  );
}
