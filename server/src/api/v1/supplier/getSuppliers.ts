import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import {
    addressFilter,
    TAddressFilter,
    addressFilterShema,
} from "../../../middlewares/filterHandlers/address.js";

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

export const getSuppliers = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const suppliers = await getProductsFromDB(filter);
        if (suppliers === "INTERNAL_SERVER_ERROR") throw internalErr;

        return suppliers;
    });

async function getProductsFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        if (filter) return await suppliers.find(filter).toArray();
        return await suppliers.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
