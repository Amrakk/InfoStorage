import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { managerProcedure } from "../../../trpc.js";
import { taxRegex } from "../../../configs/regex.js";
import ITax from "../../../interfaces/collections/tax.js";
import {
    getTaxByName,
    getTaxByEmail,
    getTaxByTaxCode,
} from "../../../middlewares/collectionHandlers/taxHandlers.js";

const inputSchema = z.object({
    _id: z.string(),
    name: z.string().regex(taxRegex.name),
    taxCode: z.string().regex(taxRegex.taxCode),
    address: z.string().regex(taxRegex.address),
    representative: z.string().regex(taxRegex.representative),
    phone: z.string().regex(taxRegex.phone),
    email: z.string().regex(taxRegex.email).nullable(),
    participants: z.array(z.string()),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const updateTax = managerProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...tax } = input;

        const isNameExist = await getTaxByName(tax.name);
        const isEmailExist = await getTaxByEmail(tax.email);
        const isTaxCodeExist = await getTaxByTaxCode(tax.taxCode);

        if (
            isNameExist === "INTERNAL_SERVER_ERROR" ||
            isEmailExist === "INTERNAL_SERVER_ERROR" ||
            isTaxCodeExist === "INTERNAL_SERVER_ERROR"
        )
            throw internalErr;
        if (
            isNameExist?._id !== new ObjectId(tax._id) ||
            isEmailExist?._id !== new ObjectId(tax._id) ||
            isTaxCodeExist?._id !== new ObjectId(tax._id)
        )
            throw new TRPCError({
                code: "CONFLICT",
                message: "Tax already exists",
            });

        const result = await updateTaxInfo(tax._id, tax);
        if (!result) throw internalErr;

        return { message: "Update successfully" };
    });

async function updateTaxInfo(id: string, tax: ITax) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        const result = await taxes.updateOne(
            { _id: new ObjectId(id) },
            { $set: tax }
        );

        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
