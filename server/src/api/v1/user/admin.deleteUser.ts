import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";

export const deleteUser = adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        try {
            const result = await delUser(id);
            if (typeof result === "string") throw new Error(result);

            return { message: "Delete user sucessfully!" };
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function delUser(id: string) {
    const db = database.getDB();
    const users = db.collection<IUser>("users");

    const result = await users.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged ? true : "Failed while deleting user";
}
