import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import ICustomer from "../../../interfaces/collections/customer.js";

export const deleteCustomer = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        if (!delCustomer(id))
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return { message: "Delete sucessfully" };
    });

async function delCustomer(id: string) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        const result = await customers.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
