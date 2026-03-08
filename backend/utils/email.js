import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends an email using EmailJS Node.js SDK.
 * Bypasses Render's SMTP block by using HTTPS.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    // 1. Detection of dummy emails
    const dummyDomains = ['example.com', 'test.com', 'dummy.com'];
    const emailDomain = to.split('@')[1];

    if (dummyDomains.includes(emailDomain) || to.includes('test') || to.includes('dummy')) {
        console.log(`🚫 Skipping email to dummy address: ${to}`);
        return;
    }

    // 2. EmailJS Template Parameters
    // Note: In your EmailJS dashboard (Settings tab), ensure "To Email" is set to {{to_email}}
    const templateParams = {
        to_email: to,     // Primary
        email: to,        // Alias
        to: to,           // Alias
        subject: subject,
        message: text || html,
    };

    console.log(`📤 Sending EmailJS request for ${to} with params:`, JSON.stringify(templateParams));

    // 3. Send via EmailJS
    try {
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );
        console.log(`📧 Email sent to ${to} via EmailJS:`, response.status, response.text);
        return response;
    } catch (error) {
        console.error(`❌ Error sending email to ${to} via EmailJS:`, error);
    }
};
