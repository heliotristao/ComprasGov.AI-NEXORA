process.env.NEXT_DISABLE_ESLINT_PATCH = '1';

import nextConfigs from 'eslint-config-next';

const nextBaseConfig = nextConfigs.find((config) => config?.name === 'next');
const nextTypescriptConfig = nextConfigs.find((config) => config?.name === 'next/typescript');
const nextCoreWebVitalsConfig = nextConfigs.find((config) => config?.name === 'next/core-web-vitals');

const config = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  nextBaseConfig,
  nextTypescriptConfig,
  nextCoreWebVitalsConfig,
].filter(Boolean);

export default config;
