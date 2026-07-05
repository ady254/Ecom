import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter: nodemailer.Transporter | null = null;

export const getMailTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT),
      secure: env.EMAIL_SECURE === 'true',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('⚠️   Email credentials not configured — skipping email send');
    return;
  }

  const mail = getMailTransporter();
  await mail.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// ─── Email Templates ──────────────────────────────────────────────────────────

export const orderConfirmationTemplate = (data: {
  name: string;
  orderId: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  trackUrl?: string;
}): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(11,35,66,0.08); }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; margin-bottom: 8px; }
    .body p { color: #555; line-height: 1.7; }
    .order-id { background: #f0ede8; border-radius: 8px; padding: 16px 24px; margin: 24px 0; }
    .order-id span { color: #0B2342; font-weight: 600; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { text-align: left; border-bottom: 2px solid #0B2342; padding: 10px; color: #0B2342; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    td { padding: 12px 10px; border-bottom: 1px solid #eee; color: #444; }
    .total-row td { font-weight: 700; color: #0B2342; border-top: 2px solid #0B2342; border-bottom: none; font-size: 16px; }
    .btn { display: inline-block; margin: 8px 0 16px; padding: 14px 32px; background: #CFA96A; color: #0B2342 !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .gold { color: #CFA96A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MINARA</h1>
      <p>Luxury Gifting, Reimagined</p>
    </div>
    <div class="body">
      <h2>Thank you, ${data.name}!</h2>
      <p>Your order has been confirmed. We're preparing your luxury gift with the utmost care.</p>
      <div class="order-id">
        Order ID: <span class="gold">${data.orderId}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price.toLocaleString('en-IN')}</td>
            </tr>
          `
            )
            .join('')}
          <tr class="total-row">
            <td colspan="2">Total</td>
            <td>₹${data.total.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      ${data.trackUrl ? `<div style="text-align:center;"><a href="${data.trackUrl}" class="btn">Track My Order</a></div>` : ''}
      <p>We'll notify you when your order ships. Expected delivery: <strong>2–5 business days</strong>.</p>
    </div>
    <div class="footer">
      <p>Questions? Email us at <span class="gold">support@minara.in</span></p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (data: { name: string; resetUrl: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(11,35,66,0.08); }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; margin-bottom: 8px; }
    .body p { color: #555; line-height: 1.7; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #0B2342; color: #fff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600; letter-spacing: 1px; }
    .note { font-size: 13px; color: #999; margin-top: 16px; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .gold { color: #CFA96A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MINARA</h1></div>
    <div class="body">
      <h2>Reset your password</h2>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset the password for your MINARA account. Click the button below to set a new password:</p>
      <a href="${data.resetUrl}" class="btn">Reset Password</a>
      <p class="note">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
    </div>
    <div class="footer"><p>Questions? Email us at <span class="gold">support@minara.in</span></p></div>
  </div>
</body>
</html>
`;

export const emailVerificationTemplate = (data: { name: string; verifyUrl: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(11,35,66,0.08); }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; margin-bottom: 8px; }
    .body p { color: #555; line-height: 1.7; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #CFA96A; color: #0B2342; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
    .note { font-size: 13px; color: #999; margin-top: 16px; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .gold { color: #CFA96A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MINARA</h1></div>
    <div class="body">
      <h2>Welcome, ${data.name}! 🎁</h2>
      <p>Thank you for joining MINARA — India's premier luxury gifting destination. Please verify your email address to unlock all features:</p>
      <a href="${data.verifyUrl}" class="btn">Verify My Email</a>
      <p class="note">If you didn't create an account with us, please ignore this email.</p>
    </div>
    <div class="footer"><p>Questions? Email us at <span class="gold">support@minara.in</span></p></div>
  </div>
</body>
</html>
`;

export const orderShippedTemplate = (data: {
  name: string;
  orderId: string;
  awbNumber: string;
  trackUrl?: string;
}): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; }
    .awb-box { background: #f0ede8; border-left: 4px solid #CFA96A; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .awb-box p { margin: 0; color: #444; }
    .awb-box strong { color: #0B2342; font-size: 18px; }
    .btn { display: inline-block; margin: 8px 0 16px; padding: 14px 32px; background: #CFA96A; color: #0B2342 !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MINARA</h1></div>
    <div class="body">
      <h2>Your order is on its way! 🚀</h2>
      <p>Hi ${data.name}, your order <strong>${data.orderId}</strong> has been shipped via XpressBees.</p>
      <div class="awb-box">
        <p>Tracking Number (AWB)</p>
        <strong>${data.awbNumber}</strong>
      </div>
      <p>You can track your shipment on the XpressBees website using the AWB number above.</p>
      ${data.trackUrl ? `<div style="text-align:center;"><a href="${data.trackUrl}" class="btn">Track My Order</a></div>` : ''}
    </div>
    <div class="footer"><p>Questions? Email us at support@minara.in</p></div>
  </div>
</body>
</html>
`;

export const orderDeliveredTemplate = (data: { name: string; orderId: string; trackUrl?: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; }
    .body p { color: #555; line-height: 1.7; }
    .order-id { background: #f0ede8; border-radius: 8px; padding: 16px 24px; margin: 24px 0; }
    .order-id span { color: #0B2342; font-weight: 600; font-size: 18px; }
    .btn { display: inline-block; margin: 8px 0 16px; padding: 14px 32px; background: #CFA96A; color: #0B2342 !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .gold { color: #CFA96A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MINARA</h1></div>
    <div class="body">
      <h2>Delivered! We hope you love it. 🎁</h2>
      <p>Hi ${data.name}, your order has arrived.</p>
      <div class="order-id">Order ID: <span class="gold">${data.orderId}</span></div>
      <p>We'd love to hear what you think — your feedback helps us keep every gift unforgettable.</p>
      ${data.trackUrl ? `<div style="text-align:center;"><a href="${data.trackUrl}" class="btn">View My Order</a></div>` : ''}
    </div>
    <div class="footer"><p>Questions? Email us at <span class="gold">support@minara.in</span></p></div>
  </div>
</body>
</html>
`;

export const orderCancelledTemplate = (data: { name: string; orderId: string; reason?: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; }
    .body p { color: #555; line-height: 1.7; }
    .order-id { background: #f0ede8; border-radius: 8px; padding: 16px 24px; margin: 24px 0; }
    .order-id span { color: #0B2342; font-weight: 600; font-size: 18px; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .gold { color: #CFA96A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MINARA</h1></div>
    <div class="body">
      <h2>Your order has been cancelled</h2>
      <p>Hi ${data.name}, order <strong>${data.orderId}</strong> has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}</p>
      <div class="order-id">Order ID: <span class="gold">${data.orderId}</span></div>
      <p>If a payment was already made, any applicable refund will be processed to your original payment method within 5–7 business days.</p>
    </div>
    <div class="footer"><p>Questions? Email us at <span class="gold">support@minara.in</span></p></div>
  </div>
</body>
</html>
`;

export const paymentFailedTemplate = (data: { name: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f9f7f4; margin: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: #0B2342; padding: 40px 32px; text-align: center; }
    .header h1 { color: #CFA96A; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { color: #0B2342; font-size: 22px; }
    .body p { color: #555; line-height: 1.7; }
    .footer { background: #0B2342; padding: 24px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .gold { color: #CFA96A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MINARA</h1></div>
    <div class="body">
      <h2>We couldn't confirm your payment</h2>
      <p>Hi ${data.name}, your recent payment attempt on MINARA could not be verified, so your order was not placed.</p>
      <p>No amount was charged, or any amount debited will be automatically refunded by your bank within 5–7 business days. Please try again, or reach out if the issue persists.</p>
    </div>
    <div class="footer"><p>Questions? Email us at <span class="gold">support@minara.in</span></p></div>
  </div>
</body>
</html>
`;
