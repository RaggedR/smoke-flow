import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: '/smoke-flow/',
  plugins: [glsl()],
  server: {
    port: 5174,
    open: true
  }
});
