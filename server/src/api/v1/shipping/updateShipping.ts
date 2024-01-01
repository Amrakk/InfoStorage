import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
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

export const updateShipping = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provCode, distCode, wardCode, id, ...shipping } = input;

        try {
            const isNameExist = await getShippingByName(shipping.name);
            if (isNameExist && isNameExist._id.toString() !== id)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Shipping already exists",
                });

            const ward = await getUnitName(wardCode, "ward");
            const district = await getUnitName(distCode, "district");
            const province = await getUnitName(provCode, "province");
            shipping.address = `${shipping.address}, ${ward}, ${district}, ${province}`;

            const result = await updateShippingInfo(id, shipping);
            if (typeof result === "string") throw new Error(result);

            return { message: "Update shipping successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updateShippingInfo(id: string, shipping: IShipping) {
    const db = database.getDB();
    const shippings = db.collection<IShipping>("shippings");

    const result = await shippings.updateOne(
        { _id: new ObjectId(id) },
        { $set: shipping }
    );

    return result.acknowledged ? true : "Failed while updating shipping";
}
