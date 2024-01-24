import { Response } from "express";
import cache from "../database/cache.js";

const isDev = process.env.ENV === "development";

export async function assignUser(
    userId: string,
    accToken: string,
    res: Response
) {
    const redis = cache.getCache();
    await redis.set(`userId-${userId}`, accToken, "EX", 60 * 5);
    res.cookie("userId", userId, {
        secure: !isDev,
        httpOnly: true,
        sameSite: isDev ? "lax" : "none",
    });
}

export async function removeUser(id: string) {
    const redis = cache.getCache();
    await redis.del(`userId-${id}`);
}

export async function isOnline(id: string) {
    const redis = cache.getCache();
    const value = await redis.get(`userId-${id}`);
    return !!value;
}

export async function verifyUser(id: string, accToken: string) {
    const redis = cache.getCache();
    const value = await redis.get(`userId-${id}`);
    return value === accToken;
}
