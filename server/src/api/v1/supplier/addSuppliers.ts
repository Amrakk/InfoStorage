import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import { CollectionNames } from "../../../configs/default.js";
import { saveImportLog } from "../../../middlewares/importLog.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getUnitName } from "../../../middlewares/addressHandlers.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(supplierRegex.name),
        address: z.string().regex(supplierRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
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
    .mutation(async ({ input, ctx }) => {
        const suppliers = input;

        const failedEntries: (ISupplier & { error: string })[] = [];
        if (suppliers.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No supplier to add",
            });
        else if (suppliers.length === 1) {
            const { provCode, distCode, wardCode, ...data } = suppliers[0];
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

            const result = await insertSupplier(data);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            const successEntries: string[] = [];
            for (const supplier of suppliers) {
                const { provCode, distCode, wardCode, ...data } = supplier;
                const result = await insertSupplier(data);
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
                CollectionNames.Suppliers
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
        return result.acknowledged
            ? result.insertedId
            : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
