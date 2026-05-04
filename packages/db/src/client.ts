// 브라우저 클라이언트 — Next.js App Router (RSC가 아닌 Client Component에서 사용)

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types.generated.js';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
