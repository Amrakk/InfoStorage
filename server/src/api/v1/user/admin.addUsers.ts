import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import IUser from "../../../interfaces/collections/user.js";
import { getUserByEmail } from "../../../middlewares/collectionHandlers/userHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(userRegex.name),
        email: z.string().email(),
        password: z.string().regex(userRegex.password),
        phone: z.string().regex(userRegex.phone),
        role: z.enum(["admin", "manager", "employee"]),
    })
);

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const addUsers = adminProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...users } = input;

        const failedEntries: (IUser & { error: string })[] = [];
        if (users.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No user to add",
            });
        else if (users.length === 1) {
            const result = await insertUser(users[0]);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const user of users) {
                const result = await insertUser(user);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...user, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...user, error: result });
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };
        return { message: "Add users successfully!" };
    });

async function insertUser(user: IUser) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        const isEmailExist = await getUserByEmail(user.email);
        if (isEmailExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isEmailExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Email already exists",
            });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;

        const result = await users.insertOne(user);
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
