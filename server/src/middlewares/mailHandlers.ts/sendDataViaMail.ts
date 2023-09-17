import nodemailer from "nodemailer";

export async function sendDataViaMail(
    to: string,
    subject: string,
    text: string,
    data: Buffer
) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
        attachments: [
            {
                filename: "data.xlsx",
                content: data,
            },
        ],
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (err) {
        return false;
    }
}
