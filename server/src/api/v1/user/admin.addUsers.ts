import { z } from "zod";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import IUser from "../../../interfaces/collections/user.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import { CollectionNames, UserRoles } from "../../../configs/default.js";
import { contextRules } from "../../../middlewares/mailHandlers/settings.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { getUserByEmail } from "../../../middlewares/collectionHandlers/userHandlers.js";
import { exportDataViaMail } from "../../../middlewares/mailHandlers/sendDataViaMail.js";
import {
    generateExcelFile,
    generateExcelSheet,
} from "../../../middlewares/excelHandlers/excelGenerators.js";

type TFailedEntry = IUser & { error: string };

const inputSchema = z.array(
    z.object({
        name: z.string().regex(userRegex.name),
        email: z.string().email(),
        password: z.string().regex(userRegex.password),
        phone: z.string().regex(userRegex.phone),
        role: z.nativeEnum(UserRoles),
    })
);

export const addUsers = adminProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
        const users = input;
        const failedEntries: TFailedEntry[] = [];

        try {
            if (users.length === 0)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No user to add",
                });
            else if (users.length === 1) {
                const result = await insertUser(users[0]);
                if (result instanceof TRPCError) throw result;
                if (typeof result === "string") throw new Error(result);
            } else {
                const successEntries: string[] = [];
                for (const user of users) {
                    const result = await insertUser(user);
                    if (result instanceof ObjectId)
                        successEntries.push(result.toString());
                    if (typeof result === "string")
                        failedEntries.push({ ...user, error: result });
                    if (result instanceof TRPCError)
                        failedEntries.push({ ...user, error: result.message });
                }

                const userID = ctx.user._id.toString();
                const result = await saveImportLog(
                    userID,
                    successEntries,
                    CollectionNames.Users
                ).catch((err) => getErrorMessage(err));
                if (typeof result === "string") console.error(result);
            }

            if (failedEntries.length > 0) {
                const result = await sendFailedEntries(
                    failedEntries,
                    ctx.user.email
                ).catch((err) => getErrorMessage(err));
                if (typeof result === "string") console.error(result);
                return {
                    message: "Partial success: Review and fix failed entries.",
                    failedEntries,
                };
            }

            return { message: "Add users successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function insertUser(user: IUser) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        const isEmailExist = await getUserByEmail(user.email);
        if (isEmailExist)
            return new TRPCError({
                code: "CONFLICT",
                message: "Email already exists",
            });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;

        const result = await users.insertOne(user);
        return result.acknowledged
            ? result.insertedId
            : "Failed while inserting users";
    } catch (err) {
        return getErrorMessage(err);
    }
}

async function sendFailedEntries(failedEntries: TFailedEntry[], email: string) {
    const sheet = await generateExcelSheet(
        CollectionNames.Users,
        failedEntries
    );
    const workbook = generateExcelFile([sheet]);
    const text = `Dear user,\n\nYou have requested to add users to InfoStorage.\nHowever, some entries are failed to add.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const mailInfo = {
        to: [email],
        text,
        data: workbook,
    };
    await exportDataViaMail(mailInfo, contextRules.failedEntries);
}
