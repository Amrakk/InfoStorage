import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { taxRegex } from "../../../configs/regex.js";
import ITax from "../../../interfaces/collections/tax.js";
import {
    getTaxByName,
    getTaxByEmail,
    getTaxByTaxCode,
} from "../../../middlewares/collectionHandlers/taxHandlers.js";
import { getUnitName } from "../../../middlewares/addressHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(taxRegex.name),
        taxCode: z.string().regex(taxRegex.taxCode),
        address: z.string().regex(taxRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
        representative: z.string().regex(taxRegex.representative),
        phone: z.string().regex(taxRegex.phone),
        email: z.string().email(),
        participants: z.array(z.string()),
    })
);

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addTaxes = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...taxes } = input;

        const failedEntries: (ITax & { error: string })[] = [];
        if (taxes.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No supplier to add",
            });
        else if (taxes.length === 1) {
            const { provCode, distCode, wardCode, ...data } = taxes[0];
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

            const result = await insertTax(data);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const tax of taxes) {
                const { provCode, distCode, wardCode, ...data } = tax;
                const result = await insertTax(data);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...data, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...data, error: result });
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };
        return { message: "Add taxes successfully!" };
    });

async function insertTax(tax: ITax) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

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

        const result = await taxes.insertOne(tax);
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
