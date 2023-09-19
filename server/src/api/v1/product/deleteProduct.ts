import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IProduct from "../../../interfaces/collections/product.js";

export const deleteProduct = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        if (!delProduct(id))
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return { message: "Delete sucessfully" };
    });

async function delProduct(id: string) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        const result = await products.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
