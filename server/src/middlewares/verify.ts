import { Response } from "express";
import { ObjectId } from "mongodb";
import { middleware } from "../trpc.js";
import cache from "../database/cache.js";
import database from "../database/db.js";
import { TRPCError } from "@trpc/server";
import IUser from "../interfaces/collections/user.js";
import { setAccToken, verifyToken } from "./tokenHandlers.js";
import ITokenPayload from "../interfaces/tokens/tokenPayload.js";

const unauthErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const verify = (roles?: string[]) =>
    middleware(async ({ ctx, next }) => {
        const { accToken, refToken } = ctx.req.cookies;

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
                !(await verifyRefPayload(refPayload))
            )
                throw clearCookie(ctx.res);

            if (!setAccToken(refToken.id, ctx.res)) throw internalErr;

            userID = refPayload.id;
        } else userID = accPayload.id;

        const user = await getUserByID(userID);
        if (!user) throw unauthErr;
        if (user === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (typeof roles === "object" && !roles.includes(user.role))
            throw unauthErr;

        return next({
            ctx: { ...ctx, user },
        });
    });

async function getUserByID(id: string) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.findOne({ _id: new ObjectId(id) });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

async function verifyRefPayload(payload: ITokenPayload) {
    try {
        const redis = cache.getCache();
        const token = await redis.get(`refToken-${payload.id}`);
        if (!token) return false;

        return true;
    } catch (err) {
        return false;
    }
}

function clearCookie(res: Response) {
    res.clearCookie("accToken");
    res.clearCookie("refToken");
    return unauthErr;
}
