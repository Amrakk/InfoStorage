import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getProvinceInfo } from "../../../middlewares/addressHandler.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(supplierRegex.name),
    address: z.string().regex(supplierRegex.address),
    provinceCode: z.number().int().positive(),
    districtCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
    contact: z.string().regex(supplierRegex.contact),
    phone: z.string().regex(supplierRegex.phone),
    note: z.string().regex(supplierRegex.note).nullable(),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addSupplier = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provinceCode, districtCode, wardCode, ...supplier } = input;

        const isNameExist = await getSupplierByName(supplier.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Supplier already exist",
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

        supplier.address = `${supplier.address}, ${ward}, ${district}, ${province}`;

        const result = await insertSupplier(supplier);
        if (!result) throw internalErr;

        return { message: "Add successfully" };
    });

async function insertSupplier(supplier: ISupplier) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        const result = await suppliers.insertOne(supplier);
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
