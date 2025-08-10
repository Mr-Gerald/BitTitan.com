import nodemailer from 'nodemailer';
import { LOGO_ICON } from '../constants';

export const config = {
  runtime: 'nodejs',
};

// IMPORTANT: The credentials for the email service are stored as environment variables
// on the hosting platform (e.g., Vercel). They are NOT hardcoded here.
const EMAIL_SERVER_USER = process.env.EMAIL_SERVER_USER;
const EMAIL_SERVER_PASSWORD = process.env.EMAIL_SERVER_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_SERVER_USER;

const getEmailHtml = (fullName: string): string => {
    // A more robust way to handle SVG for email clients
    const logoSvg = `<svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#2f81f7" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;

    return `
        <body style="margin: 0; padding: 0; background-color: #0d1117; font-family: Arial, sans-serif;">
            <div style="background-color: #0d1117; color: #c9d1d9; padding: 40px 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #30363d;">
                <div style="text-align: center; margin-bottom: 20px;">
                    ${logoSvg}
                </div>
                <h1 style="color: #ffffff; text-align: center; font-size: 24px;">Welcome to BitTitan, ${fullName}!</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #8b949e; text-align: center; max-width: 450px; margin: 10px auto;">
                    We are thrilled to have you join our community of investors and traders. Your account has been successfully created.
                </p>
                <div style="background-color: #161b22; padding: 20px; border-radius: 5px; margin-top: 30px;">
                  <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">What's next?</h2>
                  <p style="font-size: 16px; line-height: 1.6;">
                      You can log in to your account immediately and start exploring. Here are a few things you can do to get started:
                  </p>
                  <ul style="list-style: none; padding: 0; margin: 20px 0 0 0;">
                      <li style="margin-bottom: 10px;"><strong>› Explore Investment Plans:</strong> Discover our AI-powered crypto and alternative investment options.</li>
                      <li style="margin-bottom: 10px;"><strong>› Fund Your Wallet:</strong> Securely add funds to your account to start investing.</li>
                      <li style="margin-bottom: 10px;"><strong>› Visit the Trading Terminal:</strong> Monitor the market with our live trading tools.</li>
                  </ul>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="#" style="background-color: #2f81f7; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to My Dashboard</a>
                </div>
                <p style="font-size: 12px; text-align: center; color: #8b949e; margin-top: 30px;">
                    If you have any questions, don't hesitate to use our 24/7 Live Support or ask our AI Assistant.
                    <br><br>
                    &copy; ${new Date().getFullYear()} BitTitan. All rights reserved.
                </p>
            </div>
        </body>
    `;
};


export default async function handle(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    if (!EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD) {
        console.error("Email server credentials are not configured in environment variables.");
        return new Response(JSON.stringify({ message: "Server is not configured to send emails." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { email, fullName } = await req.json();

        if (!email || !fullName) {
            return new Response('Missing email or fullName in request body', { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: EMAIL_SERVER_USER,
                pass: EMAIL_SERVER_PASSWORD,
            },
        });
        
        await transporter.sendMail({
            from: `"BitTitan" <${EMAIL_FROM}>`,
            to: email,
            subject: 'Welcome to BitTitan!',
            html: getEmailHtml(fullName),
        });

        return new Response(JSON.stringify({ message: 'Welcome email sent successfully.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error("Error sending welcome email:", error);
        return new Response(JSON.stringify({ error: 'Failed to send welcome email.', details: error.message }), { status: 500 });
    }
}