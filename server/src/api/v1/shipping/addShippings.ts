import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getProvinceInfo } from "../../../middlewares/addressHandlers.js";
import { getShippingByName } from "../../../middlewares/collectionHandlers/shippingHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(shippingRegex.name),
        address: z.string().regex(shippingRegex.address),
        provinceCode: z.number().int().positive().nullish(),
        districtCode: z.number().int().positive().nullish(),
        wardCode: z.number().int().positive().nullish(),
        phone: z.string().regex(shippingRegex.phone),
        note: z.string().regex(shippingRegex.note),
    })
);

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const addShippings = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...shippings } = input;

        const failedEntries: (IShipping & { error: string })[] = [];
        if (shippings.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No shipping to add",
            });
        else if (shippings.length === 1) {
            const { provinceCode, districtCode, wardCode } = shippings[0];
            if (!provinceCode || !districtCode || !wardCode)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Missing address info",
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

            shippings[0].address = `${shippings[0].address}, ${ward}, ${district}, ${province}`;

            const result = await insertShipping(shippings[0]);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const shipping of shippings) {
                const result = await insertShipping(shipping);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...shipping, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...shipping, error: result });
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };
        return { message: "Add shippings successfully!" };
    });

async function insertShipping(shipping: IShipping) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        const isNameExist = await getShippingByName(shipping.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Shipping already exist",
            });

        const result = await shippings.insertOne(shipping);
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
