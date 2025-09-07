// import nodemailer from 'nodemailer';
import axios from 'axios';
// import { AsyncHandler } from './async-handler.js';
import transporter from './transporter.js';
// funtion tosend error to discord webhook
export const sendErrorToDiscord = async (errorInfo) => {
    if (!process.env.DISCORD_WEBHOOK_URL)
        return;
    const bodyPreview = errorInfo.body
        ? '```json\n' + JSON.stringify(errorInfo.body, null, 2) + '\n```'
        : 'No body data';
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        embeds: [
            {
                title: '🚨 Error Alert',
                description: `**Message**: \`${errorInfo.message}\`\n\n**Request Body**:\n${bodyPreview}`,
                color: 16711680,
                fields: [
                    { name: 'User', value: errorInfo.user || 'Guest', inline: true },
                    { name: 'Route', value: errorInfo.route || 'N/A', inline: true },
                    { name: 'Method', value: errorInfo.method || 'N/A', inline: true },
                ],
                footer: { text: errorInfo.stack?.split('\n')[1] || 'No stack trace' },
                timestamp: new Date().toISOString(),
            },
        ],
    });
};
// function to send error to email
export const sendErrorToEmail = async (errorInfo) => {
    if (!process.env.SMTP_AUTH_USER || !process.env.SMTP_AUTH_PASS)
        return;
    const mailOptions = {
        from: process.env.EMAIL_HOST,
        to: process.env.EMAIL_CLIENT,
        subject: `🚨 Error: ${errorInfo.message}`,
        text: `Error: ${errorInfo.message}\nUser: ${errorInfo.user}\nRoute: ${errorInfo.route}\nStack: ${errorInfo.stack}`,
    };
    await transporter.sendMail(mailOptions);
};
