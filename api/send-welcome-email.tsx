import React from 'react';
import { Resend } from 'resend';
import { Html, Head, Preview, Body, Container, Section, Img, Heading, Text, Button, Hr, Tailwind } from '@react-email/components';

const resend = new Resend(process.env.RESEND_API_KEY);

const WelcomeEmail = ({ name, verificationLink }: { name: string; verificationLink: string }) => {
  const previewText = `Welcome to BitTitan, ${name}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-900 text-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-700 rounded my-[40px] mx-auto p-[20px] w-[465px]">
             <Section className="mt-[32px] text-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2f81f7"
                    strokeWidth="1.5"
                    className="mx-auto"
                >
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
             </Section>
            <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to <strong>BitTitan</strong>, {name}!
            </Heading>
            <Text className="text-slate-400 text-[14px] leading-[24px]">
              We're excited to have you on board. To complete your registration and secure your account, please verify your email address by clicking the button below.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={verificationLink}
              >
                Verify Your Email
              </Button>
            </Section>
            <Text className="text-slate-400 text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:{" "}
              <a href={verificationLink} className="text-blue-500 no-underline">
                {verificationLink}
              </a>
            </Text>
            <Hr className="border border-solid border-slate-700 my-[26px] mx-0 w-full" />
            <Text className="text-slate-500 text-[12px] leading-[24px]">
              This email was intended for {name}. If you did not create an account on BitTitan, please disregard this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default async function handle(req: Request) {
    if (req.method === 'POST') {
        try {
            const body = await req.json();
            const { email, name, verificationLink } = body;

            if (!email || !name || !verificationLink) {
                return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
            }

            const { data, error } = await resend.emails.send({
                from: 'BitTitan <onboarding@resend.dev>',
                to: [email],
                subject: 'Welcome to BitTitan! Please Verify Your Email',
                react: <WelcomeEmail name={name} verificationLink={verificationLink} />,
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