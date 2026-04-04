import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { resolve } from 'path';

export default defineConfig({
  base: '/smoke-flow/',
  plugins: [glsl()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        evolution: resolve(__dirname, 'evolution.html'),
      },
    },
  },
  server: {
    port: 5174,
    open: true,
  },
});
