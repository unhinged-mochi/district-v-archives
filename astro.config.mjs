// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
	},

  integrations: [react()],

  fonts: [
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      provider: fontProviders.google(),
      weights: [300, 400, 500, 600, 700],
    },
  ],

  experimental: {
    queuedRendering: {
      enabled: true,
    },
  },
});