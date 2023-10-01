import cache from "../../database/cache.js";

const expired = Number(process.env.RATE_LIMIT_SEC!);

export async function setRateLimit(ip: string, isIncrease: boolean) {
    const redis = cache.getCache();

    if (isIncrease) return await redis.incr(`RPM-${ip}`);
    else await redis.set(`RPM-${ip}`, 1, "EX", expired);

    return 1;
}

export async function isLimitRateExceeded(ip: string) {
    const redis = cache.getCache();
    let result = await redis.get(`RPM-${ip}`);
    if (!result) result = (await setRateLimit(ip, false)).toString();

    return Number(result) > Number(process.env.RATE_LIMIT_MAX);
}
