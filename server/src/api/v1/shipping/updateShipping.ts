import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getProvinceInfo } from "../../../middlewares/addressHandler.js";
import { getShippingByName } from "../../../middlewares/collectionHandlers/shippingHandlers.js";

const inputSchema = z.object({
    _id: z.string(),
    name: z.string().regex(shippingRegex.name),
    address: z.string().regex(shippingRegex.address),
    provinceCode: z.number().int().positive(),
    districtCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
    phone: z.string().regex(shippingRegex.phone).nullable(),
    note: z.string().regex(shippingRegex.note).nullable(),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const updateShipping = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provinceCode, districtCode, wardCode, ...shipping } = input;

        const isNameExist = await getShippingByName(shipping.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist?._id !== new ObjectId(shipping._id))
            throw new TRPCError({
                code: "CONFLICT",
                message: "Shipping already exists",
            });

        const province = await getProvinceInfo(provinceCode, "province");
        const district = await getProvinceInfo(districtCode, "district");
        const ward = await getProvinceInfo(wardCode, "ward");
        if (
            province === "INTERNAL_SERVER_ERROR" ||
            district === "INTERNAL_SERVER_ERROR" ||
            ward === "INTERNAL_SERVER_ERROR"
        )
            throw internalErr;

        shipping.address = `${shipping.address}, ${ward}, ${district}, ${province}`;

        const result = await updateShippingInfo(shipping._id, shipping);
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
