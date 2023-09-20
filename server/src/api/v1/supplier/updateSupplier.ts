import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(supplierRegex.name),
    address: z.string().regex(supplierRegex.address),
    provCode: z.number().int().positive(),
    distCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
    contact: z.string().regex(supplierRegex.contact),
    phone: z.string().regex(supplierRegex.phone),
    note: z.string().regex(supplierRegex.note),
});

export const updateSupplier = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provCode, distCode, wardCode, id, ...supplier } = input;

        try {
            const isNameExist = await getSupplierByName(supplier.name);
            if (isNameExist && isNameExist._id.toString() !== id)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Supplier already exists",
                });

            const ward = await getUnitName(wardCode, "ward");
            const district = await getUnitName(distCode, "district");
            const province = await getUnitName(provCode, "province");
            supplier.address = `${supplier.address}, ${ward}, ${district}, ${province}`;

            const result = await updateSupplierInfo(id, supplier);
            if (typeof result === "string") throw new Error(result);

            return { message: "Update supplier successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updateSupplierInfo(id: string, supplier: ISupplier) {
    const db = database.getDB();
    const suppliers = db.collection<ISupplier>("suppliers");

    const result = await suppliers.updateOne(
        { _id: new ObjectId(id) },
        { $set: supplier }
    );

    return result.acknowledged ? true : "Failed while updating supplier";
}
