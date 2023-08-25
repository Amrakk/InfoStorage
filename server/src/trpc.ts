import { ObjectId } from "mongodb";
import { initTRPC } from "@trpc/server";
import { verify } from "./middlewares/verify.js";
import IUser from "./interfaces/collections/user.js";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(opts: CreateExpressContextOptions) {
    return {
        req: opts.req,
        res: opts.res,
        userID: new ObjectId(undefined),
        user: new Object(undefined) as IUser,
    };
}

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

// Protected procedures
export const verifiedProcedure = t.procedure.use(verify());
export const adminProcedure = t.procedure.use(verify(["admin"]));
export const managerProcedure = t.procedure.use(verify(["admin", "manager"]));
export const employeeProcedure = t.procedure.use(
    verify(["admin", "manager", "employee"])
);
