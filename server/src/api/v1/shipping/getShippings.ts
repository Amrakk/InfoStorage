import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IShipping from "../../../interfaces/collections/shipping.js";
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

export const getShippings = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const shippings = await getShippingsFromDB(filter);
        if (shippings === "INTERNAL_SERVER_ERROR") throw internalErr;

        return shippings;
    });

async function getShippingsFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        if (filter) return await shippings.find(filter).toArray();
        return await shippings.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
