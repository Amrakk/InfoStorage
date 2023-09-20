import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IShipping from "../../../interfaces/collections/shipping.js";

export const deleteShipping = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        if (!(await delShipping(id)))
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return { message: "Delete sucessfully" };
    });

async function delShipping(id: string) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        const result = await shippings.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
