import Link from 'next/link';
import { Button } from '@hjkee/ui';

const KPIS = [
  { label: '회원 인증 대기', value: 0 },
  { label: '입금 대기', value: 0 },
  { label: '입금 확인됨', value: 0 },
  { label: '검토 중', value: 0 },
  { label: '이번 달 승인', value: 0 },
] as const;

export default function AdminHome() {
  return (
    <main className="container mx-auto max-w-[1280px] px-6 py-12">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-mute">Admin</p>
          <h1 className="mt-1 text-2xl font-medium">족보위원회 대시보드</h1>
        </div>
        <Link href={'/' as never}>
          <Button variant="outline" size="sm">
            공개 사이트
          </Button>
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-border bg-bg-card p-4 transition-colors hover:border-border-strong"
          >
            <p className="text-sm text-ink-mute">{k.label}</p>
            <p className="mt-2 font-mono text-2xl font-medium text-ink">
              {k.value}
              <span className="ml-1 text-sm font-normal text-ink-mute">건</span>
            </p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-lg border border-border bg-bg-card p-8">
        <h2 className="text-lg font-medium">입금 매칭 도구</h2>
        <p className="mt-2 text-sm text-ink-mute">
          농협 통장 거래내역을 붙여넣으면 신청 코드 (예: 성도2410)와 자동 매칭합니다 (Day 6 구현).
        </p>
        <div className="mt-4 rounded border border-dashed border-border p-12 text-center text-ink-dim">
          <p>여기에 거래내역 붙여넣기</p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-bg-card p-8">
        <h2 className="text-lg font-medium">신청 큐</h2>
        <p className="mt-2 text-sm text-ink-mute">
          더미 데이터 적재 (Day 2) + 신규 등록 마법사 (Day 5) 후 실제 데이터로 채워짐.
        </p>
        <table className="mt-6 w-full text-sm">
          <thead className="text-ink-mute">
            <tr className="border-b border-border">
              <th className="py-2 text-left font-normal">신청자</th>
              <th className="py-2 text-left font-normal">코드</th>
              <th className="py-2 text-left font-normal">금액</th>
              <th className="py-2 text-left font-normal">상태</th>
              <th className="py-2 text-right font-normal">작업</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="py-12 text-center text-ink-dim">
                신청 데이터 없음
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
