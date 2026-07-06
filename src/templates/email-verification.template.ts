interface VerificationEmailProps {
  name: string;
  otp: string;
}

export const verificationEmailTemplate = ({
  name,
  otp,
}: VerificationEmailProps) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your CraveNow verification code is ${otp}. It expires in 5 minutes.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:20px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="width:100%;max-width:600px;background:#ffffff;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b00,#ff8c3d);padding:32px 24px;text-align:center;">
              <span style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">
                🍔 CraveNow
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">
                Hello ${name}, 👋
              </h2>
              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#444;">
                Welcome to <strong>CraveNow</strong>! We're excited to have you on board.
              </p>
              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#444;">
                Use the verification code below to confirm your email address:
              </p>

              <!-- OTP Box -->
              <div style="background:#fff4ec;border:1px dashed #ff6b00;padding:20px;text-align:center;border-radius:8px;margin:28px 0;">
                <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#ff6b00;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#666;">
                ⏱️ This code is valid for <strong>5 minutes</strong>. Please don't share it with anyone.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#666;">
                If you didn't create this account, you can safely ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">

              <p style="margin:0;font-size:14px;color:#888;">
                Thanks,<br>
                <strong>Team CraveNow</strong> ❤️
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">
                © ${new Date().getFullYear()} CraveNow. All rights reserved.<br>
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
