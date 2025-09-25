import nodemailer from 'nodemailer';

export default function registerHook({ action }) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
        secure: false,
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASSWORD,
        },
    });

    action('items.test_collection_2.create', async ({ payload }) => {
        console.log('Payload reçu dans hook:', payload);
        if (!payload.email) {
            console.warn('Pas d’email dans payload:', payload);
        } else {
            console.log('Email trouvé dans payload:', payload.email);
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: payload.email,
            subject: 'Bienvenue sur test_collection_2 !',
            text: `Bonjour ! Un nouvel enregistrement a été créé avec l'ID : ${payload.id}`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✉️ Email envoyé à ${payload.email}`);
        } catch (error) {
            console.error('Erreur lors de l’envoi de l’e-mail SMTP :', error);
        }
    });

}