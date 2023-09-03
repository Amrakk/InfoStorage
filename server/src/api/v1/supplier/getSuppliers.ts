import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ISupplier from "../../../interfaces/collections/supplier.js";

export const getSuppliers = employeeProcedure.query(async () => {
    const suppliers = await getAllProducts();

    if (suppliers === "INTERNAL_SERVER_ERROR")
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return suppliers;
});

async function getAllProducts() {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        return await suppliers.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
