import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class OnlyOfficeService {
  private ds = process.env.DS_PUBLIC_URL!;
  private secret = process.env.DS_JWT_SECRET!;

  buildConfig(att: { id: string; filename: string; url: string; mimeType: string }, user: { id: string; name: string }) {
    const key = `${att.id}-${Date.now()}`;
    const document = {
      fileType: att.filename.split('.').pop(),
      key,
      title: att.filename,
      url: `${process.env.API_PUBLIC_URL}${att.url}`,
      permissions: { edit: true, download: true },
    };
    const editorConfig = {
      callbackUrl: `${process.env.API_PUBLIC_URL}/api/onlyoffice/callback?attId=${att.id}`,
      user: { id: user.id, name: user.name },
    };
    const token = jwt.sign({ document, editorConfig }, this.secret);
    return { document, editorConfig, token };
  }

  async handleCallback(body: any, attId: string) {
    if (![2, 6].includes(body?.status)) return { error: 0 };
    const r = await fetch(body.url);
    const buf = Buffer.from(await r.arrayBuffer());
    const filename = body?.filename || 'file';
    const uploadName = filename;
    const uploadPathRel = `/uploads/${uploadName}`;
    const uploadPathAbs = join(process.cwd(), uploadPathRel.slice(1));
    await fs.writeFile(uploadPathAbs, buf);
    return { error: 0 };
  }
}