const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'resume.scan.ai@gmail.com',
                pass: 'tjzo lyec nqhd eazm'
            }
        });
    }

    async sendActivationMail(to, link) {
        try {
            const mailOptions = {
                from: 'resume.scan.ai@gmail.com',
                to: to,
                subject: 'Activate your account',
                html: `
                    <div>
                        <h1>Click the link below to activate your account:</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ', info.response);
            return info.response;
        } catch (error) {
            console.error('Failed to send email:', error.message);
            throw new Error('Failed to send activation email');
        }
    }
}

module.exports = new MailService();
