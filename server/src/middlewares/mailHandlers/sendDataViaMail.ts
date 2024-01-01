import nodemailer from "nodemailer";
import { contextRules } from "./settings.js";
import { getCurrentTime } from "../utils/getCurrentTime.js";

type TMailInfo = {
    to: string[];
    text: string;
    data: Buffer;
};

export async function exportDataViaMail(
    mailInfo: TMailInfo,
    context: contextRules
) {
    const { to, text, data } = mailInfo;

    const transporter = nodemailer.createTransport({
        secure: true,
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const time = getCurrentTime("ddMMyy");
    const filename = `InfoStorage_${context}_${time}.xlsx`;

    const mailOptions = {
        from: `InfoStorage <${process.env.EMAIL_USER}>`,
        to,
        subject: "InfoStorage - Exported data",
        text,
        attachments: [{ filename, content: data }],
    };

    await transporter.sendMail(mailOptions);
    return true;
}
