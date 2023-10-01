import { Redis } from "ioredis";

const url = process.env.REDIS_URL!;
const redis = new Redis(url, { lazyConnect: true });

const init = async () => {
    try {
        await redis.connect();
        setInterval(() => {
            redis.ping();
        }, 1000 * 60 * 5);

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
