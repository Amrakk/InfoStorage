import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ITax from "../../../interfaces/collections/tax.js";
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

export const getTaxes = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const taxes = await getTaxesFromDB(filter);
        if (taxes === "INTERNAL_SERVER_ERROR") throw internalErr;

        return taxes;
    });

async function getTaxesFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        if (filter) return await taxes.find(filter).toArray();
        return await taxes.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
