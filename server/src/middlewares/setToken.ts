import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { Response } from "express";
import cache from "../database/cache.js";

interface IAccData {
    name: string;
    role: string;
}

export function setAccToken(user: IAccData, res: Response) {
    try {
        if (!user.name || !user.role) throw new Error("Invalid user data");

        const token = jwt.sign(
            { name: user.name, role: user.role },
            process.env.ACCESS_SECRET_KEY as string,
            {
                expiresIn: "15m",
            }
        );

        res.cookie("accToken", token, {
            secure: true,
            sameSite: "none",
        });

        return true;
    } catch (err) {
        return false;
    }
}

export async function setRefToken(id: ObjectId, res: Response) {
    try {
        if (!id) throw new Error("Invalid user id");

        const token = jwt.sign(
            { id: id },
            process.env.REFRESH_SECRET_KEY as string,
            {
                expiresIn: "7d",
            }
        );

        res.cookie("refToken", token, {
            secure: true,
            httpOnly: true,
            sameSite: "none",
        });

        const redis = cache.getCache();
        await redis.set(`refToken-${id}`, token, "EX", 60 * 60 * 24 * 7);

        return true;
    } catch (err) {
        return false;
    }
}
