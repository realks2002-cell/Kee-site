import Link from 'next/link';
import type { Route } from 'next';
import { PageHeader } from '@/components/DayBadge';

type Params = Promise<{ id: string }>;

export default async function PersonDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <main className="container mx-auto max-w-[1080px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F02"
        title={`인물 상세 — Person #${id}`}
        desc="개인자료 + 사진 4매 슬롯 + 족보 원문/번역 (UI_UX.md 명세)."
        day={3}
      />

      <section className="rounded-lg border border-border bg-bg-card p-6">
        <h2 className="text-lg font-medium text-ink">상세 페이지 구조 (Day 3 구현)</h2>
        <p className="mt-2 text-sm text-ink-mute">
          상단 5세대 직계 가로 표시 / 좌 60% 개인자료 / 우 40% 사진 4매 / 하단 족보 원문 + 번역.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="rounded border border-dashed border-border bg-bg-soft p-6 text-center text-sm text-ink-dim">
            상세 정보 영역
            <br />
            (자, 호, 생몰, 묘소, 배우자, 자녀)
          </div>
          <div className="rounded border border-dashed border-border bg-bg-soft p-6 text-center text-sm text-ink-dim">
            사진 4매<br />슬롯
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/persons/${id}/tree` as Route}
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white hover:bg-accent-soft"
          >
            전체 가계도 →
          </Link>
          <Link
            href="/search"
            className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 text-sm font-medium text-ink hover:bg-bg-elevated"
          >
            ← 검색으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
