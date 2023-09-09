import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getProvinceInfo } from "../../../middlewares/addressHandlers.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(supplierRegex.name),
        address: z.string().regex(supplierRegex.address),
        provinceCode: z.number().int().positive().nullish(),
        districtCode: z.number().int().positive().nullish(),
        wardCode: z.number().int().positive().nullish(),
        contact: z.string().regex(supplierRegex.contact),
        phone: z.string().regex(supplierRegex.phone),
        note: z.string().regex(supplierRegex.note),
    })
);

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addSuppliers = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...suppliers } = input;

        const failedEntries: (ISupplier & { error: string })[] = [];
        if (suppliers.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No supplier to add",
            });
        else if (suppliers.length === 1) {
            const { provinceCode, districtCode, wardCode } = suppliers[0];
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

            suppliers[0].address = `${suppliers[0].address}, ${ward}, ${district}, ${province}`;

            const result = await insertSupplier(suppliers[0]);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const supplier of suppliers) {
                const result = await insertSupplier(supplier);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...supplier, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...supplier, error: result });
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };

        return { message: "Add suppliers successfully!" };
    });

async function insertSupplier(supplier: ISupplier) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        const isNameExist = await getSupplierByName(supplier.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Supplier already exist",
            });

        const result = await suppliers.insertOne(supplier);
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
