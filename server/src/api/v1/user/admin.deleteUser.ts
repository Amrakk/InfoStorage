import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";

export const deleteUser = adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
        const { id } = input;

        if (!delUser(id))
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });

        return { message: "Delete sucessfully" };
    });

async function delUser(id: string) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        const result = await users.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
