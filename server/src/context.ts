import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(opts: CreateExpressContextOptions) {
    return {
        req: opts.req,
        res: opts.res,
    };
}

export type Context = inferAsyncReturnType<typeof createContext>;
