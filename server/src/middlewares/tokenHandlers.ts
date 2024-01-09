import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { Response } from "express";
import cache from "../database/cache.js";
import ITokenPayload from "../interfaces/tokens/tokenPayload.js";
import { WebSocket } from "ws";
const isDev = process.env.ENV === "development";

export function setAccToken(id: ObjectId, res: Response) {
    const token = jwt.sign({ id }, process.env.ACCESS_SECRET_KEY!, {
        expiresIn: "15m",
    });

    res.cookie("accToken", token, {
        secure: !isDev,
        httpOnly: true,
        sameSite: isDev ? "lax" : "none",
    });

    return true;
}

export async function setRefToken(id: ObjectId, res: Response) {
    const token = jwt.sign({ id }, process.env.REFRESH_SECRET_KEY!, {
        expiresIn: "7d",
    });

    res.cookie("refToken", token, {
        secure: !isDev,
        httpOnly: true,
        sameSite: isDev ? "lax" : "none",
    });

    const redis = cache.getCache();
    await redis.set(`refToken-${id}`, token, "EX", 60 * 60 * 24 * 7);

    return true;
}

export function verifyToken(token: string, secret = "") {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded as ITokenPayload;
    } catch (err: jwt.VerifyErrors | any) {
        if (err.name !== "TokenExpiredError") return null;
        return "expired";
    }
}

export async function deleteRefToken(id: ObjectId) {
    const redis = cache.getCache();
    await redis.del(`refToken-${id}`);

    return true;
}
