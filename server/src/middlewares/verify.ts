import jwt from "jsonwebtoken";
import { Response } from "express";
import { ObjectId } from "mongodb";
import { middleware } from "../trpc.js";
import { TRPCError } from "@trpc/server";
import cache from "../database/cache.js";
import database from "../database/db.js";
import { setAccToken } from "./setToken.js";
import IUser from "../interfaces/collections/user.js";
import { IAccPayload, IRefPayload } from "../interfaces/tokens/cookieTokens.js";

const generalErr = new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid token",
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const verify = middleware(async ({ ctx, next }) => {
    const { accToken, refToken } = ctx.req.cookies;
    if (!accToken) throw generalErr;

    let userRole: string;

    const accPayload = verifyToken<IAccPayload>(
        accToken,
        process.env.ACCESS_SECRET_KEY as string
    );
    if (!accPayload) throw await clearCookie(ctx.res);
    if (accPayload === "expired") {
        if (!refToken) throw generalErr;

        const refPayload = verifyToken<IRefPayload>(
            refToken,
            process.env.REFRESH_SECRET_KEY as string
        );
        if (
            !refPayload ||
            refPayload === "expired" ||
            !(await verifyRefPayload(refPayload))
        )
            throw await clearCookie(ctx.res);
        const user = await getUserByID(refPayload.id);
        if (!user) throw generalErr;
        if (user === "INTERNAL_SERVER_ERROR") throw internalErr;

        const { name, role } = user;
        if (!setAccToken({ name, role }, ctx.res)) throw internalErr;

        userRole = role;
    } else userRole = accPayload.role;

    return next({
        ctx: { ...ctx, userRole },
    });
});

function verifyToken<T>(token: string, secret = "") {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded as T;
    } catch (err: jwt.VerifyErrors | any) {
        if (err.name !== "TokenExpiredError") return null;
        return "expired";
    }
}

async function verifyRefPayload(payload: IRefPayload) {
    const redis = cache.getCache();
    const token = await redis.get(`refToken-${payload.id}`);
    if (!token) return false;

    return true;
}

async function getUserByID(id: string) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.findOne({ _id: new ObjectId(id) });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

async function clearCookie(res: Response) {
    res.clearCookie("accToken");
    res.clearCookie("refToken");
    return generalErr;
}
