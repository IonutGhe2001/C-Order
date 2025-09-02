import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['warning', 'prop-types', 'pdfjs-dist/build/pdf.worker.js'],
    exclude: [
      '@cyntler/react-doc-viewer',
      'react-pdf',
      '@monaco-editor/react',
      'framer-motion',
    ],
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: /^pdfjs-dist$/, replacement: 'pdfjs-dist/legacy/build/pdf' },
    ],
    dedupe: ['react', 'react-dom'],
  },
})