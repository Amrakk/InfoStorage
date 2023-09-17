import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { ProductCategories } from "../../../configs/default.js";
import IProduct from "../../../interfaces/collections/product.js";

const categoryFilterShema = z.object({
    category: z.nativeEnum(ProductCategories),
});

const filterSchema = z.object({
    filter: categoryFilterShema.optional(),
});

type TCategoryFilter = { category: { $regex: string } };

export const getProducts = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { category } = input?.filter ?? {};

        let categoryFilter;
        if (category) categoryFilter = { category: { $regex: category } };

        const products = await getProductsFromDB(categoryFilter);
        if (products === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return products;
    });

async function getProductsFromDB(filter?: TCategoryFilter) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        if (filter) return await products.find(filter).toArray();
        return await products.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
