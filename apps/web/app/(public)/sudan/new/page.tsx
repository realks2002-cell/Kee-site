import { PageHeader } from '@/components/DayBadge';
import { Wizard } from './Wizard';

export default function SudanNewPage() {
  return (
    <main className="container mx-auto max-w-[880px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F05"
        title="신규 등록 (수단)"
        desc="5단계 마법사. NICE 본인인증 대신 위원회 수동 검증, Toss 대신 농협 입금 + 매칭 코드."
        day={5}
        status="inprogress"
      />
      <Wizard />
    </main>
  );
}
