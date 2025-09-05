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

  async buildConfig(att: { id: string; filename: string; url: string; mimeType: string }, user: { id: string; name: string }) {
   // citește versiunea curentă din DB
   const rec = await this.prisma.attachment.findUnique({ where: { id: att.id }, select: { version: true } });
   const version = (rec?.version ?? 1);    
   const key = `${att.id}:${version}`; // unic pe versiune
    const document = {
     fileType: att.filename.split('.').pop()?.toLowerCase(),
     title: att.filename,
     url: (att.url.startsWith('http') ? att.url : `${this.api}${att.url}`) + `?v=${version}`, // cache-buster
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
    // suprascrie atașamentul original + bump versiune
    const att = await this.prisma.attachment.findUnique({ where: { id: attId }, select: { url: true } });
    if (!att) return { error: 1 };
    const target = join(process.cwd(), att.url.startsWith('/') ? att.url.slice(1) : att.url);
    await fs.writeFile(target, buf);
    await this.prisma.attachment.update({
      where: { id: attId },
      data: { version: { increment: 1 } } // necesită câmp numeric "version" în schema
    });
    return { error: 0 };
  }
}