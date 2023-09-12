import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import { UserRoles } from "../../../configs/default.js";
import IUser from "../../../interfaces/collections/user.js";

const roleFilterSchema = z.object({
    role: z.nativeEnum(UserRoles),
});

const filterSchema = z.object({
    filter: roleFilterSchema.optional(),
});

type TRoleFilter = { role: { $regex: string } };

export const getUsers = adminProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { role } = input?.filter ?? {};

        let filter;
        if (role) filter = { role: { $regex: role } };

        const users = await getUsersFromDB(filter);
        if (users === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return users.map(({ password, ...user }) => user);
    });

async function getUsersFromDB(filter?: TRoleFilter) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        if (filter) return await users.find(filter).toArray();
        return await users.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
