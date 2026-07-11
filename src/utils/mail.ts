import { createTransport } from "nodemailer";
import { SendMailOptions } from "../types/index.js";

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: SendMailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"CraveNow" <${process.env.MAIL_ID}>`,
    to,
    subject,
    html,
  });
};
