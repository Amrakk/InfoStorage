import { WebSocketServer } from "ws";
import cors from "cors";
import express from "express";
import cache from "./database/cache.js";
import database from "./database/db.js";
import cookieParser from "cookie-parser";
import { createContext } from "./trpc.js";
import { appRouter } from "./routers/appRouter.js";
import logger from "./middlewares/logger/logger.js";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

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

const wss = new WebSocketServer({ server });

const handler = applyWSSHandler({
    wss: wss, // Use the existing wss instance
    router: appRouter,
    createContext,
});

wss.on("connection", (ws) => {
    console.log(`Got a connection ${wss.clients.size}`);
    wss.once("close", () => {
        console.log(`Closed connection ${wss.clients.size}`);
    });
    ws.on("message", (message) => {
        console.log(message);
    });
});

process.on("SIGINT", () => {
    console.log("Got SIGTERM");
    handler.broadcastReconnectNotification();
    wss.close();
});
