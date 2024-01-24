import cors from "cors";
import express from "express";
import cache from "./database/cache.js";
import database from "./database/db.js";
import cookieParser from "cookie-parser";
import { createContext } from "./trpc.js";
import { wssConfigure } from "./socket.js";
import { appRouter } from "./routers/appRouter.js";
import logger from "./middlewares/logger/logger.js";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import limiter from "./middlewares/rateLimiter/rateLimitHandlers.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const app = express();

app.use(
    cors({
        origin: [process.env.DEV_URL!, process.env.PROD_URL!],
        credentials: true,
    })
);

await cache.init();
await database.init();

// HTTP only
app.use(limiter);

app.use(logger);
app.use(cookieParser());
app.use(express.json());
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));

const server = app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});

app.on("close", async () => {
    await cache.close();
    await database.close();
    console.log("Server closed");
});

export type AppRouter = typeof appRouter;

const wss = wssConfigure(server);

applyWSSHandler({
    wss,
    createContext,
    router: appRouter.wss,
});

process.on("SIGINT", () => {
    console.log("Got SIGTERM signal");
    wss.close();
});
