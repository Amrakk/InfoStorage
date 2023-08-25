import { z } from "zod";
import bycrpt from "bcrypt";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { publicProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";
import { valEmail, valPassword } from "../../../middlewares/validateInput.js";
import {
    setAccToken,
    setRefToken,
} from "../../../middlewares/tokenHandlers.js";

const signinSchema = z.object({
    email: z.string(),
    password: z.string(),
});

const generalErr = new TRPCError({
    code: "BAD_REQUEST",
    message: "Invalid email or password",
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const signin = publicProcedure
    .input(signinSchema)
    .mutation(async ({ ctx, input }) => {
        const { email, password } = input;
        if (!email || !password) throw generalErr;
        if (!valEmail(email) || !valPassword(password)) throw generalErr;

        const user = await getUserByEmail(email);
        if (!user) throw generalErr;
        if (user === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (!bycrpt.compareSync(password, user.password)) throw generalErr;

        if (
            !setAccToken(user._id, ctx.res) &&
            !(await setRefToken(user._id, ctx.res))
        )
            throw internalErr;

        return {
            message: "Signin successfully",
            data: {
                name: user.name,
                role: user.role,
            },
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
