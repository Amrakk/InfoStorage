import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";

export const deleteSupplier = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        try {
            const result = await delSupplier(id);
            if (typeof result === "string") throw new Error(result);

            return { message: "Delete supplier sucessfully!" };
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function delSupplier(id: string) {
    const db = database.getDB();
    const suppliers = db.collection<ISupplier>("suppliers");

    const result = await suppliers.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged ? true : "Failed while deleting supplier";
}
