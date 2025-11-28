import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // GitHub Pages base path - change to '/' if using custom domain
      base: mode === 'production' ? '/MDEditor/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                // React core
                if (id.includes('react-dom') || id.includes('/react/')) {
                  return 'vendor-react';
                }
                // Markdown processing
                if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-') || id.includes('unified') || id.includes('hast') || id.includes('mdast') || id.includes('micromark')) {
                  return 'vendor-markdown';
                }
                // Mermaid (usually the largest)
                if (id.includes('mermaid') || id.includes('dagre') || id.includes('d3') || id.includes('elkjs')) {
                  return 'vendor-mermaid';
                }
                // KaTeX
                if (id.includes('katex')) {
                  return 'vendor-katex';
                }
                // UI icons
                if (id.includes('lucide')) {
                  return 'vendor-ui';
                }
                // AI SDK
                if (id.includes('@google/genai')) {
                  return 'vendor-ai';
                }
                // Code highlighting
                if (id.includes('highlight.js') || id.includes('lowlight')) {
                  return 'vendor-highlight';
                }
              }
            }
          }
        },
        chunkSizeWarningLimit: 2500, // Mermaid is inherently large (~2.2MB)
      }
    };
});
