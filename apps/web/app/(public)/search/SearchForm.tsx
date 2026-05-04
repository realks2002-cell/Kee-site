'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { createClient } from '@hjkee/db';
import type { Database } from '@hjkee/db';
import { PersonName, GenerationLabel } from '@hjkee/ui';

type RpcRow = Database['public']['Functions']['kee_search_persons']['Returns'][number];

export function SearchForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [results, setResults] = useState<RpcRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = {
      name: String(fd.get('name') ?? '').trim(),
      father: String(fd.get('father') ?? '').trim(),
      ja: String(fd.get('ja') ?? '').trim(),
      ho: String(fd.get('ho') ?? '').trim(),
      gwanjik: String(fd.get('gwanjik') ?? '').trim(),
      spouse: String(fd.get('spouse') ?? '').trim(),
    };

    if (!Object.values(q).some((v) => v.length > 0)) {
      setError('한 가지 이상 조건을 입력해주세요.');
      setSearched(false);
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const sb = createClient();
      const { data, error: err } = await sb
        .schema('public')
        .rpc('kee_search_persons', {
          q_name: q.name || undefined,
          q_father: q.father || undefined,
          q_ja: q.ja || undefined,
          q_ho: q.ho || undefined,
          q_gwanjik: q.gwanjik || undefined,
          q_spouse: q.spouse || undefined,
          limit_count: 50,
        });
      if (err) throw err;
      setResults(data ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 실패');
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    formRef.current?.reset();
    setResults([]);
    setSearched(false);
    setError(null);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <section className="rounded-lg border border-border bg-bg-card p-6">
        <h2 className="text-lg font-medium text-ink">검색 조건</h2>

        <div className="mt-3 rounded-md border border-info/20 bg-info/5 p-3 text-sm text-ink-soft">
          <p>
            <strong className="text-ink">💡 한자 입력</strong> — macOS는 한글 입력 후{' '}
            <Kbd>⌥</Kbd>+<Kbd>↩</Kbd> (한 글자씩), Windows는 <Kbd>한자</Kbd>키.
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            한글로만 입력해도 한글 이름 컬럼에서 매칭됩니다 (예: 성도 → 기성도).
            한자(成度)로 입력하면 한자 이름 컬럼에서 매칭.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="name" label="이름 (한글 또는 한자)" placeholder="기성도 또는 奇成度" autoFocus />
          <Field name="father" label="부친 이름" placeholder="우봉 (동명이인 보조)" />
          <Field name="ja" label="자(字)" placeholder="成道" />
          <Field name="ho" label="호(號) / 시호" placeholder="松齋 등" />
          <Field name="gwanjik" label="관직 / 경력" placeholder="영의정, 판서, 의병장 …" />
          <Field name="spouse" label="배우자 이름" placeholder="김씨, 차씨처 등" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-40"
          >
            {loading ? '검색 중…' : '족보 검색'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 text-sm font-medium text-ink hover:bg-bg-elevated"
          >
            다시 검색
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          ⚠ {error}
        </div>
      )}

      <section className="mt-8 rounded-lg border border-border bg-bg-card p-6">
        <h2 className="text-lg font-medium text-ink">
          검색 결과
          {searched && (
            <span className="ml-2 font-mono text-sm text-ink-mute">({results.length}건)</span>
          )}
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-ink-mute">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-normal">이름 (漢字)</th>
                <th className="py-2 pr-3 text-left font-normal">부친</th>
                <th className="py-2 pr-3 text-left font-normal">조부</th>
                <th className="py-2 pr-3 text-left font-normal">증조</th>
                <th className="py-2 pr-3 text-left font-normal">세</th>
                <th className="py-2 pr-3 text-left font-normal">분파</th>
                <th className="py-2 pr-3 text-left font-normal">상태</th>
              </tr>
            </thead>
            <tbody>
              {!searched && (
                <EmptyRow>
                  <p>검색 조건을 입력 후 [족보 검색]</p>
                </EmptyRow>
              )}
              {searched && results.length === 0 && !error && (
                <EmptyRow>
                  <p>조건에 맞는 인물이 없습니다.</p>
                  <p className="mt-2 text-xs text-ink-dim">
                    현재 인물 데이터가 0건입니다. Day 2 더미 100명 적재 후 검색 결과가
                    표시됩니다. (분파 6개 시드만 적용된 상태)
                  </p>
                </EmptyRow>
              )}
              {results.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-bg-elevated"
                >
                  <td className="py-2 pr-3">
                    <Link
                      href={`/persons/${r.id}` as Route}
                      className="text-ink hover:text-accent"
                    >
                      <PersonName ko={r.name_ko} hanja={r.name_hanja} size="sm" />
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-ink-soft">{r.father_name ?? '─'}</td>
                  <td className="py-2 pr-3 text-ink-soft">{r.grandfather_name ?? '─'}</td>
                  <td className="py-2 pr-3 text-ink-soft">
                    {r.great_grandfather_name ?? '─'}
                  </td>
                  <td className="py-2 pr-3">
                    <GenerationLabel generation={r.generation} />
                  </td>
                  <td className="py-2 pr-3 text-ink-soft">{r.branch_name ?? '─'}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        r.is_alive
                          ? 'rounded bg-success/10 px-2 py-0.5 text-xs text-success'
                          : 'rounded bg-bg-elevated px-2 py-0.5 text-xs text-ink-mute'
                      }
                    >
                      {r.is_alive ? '생존' : '사망'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </form>
  );
}

function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={7} className="py-12 text-center text-ink-dim">
        {children}
      </td>
    </tr>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border-strong bg-bg-soft px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}

function Field({
  name,
  label,
  placeholder,
  autoFocus,
}: {
  name: string;
  label: string;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-ink-mute" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        lang="ko"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        defaultValue=""
        placeholder={placeholder}
        {...(autoFocus ? { autoFocus: true } : {})}
        className="mt-1 block h-11 w-full rounded border border-border-strong bg-bg px-3 text-base placeholder:text-ink-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
