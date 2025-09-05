import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class OnlyOfficeService {
  private ds = process.env.DS_PUBLIC_URL!;
  private secret = process.env.DS_JWT_SECRET!;
  private api = process.env.API_PUBLIC_URL!;

  constructor(private prisma: PrismaService) {}

  buildConfig(att: { id: string; filename: string; url: string; mimeType: string }, user: { id: string; name: string }) {
    const key = `${att.id}-${Date.now()}`;
    const document = {
      fileType: att.filename.split('.').pop(),
      title: att.filename,
      url: att.url.startsWith('http') ? att.url : `${this.api}${att.url}`,
      key,
      permissions: { edit: true, download: false },
    };
    const editorConfig = {
      callbackUrl: `${this.api}/api/onlyoffice/callback?attId=${att.id}`,
      user,
      customization: { autosave: true },
    };
    const token = jwt.sign({ document, editorConfig }, this.secret);
    return { document, editorConfig, token };
  }

  async handleCallback(body: any, attId: string) {
    if (![2, 6].includes(body?.status)) return { error: 0 };
    const r = await fetch(body.url);
    if (!r.ok) throw new Error('DS fetch failed');
    const buf = Buffer.from(await r.arrayBuffer());
    // suprascrie atașamentul original
    const att = await this.prisma.attachment.findUnique({ where: { id: attId } });
    if (!att) return { error: 1 };
    const target = join(process.cwd(), att.url.startsWith('/') ? att.url.slice(1) : att.url);
    await fs.writeFile(target, buf);
    return { error: 0 };
  }
}