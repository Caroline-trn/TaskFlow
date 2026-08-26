import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, FRONTEND_URL } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !MAIL_FROM || !FRONTEND_URL) {
      throw new InternalServerErrorException('Le service email n’est pas configuré.');
    }
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
    const resetUrl = `${FRONTEND_URL.replace(/\/$/, '')}/?resetToken=${encodeURIComponent(token)}`;
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: 'Réinitialisation de votre mot de passe TaskFlow',
      text: `Réinitialisez votre mot de passe avec ce lien (valable 15 minutes) : ${resetUrl}`,
      html: `<p>Vous avez demandé la réinitialisation de votre mot de passe TaskFlow.</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p><p>Ce lien est valable 15 minutes.</p>`,
    });
  }
}
