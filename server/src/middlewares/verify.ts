import { ObjectId } from "mongodb";
import { middleware } from "../trpc.js";
import { TRPCError } from "@trpc/server";
import cache from "../database/cache.js";
import { setAccToken, verifyToken } from "./tokenHandlers.js";
import ITokenPayload from "../interfaces/tokens/tokenPayload.js";
import { assignUser, verifyUser } from "./userStatusHandlers.js";
import { getUserByID } from "./collectionHandlers/userHandlers.js";
import { getErrorMessage } from "./errorHandlers/getErrorMessage.js";

import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Response, Request } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

type REQ = Request<ParamsDictionary, any, any, Query, Record<string, any>>;

const unauthErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

function isREQ(req: Request | IncomingMessage): req is REQ {
    return (req as IncomingMessage).headers.upgrade !== "websocket";
}

export const verify = (roles?: string[]) =>
    middleware(async ({ ctx, next }) => {
        if (!isREQ(ctx.req))
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Invalid request",
            });

        ctx.res = ctx.res as Response;

        try {
            const userID = await verifyCookies(ctx.req, ctx.res);

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
                    req: ctx.req as Request,
                    res: ctx.res as Response,
                    user,
                },
            });
        } catch (err) {
            if (err instanceof TRPCError && err.code == "UNAUTHORIZED") {
                ctx.res.clearCookie("accToken");
                ctx.res.clearCookie("refToken");
            }
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

export async function verifyUserId(req: IncomingMessage | Request) {
    const isREQ = (req as IncomingMessage).headers.upgrade !== "websocket";
    const cookies = req.headers.cookie?.split("; ");

    var userId = cookies?.find((c) => c.startsWith("userId"))?.split("=")[1];
    var accToken = cookies
        ?.find((c) => c.startsWith("accToken"))
        ?.split("=")[1];
    const refToken = cookies
        ?.find((c) => c.startsWith("refToken"))
        ?.split("=")[1];
}

export async function verifyCookies(
    req: IncomingMessage | Request,
    res: WebSocket | Response
) {
    const isREQ = (req as IncomingMessage).headers.upgrade !== "websocket";
    const cookies = req.headers.cookie?.split("; ");

    var userId = cookies?.find((c) => c.startsWith("userId"))?.split("=")[1];
    var accToken = cookies
        ?.find((c) => c.startsWith("accToken"))
        ?.split("=")[1];
    const refToken = cookies
        ?.find((c) => c.startsWith("refToken"))
        ?.split("=")[1];

    if (!accToken) throw unauthErr;
    if (userId && (await verifyUser(userId, accToken))) return userId;

    const accPayload = verifyToken(accToken, process.env.ACCESS_SECRET_KEY!);
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

        if (isREQ)
            accToken = setAccToken(
                new ObjectId(refPayload.id),
                res as Response
            );

        userId = refPayload.id;
    } else userId = accPayload.id;

    if (!isREQ)
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "HTTP verification required!",
        });
    await assignUser(userId, accToken, res as Response);
    return userId;
}

async function verifyRefPayload(payload: ITokenPayload, refToken: string) {
    const redis = cache.getCache();
    const token = await redis.get(`refToken-${payload.id}`);
    if (token !== refToken) return false;

    return true;
}
