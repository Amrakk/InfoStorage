import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import { CollectionNames } from "../../../configs/default.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { getShippingByName } from "../../../middlewares/collectionHandlers/shippingHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(shippingRegex.name),
        address: z.string().regex(shippingRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
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
    .mutation(async ({ input, ctx }) => {
        const shippings = input;

        const failedEntries: (IShipping & { error: string })[] = [];
        if (shippings.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No shipping to add",
            });
        else if (shippings.length === 1) {
            const { provCode, distCode, wardCode, ...data } = shippings[0];
            if (!provCode || !distCode || !wardCode)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Missing address info",
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

            data.address = `${data.address}, ${ward}, ${district}, ${province}`;

            const result = await insertShipping(data);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            const successEntries: string[] = [];
            for (const shipping of shippings) {
                const { provCode, distCode, wardCode, ...data } = shipping;
                const result = await insertShipping(data);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...data, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...data, error: result });
                if (result instanceof ObjectId)
                    successEntries.push(result.toString());
            }

            const userID = ctx.user._id.toString();
            const result = await saveImportLog(
                userID,
                successEntries,
                CollectionNames.Shippings
            );

            if (result === "INTERNAL_SERVER_ERROR") {
                // TODO: log error
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
        return result.acknowledged
            ? result.insertedId
            : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
