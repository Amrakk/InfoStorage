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
import { getProvinceInfo } from "../../../middlewares/addressHandlers.js";
import ITax from "../../../interfaces/collections/tax.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(taxRegex.name),
        taxCode: z.string().regex(taxRegex.taxCode),
        address: z.string().regex(taxRegex.address),
        provinceCode: z.number().int().positive().nullish(),
        districtCode: z.number().int().positive().nullish(),
        wardCode: z.number().int().positive().nullish(),
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
            const { provinceCode, districtCode, wardCode } = taxes[0];
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

            taxes[0].address = `${taxes[0].address}, ${ward}, ${district}, ${province}`;

            const result = await insertTax(taxes[0]);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const tax of taxes) {
                const result = await insertTax(tax);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...tax, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...tax, error: result });
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };

        return { message: "Add taxes successfully!" };
    });

async function insertTax(tax: Itax) {
    try {
        const db = database.getDB();
        const taxes = db.collection<Itax>("taxes");

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
