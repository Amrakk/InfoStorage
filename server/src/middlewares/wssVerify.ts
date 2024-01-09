import { ObjectId } from "mongodb";
import { IncomingMessage } from "http";
import { middleware } from "../trpc.js";
import cache from "../database/cache.js";
import database from "../database/db.js";
import { TRPCError } from "@trpc/server";
import type { Response, Request } from "express";
import { setAccToken, verifyToken } from "./tokenHandlers.js";
import ITokenPayload from "../interfaces/tokens/tokenPayload.js";
import { getUserByID } from "./collectionHandlers/userHandlers.js";
import { getErrorMessage } from "./errorHandlers/getErrorMessage.js";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import {
    setRateLimit,
    isLimitRateExceeded,
} from "./rateLimiter/rateLimitHandlers.js";

import { WebSocket } from "ws";

const unauthErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

type REQ = Request<ParamsDictionary, any, any, Query, Record<string, any>>;

function isREQ(req: Request | IncomingMessage): req is REQ {
    return (req as IncomingMessage).headers.upgrade !== "websocket";
}

export const wssVerify = (roles?: string[]) =>
    middleware(async ({ ctx, next }) => {
        if (isREQ(ctx.req))
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "Invalid request",
            });

        const ip = (ctx.req.headers["x-forwarded-for"] ||
            ctx.req.socket.remoteAddress) as string;

        const cookies = ctx.req.headers.cookie?.split("; ");
        const accToken = cookies
            ?.find((c) => c.startsWith("accToken"))
            ?.split("=")[1];
        const refToken = cookies
            ?.find((c) => c.startsWith("refToken"))
            ?.split("=")[1];

        ctx.res = ctx.res as WebSocket;

        try {
            if (await isBanned(ip)) throw new TRPCError({ code: "FORBIDDEN" });
            await setRateLimit(ip);

            const isLimitExceeded = await isLimitRateExceeded(ip);
            if (isLimitExceeded)
                throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

            if (!accToken) throw unauthErr;
            let userID: string;

            const accPayload = verifyToken(
                accToken,
                process.env.ACCESS_SECRET_KEY!
            );
            if (!accPayload) throw unauthErr;
            if (accPayload === "expired") {
                if (!refToken) throw unauthErr;
                const refPayload = verifyToken(
                    refToken,
                    process.env.REFRESH_SECRET_KEY!
                );

                if (
                    !refPayload ||
                    refPayload === "expired" ||
                    !(await verifyRefPayload(refPayload, refToken))
                )
                    throw unauthErr;

                throw new TRPCError({
                    code: "CLIENT_CLOSED_REQUEST",
                    message: "Expired token",
                });
            } else userID = accPayload.id;

            const user = await getUserByID(userID);
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

async function verifyRefPayload(payload: ITokenPayload, refToken: string) {
    const redis = cache.getCache();
    const token = await redis.get(`refToken-${payload.id}`);
    if (token !== refToken) return false;

    return true;
}

async function isBanned(ip: string) {
    const db = database.getDB();
    return await db.collection("bannedIPs").findOne({ ip });
}
