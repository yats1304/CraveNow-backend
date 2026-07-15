import { env } from "../config/env.js";
import { createTransport } from "nodemailer";
import { SendMailOptions } from "../types/index.js";

const transporter = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true,
  auth: {
    user: env.MAIL_ID,
    pass: env.MAIL_PASSWORD,
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: SendMailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"CraveNow" <${env.MAIL_ID}>`,
    to,
    subject,
    html,
  });
};
