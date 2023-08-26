import { z } from "zod";
import bycrpt from "bcrypt";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";
import {
    valEmail,
    valName,
    valPassword,
    valPhone,
    valRole,
} from "../../../middlewares/validateInput.js";

const signupSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    password: z.string(),
    role: z.string(),
});

const generalErr = new TRPCError({
    code: "BAD_REQUEST",
    message: "Invalid user information",
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const signup = adminProcedure
    .input(signupSchema)
    .mutation(async ({ ctx, input }) => {
        const { name, email, phone, password, role } = input;

        if (!name || !email || !phone || !password || !role) throw generalErr;
        if (
            !valName(name) ||
            !valRole(role) ||
            !valEmail(email) ||
            !valPhone(phone) ||
            !valPassword(password)
        )
            throw generalErr;

        const isEmailExist = await getUserByEmail(email);
        if (isEmailExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Email already exists",
            });
        if (isEmailExist === "INTERNAL_SERVER_ERROR") throw internalErr;

        const salt = bycrpt.genSaltSync(10);
        const hashedPassword = bycrpt.hashSync(password, salt);

        const user = {
            name,
            email,
            phone,
            password: hashedPassword,
            role,
        };

        const result = await insertUser(user);
        if (!result || result === "INTERNAL_SERVER_ERROR") throw internalErr;

        return {
            message: "Signup successfully",
        };
    });

async function getUserByEmail(email: string) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.findOne({ email });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

async function insertUser(user: IUser) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.insertOne(user);
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
