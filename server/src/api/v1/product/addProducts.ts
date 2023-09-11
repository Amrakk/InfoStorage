import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { productRegex } from "../../../configs/regex.js";
import { productCategories } from "../../../configs/global.js";
import IProduct from "../../../interfaces/collections/product.js";
import { getProductByName } from "../../../middlewares/collectionHandlers/productHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(productRegex.name),
        category: z.enum(productCategories),
        quantity: z.number().int().positive(),
        price: z.number().int().positive(),
        suppliers: z.array(z.string()),
    })
);

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addProducts = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...products } = input;

        const failedEntries: (IProduct & { error: string })[] = [];
        if (products.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No product to add",
            });
        else if (products.length === 1) {
            const result = await insertProduct(products[0]);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const product of products) {
                const result = await insertProduct(product);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...product, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...product, error: result });
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };
        return { message: "Add products successfully!" };
    });

async function insertProduct(product: IProduct) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        const isNameExist = await getProductByName(product.name);
        if (isNameExist === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (isNameExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Product already exist",
            });

        const isDuplicate = product.suppliers.some((supplier, index) => {
            return product.suppliers.indexOf(supplier) !== index;
        });
        if (isDuplicate)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Duplicate suppliers",
            });

        const result = await products.insertOne(product);
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
