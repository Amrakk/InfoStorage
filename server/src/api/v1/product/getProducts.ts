import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IProduct from "../../../interfaces/collections/product.js";

export const getProducts = employeeProcedure.query(async () => {
    const products = await getAllProducts();

    if (products === "INTERNAL_SERVER_ERROR")
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return products;
});

async function getAllProducts() {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        return await products.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
