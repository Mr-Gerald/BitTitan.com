export const config = {
  runtime: 'edge',
};

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const createWelcomeEmailHtml = ({ name, verificationLink }: { name: string; verificationLink: string }): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BitTitan</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
        .container { border: 1px solid #30363d; border-radius: 8px; margin: 40px auto; padding: 20px; width: 100%; max-width: 465px; }
        .logo { text-align: center; margin-top: 32px; }
        .heading { color: #ffffff; font-size: 24px; font-weight: 400; text-align: center; padding: 0; margin: 30px 0; }
        .text { color: #8b949e; font-size: 14px; line-height: 24px; }
        .button-section { text-align: center; margin: 32px 0; }
        .button { background-color: #2f81f7; border-radius: 6px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center; padding: 12px 20px; }
        .link { color: #2f81f7; text-decoration: none; }
        .hr { border: 0; border-top: 1px solid #30363d; margin: 26px 0; width: 100%; }
        .footer-text { color: #8b949e; font-size: 12px; line-height: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2f81f7" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 class="heading">Welcome to <strong>BitTitan</strong>, ${name}!</h1>
        <p class="text">
          We're excited to have you on board. To complete your registration and secure your account, please verify your email address by clicking the button below.
        </p>
        <div class="button-section">
          <a href="${verificationLink}" class="button">Verify Your Email</a>
        </div>
        <p class="text">
          Or copy and paste this URL into your browser: 
          <a href="${verificationLink}" class="link">${verificationLink}</a>
        </p>
        <hr class="hr" />
        <p class="footer-text">
          This email was intended for ${name}. If you did not create an account on BitTitan, please disregard this email.
        </p>
      </div>
    </body>
    </html>
  `;
};

export default async function handle(req: Request) {
    if (req.method === 'POST') {
        try {
            const body = await req.json();
            const { email, name, verificationLink } = body;

            if (!email || !name || !verificationLink) {
                return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
            }
            
            const emailHtml = createWelcomeEmailHtml({ name, verificationLink });

            const { data, error } = await resend.emails.send({
                from: 'BitTitan <onboarding@resend.dev>',
                to: [email],
                subject: 'Welcome to BitTitan! Please Verify Your Email',
                html: emailHtml,
            });

            if (error) {
                console.error("Resend error:", error);
                return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }

            return new Response(JSON.stringify(data), { status: 200 });
        } catch (error: any) {
            console.error("Server error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }
}