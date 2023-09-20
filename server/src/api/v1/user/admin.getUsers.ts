import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure } from "../../../trpc.js";
import { UserRoles } from "../../../configs/default.js";
import { getUsersFromDB } from "../../../middlewares/collectionHandlers/userHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";

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

        let filter = undefined;
        if (role) filter = { role: { $regex: role } };

        try {
            const users = await getUsersFromDB(filter);
            return users.map(({ password, ...user }) => user);
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
