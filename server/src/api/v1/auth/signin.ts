import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../../../trpc.js";
import { userRegex } from "../../../configs/regex.js";
import { getUserByEmail } from "../../../middlewares/collectionHandlers/userHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";
import {
    setAccToken,
    setRefToken,
} from "../../../middlewares/tokenHandlers.js";

const inputSchema = z.object({
    email: z.string().email(),
    password: z.string().regex(userRegex.password),
});

export const signin = publicProcedure
    .input(inputSchema)
    .mutation(async ({ ctx, input }) => {
        const { email, password } = input;

        try {
            const user = await getUserByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.password)))
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid credentials",
                });

            setAccToken(user._id, ctx.res);
            await setRefToken(user._id, ctx.res);

            return {
                message: "Signin successfully",
                user: { name: user.name, role: user.role },
            };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
