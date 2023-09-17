import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../database/db.js";
import { verifiedProcedure } from "../../trpc.js";
import { subjectRegex } from "../../configs/regex.js";
import { rolePermissions } from "../../configs/default.js";
import { CollectionNames } from "../../configs/default.js";
import * as Collections from "../../interfaces/collections/collections.js";
import { toLowerNonAccentVietnamese } from "../../middlewares/utils/textHandler.js";

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
        const data = await getCollectionData(type);
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

async function getCollectionData(
    type: CollectionNames
): Promise<Collections.TCollections[]> {
    const db = database.getDB();

    if (type === "Taxes")
        return await db.collection<Collections.ITax>("taxes").find().toArray();
    if (type === "Users")
        return await db.collection<Collections.IUser>("users").find().toArray();
    if (type === "Products")
        return await db
            .collection<Collections.IProduct>("products")
            .find()
            .toArray();
    if (type === "Customers")
        return await db
            .collection<Collections.ICustomer>("customers")
            .find()
            .toArray();
    if (type === "Shippings")
        return await db
            .collection<Collections.IShipping>("shippings")
            .find()
            .toArray();
    if (type === "Suppliers")
        return await db
            .collection<Collections.ISupplier>("suppliers")
            .find()
            .toArray();
    throw new Error("INVALID_TYPE");
}
