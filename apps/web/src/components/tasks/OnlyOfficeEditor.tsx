/// <reference types="vite/client" />
import { useEffect, useRef, useState } from 'react';
import { apiRoot } from '../../lib/api';

export default function OnlyOfficeEditor({ taskId, attId }: { taskId: string; attId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<any>(null);
  const containerId = `oo-editor-${attId}`;

  useEffect(() => {
    (async () => {
      const r = await fetch(`${apiRoot}/api/tasks/${taskId}/attachments/${attId}/onlyoffice-config`, {
        credentials: 'include',
      });
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
        s.src = `${import.meta.env.VITE_DS_URL || 'http://localhost:8082'}/web-apps/apps/api/documents/api.js`;
        s.onload = () => res();
        document.body.appendChild(s);
      });
    let editor: any;
    ensure().then(() => {
      editor = new (window as any).DocsAPI.DocEditor(containerId, { ...config, width: '100%', height: '100%' });
    });
    return () => {
      if (editor && editor.destroyEditor) editor.destroyEditor();
    };
  }, [config]);

  return <div id={containerId} className="w-full h-[70vh]" ref={ref} />;
}
