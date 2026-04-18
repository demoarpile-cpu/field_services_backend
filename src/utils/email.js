const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  FRONTEND_URL
} = require('../config/env');

const canSendEmail = () => {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);
};

const getTransporter = () => {
  if (!canSendEmail()) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendPortalCredentialsEmail = async ({ email, temporaryPassword }) => {
  if (!email || !temporaryPassword) return false;
  const transporter = getTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Your FieldSync Portal Access',
    text: [
      'Hello,',
      '',
      'Your customer portal account has been created.',
      '',
      `Login Email: ${email}`,
      `Temporary Password: ${temporaryPassword}`,
      '',
      'Please login and change your password after first login.',
      '',
      `Portal Link: ${FRONTEND_URL}/login`
    ].join('\n')
  });

  return true;
};

module.exports = {
  canSendEmail,
  sendPortalCredentialsEmail
};
