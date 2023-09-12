import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ICustomer from "../../../interfaces/collections/customer.js";
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

export const getCustomers = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const customers = await getCustomersFromDB(filter);
        if (customers === "INTERNAL_SERVER_ERROR") throw internalErr;

        return customers;
    });

async function getCustomersFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        if (filter) return await customers.find(filter).toArray();
        return await customers.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
