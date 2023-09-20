import { ObjectId } from "mongodb";
import { Response } from "express";
import { middleware } from "../trpc.js";
import cache from "../database/cache.js";
import { TRPCError } from "@trpc/server";
import { setAccToken, verifyToken } from "./tokenHandlers.js";
import ITokenPayload from "../interfaces/tokens/tokenPayload.js";
import { getUserByID } from "./collectionHandlers/userHandlers.js";
import { getErrorMessage } from "./errorHandlers.ts/getErrorMessage.js";
import {
    setRateLimit,
    isLimitRateExceeded,
} from "./rateLimiter/rateLimitHandlers.js";

const unauthErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

export const verify = (roles?: string[]) =>
    middleware(async ({ ctx, next }) => {
        const { ip } = ctx.req;
        const { accToken, refToken } = ctx.req.cookies;

        try {
            const isLimitExceeded = await isLimitRateExceeded(ip);
            if (isLimitExceeded)
                throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
            else await setRateLimit(ip, true);

            if (!accToken) throw unauthErr;
            let userID: string;

            const accPayload = verifyToken(
                accToken,
                process.env.ACCESS_SECRET_KEY!
            );
            if (!accPayload) throw clearCookie(ctx.res);
            if (accPayload === "expired") {
                if (!refToken) throw clearCookie(ctx.res);
                const refPayload = verifyToken(
                    refToken,
                    process.env.REFRESH_SECRET_KEY!
                );

                if (
                    !refPayload ||
                    refPayload === "expired" ||
                    !(await verifyRefPayload(refPayload, refToken))
                )
                    throw clearCookie(ctx.res);

                setAccToken(new ObjectId(refPayload.id), ctx.res);

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

            return next({
                ctx: { ...ctx, user },
            });
        } catch (err) {
            console.log(err);
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
