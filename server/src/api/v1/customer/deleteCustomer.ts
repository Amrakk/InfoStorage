import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ICustomer from "../../../interfaces/collections/customer.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";

export const deleteCustomer = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        try {
            const result = await delCustomer(id);
            if (typeof result === "string") throw new Error(result);

            return { message: "Delete customer sucessfully!" };
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function delCustomer(id: string) {
    const db = database.getDB();
    const customers = db.collection<ICustomer>("customers");

    const result = await customers.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged ? true : "Failed while deleting customer";
}
