const nodemailer = require('nodemailer');

async function main() {
  try {
    console.log('Testing SMTP configuration...');

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'ettajohnson1@gmail.com',
        pass: 'jdgk avur tuln tdal', // <-- App Password here
      },
    });

    const info = await transporter.sendMail({
      from: '"Pearls of Lyfe" <no-reply@yourdomain.com>',
      to: 'asim56101@gmail.com',
      subject: 'SMTP TEST',
      text: 'Email sent successfully using Gmail App Password.',
    });

    console.log('Email sent:', info.response);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
