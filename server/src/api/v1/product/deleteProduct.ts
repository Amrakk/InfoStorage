import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IProduct from "../../../interfaces/collections/product.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";

export const deleteProduct = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        try {
            const result = await delProduct(id);
            if (typeof result === "string") throw new Error(result);

            return { message: "Delete product sucessfully!" };
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function delProduct(id: string) {
    const db = database.getDB();
    const products = db.collection<IProduct>("products");

    const result = await products.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged ? true : "Failed while deleting product";
}
