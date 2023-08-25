import { Redis } from "ioredis";

const url = process.env.REDIS_URL as string;
const redis = new Redis(url, { lazyConnect: true });

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
    if (redis.status === "connect") throw new Error("Cache not initialized");
    return redis;
};

export default { init, close, getCache };
