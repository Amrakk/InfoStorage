import { middleware } from "../trpc.js";
import { TRPCError } from "@trpc/server";
import { getUserByID } from "./collectionHandlers/userHandlers.js";
import { getErrorMessage } from "./errorHandlers/getErrorMessage.js";

import type { WebSocket } from "ws";
import type { Request } from "express";
import type { IncomingMessage } from "http";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import { verifyUser } from "./userStatusHandlers.js";

type REQ = Request<ParamsDictionary, any, any, Query, Record<string, any>>;

const unauthErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

function isREQ(req: Request | IncomingMessage): req is REQ {
    return (req as IncomingMessage).headers.upgrade !== "websocket";
}

export const wssVerify = (roles?: string[]) =>
    middleware(async ({ ctx, next }) => {
        if (isREQ(ctx.req))
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Invalid request",
            });

        const cookies = ctx.req.headers.cookie?.split("; ");
        const userId = cookies
            ?.find((c) => c.startsWith("userId"))
            ?.split("=")[1];
        const accToken = cookies
            ?.find((c) => c.startsWith("accToken"))
            ?.split("=")[1];

        ctx.res = ctx.res as WebSocket;

        try {
            if (!accToken) throw unauthErr;
            if (!userId || !(await verifyUser(userId, accToken)))
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "HTTP verification required!",
                });

            const user = await getUserByID(userId);
            if (!user) throw unauthErr;
            if (typeof roles === "object" && !roles.includes(user.role))
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You don't have permission to access this resource",
                });

            return next({
                ctx: {
                    req: ctx.req as IncomingMessage,
                    res: ctx.res as WebSocket,
                    user,
                },
            });
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
