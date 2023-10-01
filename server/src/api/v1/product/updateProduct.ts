import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { productRegex } from "../../../configs/regex.js";
import { ProductCategories } from "../../../configs/default.js";
import IProduct from "../../../interfaces/collections/product.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { getProductByName } from "../../../middlewares/collectionHandlers/productHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(productRegex.name),
    category: z.nativeEnum(ProductCategories),
    quantity: z.number().int().positive(),
    price: z.number().int().positive(),
    suppliers: z.array(z.string()),
});

export const updateProduct = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { id, ...product } = input;

        try {
            const isNameExist = await getProductByName(product.name);
            if (isNameExist && isNameExist._id.toString() !== id)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Product already exists",
                });

            const isDuplicate = product.suppliers.some((supplier, index) => {
                return product.suppliers.indexOf(supplier) !== index;
            });
            if (isDuplicate)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Supplier already exists",
                });

            const result = await updateProductInfo(id, product);
            if (typeof result === "string") throw new Error(result);

            return { message: "Update product successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updateProductInfo(id: string, product: IProduct) {
    const db = database.getDB();
    const products = db.collection<IProduct>("products");

    const result = await products.updateOne(
        { _id: new ObjectId(id) },
        { $set: product }
    );

    return result.acknowledged ? true : "Failed while updating product";
}
