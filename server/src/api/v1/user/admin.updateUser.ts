import { z } from "zod";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import { UserRoles } from "../../../configs/default.js";
import IUser from "../../../interfaces/collections/user.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { getUserByEmail } from "../../../middlewares/collectionHandlers/userHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(userRegex.name),
    email: z.string().email(),
    password: z.string().regex(userRegex.password),
    phone: z.string().regex(userRegex.phone),
    role: z.nativeEnum(UserRoles),
});

export const updateUser = adminProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { id, ...user } = input;

        try {
            const isEmailExist = await getUserByEmail(user.email);
            if (isEmailExist && isEmailExist._id.toString() !== id)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Email already exists",
                });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;

            const result = await updateUserInfo(id, user);
            if (typeof result === "string") throw new Error(result);

            return { message: "Update user sucessfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updateUserInfo(id: string, user: IUser) {
    const db = database.getDB();
    const users = db.collection<IUser>("users");

    const result = await users.updateOne(
        { _id: new ObjectId(id) },
        { $set: user }
    );
    return result.acknowledged ? true : "Failed while updating user";
}
