import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { getShippingByName } from "../../../middlewares/collectionHandlers/shippingHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(shippingRegex.name),
    address: z.string().regex(shippingRegex.address),
    provCode: z.number().int().positive(),
    distCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
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
        const { provCode, distCode, wardCode, id, ...shipping } = input;

        const isNameExist = await getShippingByName(shipping.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist && isNameExist._id.toString() !== id)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Shipping already exists",
            });

        const province = await getUnitName(provCode, "province");
        const district = await getUnitName(distCode, "district");
        const ward = await getUnitName(wardCode, "ward");
        if (
            province === "INTERNAL_SERVER_ERROR" ||
            district === "INTERNAL_SERVER_ERROR" ||
            ward === "INTERNAL_SERVER_ERROR"
        )
            throw internalErr;

        shipping.address = `${shipping.address}, ${ward}, ${district}, ${province}`;

        const result = await updateShippingInfo(id, shipping);
        if (!result) throw internalErr;

        return { message: "Update successfully!" };
    });

async function updateShippingInfo(id: string, shipping: IShipping) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        const result = await shippings.updateOne(
            { _id: new ObjectId(id) },
            { $set: shipping }
        );

        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
