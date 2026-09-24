import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
  });

  async sendPasswordReset(to: string, link: string) {
    await this.transporter.sendMail({
      from: 'EpiTrello <no-reply@epitrello.local>',
      to,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Pour réinitialiser votre mot de passe, ouvrez ce lien (valable 1h) :\n${link}`,
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous (valable 1h) :</p><p><a href="${link}">${link}</a></p>`,
    });
    this.logger.log(`Mail de reset envoyé à ${to}`);
  }
}
