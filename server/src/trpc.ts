import { initTRPC } from "@trpc/server";
import { verify } from "./middlewares/verify.js";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(opts: CreateExpressContextOptions) {
    return {
        req: opts.req,
        res: opts.res,
    };
}

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;

export const publicProcedure = t.procedure;
// export const adminProcedure = t.procedure.use(verify).use(authorize);
// export const managerProcedure = t.procedure.use(verify).use(authorize);
