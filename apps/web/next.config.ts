import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@hjkee/ui', '@hjkee/db', '@hjkee/domain', '@hjkee/hanja'],
  typedRoutes: true,
  images: {
    remotePatterns: [
      // Supabase Storage (도메인은 환경변수 기반으로 추후 보강)
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // 내부 워크스페이스 패키지는 TS source(.ts/.tsx) + ESM-spec '.js' import 패턴.
  // Next.js webpack이 '.js' import를 '.ts'/'.tsx'로 해석하도록 alias 설정.
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
