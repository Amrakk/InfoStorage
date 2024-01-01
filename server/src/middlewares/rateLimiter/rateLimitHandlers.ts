import cache from "../../database/cache.js";
import database from "../../database/db.js";

const expired = Number(process.env.RATE_LIMIT_SEC!);
const max = Number(process.env.RATE_LIMIT_MAX!);
const banned = Number(process.env.RATE_LIMIT_BANNED!);

export async function setRateLimit(ip: string) {
    const redis = cache.getCache();

    if ((await redis.ttl(`RPM-${ip}`)) > 0)
        return await redis.incr(`RPM-${ip}`);

    return await redis.set(`RPM-${ip}`, 1, "EX", expired);
}

export async function isLimitRateExceeded(ip: string) {
    const redis = cache.getCache();
    if (Number(await redis.get(`RPM-${ip}`)) > banned) {
        const db = database.getDB();
        await db
            .collection("bannedIPs")
            .findOneAndUpdate(
                { ip: ip },
                { $set: { ip: ip } },
                { upsert: true }
            );
        return false;
    }

    return Number(await redis.get(`RPM-${ip}`)) > Number(max);
}
