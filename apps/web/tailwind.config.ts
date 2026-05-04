import type { Config } from 'tailwindcss';
import preset from '@hjkee/ui/tailwind.preset';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [preset as Config],
  plugins: [],
};

export default config;
