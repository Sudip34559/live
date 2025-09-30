import { createTransport } from "nodemailer";

interface VerificationRequestParams {
  identifier: string;
  url: string;
  provider: {
    server: any;
    from: string;
  };
  theme?: {
    brandColor?: string;
    buttonText?: string;
  };
}

async function sendVerificationRequest(params: VerificationRequestParams) {
  const { identifier, url, provider, theme } = params;
  const { host } = new URL(url);

  const transport = createTransport(provider.server);
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `Sign in to ${host}`,
    text: text({ url, host }),
    html: html({ url, host, theme }),
  });

  console.log(result);

  const failed = result.rejected.filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

/**
 * Minimal purple-themed login email template
 */
function html(params: { url: string; host: string; theme?: any }): string {
  const { url, host } = params;
  const escapedHost = host.replace(/\./g, "​.");

  const colors = {
    background: "#f8f7ff",
    card: "#ffffff",
    primary: "#7c3aed",
    text: "#1f2937",
    textLight: "#6b7280",
    border: "#e5e7eb",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; background-color: ${colors.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background-color: ${colors.card}; border-radius: 12px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.08); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${colors.primary}, #a855f7); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
        Welcome back!
      </h1>
      <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
        Sign in to <strong>${escapedHost}</strong>
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="margin: 0 0 30px; color: ${colors.text}; font-size: 16px; line-height: 1.5;">
        Click the button below to securely sign in to your account:
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" target="_blank" style="display: inline-block; background-color: ${colors.primary}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);">
          Sign In
        </a>
      </div>
      
      <!-- Alternative link -->
      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid ${colors.border};">
        <p style="margin: 0 0 12px; color: ${colors.textLight}; font-size: 14px;">
          Or copy and paste this link:
        </p>
        <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid ${colors.border}; word-break: break-all;">
          <a href="${url}" style="color: ${colors.primary}; font-size: 13px; text-decoration: none;">
            ${url}
          </a>
        </div>
      </div>
      
      <!-- Security notice -->
      <p style="margin: 30px 0 0; color: ${colors.textLight}; font-size: 14px; line-height: 1.4;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Plain text version for email clients that don't support HTML
 */
function text(params: { url: string; host: string }): string {
  const { url, host } = params;
  return `Sign in to ${host}\n\nClick this link to sign in:\n${url}\n\nIf you didn't request this email, you can safely ignore it.`;
}

export { sendVerificationRequest };
