import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: +(process.env.SMTP_PORT || 25),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  async sendMail(opts: { to: string[]; subject: string; html: string; attachments?: { filename: string; path: string; }[] }) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: opts.to.join(','),
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
  }
}