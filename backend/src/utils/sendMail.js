import { getTransporter } from "./mailTransporter.js";

export const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: `${process.env.APP_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Mail sent to:", to);
  console.log("Message ID:", info.messageId);

  return info;
};

export const queueMail = ({ to, subject, html, label = "Mail" }) => {
  setImmediate(async () => {
    try {
      await sendMail({ to, subject, html });
      console.log(`${label} queued mail sent:`, to);
    } catch (error) {
      console.log(`${label} queued mail failed:`, to, error.message);
    }
  });
};
