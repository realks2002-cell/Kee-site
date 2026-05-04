import Link from 'next/link';

// 공개 페이지 공통 sub-layout — 상단 사이트 바
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-serif-cjk text-base font-medium text-ink">행주기씨대종중</span>
            <span className="hanja">幸州奇氏</span>
          </Link>
          <nav className="hidden gap-5 text-sm text-ink-mute md:flex">
            <Link href="/search" className="hover:text-ink">검색</Link>
            <Link href="/persons/1/tree" className="hover:text-ink">가계도</Link>
            <Link href="/adoptions" className="hover:text-ink">양자</Link>
            <Link href="/chonsu" className="hover:text-ink">촌수</Link>
            <Link href="/stats" className="hover:text-ink">통계</Link>
            <Link href="/sudan/new" className="hover:text-ink">신규 등록</Link>
            <Link href="/gaseungbo" className="hover:text-ink">가승보</Link>
            <Link href="/admin" className="text-accent hover:text-accent-soft">관리자</Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
