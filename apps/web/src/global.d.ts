declare module '@cyntler/react-doc-viewer';
declare module 'react-pdf';
declare module '@monaco-editor/react';
declare module 'pdfjs-dist/build/pdf.worker.min.js?url' {
  const src: string;
  export default src;
  }
declare module '*.svg?raw' {
  const content: string;
  export default content;
}