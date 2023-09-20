import { set } from "zod";
import cache from "../../database/cache.js";

const expired = Number(process.env.RATE_LIMIT_SEC);
export async function setRateLimit(ip: string, isIncrease: boolean) {
    try {
        const redis = cache.getCache();

        if (isIncrease) return await redis.incr(`RPM-${ip}`);
        else await redis.set(`RPM-${ip}`, 1, "EX", expired);

        return 1;
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function isLimitRateExceeded(ip: string) {
    try {
        const redis = cache.getCache();
        let result = await redis.get(`RPM-${ip}`);
        if (!result) result = (await setRateLimit(ip, false)).toString();
        if (result === "INTERNAL_SERVER_ERROR")
            throw new Error("Set rate limit failed");

        return Number(result) > Number(process.env.RATE_LIMIT_MAX);
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
