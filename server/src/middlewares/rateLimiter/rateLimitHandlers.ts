import cache from "../../database/cache.js";
import database from "../../database/db.js";
import { TRPCError } from "@trpc/server";
import type { Request } from "express";
import { IncomingMessage } from "http";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import { middleware } from "../../trpc.js";
import { banIp } from "../collectionHandlers/bannedIPsHandlers.js";

const expired = Number(process.env.RATE_LIMIT_SEC!);
const max = Number(process.env.RATE_LIMIT_MAX!);
const banned = Number(process.env.RATE_LIMIT_BANNED!);

type REQ = Request<ParamsDictionary, any, any, Query, Record<string, any>>;

function isREQ(req: Request | IncomingMessage): req is REQ {
    return (req as IncomingMessage).headers.upgrade !== "websocket";
}

export const limiter = () =>
    middleware(async ({ ctx, next }) => {
        const ip = isREQ(ctx.req) ? ctx.req.ip : ctx.req.socket.remoteAddress;

        if (!ip)
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Invalid request",
            });

        if (await isBanned(ip)) throw new TRPCError({ code: "FORBIDDEN" });
        await setRateLimit(ip);

        const isLimitExceeded = await isLimitRateExceeded(ip);
        if (isLimitExceeded) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

        return next();
    });

async function setRateLimit(ip: string) {
    const redis = cache.getCache();

    if ((await redis.ttl(`RPM-${ip}`)) > 0)
        return await redis.incr(`RPM-${ip}`);

    return await redis.set(`RPM-${ip}`, 1, "EX", expired);
}

async function isLimitRateExceeded(ip: string) {
    const redis = cache.getCache();
    if (Number(await redis.get(`RPM-${ip}`)) > banned) {
        await banIp(ip);
        return false;
    }

    return Number(await redis.get(`RPM-${ip}`)) > Number(max);
}

async function isBanned(ip: string) {
    const db = database.getDB();
    return await db.collection("bannedIPs").findOne({ ip });
}
