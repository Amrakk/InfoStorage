import { ZodError } from "zod";
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
        user: {
            _id: new ObjectId(undefined),
            ...(new Object(undefined) as IUser),
        },
    };
}

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
    errorFormatter({ shape, error }) {
        if (error.code === "BAD_REQUEST" && error.cause instanceof ZodError)
            shape.message = "Invalid input";
        if (error.code === "INTERNAL_SERVER_ERROR") {
            console.error(error);
            shape.message = "Internal Server Error";
        }

        shape.data.stack = undefined;
        return {
            ...shape,
            data: {
                ...shape.data,
            },
        };
    },
});

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
