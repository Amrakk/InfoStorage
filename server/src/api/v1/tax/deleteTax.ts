import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ITax from "../../../interfaces/collections/tax.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";

export const deleteTax = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        try {
            const result = await delTax(id);
            if (typeof result === "string") throw new Error(result);

            return { message: "Delete tax sucessfully!" };
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function delTax(id: string) {
    const db = database.getDB();
    const taxes = db.collection<ITax>("taxes");

    const result = await taxes.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged ? true : "Failed while deleting tax";
}
