import { z } from "zod";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getShippingByName } from "../../../middlewares/shippingHandlers.js";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";

const inputSchema = z.object({
    _id: z.string(),
    name: z.string().regex(shippingRegex.name),
    address: z.string().regex(shippingRegex.address),
    phone: z.string().regex(shippingRegex.phone),
    note: z.string().regex(shippingRegex.note),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const updateShipping = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...shipping } = input;

        const data = await getShippingByName(shipping.name);
        if (data === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (data && data._id != new ObjectId(shipping._id))
            throw new TRPCError({
                code: "CONFLICT",
                message: "Shipping already exists",
            });

        const result = await updateShippingInfo(shipping._id, shipping);
        if (!result) throw internalErr;

        return { message: "Update shipping successfully!" };
    });

async function updateShippingInfo(_id: string, data: IShipping) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        const result = await shippings.updateOne(
            { _id: new ObjectId(_id) },
            { $set: data }
        );

        return result.acknowledged;
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
