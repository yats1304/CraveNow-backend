interface WelcomeEmailProps {
  name: string;
  ctaUrl?: string;
}

export const welcomeEmailTemplate = ({
  name,
  ctaUrl = "https://cravenow.com",
}: WelcomeEmailProps) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Welcome to CraveNow</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Welcome to CraveNow, ${name}! Your account is ready — let's get you fed.
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
                Welcome aboard, ${name}! 🎉
              </h2>
              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#444;">
                Your CraveNow account is all set up. We're thrilled to have you join us —
                great food is just a few taps away.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#444;">
                Here's what you can do next:
              </p>

              <!-- Feature list -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;">
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#444;">
                    🍽️ &nbsp;Browse restaurants near you
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#444;">
                    ⚡ &nbsp;Track your order in real time
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#444;">
                    🎁 &nbsp;Grab exclusive deals for new members
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}"
                      style="
                      background:#ff6b00;
                      color:#ffffff;
                      text-decoration:none;
                      font-size:16px;
                      font-weight:bold;
                      padding:14px 32px;
                      border-radius:8px;
                      display:inline-block;
                      ">
                      Start Ordering →
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">

              <p style="margin:0;font-size:14px;color:#888;">
                Happy cravings,<br>
                <strong>Team CraveNow</strong> ❤️
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">
                © ${new Date().getFullYear()} CraveNow. All rights reserved.<br>
                This is an automated message, please do not reply directly.
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
