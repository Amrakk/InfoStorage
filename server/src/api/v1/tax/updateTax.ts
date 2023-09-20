import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { taxRegex } from "../../../configs/regex.js";
import ITax from "../../../interfaces/collections/tax.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";
import {
    getTaxByName,
    getTaxByEmail,
    getTaxByTaxCode,
} from "../../../middlewares/collectionHandlers/taxHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(taxRegex.name),
    taxCode: z.string().regex(taxRegex.taxCode),
    address: z.string().regex(taxRegex.address),
    provCode: z.number().int().positive(),
    distCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
    representative: z.string().regex(taxRegex.representative),
    phone: z.string().regex(taxRegex.phone),
    email: z.string().email(),
    participants: z.array(z.string()),
});

export const updateTax = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provCode, distCode, wardCode, id, ...tax } = input;

        try {
            const isNameExist = await getTaxByName(tax.name);
            const isEmailExist = await getTaxByEmail(tax.email);
            const isTaxCodeExist = await getTaxByTaxCode(tax.taxCode);
            if (
                (isNameExist && isNameExist._id.toString() !== id) ||
                (isEmailExist && isEmailExist._id.toString() !== id) ||
                (isTaxCodeExist && isTaxCodeExist._id.toString() !== id)
            )
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Tax already exists",
                });

            const ward = await getUnitName(wardCode, "ward");
            const district = await getUnitName(distCode, "district");
            const province = await getUnitName(provCode, "province");
            tax.address = `${tax.address}, ${ward}, ${district}, ${province}`;

            const result = await updateTaxInfo(id, tax);
            if (typeof result === "string") throw new Error(result);

            return { message: "Update tax successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updateTaxInfo(id: string, tax: ITax) {
    const db = database.getDB();
    const taxes = db.collection<ITax>("taxes");

    const result = await taxes.updateOne(
        { _id: new ObjectId(id) },
        { $set: tax }
    );

    return result.acknowledged ? true : "Failed while updating tax";
}
