import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import IUser from "../../../interfaces/collections/user.js";
import { getUserByEmail } from "../../../middlewares/collectionHandlers/userHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(userRegex.name),
    email: z.string().regex(userRegex.email),
    password: z.string().regex(userRegex.password),
    phone: z.string().regex(userRegex.phone),
    role: z.string().regex(userRegex.role),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const addUser = adminProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...user } = input;

        const isEmailExist = await getUserByEmail(user.email);
        if (isEmailExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isEmailExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Email already exists",
            });

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(user.password, salt);
        user.password = hashedPassword;

        const result = await insertUser(user);
        if (!result) throw internalErr;

        return { message: "Add user successfully" };
    });

async function insertUser(user: IUser) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        const result = await users.insertOne(user);
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
