import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../../trpc.js";
import { deleteRefToken } from "../../../middlewares/tokenHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";

export const signout = verifiedProcedure.mutation(async ({ ctx }) => {
    try {
        // ctx.res.clearCookie("accToken");
        // ctx.res.clearCookie("refToken");
        await deleteRefToken(ctx.user._id);

        return { message: "Signout successfully" };
    } catch (err) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(err),
        });
    }
});
