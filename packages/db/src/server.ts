// 서버 클라이언트 — Next.js App Router (RSC, Route Handler, Server Action에서 사용)
// 쿠키 핸들링은 호출 측에서 next/headers의 cookies()를 주입한다.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.generated.js';

type CookieStore = {
  get: (name: string) => { name: string; value: string } | undefined;
  set?: (name: string, value: string, options: CookieOptions) => void;
};

/** RSC/Route Handler — 사용자 컨텍스트 (RLS 적용됨) */
export function createServerClientWithCookies(cookies: CookieStore) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars');
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set?.(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookies.set?.(name, '', { ...options, maxAge: 0 });
      },
    },
  });
}

/** 서비스 롤 클라이언트 — RLS 우회. 마이그레이션·관리 작업·cron 전용. 절대 클라이언트에 노출 금지. */
export function createServiceClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase service env vars');
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
