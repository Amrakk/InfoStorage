import cors from "cors";
import express from "express";
import cache from "./database/cache.js";
import database from "./database/db.js";
import { createContext } from "./trpc.js";
import cookieParser from "cookie-parser";
import { appRouter } from "./routers/appRouter.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const app = express();

app.use(
    cors({
        origin: [process.env.DEV_URL as string, process.env.PROD_URL as string],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));

app.listen(process.env.PORT, async () => {
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
