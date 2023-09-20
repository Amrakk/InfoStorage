import { z } from "zod";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import IUser from "../../../interfaces/collections/user.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";

const inputSchema = z.object({
    oldPass: z.string().regex(userRegex.password),
    newPass: z.string().regex(userRegex.password),
});

export const resetPassword = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ ctx, input }) => {
        const { _id, password } = ctx.user;
        const { oldPass, newPass } = input;

        try {
            if (!(await bcrypt.compare(oldPass, password)))
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid credential",
                });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPass, salt);

            const result = await updatePassword(_id, hashedPassword);
            if (typeof result === "string") throw new Error(result);

            return { message: "Reset password successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updatePassword(id: ObjectId, newPass: string) {
    const db = database.getDB();
    const users = db.collection<IUser>("users");
    const result = await users.updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: newPass } }
    );

    return result.acknowledged ? true : "Failed while updating password";
}
