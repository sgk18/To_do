import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use host/port from env
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    if (!process.env.EMAIL_USER) {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
        return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
