import { PageHeader } from '@/components/DayBadge';
import { SearchForm } from './SearchForm';

export default function SearchPage() {
  return (
    <main className="container mx-auto max-w-[1080px] px-5 py-12 md:px-8">
      <PageHeader
        kind="F02"
        title="인물 검색"
        desc="한글·한자 통합 검색. 동명이인은 부친 이름으로 분리. kee_search_persons RPC 호출."
        day={3}
        status="inprogress"
      />
      <SearchForm />
    </main>
  );
}
