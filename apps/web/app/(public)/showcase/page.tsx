import {
  PersonName,
  PersonCard,
  GenerationLabel,
  GanjiDisplay,
  AdoptionBadge,
  TreeNode,
  Button,
} from '@hjkee/ui';

export default function ShowcasePage() {
  return (
    <main className="container mx-auto max-w-[1080px] px-5 py-16 md:px-8 md:py-24">
      <header className="mb-16">
        <p className="font-mono text-sm uppercase tracking-wider text-ink-mute">
          Design System · Domain Components
        </p>
        <h1 className="mt-3 font-serif-cjk text-4xl font-medium text-ink md:text-5xl">
          컴포넌트 미리보기
        </h1>
        <p className="mt-4 max-w-[640px] text-lg text-ink-soft">
          UI_UX.md / DOMAIN.md 명세에 맞춘 도메인 특화 컴포넌트 시각 검수.
        </p>
      </header>

      <Section title="PersonName · GenerationLabel" desc="한글 + 한자 병기, 세대 표기">
        <div className="space-y-2">
          <div>
            <PersonName ko="기성도" hanja="奇成度" size="xl" /> ·{' '}
            <GenerationLabel generation={27} hanja />
          </div>
          <div>
            <PersonName ko="기우봉" hanja="奇宇鳳" /> · <GenerationLabel generation={26} />
          </div>
          <div>
            <PersonName ko="기노준" hanja="奇老俊" size="sm" /> ·{' '}
            <GenerationLabel generation={28} />
          </div>
        </div>
      </Section>

      <Section title="GanjiDisplay" desc="양력 연도 → 60갑자 자동 계산">
        <div className="space-y-2">
          <div>
            <GanjiDisplay year={1962} /> — 임인년
          </div>
          <div>
            <GanjiDisplay year={1900} /> · <GanjiDisplay year={2024} /> ·{' '}
            <GanjiDisplay year={2026} />
          </div>
        </div>
      </Section>

      <Section title="AdoptionBadge" desc="양자관계 시각화 (호박색)">
        <div className="flex items-center gap-2">
          <PersonName ko="기○○" hanja="奇○○" /> <AdoptionBadge type="adopted" />
          <span className="text-ink-mute">/</span>
          <AdoptionBadge type="out_adoption" />
        </div>
      </Section>

      <Section title="PersonCard · compact" desc="검색 결과 / 리스트 행">
        <div className="grid gap-3 sm:grid-cols-2">
          <PersonCard
            nameKo="기성도"
            nameHanja="奇成度"
            generation={27}
            branchName="정무공파"
            fatherName="우봉"
            isAlive={false}
          />
          <PersonCard
            nameKo="기노준"
            nameHanja="奇老俊"
            generation={28}
            branchName="정무공 · 광주문중"
            fatherName="성도"
            isAlive
          />
          <PersonCard
            nameKo="기게선"
            nameHanja="奇繼善"
            generation={17}
            branchName="정무공 · 광주문중"
            fatherName="민헌"
            isAdopted
            isAlive={false}
          />
        </div>
      </Section>

      <Section title="PersonCard · detailed" desc="가계도 노드 / 상세 미리보기">
        <PersonCard
          variant="detailed"
          nameKo="기성도"
          nameHanja="奇成度"
          generation={27}
          branchName="정무공파 · 광주문중 · 기은문중"
          fatherName="우봉"
          grandfatherName="춘연"
          greatGrandfatherName="광국"
          isAlive={false}
        />
      </Section>

      <Section title="TreeNode" desc="가계도 노드 — type별 시각 차이 (DOMAIN.md 양자 규칙)">
        <div className="flex flex-wrap items-end gap-3">
          <TreeNode generation={23} type="ancestor" nameKo="광국" nameHanja="光國" />
          <Arrow />
          <TreeNode generation={24} type="ancestor" nameKo="춘연" nameHanja="春衍" />
          <Arrow />
          <TreeNode generation={25} type="ancestor" nameKo="우봉" nameHanja="宇鳳" />
          <Arrow />
          <TreeNode generation={26} type="ancestor" nameKo="성도父" nameHanja="父" />
          <Arrow />
          <TreeNode generation={27} type="self" nameKo="기성도" nameHanja="奇成度" highlight />
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <TreeNode generation={17} type="adopted" nameKo="繼善" nameHanja="入後" />
          <span className="self-center font-mono text-xs text-amber-700">↑ 양자 (호박색)</span>
          <TreeNode generation={28} type="descendant" nameKo="자녀" nameHanja="子" />
          <TreeNode generation={28} type="sibling" nameKo="형제" nameHanja="兄弟" />
        </div>
      </Section>

      <Section title="Button — 어르신 친화 (44px 터치 영역)" desc="default / outline / ghost / link">
        <div className="flex flex-wrap gap-3">
          <Button>족보 검색</Button>
          <Button variant="outline">가계도 보기</Button>
          <Button variant="ghost">로그인</Button>
          <Button variant="link">자세히</Button>
          <Button size="sm">소형</Button>
          <Button size="lg">대형 (어르신용)</Button>
        </div>
      </Section>

      <Section title="컬러 토큰" desc="UI_UX.md Phase 1 어르신 친화">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['accent', 'bg-accent text-white'],
            ['accent-soft', 'bg-accent-soft text-white'],
            ['gold', 'bg-gold text-white'],
            ['success', 'bg-success text-white'],
            ['info', 'bg-info text-white'],
            ['warning', 'bg-warning text-white'],
            ['danger', 'bg-danger text-white'],
            ['ink', 'bg-ink text-white'],
          ].map(([name, cls]) => (
            <div
              key={name}
              className={`${cls} flex h-16 items-center justify-center rounded font-mono text-xs`}
            >
              {name}
            </div>
          ))}
        </div>
      </Section>

      <footer className="mt-24 border-t border-border pt-8 text-sm text-ink-mute">
        <p>본 페이지는 디자인 시스템 검수 전용. 클라이언트 시연에는 노출하지 않음.</p>
      </footer>
    </main>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 rounded-lg border border-border bg-bg-card p-6 md:p-8">
      <h2 className="text-xl font-medium text-ink">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink-mute">{desc}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Arrow() {
  return (
    <span aria-hidden className="self-center text-ink-dim">
      →
    </span>
  );
}
