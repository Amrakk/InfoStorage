import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { Response } from "express";

interface IAccData {
    id: ObjectId;
    permissions: string[];
}

export function setAccessToken(user: IAccData, res: Response) {
    const token = jwt.sign(
        { id: user.id, permissions: user.permissions },
        process.env.ACCESS_SECRET_KEY as string,
        {
            expiresIn: "15m",
        }
    );

    res.cookie("access-token", token, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    });
}

export function setRefreshToken(id: ObjectId, res: Response) {
    const token = jwt.sign(
        { id: id },
        process.env.REFRESH_SECRET_KEY as string,
        {
            expiresIn: "7d",
        }
    );

    res.cookie("refresh-token", token, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    });
}
