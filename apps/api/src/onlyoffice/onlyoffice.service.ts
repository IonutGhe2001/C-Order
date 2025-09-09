import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { join, basename } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class OnlyOfficeService {
  private secret = process.env.DS_JWT_SECRET!;
  private api = process.env.API_PUBLIC_URL!;

  constructor(private prisma: PrismaService) {}

  async buildConfig(att: { id: string; filename: string; url: string; mimeType: string }, user: { id: string; name: string }) {
    const rec = await this.prisma.attachment.findUnique({ where: { id: att.id }, select: { version: true } });
    const version = rec?.version ?? 1;
    const key = `${att.id}_${version}`;

    const baseUrl = att.url.startsWith('http') ? att.url : `${this.api}${att.url}`;
    const documentUrl = encodeURI(baseUrl) + `?v=${version}`;

    const document = {
      fileType: att.filename.split('.').pop()?.toLowerCase(),
      title: att.filename,
      url: documentUrl,
      key,
      permissions: { edit: true, download: true },
    };

    const editorConfig = {
      callbackUrl: `${this.api}/api/onlyoffice/callback?attId=${att.id}`,
      user,
      customization: { autosave: true },
    };

    const token = jwt.sign({ document, editorConfig }, this.secret, { algorithm: 'HS256' });
    return { document, editorConfig, token };
  }

  async handleCallback(body: any, attId: string) {
    if (![2, 6].includes(body?.status)) return { error: 0 };

    const r = await fetch(body.url);
    if (!r.ok) throw new Error('DS fetch failed');
    const buf = Buffer.from(await r.arrayBuffer());

    const att = await this.prisma.attachment.findUnique({ where: { id: attId }, select: { url: true } });
    if (!att?.url) return { error: 1 };

    const uploadDir = join(process.cwd(), 'apps', 'api', 'uploads'); // același cu main.ts
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = basename(att.url);         // ex: 1757...-formular semnat.pdf
    const target = join(uploadDir, fileName);
    await fs.writeFile(target, buf);

    await this.prisma.attachment.update({ where: { id: attId }, data: { version: { increment: 1 } } });
    return { error: 0 };
  }
}
