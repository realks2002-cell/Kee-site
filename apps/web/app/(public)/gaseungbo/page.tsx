import { PageHeader } from '@/components/DayBadge';

export default function GaseungboPage() {
  return (
    <main className="container mx-auto max-w-[1080px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F08"
        title="가승보 미리보기"
        desc="본인 직계 가지의 족보책. 한문 원문 + 한글 번역 병기. 권당 30,000원, 최소 10부."
        day={6}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-lg border border-border bg-bg-card p-8 shadow-sm">
          <header className="mb-6 border-b border-amber-300 pb-4 text-center">
            <p className="font-serif-cjk text-2xl text-gold">家 乘 譜</p>
            <p className="mt-1 text-sm text-ink-mute">가승보</p>
            <p className="mt-3 font-serif-cjk text-base text-ink">
              幸州 奇氏 · 27世 奇成度
            </p>
          </header>

          <dl className="space-y-3 text-base">
            <Row k="姓名 (성명)" v="奇成度 (기성도)" />
            <Row k="字 (자)" v="成道" />
            <Row k="號 (호)" v="—" />
            <Row k="世系 (세계)" v="27세 정무공파 광주문중 기은문중" />
            <Row k="生年 (생년)" v="1962년 임인 6월 12일 (음)" />
            <Row k="父 (부)" v="奇宇鳳 (기우봉)" />
            <Row k="祖父 (조부)" v="奇春衍 (기춘연)" />
            <Row k="曾祖 (증조)" v="奇光國 (기광국)" />
            <Row k="高祖 (고조)" v="奇敬舜 (기경순)" />
          </dl>

          <section className="mt-6 border-t border-border pt-4">
            <p className="mb-1 text-xs font-mono uppercase tracking-wider text-ink-mute">족보 원문</p>
            <p className="font-serif-cjk text-base leading-relaxed text-ink">
              字成道 一九六二年 壬寅 六月 十二日 生 不單
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              자(字)는 成道. 1962년 임인년 6월 12일 출생.
            </p>
          </section>
        </article>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <p className="text-sm font-medium text-ink">주문</p>
            <div className="mt-4">
              <label className="text-sm text-ink-mute">부수 (최소 10부)</label>
              <input
                type="number"
                defaultValue={10}
                disabled
                className="mt-1 block h-11 w-full rounded border border-border-strong bg-bg-soft px-3 text-base"
              />
            </div>
            <div className="mt-4 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-ink-mute">
                <span>권당</span>
                <span>30,000원</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-medium text-ink">
                <span>합계</span>
                <span>300,000원</span>
              </div>
            </div>
            <button
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent text-base font-medium text-white opacity-50"
              disabled
            >
              주문하기
            </button>
            <button
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md border border-border-strong text-sm text-ink"
              disabled
            >
              PDF 미리보기
            </button>
          </div>

          <div className="rounded-lg border border-dashed border-border-strong bg-bg-soft p-4 text-xs text-ink-soft">
            <p className="font-medium text-ink">Day 6 구현 예정</p>
            <ul className="mt-2 space-y-1">
              <li>· HTML 미리보기 우선 (현재 화면)</li>
              <li>· 실제 PDF는 W2 (pdf-lib + Noto Serif KR 한자 임베딩)</li>
              <li>· kee_gaseungbo_orders INSERT</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex border-b border-border pb-2 last:border-0">
      <dt className="w-44 font-mono text-sm text-ink-mute">{k}</dt>
      <dd className="flex-1 text-base text-ink">{v}</dd>
    </div>
  );
}
