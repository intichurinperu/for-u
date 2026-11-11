import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_SUPABASE_');
  if (command === 'build' && (!env.VITE_SUPABASE_URL || !(env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY))) {
    throw new Error('No se puede compilar FOR U sin Supabase: configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o VITE_SUPABASE_PUBLISHABLE_KEY) en el entorno de build o en frontend/.env.');
  }
  return {
  plugins: [react()],
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    minify: 'esbuild',
    // Keep React and its renderers in Rollup's dependency graph. Splitting
    // reconciler/fiber/drei into forced vendor chunks creates initialization cycles.
    rollupOptions: { output: { manualChunks(id) {
      if (id.includes('/node_modules/three/')) return 'three-vendor'
    } } },
  },
  };
})
