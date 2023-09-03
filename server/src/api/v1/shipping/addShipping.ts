import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getShippingByName } from "../../../middlewares/collectionHandlers/shippingHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(shippingRegex.name),
    address: z.string().regex(shippingRegex.address),
    phone: z.string().regex(shippingRegex.phone).nullable(),
    note: z.string().regex(shippingRegex.note).nullable(),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const addShipping = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...shipping } = input;

        const isNameExist = await getShippingByName(shipping.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Shipping already exist",
            });

        const result = await insertShipping(shipping);
        if (!result) throw internalErr;

        return { message: "Add successfully" };
    });

async function insertShipping(shipping: IShipping) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        const result = await shippings.insertOne(shipping);
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
