import type { Response } from "express";
import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../../trpc.js";
import { deleteRefToken } from "../../../middlewares/tokenHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { removeUser } from "../../../middlewares/userStatusHandlers.js";

export const signout = verifiedProcedure.mutation(async ({ ctx }) => {
    try {
        (ctx.res as Response).clearCookie("accToken");
        (ctx.res as Response).clearCookie("refToken");
        (ctx.res as Response).clearCookie("userId");

        await Promise.all([
            removeUser(ctx.user._id.toString()),
            deleteRefToken(ctx.user._id),
        ]);

        return { message: "Signout successfully" };
    } catch (err) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(err),
        });
    }
});
