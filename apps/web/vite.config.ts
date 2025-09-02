import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['warning'],
    exclude: [
      '@cyntler/react-doc-viewer',
      'react-pdf',
      '@monaco-editor/react',
      'framer-motion',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
    dedupe: ['react', 'react-dom'],
  },
})