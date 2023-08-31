import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../../trpc.js";
import { deleteRefToken } from "../../../middlewares/tokenHandlers.js";

export const signout = verifiedProcedure.mutation(({ ctx }) => {
    if (!deleteRefToken(ctx.user._id))
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
        });

    ctx.res.clearCookie("accToken");
    ctx.res.clearCookie("refToken");

    return { message: "Signout successfully" };
});
