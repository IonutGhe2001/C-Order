/// <reference types="vite/client" />
import { useEffect, useRef, useState } from 'react';
import { apiRoot } from '../../lib/api';

declare global {
  interface Window { DocsAPI: any }
}

export default function OnlyOfficeEditor({ taskId, attId }: { taskId: string; attId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(
        `${apiRoot}/api/tasks/${taskId}/attachments/${attId}/onlyoffice-config`,
        {
          credentials: 'include',
        },
      );
      const cfg = await r.json();
      setConfig(cfg);
    })();
  }, [taskId, attId]);

  useEffect(() => {
    if (!config || !ref.current) return;
    const ensure = () =>
      new Promise<void>((res) => {
        if ((window as any).DocsAPI) return res();
        const s = document.createElement('script');
        s.src = `${import.meta.env.VITE_DS_URL}/web-apps/apps/api/documents/api.js`;
        s.onload = () => res();
        document.body.appendChild(s);
      });
    let editor: any;
    ensure().then(() => {
      editor = new window.DocsAPI.DocEditor(ref.current, { ...config });
    });
    return () => {
      if (editor && editor.destroyEditor) editor.destroyEditor();
    };
  }, [config]);

  return <div className="w-full h-full" ref={ref} />;
}