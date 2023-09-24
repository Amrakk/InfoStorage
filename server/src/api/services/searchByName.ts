import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../trpc.js";
import { subjectRegex } from "../../configs/regex.js";
import { rolePermissions, CollectionNames } from "../../configs/default.js";
import { toLowerNonAccentVietnamese } from "../../middlewares/utils/textHandler.js";
import { getDataFromDB } from "../../middlewares/collectionHandlers/dataHandlers.js";
import { getErrorMessage } from "../../middlewares/errorHandlers/getErrorMessage.js";

const inputSchema = z.object({
    type: z.nativeEnum(CollectionNames),
    text: z.string().regex(subjectRegex),
});

export const searchByName = verifiedProcedure
    .input(inputSchema)
    .query(async ({ ctx, input }) => {
        const { user } = ctx;
        const { text, type } = input;

        try {
            if (!rolePermissions[user.role].includes(type))
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You don't have permission to access this resource",
                });

            const data = await getDataByName(text, type);
            return data;
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function getDataByName(text: string, type: CollectionNames) {
    const data = await getDataFromDB(type);
    const plainText = toLowerNonAccentVietnamese(text);

    const result = data.filter((item) => {
        const regex = new RegExp(`^.*${plainText}.*$`, "gmiu");
        return regex.test(toLowerNonAccentVietnamese(item.name));
    });

    return result;
}
