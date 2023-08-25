import nodemailer from "nodemailer";
import { CollectionNames } from "../../configs/default.js";
import { getCurrentTime } from "../utils/getCurrentTime.js";

type TMailInfo = {
    to: string[];
    types?: CollectionNames[];
    data: Buffer;
};

export async function sendDataViaMail(mailInfo: TMailInfo) {
    const { to, types, data } = mailInfo;

    const transporter = nodemailer.createTransport({
        secure: true,
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    let typesString = Object.values(CollectionNames).join(", ");
    if (types) typesString = types.join(", ");
    const text = `Dear user,\n\nYou have requested to export data from InfoStorage included ${typesString}.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const time = getCurrentTime("DD/MM/YYYY");
    const filename = "InfoStorage_" + time + ".xlsx";

    const mailOptions = {
        from: `InfoStorage <${process.env.EMAIL_USER}>`,
        to,
        subject: "InfoStorage - Exported data",
        text,
        attachments: [{ filename, content: data }],
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        return false;
    }
}
