import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { taxRegex } from "../../../configs/regex.js";
import Itax from "../../../interfaces/collections/tax.js";
import {
    getTaxByName,
    getTaxByEmail,
    getTaxByTaxCode,
} from "../../../middlewares/collectionHandlers/taxHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(taxRegex.name),
    taxCode: z.string().regex(taxRegex.taxCode),
    address: z.string().regex(taxRegex.address),
    representative: z.string().regex(taxRegex.representative),
    phone: z.string().regex(taxRegex.phone),
    email: z.string().email().nullable(),
    participants: z.array(z.string()),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addTax = employeeProcedure
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
        if (isNameExist || isEmailExist || isTaxCodeExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Tax already exist",
            });

        const result = await insertTax(tax);
        if (!result) throw internalErr;

        return { message: "Add successfully" };
    });

async function insertTax(tax: Itax) {
    try {
        const db = database.getDB();
        const taxes = db.collection<Itax>("taxes");

        const result = await taxes.insertOne(tax);
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
