import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../trpc.js";
import { subjectRegex } from "../../configs/regex.js";
import { rolePermissions } from "../../configs/default.js";
import { CollectionNames } from "../../configs/default.js";
import { toLowerNonAccentVietnamese } from "../../middlewares/utils/textHandler.js";
import { getDataFromDB } from "../../middlewares/collectionHandlers/dataHandlers.js";

const inputSchema = z.object({
    type: z.nativeEnum(CollectionNames),
    text: z.string().regex(subjectRegex),
});

export const searchByName = verifiedProcedure
    .input(inputSchema)
    .query(async ({ ctx, input }) => {
        const { user } = ctx;
        const { text, type } = input;

        if (!rolePermissions[user.role].includes(type))
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You don't have permission to access this resource",
            });

        const data = await getDataByName(text, type);
        if (data === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return data;
    });

async function getDataByName(text: string, type: CollectionNames) {
    try {
        const data = await getDataFromDB(type);
        const plainText = toLowerNonAccentVietnamese(text);

        const result = data.filter((item) => {
            const regex = new RegExp(`^.*${plainText}.*$`, "gmiu");
            return regex.test(toLowerNonAccentVietnamese(item.name));
        });

        return result;
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
