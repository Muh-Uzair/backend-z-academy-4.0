import { transporter } from "../config/email.config";

interface SendOTPEmailOptions {
  to: string;
  otp: string; // string better for leading zeros (if any)
}

export const sendOTPEmail = async ({ to, otp }: SendOTPEmailOptions) => {
  try {
    const expiresInMinutes = 10;

    const subject = "Your zAcademy OTP Code – Verify Your Email";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #dcfce7; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #059669, #059669); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">zAcademy</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Learn. Grow. Succeed.</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #1e293b; margin-bottom: 20px;">Verify Your Email Address</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                      Here's your One-Time Password (OTP) to complete verification:
                    </p>

                    <!-- OTP Box -->
                    <div style="
                      display: inline-block;
                      background-color: #dcfce7;
                      border: 2px dashed #059669;
                      border-radius: 12px;
                      padding: 20px 40px;
                      margin: 20px 0;
                      font-size: 32px;
                      font-weight: bold;
                      letter-spacing: 8px;
                      color: #1e293b;
                      text-align: center;
                    ">
                      ${otp}
                    </div>

                    <p style="color: #64748b; font-size: 14px; margin: 30px 0;">
                      This OTP is valid for <strong>${expiresInMinutes} minutes</strong>.<br>
                      Do not share this code with anyone.
                    </p>

                    <p style="color: #94a3b8; font-size: 13px; margin-top: 40px;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b;">
                    <p style="margin: 0;">© 2025 zAcademy. All rights reserved.</p>
                    <p style="margin: 10px 0 0;">
                      <a href="#" style="color: #059669; text-decoration: none;">Unsubscribe</a> • 
                      <a href="#" style="color: #059669; text-decoration: none;">Privacy Policy</a>
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

    // Plain text fallback
    const text = `
Your zAcademy OTP Code

Your One-Time Password (OTP): ${otp}

This code is valid for ${expiresInMinutes} minutes.
Do not share it with anyone.

If you didn't request this, ignore this email.

© 2025 zAcademy
    `;

    const info = await transporter.sendMail({
      from: `"zAcademy" <no-reply@zacademy.com>`, // professional no-reply
      to,
      subject,
      text,
      html,
    });

    console.log("OTP Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
// Pre-built templates
// export const sendWelcomeEmail = (to: string, fullName: string) => {
//   return sendEmail({
//     to,
//     subject: "Welcome to zAcademy! 🚀",
//     html: `
//       <h1>Hello ${fullName}!</h1>
//       <p>Welcome to <strong>zAcademy</strong> – your journey to mastering skills starts now!</p>
//       <p>Explore courses, track progress, and level up your career.</p>
//       <br>
//       <p>Team zAcademy</p>
//     `,
//   });
// };
