import type { Config } from 'tailwindcss';
import { appColor } from './src/presentation/design-system/AppColor';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...appColor,
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          border: 'var(--text-border)',
          disabled: 'var(--text-disabled)',
        },
        primary: {
          main: 'var(--primary-main)',
          light: 'var(--primary-light)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
