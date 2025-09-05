/// <reference types="vite/client" />
import { useEffect, useRef, useState } from 'react';
import { apiRoot } from '../../lib/api';

declare global {
  interface Window {
    DocsAPI: any;
  }
}

export default function OnlyOfficeEditor({ taskId, attId }: { taskId: string; attId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ config: any; token: string; dsUrl: string } | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(
        `${apiRoot}/api/tasks/${taskId}/attachments/${attId}/onlyoffice-config`,
        {
          credentials: 'include',
        },
      );
      const cfg = await r.json();
      setState(cfg);
    })();
  }, [taskId, attId]);

  useEffect(() => {
    if (!state || !ref.current) return;
    const { config, token, dsUrl } = state;
    const ensure = () =>
      new Promise<void>((res) => {
        if ((window as any).DocsAPI) return res();
        const s = document.createElement('script');
        s.src = `${dsUrl}/web-apps/apps/api/documents/api.js`;
        s.onload = () => res();
        document.body.appendChild(s);
      });
    let editor: any;
    ensure().then(() => {
      editor = new window.DocsAPI.DocEditor(ref.current, {
        ...config,
        document: { ...config.document, token },
        editorConfig: { ...config.editorConfig, token },
        height: '100%',
        width: '100%',
      });
    });
    return () => {
      if (editor && editor.destroyEditor) editor.destroyEditor();
    };
  }, [state]);

  return <div className="w-full h-full" ref={ref} />;
}