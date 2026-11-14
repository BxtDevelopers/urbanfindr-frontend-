import { Resend } from 'resend';

function emailError(message, status = 502) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Send an email using the Resend SDK.
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL in environment variables.
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim();

  if (process.env.NODE_TEST_CONTEXT && !apiKey) {
    return { id: 'test-mode', skipped: true };
  }

  if (!apiKey) {
    throw emailError('Email service is not configured. Set RESEND_API_KEY in .env.local and restart the server.', 503);
  }
  if (!from) {
    throw emailError('Sender email is not configured. Set RESEND_FROM_EMAIL in .env.local and restart the server.', 503);
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  });

  if (error) {
    throw emailError(error.message || 'Failed to send email via Resend.', 502);
  }

  return data;
}

/**
 * Send a 6-digit password reset OTP email.
 */
export async function sendPasswordResetOtpEmail({ to, code }) {
  const subject = 'Your UrbanFindr Password Reset Verification Code';
  const text = `Your UrbanFindr verification code is ${code}. This code expires in 10 minutes. For your security, never share this code with anyone.`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:18px;font-weight:700;color:#163e35;letter-spacing:-0.3px;">UrbanFindr</span>
      </div>
      <h2 style="color:#111827;font-size:20px;margin:0 0 10px;">Password Reset Verification Code</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 18px;">
        Use the 6-digit verification code below to reset your UrbanFindr account password:
      </p>
      <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;color:#163e35;margin-bottom:18px;">
        ${code}
      </div>
      <p style="color:#4b5563;font-size:13px;line-height:1.5;margin:0 0 12px;">
        This code expires in <strong>10 minutes</strong> and can only be used once.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 12px;margin-bottom:14px;">
        <p style="color:#991b1b;font-size:12px;line-height:1.5;margin:0;">
          <strong>Security Notice:</strong> Never share this verification code with anyone, including UrbanFindr staff. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `.trim();

  return sendEmail({ to, subject, html, text });
}
