import { getTransporter } from "./mailTransporter.js";

export const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();   // ✅ now env already loaded

  const info = await transporter.sendMail({
    from: `${process.env.APP_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("✅ Mail Sent To:", to);
  console.log("📩 Message ID:", info.messageId);

  return info;
};
