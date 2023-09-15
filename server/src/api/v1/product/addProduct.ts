import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { productRegex } from "../../../configs/regex.js";
import { productCategories } from "../../../configs/global.js";
import IProduct from "../../../interfaces/collections/product.js";
import { getProductByName } from "../../../middlewares/collectionHandlers/productHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(productRegex.name),
    category: z.enum(["syrup", "jam", "powder", "canned", "topping", "others"]),
    quantity: z.number().int().positive(),
    price: z.number().int().positive(),
    suppliers: z.array(z.string()),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addProduct = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...product } = input;

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

        const result = await insertProduct(product);
        if (!result) throw internalErr;

        return { message: "Add successfully" };
    });

async function insertProduct(product: IProduct) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        const result = await products.insertOne(product);
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
