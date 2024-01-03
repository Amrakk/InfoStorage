import { ObjectId } from "mongodb";
import type { Response, Request } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import { IncomingMessage } from "http";
import { middleware } from "../trpc.js";
import cache from "../database/cache.js";
import database from "../database/db.js";
import { TRPCError } from "@trpc/server";
import { setAccToken, verifyToken } from "./tokenHandlers.js";
import ITokenPayload from "../interfaces/tokens/tokenPayload.js";
import { getUserByID } from "./collectionHandlers/userHandlers.js";
import { getErrorMessage } from "./errorHandlers/getErrorMessage.js";
import {
    setRateLimit,
    isLimitRateExceeded,
} from "./rateLimiter/rateLimitHandlers.js";

const unauthErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

type REQ = Request<ParamsDictionary, any, any, Query, Record<string, any>>;

function isREQ(req: Request | IncomingMessage): req is REQ {
    return (req as IncomingMessage).socket === undefined;
}

export const verify = (roles?: string[]) =>
    middleware(async ({ ctx, next }) => {
        var ip;
        if (!isREQ(ctx.req)) {
            ip = ctx.req.socket.remoteAddress;
            console.log(ctx);

            console.log(ip);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const req = ctx.req as REQ;
        const res = ctx.res as Response;
        ip = ctx.req.ip;
        const { accToken, refToken } = ctx.req.cookies;

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
            if (!accPayload) throw clearCookie(res);
            if (accPayload === "expired") {
                if (!refToken) throw clearCookie(res);
                const refPayload = verifyToken(
                    refToken,
                    process.env.REFRESH_SECRET_KEY!
                );

                if (
                    !refPayload ||
                    refPayload === "expired" ||
                    !(await verifyRefPayload(refPayload, refToken))
                )
                    throw clearCookie(res);

                setAccToken(new ObjectId(refPayload.id), res);

                userID = refPayload.id;
            } else userID = accPayload.id;

            const user = await getUserByID(userID);
            if (!user) throw unauthErr;
            if (typeof roles === "object" && !roles.includes(user.role))
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You don't have permission to access this resource",
                });

            return next({ ctx: { ...ctx, user } });
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

function clearCookie(res: Response) {
    res.clearCookie("accToken");
    res.clearCookie("refToken");
    return unauthErr;
}

async function isBanned(ip: string) {
    const db = database.getDB();
    return await db.collection("bannedIPs").findOne({ ip });
}
