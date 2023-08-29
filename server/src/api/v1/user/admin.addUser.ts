import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import IUser from "../../../interfaces/collections/user.js";
import { getUserByEmail } from "../../../middlewares/userHandlers.js";

const addUserSchema = z.object({
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
    .input(addUserSchema)
    .mutation(async ({ input }) => {
        const { name, email, phone, password, role } = input;

        const isEmailExist = await getUserByEmail(email);
        if (isEmailExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Email already exists",
            });
        if (isEmailExist === "INTERNAL_SERVER_ERROR") throw internalErr;

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword,
            phone,
            role,
        };

        const result = await insertUser(user);
        if (!result || result === "INTERNAL_SERVER_ERROR") throw internalErr;

        return {
            message: "Add user successfully",
        };
    });

async function insertUser(user: IUser) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.insertOne(user);
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
