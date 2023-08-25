import { z } from "zod";
import bycrpt from "bcrypt";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure, publicProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";
import { valEmail, valPassword } from "../../../middlewares/validateInput.js";

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
