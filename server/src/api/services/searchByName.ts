import { z } from "zod";
import { Collection } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../database/db.js";
import { verifiedProcedure } from "../../trpc.js";
import { subjectRegex } from "../../configs/regex.js";
import { rolePermissions } from "../../configs/default.js";
import { CollectionNames } from "../../configs/default.js";
import * as Collections from "../../interfaces/collections/collections.js";

const inputSchema = z.object({
    text: z.string().regex(subjectRegex),
    type: z.nativeEnum(CollectionNames),
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

        const things = await getThingsByName(text, type);
        if (things === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return things;
    });

function getCollections(type: CollectionNames) {
    const db = database.getDB();

    if (type === "taxes") return db.collection<Collections.ITax>("taxes");
    else if (type === "users") return db.collection<Collections.IUser>("users");
    else if (type === "products")
        return db.collection<Collections.IProduct>("products");
    else if (type === "customers")
        return db.collection<Collections.ICustomer>("customers");
    else if (type === "shippings")
        return db.collection<Collections.IShipping>("shippings");
    else if (type === "suppliers")
        return db.collection<Collections.ISupplier>("suppliers");
    throw new Error("INVALID_TYPE");
}

async function getThingsByName(text: string, type: CollectionNames) {
    try {
        const collection = getCollections(type);

        await collection.createIndex({ name: "text" });
        const things = await collection
            .find({
                $text: {
                    $search: `(*UCP)${text}`,
                    $caseSensitive: false,
                    $diacriticSensitive: false,
                },
            })
            .sort({ score: { $meta: "textScore" } })
            .toArray();

        return things;
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
