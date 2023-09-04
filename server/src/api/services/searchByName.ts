import { z } from "zod";
import { Collection } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../database/db.js";
import { roles } from "../../configs/global.js";
import { verifiedProcedure } from "../../trpc.js";
import * as Collections from "../../interfaces/collections/collections.js";
import { subjectRegex } from "../../configs/regex.js";

const inputSchema = z.object({
    text: z.string().regex(subjectRegex),
    type: z.enum([
        "customers",
        "products",
        "shippings",
        "supplies",
        "taxes",
        "users",
    ]),
});

export const searchByName = verifiedProcedure
    .input(inputSchema)
    .query(async ({ ctx, input }) => {
        const { user } = ctx;
        const { text, type } = input;

        if (!roles[user.role].includes(type))
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

async function getThingsByName(text: string, type: string) {
    try {
        const db = database.getDB();
        let collection: Collection<any>;

        if (type === "taxes")
            collection = db.collection<Collections.ITax>("taxes");
        else if (type === "users")
            collection = db.collection<Collections.IUser>("users");
        else if (type === "products")
            collection = db.collection<Collections.IProduct>("products");
        else if (type === "customers")
            collection = db.collection<Collections.ICustomer>("customers");
        else if (type === "shippings")
            collection = db.collection<Collections.IShipping>("shippings");
        else if (type === "suppliers")
            collection = db.collection<Collections.ISupplier>("suppliers");
        else throw new Error("INVALID_TYPE");

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
