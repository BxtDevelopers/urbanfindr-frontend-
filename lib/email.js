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

/**
 * Send an instant property match email notification.
 */
export async function sendPropertyAlertEmail({ to, alertName, property, appUrl = 'http://localhost:3000' }) {
  const priceFormatted = property.price ? (property.price >= 10000000 ? `₹${(property.price / 10000000).toFixed(2)} Cr` : property.price >= 100000 ? `₹${(property.price / 100000).toFixed(2)} Lakh` : `₹${property.price.toLocaleString('en-IN')}`) : 'Price on request';
  const bhkText = property.bedrooms ? `${property.bedrooms} BHK ` : '';
  const propUrl = `${appUrl}/properties/${property._id}`;
  const manageUrl = `${appUrl}/dashboard/customer?section=saved-searches`;
  const subject = `New property matching your UrbanFindr alert: ${alertName}`;
  const text = `A new property matching your alert "${alertName}" is available!\n\n${property.title}\n${bhkText}${property.type || ''} in ${property.locality}, ${property.city}\nPrice: ${priceFormatted}\n\nView details: ${propUrl}\nManage alerts: ${manageUrl}`;

  const imageBlock = property.images?.[0]
    ? `<img src="${property.images[0]}" alt="${property.title}" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px;margin-bottom:14px;display:block;" />`
    : '';

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:540px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:18px;font-weight:700;color:#163e35;letter-spacing:-0.3px;">UrbanFindr Property Alerts</span>
      </div>
      <p style="color:#6b7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Alert: ${alertName}</p>
      <h2 style="color:#111827;font-size:20px;margin:0 0 14px;">A new matching home was just listed</h2>
      ${imageBlock}
      <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:16px;margin-bottom:18px;">
        <h3 style="color:#111827;font-size:16px;margin:0 0 6px;">${property.title}</h3>
        <p style="color:#4b5563;font-size:13px;margin:0 0 8px;">📍 ${property.locality}, ${property.city}</p>
        <div style="display:flex;gap:12px;align-items:center;">
          <span style="font-size:16px;font-weight:700;color:#163e35;">${priceFormatted}</span>
          ${bhkText ? `<span style="font-size:12px;background:#ecf2e4;color:#163e35;padding:3px 8px;border-radius:6px;font-weight:600;">${bhkText.trim()}</span>` : ''}
          <span style="font-size:12px;background:#f3f4f6;color:#4b5563;padding:3px 8px;border-radius:6px;">${property.type || 'Property'}</span>
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <a href="${propUrl}" style="background:#163e35;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;display:inline-block;">View Property Details &rarr;</a>
      </div>
      <div style="border-top:1px solid #f3f4f6;padding-top:12px;color:#9ca3af;font-size:11px;line-height:1.5;">
        You received this notification because of your active saved search alert. You can <a href="${manageUrl}" style="color:#163e35;text-decoration:underline;">manage or pause your alerts</a> anytime in your dashboard.
      </div>
    </div>
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a daily digest email containing all newly matched properties.
 */
export async function sendDailyDigestEmail({ to, alertName, properties, appUrl = 'http://localhost:3000' }) {
  if (!properties?.length) return;
  const count = properties.length;
  const manageUrl = `${appUrl}/dashboard/customer?section=saved-searches`;
  const subject = `UrbanFindr Daily Digest: ${count} new ${count === 1 ? 'home matches' : 'homes match'} your alert "${alertName}"`;

  const itemsHtml = properties.map(property => {
    const priceFormatted = property.price ? (property.price >= 10000000 ? `₹${(property.price / 10000000).toFixed(2)} Cr` : property.price >= 100000 ? `₹${(property.price / 100000).toFixed(2)} Lakh` : `₹${property.price.toLocaleString('en-IN')}`) : 'Price on request';
    const bhkText = property.bedrooms ? `${property.bedrooms} BHK ` : '';
    const propUrl = `${appUrl}/properties/${property._id}`;
    const imgHtml = property.images?.[0]
      ? `<img src="${property.images[0]}" alt="${property.title}" style="width:90px;height:70px;object-fit:cover;border-radius:6px;margin-right:12px;float:left;" />`
      : '';
    return `
      <div style="border-bottom:1px solid #f3f4f6;padding:12px 0;overflow:hidden;">
        ${imgHtml}
        <div>
          <h4 style="margin:0 0 4px;font-size:14px;"><a href="${propUrl}" style="color:#111827;text-decoration:none;">${property.title}</a></h4>
          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">📍 ${property.locality}, ${property.city} · ${bhkText}${property.type || ''}</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#163e35;">${priceFormatted} · <a href="${propUrl}" style="color:#163e35;text-decoration:underline;font-size:12px;font-weight:600;">View &rarr;</a></p>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:540px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:18px;font-weight:700;color:#163e35;letter-spacing:-0.3px;">UrbanFindr Daily Digest</span>
      </div>
      <p style="color:#6b7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Alert: ${alertName}</p>
      <h2 style="color:#111827;font-size:20px;margin:0 0 14px;">${count} new ${count === 1 ? 'property matches' : 'properties match'} your search</h2>
      <div style="margin-bottom:18px;">
        ${itemsHtml}
      </div>
      <div style="margin-bottom:20px;">
        <a href="${manageUrl}" style="background:#163e35;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;display:inline-block;">Manage All Alerts &rarr;</a>
      </div>
      <div style="border-top:1px solid #f3f4f6;padding-top:12px;color:#9ca3af;font-size:11px;line-height:1.5;">
        You received this daily digest based on your notification frequency preference.
      </div>
    </div>
  `.trim();

  return sendEmail({ to, subject, html, text: `${count} new properties matching your alert "${alertName}". View your dashboard to manage alerts.` });
}
