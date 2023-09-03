import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { managerProcedure } from "../../../trpc.js";
import ITax from "../../../interfaces/collections/tax.js";

export const deleteTax = managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        if (!delTax(id))
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return { message: "Delete sucessfully" };
    });

async function delTax(id: string) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        const result = await taxes.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
