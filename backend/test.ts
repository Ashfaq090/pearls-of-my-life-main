import * as nodemailer from 'nodemailer';

async function sendTestEmail() {
  try {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: 'blsspain651@gmail.com',
        pass: 'slgjaymzxagndpxy',
      },
    });

    // 2. Send email
    const info = await transporter.sendMail({
      from: 'Pearls of Lyfe <no-reply@yourdomain.com>',
      to: 'someonenew@yopmail.com',
      subject: 'Test Email from NestJS',
      html: `
        <h2>Test Email Successful 🎉</h2>
        <p>This is a test message sent from your NestJS SMTP setup.</p>
      `,
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

sendTestEmail();
