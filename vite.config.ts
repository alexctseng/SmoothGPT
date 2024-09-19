import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/', 
  logLevel: 'info',  // Options are 'info', 'warn', 'error', and 'silent'
  define: {
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY),
  },

    build: {
      target: "es2022",
      rollupOptions: {
        output: {
          // PDF.js might benefit from this for handling assets like workers
          manualChunks(id) {
            if (id.includes('pdf.worker.min.js')) {
              return 'pdf.worker.min';
            }
          }
        }
      }
    },
    esbuild: {
      target: "es2022"
    },
    optimizeDeps:{
      esbuildOptions: {
        target: "es2022",
      }
    }


})
