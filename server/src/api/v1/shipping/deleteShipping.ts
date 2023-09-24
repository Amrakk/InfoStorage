import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";

export const deleteShipping = employeeProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        try {
            const result = await delShipping(id);
            if (typeof result === "string") throw new Error(result);

            return { message: "Delete shipping sucessfully!" };
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function delShipping(id: string) {
    const db = database.getDB();
    const shippings = db.collection<IShipping>("shippings");

    const result = await shippings.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged ? true : "Failed while deleting shipping";
}
