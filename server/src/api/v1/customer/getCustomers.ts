import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ICustomer from "../../../interfaces/collections/customer.js";

export const getCustomers = employeeProcedure.query(async () => {
    const customers = await getAllCustomers();

    if (customers === "INTERNAL_SERVER_ERROR")
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return customers;
});

async function getAllCustomers() {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        return await customers.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
