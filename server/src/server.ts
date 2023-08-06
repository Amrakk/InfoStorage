import cors from "cors";
import express from "express";
import database from "./database/db.js";
import cookieParser from "cookie-parser";
import { appRouter } from "./routers/appRouter.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const app = express();

app.use(
    cors({
        origin: [process.env.DEV_URL ?? "", process.env.PROD_URL ?? ""],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use("/trpc", createExpressMiddleware({ router: appRouter }));

app.listen(process.env.PORT, async () => {
    await database.init();
    console.log(`Server listening on port ${process.env.PORT}`);
});

app.on("close", async () => {
    await database.close();
    console.log("Server closed");
});

export type AppRouter = typeof appRouter;
