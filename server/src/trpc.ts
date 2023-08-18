import { initTRPC } from "@trpc/server";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

async function createContext(opts: CreateExpressContextOptions) {
    return {
        req: opts.req,
        res: opts.res,
    };
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
