import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getUnitName } from "../../../middlewares/addressHandlers.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(supplierRegex.name),
    address: z.string().regex(supplierRegex.address),
    provinceCode: z.number().int().positive(),
    districtCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
    contact: z.string().regex(supplierRegex.contact),
    phone: z.string().regex(supplierRegex.phone),
    note: z.string().regex(supplierRegex.note),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const updateSupplier = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provinceCode, districtCode, wardCode, ...supplier } = input;

        const isNameExist = await getSupplierByName(supplier.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist?._id !== new ObjectId(supplier.id))
            throw new TRPCError({
                code: "CONFLICT",
                message: "Supplier already exists",
            });

        const province = await getUnitName(provinceCode, "province");
        const district = await getUnitName(districtCode, "district");
        const ward = await getUnitName(wardCode, "ward");
        if (
            province === "INTERNAL_SERVER_ERROR" ||
            district === "INTERNAL_SERVER_ERROR" ||
            ward === "INTERNAL_SERVER_ERROR"
        )
            throw internalErr;

        supplier.address = `${supplier.address}, ${ward}, ${district}, ${province}`;

        const result = await updateSupplierInfo(supplier.id, supplier);
        if (!result) throw internalErr;

        return { message: "Update successfully" };
    });

async function updateSupplierInfo(id: string, supplier: ISupplier) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        const result = await suppliers.updateOne(
            { _id: new ObjectId(id) },
            { $set: supplier }
        );

        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
