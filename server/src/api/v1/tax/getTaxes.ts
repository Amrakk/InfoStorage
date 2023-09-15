import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ITax from "../../../interfaces/collections/tax.js";

export const getTaxes = employeeProcedure.query(async () => {
    const taxes = await getAllProducts();

    if (taxes === "INTERNAL_SERVER_ERROR")
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return taxes;
});

async function getAllProducts() {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        return await taxes.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
