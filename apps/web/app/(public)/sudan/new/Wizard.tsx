'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { PersonName, GenerationLabel, AdoptionBadge } from '@hjkee/ui';

const STEPS = [
  { n: 1, name: '본인 확인', desc: '회원가입 + 위원회 검증' },
  { n: 2, name: '가지 찾기', desc: '부친 검색 → 본인 위치 추정' },
  { n: 3, name: '본인 정보', desc: '한자명 자동 추천 (항렬자)' },
  { n: 4, name: '사진 4매', desc: '본인 / 배우자 / 가족 / 묘소' },
  { n: 5, name: '입금 안내', desc: '농협 + 매칭 코드' },
] as const;

export function Wizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const next = () => setStep((s) => (s < 6 ? ((s + 1) as typeof step) : s));
  const prev = () => setStep((s) => (s > 1 ? ((s - 1) as typeof step) : s));

  return (
    <>
      <Stepper current={step} />

      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
      {step === 6 && <StepDone onRestart={() => setStep(1)} />}

      {step <= 5 && (
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 text-sm font-medium text-ink hover:bg-bg-elevated disabled:opacity-30"
          >
            ← 이전
          </button>
          <p className="text-xs text-ink-mute">
            {step} / 5
            {step === 1 && ' · 본인 확인'}
            {step === 2 && ' · 가지 찾기'}
            {step === 3 && ' · 본인 정보'}
            {step === 4 && ' · 사진 4매'}
            {step === 5 && ' · 입금 안내'}
          </p>
          <button
            type="button"
            onClick={next}
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white hover:bg-accent-soft"
          >
            {step === 5 ? '신청 제출 →' : '다음 단계 →'}
          </button>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-10 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = current > s.n || current === 6;
        const active = current === s.n;
        return (
          <li key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm transition-colors ${
                active
                  ? 'bg-accent text-white'
                  : done
                    ? 'border border-success bg-success/10 text-success'
                    : 'border border-border-strong bg-bg-card text-ink-mute'
              }`}
            >
              {done ? '✓' : s.n}
            </span>
            <span
              className={`hidden text-sm sm:inline ${active ? 'font-medium text-ink' : done ? 'text-ink-mute' : 'text-ink-dim'}`}
            >
              {s.name}
            </span>
            {i < STEPS.length - 1 && (
              <span className="flex-1 border-t border-dashed border-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────
// Step 1: 본인 확인
// ─────────────────────────────────────────
function Step1() {
  return (
    <Card title="본인 확인" desc="이메일·휴대폰 + 이름·생년월일·부친 이름. 위원회가 종친 명단과 대조하여 verified 처리합니다.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="이메일" placeholder="example@hjkee.com" type="email" />
        <Field label="휴대폰" placeholder="010-0000-0000" type="tel" />
        <Field label="이름 (한글)" placeholder="기○○" />
        <Field label="생년월일" placeholder="YYYY-MM-DD" type="date" />
        <Field label="부친 이름 (한글)" placeholder="아버님 한글 이름" />
        <Field label="가까운 종친 (검증 보조)" placeholder="삼촌·사촌 등 한 분 이름" />
      </div>
      <Notice>
        💡 NICE 본인인증 대신 위원회가 수동 검증합니다. 검토 1~3 영업일 소요.
      </Notice>
    </Card>
  );
}

// ─────────────────────────────────────────
// Step 2: 가지 찾기
// ─────────────────────────────────────────
function Step2() {
  return (
    <Card
      title="가지 찾기"
      desc="부친 이름으로 검색해서 본인이 어느 분파의 어느 가지에 속하는지 자동 추정합니다."
    >
      <div>
        <label className="text-sm text-ink-mute">부친 이름 검색</label>
        <input
          type="text"
          placeholder="우봉, 宇鳳 등"
          autoComplete="off"
          className="mt-1 block h-11 w-full rounded border border-border-strong bg-bg px-3 text-base placeholder:text-ink-dim"
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-ink">검색 결과 (부친 후보)</p>
        <div className="space-y-2">
          <CandidateRow nameKo="기우봉" nameHanja="奇宇鳳" generation={26} branch="정무공파 · 광주문중" selected />
          <CandidateRow nameKo="기우봉" nameHanja="奇宇逢" generation={28} branch="낭장공파" />
          <CandidateRow nameKo="기우봉" nameHanja="奇宇峰" generation={29} branch="지평공파" />
        </div>
        <p className="mt-2 text-xs text-ink-mute">
          동명이인이 있을 경우 조부 이름 추가 입력으로 분리 가능
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-accent/20 bg-accent-bg p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-accent">본인 위치 추정</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Lineage>
            <PersonName ko="광국" hanja="光國" size="sm" />
            <Sep />
            <PersonName ko="춘연" hanja="春衍" size="sm" />
            <Sep />
            <PersonName ko="우봉" hanja="宇鳳" size="sm" />
            <Sep />
            <span className="rounded border-2 border-dashed border-accent px-2 py-0.5 text-accent">본인</span>
          </Lineage>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          자동 추정: <strong className="text-ink">27세 정무공파 · 광주문중 · 기은문중</strong>
          <br />
          (위원회 검토 시 최종 확정)
        </p>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────
// Step 3: 본인 정보 (한자 자동 추천)
// ─────────────────────────────────────────
function Step3() {
  return (
    <Card
      title="본인 정보"
      desc="한자 이름은 항렬자 자동 추천. 27세는 老 항렬 (앞글자), 30세는 度 항렬 (뒷글자)."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm text-ink-mute">한글 이름</label>
          <input
            type="text"
            defaultValue="성도"
            className="mt-1 block h-11 w-full rounded border border-border-strong bg-bg px-3 text-base"
          />
        </div>
        <div>
          <label className="text-sm text-ink-mute">한자 이름 (자동 추천)</label>
          <div className="mt-1 flex gap-1">
            <input
              type="text"
              defaultValue="成"
              className="h-11 w-1/2 rounded border border-border-strong bg-bg px-3 text-base"
            />
            <input
              type="text"
              defaultValue="度"
              readOnly
              className="h-11 w-1/2 rounded border-2 border-accent bg-accent-bg px-3 text-base font-medium text-accent"
            />
          </div>
          <p className="mt-1 text-xs text-amber-700">
            ⓘ 30세 度 항렬 (뒷글자 고정). 앞글자는 후보에서 선택 가능.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {['成', '永', '正', '弘', '哲', '春', '仁', '義', '善', '俊'].map((h) => (
              <button
                key={h}
                type="button"
                className="rounded border border-border-strong bg-bg-card px-2 py-1 font-serif-cjk text-sm hover:bg-bg-elevated"
              >
                {h}度
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="자(字)" placeholder="成道" />
        <Field label="호(號) (선택)" placeholder="松齋 등" />
        <Field label="생년월일" placeholder="YYYY-MM-DD" type="date" />
        <div>
          <label className="text-sm text-ink-mute">달력</label>
          <select className="mt-1 block h-11 w-full rounded border border-border-strong bg-bg px-3 text-base">
            <option>음력</option>
            <option>양력</option>
          </select>
        </div>
        <Field label="직업 (선택)" placeholder="개발자, 교사 등" />
        <Field label="거주 시·도" placeholder="서울 / 경기 …" />
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-medium text-ink">배우자 (선택)</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Field label="배우자 이름 (한글)" placeholder="○○○" />
          <Field label="본관" placeholder="김해, 전주 등" />
          <Field label="성씨" placeholder="김 / 이 / 박 …" />
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-medium text-ink">자녀 (선택)</p>
        <div className="mt-3 rounded border border-dashed border-border bg-bg-soft p-6 text-center text-sm text-ink-dim">
          + 자녀 추가 (28세 항렬 자동 적용)
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────
// Step 4: 사진 4매
// ─────────────────────────────────────────
function Step4() {
  const slots = [
    { name: '본인', desc: '반명함 (얼굴 정면)', icon: '👤', sizeNote: '~100KB 자동 리사이즈' },
    { name: '배우자', desc: '반명함', icon: '💑', sizeNote: '~100KB' },
    { name: '가족', desc: '단체 사진 (선택)', icon: '👨‍👩‍👧', sizeNote: '~300KB' },
    { name: '묘소', desc: '묘비 또는 묘소 전경', icon: '⛰️', sizeNote: '~300KB' },
  ];
  return (
    <Card title="사진 업로드" desc="총 4매. 자동 리사이즈로 용량 최적화. JPG / PNG / HEIC.">
      <div className="grid gap-4 sm:grid-cols-2">
        {slots.map((s, i) => (
          <div
            key={s.name}
            className="rounded-lg border-2 border-dashed border-border bg-bg-soft p-6 text-center"
          >
            <div className="text-4xl">{s.icon}</div>
            <p className="mt-2 text-base font-medium text-ink">
              {i + 1}. {s.name}
            </p>
            <p className="mt-1 text-sm text-ink-mute">{s.desc}</p>
            <button
              type="button"
              className="mt-4 inline-flex h-10 items-center rounded-md border border-border-strong bg-bg px-4 text-sm text-ink hover:bg-bg-elevated"
            >
              파일 선택
            </button>
            <p className="mt-2 text-xs text-ink-dim">{s.sizeNote}</p>
          </div>
        ))}
      </div>
      <Notice>
        Supabase Storage에 업로드 → kee_person_photos 테이블에 slot 1~4 매핑 (Day 5 구현).
      </Notice>
    </Card>
  );
}

// ─────────────────────────────────────────
// Step 5: 입금 안내
// ─────────────────────────────────────────
function Step5() {
  // 매칭 코드 미리보기 (실제로는 입력값으로 자동 생성)
  const code = useMemo(() => {
    const yymm = new Date().toISOString().slice(2, 7).replace('-', '');
    const rand = Math.floor(Math.random() * 90 + 10);
    return `성도${yymm}${rand}`;
  }, []);

  return (
    <Card
      title="입금 안내"
      desc="Toss Payments 대신 농협 입금 + 매칭 코드. 입금자명에 코드를 포함하면 자동 매칭."
    >
      <div className="rounded-lg border-2 border-accent bg-accent-bg p-6">
        <p className="text-xs font-mono uppercase tracking-wider text-accent">신청 매칭 코드</p>
        <p className="mt-2 font-mono text-3xl font-medium text-accent">{code}</p>
        <p className="mt-2 text-sm text-ink-soft">
          입금자명에 위 코드를 정확히 포함해주세요. 위원회가 통장 거래내역과 자동 매칭합니다.
        </p>
      </div>

      <dl className="mt-6 space-y-3 rounded-lg border border-border bg-bg-card p-6 text-base">
        <Row k="입금 계좌" v="농협 351-0833-9286-23" mono />
        <Row k="예금주" v="행주기씨대종중" />
        <Row k="입금 금액" v="50,000원" mono strong />
        <Row k="입금자명" v={code} mono strong />
        <Row k="입금 기한" v="신청일로부터 7일 이내" />
      </dl>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong px-4 text-sm font-medium text-ink hover:bg-bg-elevated"
        >
          📱 입금 안내 문자 받기
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong px-4 text-sm font-medium text-ink hover:bg-bg-elevated"
        >
          📋 매칭 코드 복사
        </button>
      </div>

      <Notice>
        입금 확인 후 위원회 검토 → 승인 → 가족관계 자동 생성 (kee_relationships INSERT).
      </Notice>
    </Card>
  );
}

// ─────────────────────────────────────────
// Step 6: 완료
// ─────────────────────────────────────────
function StepDone({ onRestart }: { onRestart: () => void }) {
  return (
    <Card title="신청 완료" desc="">
      <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
        <div className="text-5xl">🌳</div>
        <p className="mt-4 text-xl font-medium text-ink">신청이 접수되었습니다</p>
        <p className="mt-2 text-sm text-ink-soft">
          입금 확인 후 위원회 검토를 거쳐 승인됩니다.
          <br />
          진행 상황은 마이페이지에서 확인하실 수 있습니다.
        </p>
        <p className="mt-6 inline-block rounded border border-border-strong bg-bg-card px-4 py-2 font-mono text-sm">
          신청 번호: <strong>HJKEE-2026-0001</strong>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white hover:bg-accent-soft"
          >
            마이페이지 →
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 text-sm font-medium text-ink hover:bg-bg-elevated"
          >
            처음부터 다시 (시연용)
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────
// 공통 부속
// ─────────────────────────────────────────
function Card({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-bg-card p-6 md:p-8">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink-mute">{desc}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'tel' | 'date';
}) {
  return (
    <div>
      <label className="text-sm text-ink-mute">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete="off"
        defaultValue=""
        className="mt-1 block h-11 w-full rounded border border-border-strong bg-bg px-3 text-base placeholder:text-ink-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 rounded border border-info/20 bg-info/5 p-3 text-sm text-ink-soft">
      {children}
    </p>
  );
}

function CandidateRow({
  nameKo,
  nameHanja,
  generation,
  branch,
  selected,
}: {
  nameKo: string;
  nameHanja: string;
  generation: number;
  branch: string;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded border p-3 text-left transition-colors ${
        selected
          ? 'border-accent bg-accent-bg'
          : 'border-border bg-bg-card hover:border-border-strong hover:bg-bg-elevated'
      }`}
    >
      <div className="flex items-baseline gap-3">
        <PersonName ko={nameKo} hanja={nameHanja} />
        <GenerationLabel generation={generation} />
        <span className="text-sm text-ink-mute">· {branch}</span>
      </div>
      {selected && <span className="text-sm font-medium text-accent">선택됨 ✓</span>}
    </button>
  );
}

function Lineage({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}

function Sep() {
  return <span className="text-ink-mute">→</span>;
}

function Row({ k, v, mono, strong }: { k: string; v: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-sm text-ink-mute">{k}</dt>
      <dd
        className={`${mono ? 'font-mono' : ''} ${strong ? 'text-base font-medium text-ink' : 'text-base text-ink-soft'}`}
      >
        {v}
      </dd>
    </div>
  );
}
