import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(supplierRegex.name),
    address: z.string().regex(supplierRegex.address),
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
        const { ...supplier } = input;

        const isNameExist = await getSupplierByName(supplier.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Supplier already exist",
            });

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
