import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
// import nodemailer from 'nodemailer';
import * as nodemailer from 'nodemailer';

@Module({
  imports: [
    // MailerModule.forRootAsync({
    //   useFactory: async () => {
    //     const testAccount = await nodemailer.createTestAccount();
    //     return {
    //       transport: {
    //         host: testAccount.smtp.host,
    //         port: testAccount.smtp.port,
    //         secure: testAccount.smtp.secure,
    //         auth: {
    //           user: testAccount.user,
    //           pass: testAccount.pass,
    //         },
    //       },
    //       defaults: {
    //         from: '"DEV Environment" <no-reply@pol.local>',
    //       },
    //     };
    //   },
    // }),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: parseInt(process.env.MAIL_PORT, 10),
          secure: process.env.MAIL_SECURE === 'true',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
        defaults: {
          from: process.env.EMAIL_FROM,
        },
      }),
    }),
  ],

  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
