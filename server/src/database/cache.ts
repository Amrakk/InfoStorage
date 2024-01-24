import { Redis } from "ioredis";

const url =
    process.env.ENV === "development"
        ? process.env.REDIS_URL!
        : process.env.REDIS_PRIVATE_URL!;
const redis = new Redis(url, { lazyConnect: true, enableAutoPipelining: true });

const init = async () => {
    try {
        await redis.connect();
        console.log("Cache connected");
    } catch (err) {
        console.log(err);
    }
};

const close = async () => {
    try {
        await redis.quit();
        console.log("Cache disconnected");
    } catch (err) {
        console.log(err);
    }
};

const getCache = () => {
    if (redis.status !== "ready") throw new Error("Cache not initialized");
    return redis;
};

export default { init, close, getCache };
