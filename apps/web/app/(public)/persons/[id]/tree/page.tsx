import { PageHeader } from '@/components/DayBadge';
import { TreeNode } from '@hjkee/ui';

type Params = Promise<{ id: string }>;

export default async function PersonTreePage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <main className="container mx-auto max-w-[1280px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F01"
        title={`가계도 — Person #${id}`}
        desc="본인 중심 5세대 (위 4 + 아래 1). 양자관계는 점선·호박색. D3.js 또는 자체 SVG."
        day={2}
      />

      <section className="rounded-lg border border-border bg-bg-card p-6">
        <h2 className="text-lg font-medium text-ink">정적 미리보기 (5세대)</h2>
        <p className="mt-1 text-sm text-ink-mute">
          Day 2 더미 100명 적재 후 → kee_get_direct_lineage RPC로 실제 트리 렌더.
        </p>
        <div className="mt-8 overflow-x-auto">
          <div className="flex min-w-[900px] flex-col gap-3">
            <Row gen={23} nodes={[<TreeNode key="g" generation={23} type="ancestor" nameKo="광국" nameHanja="光國" />]} />
            <Connector />
            <Row gen={24} nodes={[<TreeNode key="g" generation={24} type="ancestor" nameKo="춘연" nameHanja="春衍" />]} />
            <Connector />
            <Row gen={25} nodes={[<TreeNode key="g" generation={25} type="ancestor" nameKo="우봉" nameHanja="宇鳳" />]} />
            <Connector />
            <Row
              gen={26}
              nodes={[
                <TreeNode key="b" generation={26} type="sibling" nameKo="성환" nameHanja="成煥" />,
                <TreeNode key="s" generation={26} type="self" nameKo="성도" nameHanja="成度" highlight />,
                <TreeNode key="b2" generation={26} type="sibling" nameKo="성훈" nameHanja="成薰" />,
              ]}
            />
            <Connector />
            <Row
              gen={27}
              nodes={[
                <TreeNode key="c1" generation={27} type="descendant" nameKo="노준" nameHanja="老俊" />,
                <TreeNode key="c2" generation={27} type="descendant" nameKo="노성" nameHanja="老成" />,
                <TreeNode key="c3" generation={27} type="adopted" nameKo="노식" nameHanja="老植" />,
              ]}
            />
          </div>
        </div>
        <div className="mt-6 grid gap-2 border-t border-border pt-4 text-sm text-ink-mute md:grid-cols-2">
          <Legend swatch="bg-ink" label="본인 (다크)" />
          <Legend swatch="bg-bg-card border" label="조상 / 자손 / 형제 (일반)" />
          <Legend swatch="bg-amber-100 border-amber-300" label="양자 / 출계 (호박색 #fef3c7)" />
          <Legend swatch="border-dashed border-2" label="점선 = 친부 라인 (양자 한정)" />
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-dashed border-border-strong bg-bg-soft p-6">
        <h3 className="text-base font-medium text-ink">Day 2~3 구현 예정</h3>
        <ul className="mt-3 space-y-1 text-sm text-ink-soft">
          <li>· D3.js (`d3-hierarchy` + `d3-zoom`) 또는 자체 SVG</li>
          <li>· 줌·드래그·검색 결합, 클릭 시 해당 인물로 이동</li>
          <li>· 양자관계 점선 + 호박색 박스 (DOMAIN.md 시각 규칙 준수)</li>
          <li>· 모바일: 카드 스택 (Day 3, 위/아래/좌/우 스와이프)</li>
        </ul>
      </section>
    </main>
  );
}

function Row({ nodes }: { gen: number; nodes: React.ReactNode[] }) {
  return <div className="flex justify-center gap-4">{nodes}</div>;
}

function Connector() {
  return (
    <div className="flex justify-center">
      <div className="h-6 w-px bg-border-strong" />
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-4 w-4 rounded ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}
