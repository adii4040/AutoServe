import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'


const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'App assistant',
            link: 'https://mailgen.js/'
        }
    });

    const emailHtml = mailGenerator.generate(options.mailgenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: emailText, // plain‑text body
        html: emailHtml, // HTML body
    }

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error(
            "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file",
        );
        console.error("Error: ", error);
    }
}


const emailVerificationMailGen = (fullname, verificationUrl) => {
    return {
        body: {
            name: fullname,
            intro: 'Welcome to AutoServe! We\'re very excited to have you on app.',
            action: {
                instructions: 'To get your email verified , please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify Your Email',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
};

const forgotPasswordReqMailGen = (fullname, forgotPasswordUrl) => {
    return {
        body: {
            name: fullname,
            intro: 'You are receiving this email because we received a password reset request for your account.',
            action: {
                instructions: 'To reset the password, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Reset Password',
                    link: forgotPasswordUrl
                }
            },
            outro: 'If you did not request a password reset, no further action is required.'
        }
    }
};


const VendorApprovalRejectionMailGen = (fullname, status) => {
    const message =
        status === "APPROVED"
            ? "We are pleased to inform you that your onboarding on AutoServe has been approved. You can now access your dashboard and start using our platform."
            : "We are sorry to inform you that your onboarding on AutoServe has been rejected. For further details, please contact our support team.";

    return {
        body: {
            name: fullname,
            intro: "Your vendor onboarding process has been reviewed.",
            table: {
                data: [
                    {
                        Status: status,
                        Message: message,
                    },
                ],
            },
            outro: "Thank you for your time and interest — AutoServe Team.",
        },
    };
};


export {
    sendMail,
    emailVerificationMailGen,
    forgotPasswordReqMailGen,
    VendorApprovalRejectionMailGen
}