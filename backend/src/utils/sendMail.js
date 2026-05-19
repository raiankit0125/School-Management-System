import { getTransportConfigs, getTransporter, hasSmtpConfig } from "./mailTransporter.js";

const buildFromAddress = () => {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || process.env.APP_NAME || "School Management System";
  return `${fromName} <${fromEmail}>`;
};

export const sendMail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    throw new Error("SMTP configuration is incomplete");
  }

  if (!to || !subject || (!html && !text)) {
    throw new Error("to, subject, and mail body are required");
  }

  const configs = getTransportConfigs();
  const errors = [];

  for (const config of configs) {
    let transporter = null;
    try {
      transporter = getTransporter(config);

      const info = await transporter.sendMail({
        from: buildFromAddress(),
        to,
        subject,
        html,
        text,
      });
      transporter.close();

      console.log("Mail sent to:", to);
      console.log("Message ID:", info.messageId);
      console.log("SMTP transport:", `${config.host}:${config.port}${config.service ? ` (${config.service})` : ""}`);

      return info;
    } catch (error) {
      transporter?.close();
      errors.push(`${config.host}:${config.port} ${error.message}`);
    }
  }

  throw new Error(errors.join(" | "));
};

export const queueMail = ({ to, subject, html, text, label = "Mail" }) => {
  setImmediate(async () => {
    try {
      await sendMail({ to, subject, html, text });
      console.log(`${label} queued mail sent:`, to);
    } catch (error) {
      console.log(`${label} queued mail failed:`, to, error.message);
    }
  });
};
