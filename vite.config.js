import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    {
      // SvelteKit feature-detects these Svelte 5 APIs at runtime; harmless on Svelte 4
      name: 'silence-kit-svelte5-exports',
      onLog(level, log) {
        if (log.code === 'MISSING_EXPORT' && log.id?.includes('@sveltejs/kit')) return false;
      }
    }
  ]
});
