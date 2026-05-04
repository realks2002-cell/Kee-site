// 위원회 관리자 영역 sub-layout.
// (실제 인증 게이팅은 W2 RLS·Supabase Auth 적용 시 추가)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg-soft">{children}</div>;
}
