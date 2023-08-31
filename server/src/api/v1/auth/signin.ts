import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import { getUserByEmail } from "../../../middlewares/userHandlers.js";
import {
  setAccToken,
  setRefToken,
} from "../../../middlewares/tokenHandlers.js";

const signinSchema = z.object({
    email: z.string().regex(userRegex.email),
    password: z.string().regex(userRegex.password),
});

const generalErr = new TRPCError({
    code: "BAD_REQUEST",
    message: "Invalid credentials",

});

const internalErr = new TRPCError({
  code: "INTERNAL_SERVER_ERROR",
  message: "Internal server error",
});

export const signin = publicProcedure
    .input(signinSchema)
    .mutation(async ({ ctx, input }) => {
        const { email, password } = input;

        const user = await getUserByEmail(email);
        if (!user) throw generalErr;
        if (user === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (!bcrypt.compareSync(password, user.password)) throw generalErr;

        const isSet =
            setAccToken(user._id, ctx.res) &&
            (await setRefToken(user._id, ctx.res));
        if (!isSet) throw internalErr;

        return {
            message: "Signin successfully",
            user: {
                name: user.name,
                role: user.role,
            },
        };
    });
