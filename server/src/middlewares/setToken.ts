import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { Response } from "express";
import cache from "../database/cache.js";
import { TRPCError } from "@trpc/server";

interface IAccData {
    name: string;
    permissions: string[];
}

export function setAccessToken(user: IAccData, res: Response) {
    const token = jwt.sign(
        { name: user.name, permissions: user.permissions },
        process.env.ACCESS_SECRET_KEY as string,
        {
            expiresIn: "15m",
        }
    );

    res.cookie("access-token", token, {
        secure: true,
        sameSite: "none",
    });
}

export async function setRefreshToken(id: ObjectId, res: Response) {
    const token = jwt.sign(
        { id: id },
        process.env.REFRESH_SECRET_KEY as string,
        {
            expiresIn: "7d",
        }
    );

    res.cookie("reftoken", token, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    });

    const redis = cache.getCache();

    return await redis.set(`reftoken-${id}`, token, "EX", 60 * 60 * 24 * 7);
}
