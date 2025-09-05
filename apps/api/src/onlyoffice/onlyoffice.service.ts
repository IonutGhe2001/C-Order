import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { join } from 'path';
import { promises as fs } from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnlyOfficeService {
  private ds = process.env.DS_PUBLIC_URL!;
  private secret = process.env.DS_JWT_SECRET!;

  constructor(private prisma: PrismaService) {}

  buildConfig(att: { id: string; filename: string; url: string; version: number }, user: { id: string; name: string }) {
    const fileType = att.filename.split('.').pop()?.toLowerCase();
    const config = {
      document: {
        fileType,
        title: att.filename,
        url: `${process.env.API_PUBLIC_URL}${att.url}`,
        key: `${att.id}:${att.version}`,
        permissions: { edit: true, download: false },
      },
      editorConfig: {
        callbackUrl: `${process.env.API_PUBLIC_URL}/api/onlyoffice/callback?attId=${att.id}`,
        user: { id: user.id, name: user.name },
        customization: { autosave: true },
      },
    };
    const token = jwt.sign(config, this.secret);
    return { config, token, dsUrl: this.ds };
  }

  async handleCallback(body: any, attId: string) {
    if (![2, 6].includes(body?.status)) return { error: 0 };
    const r = await fetch(body.url);
    if (!r.ok) throw new Error('DS fetch failed');
    const buf = Buffer.from(await r.arrayBuffer());
    const att = await this.prisma.attachment.findUnique({ where: { id: attId } });
    if (!att) return { error: 1 };
    const uploadPathAbs = join(
      process.cwd(),
      att.url.startsWith('/') ? att.url.slice(1) : att.url,
    );
    await fs.writeFile(uploadPathAbs, buf);
    await this.prisma.attachment.update({
      where: { id: attId },
      data: { version: { increment: 1 } },
    });
    return { error: 0 };
  }
}