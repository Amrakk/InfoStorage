import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure } from "../../../trpc.js";
import { UserRoles } from "../../../configs/default.js";
import {
    getUsersFromDB,
    TRoleFilter,
} from "../../../middlewares/collectionHandlers/userHandlers.js";

const roleFilterSchema = z.object({
    role: z.nativeEnum(UserRoles),
});

const filterSchema = z.object({
    filter: roleFilterSchema.optional(),
});

export const getUsers = adminProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { role } = input?.filter ?? {};

        let filter: TRoleFilter | undefined = undefined;
        if (role) filter = { role: { $regex: role } };

        const users = await getUsersFromDB(filter);
        if (users === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return users.map(({ password, ...user }) => user);
    });
