import { defineConfig } from 'tsup';

export default defineConfig({
  // Bundle the internal workspace packages INTO server.js. Their `main`
  // fields point at raw .ts source, which Node cannot execute at runtime,
  // so they must be inlined rather than left as external requires.
  noExternal: ['@minara/config', '@minara/types', '@minara/utils'],
});
