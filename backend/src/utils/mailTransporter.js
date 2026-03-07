import nodemailer from "nodemailer";

let transporter = null;

const getSmtpPort = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  return Number.isFinite(port) ? port : 587;
};

const getTransportOptions = () => {
  const port = getSmtpPort();

  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    requireTLS: port !== 465,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  };
};

export const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

export const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport(getTransportOptions());
  return transporter;
};

export const resetTransporter = () => {
  transporter = null;
};

export const verifySmtpConnection = async () => {
  const smtpTransporter = getTransporter();
  await smtpTransporter.verify();
  return true;
};
