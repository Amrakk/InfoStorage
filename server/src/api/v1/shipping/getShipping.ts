import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IShipping from "../../../interfaces/collections/shipping.js";

export const getShippings = employeeProcedure.query(async () => {
    const shippings = await getAllShippings();

    if (shippings === "INTERNAL_SERVER_ERROR")
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return shippings;
});

async function getAllShippings() {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        return await shippings.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
