import cors from "cors";
import express from "express";
import cache from "./database/cache.js";
import database from "./database/db.js";
import cookieParser from "cookie-parser";
import { createContext } from "./trpc.js";
import { MySocketServer } from "./MySocket.js";
import { appRouter } from "./routers/appRouter.js";
import logger from "./middlewares/logger/logger.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { Server } from "http";

const app = express();

app.use(
    cors({
        origin: [process.env.DEV_URL!, process.env.PROD_URL!],
        credentials: true,
    })
);

app.use(logger);
app.use(cookieParser());
app.use(express.json());
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));

const server = app.listen(process.env.PORT, async () => {
    await cache.init();
    await database.init();
    console.log(`Server listening on port ${process.env.PORT}`);
});

app.on("close", async () => {
    await cache.close();
    await database.close();
    console.log("Server closed");
});

export type AppRouter = typeof appRouter;

const wss = new MySocketServer(
    express().listen(3001),
    "/wss",
    appRouter,
    createContext
);
wss.run();

const wss2 = new MySocketServer(
    express().listen(3002),
    "/wss2",
    appRouter,
    createContext
);
wss2.run();
