import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../../trpc.js";
import { deleteRefToken } from "../../../middlewares/tokenHandlers.js";

/**
 * @name signout
 * Use by verified user to signout
 */
export const signout = verifiedProcedure.mutation(async ({ ctx }) => {
    if (!(await deleteRefToken(ctx.user._id)))
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
        });

    ctx.res.clearCookie("accToken");
    ctx.res.clearCookie("refToken");

    return { message: "Signout successfully" };
});
