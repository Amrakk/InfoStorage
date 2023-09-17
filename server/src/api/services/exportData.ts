import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../trpc.js";
import { CollectionNames, rolePermissions } from "../../configs/default.js";

const inputSchema = z.object({
    type: z.nativeEnum(CollectionNames),
    data: z.array(z.string()).optional(),
});

export const exportData = verifiedProcedure
    .input(inputSchema)
    .query(({ ctx, input }) => {
        const { user } = ctx;
        const { type, data } = input;

        if (!rolePermissions[user.role].includes(type))
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You don't have permission to access this resource",
            });

        if (data) console.log(1); // export all
        // export selected
        else return { message: "File exported via email successfully" };
    });
