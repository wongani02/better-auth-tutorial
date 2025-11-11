import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

interface SendEmailValues {
    to: string;
    subject: string;
    text: string;
}

export async function sendMail({to, subject, text}: SendEmailValues){
    await resend.emails.send({
        from: "admin@properties.mw",
        to,
        subject,
        text,
    })
}
