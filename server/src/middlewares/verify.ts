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

export const verify = (role?: string) =>
    middleware(async ({ ctx, next }) => {
        const { accToken, refToken } = ctx.req.cookies;
        if (!accToken) throw unauthErr;

        let userID: ObjectId;

        const accPayload = verifyToken(
            accToken,
            process.env.ACCESS_SECRET_KEY as string
        );
        if (!accPayload) throw clearCookie(ctx.res);
        if (accPayload === "expired") {
            if (!refToken) throw clearCookie(ctx.res);

            const refPayload = verifyToken(
                refToken,
                process.env.REFRESH_SECRET_KEY as string
            );
            if (
                !refPayload ||
                refPayload === "expired" ||
                !(await verifyRefPayload(refPayload))
            )
                throw clearCookie(ctx.res);

            if (!setAccToken(refToken.id, ctx.res)) throw internalErr;

            userID = refToken.id;
        } else userID = accPayload.id;

        const user = await getUserByID(userID);
        if (!user) throw unauthErr;
        if (user === "INTERNAL_SERVER_ERROR") throw internalErr;
        if (typeof role === "string" && user.role !== role) throw unauthErr;

        return next({
            ctx: { ...ctx, userID, user },
        });
    });

async function getUserByID(id: ObjectId) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.findOne({ _id: id });
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
