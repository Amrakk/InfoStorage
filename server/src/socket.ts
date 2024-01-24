import { EventEmitter } from "events";
import { WebSocketServer } from "ws";
import limiter from "./middlewares/rateLimiter/rateLimitHandlers.js";

import type { Server } from "http";

export const ee = new EventEmitter();

const HEARTBEAT_INTERVAL = 1000 * 5;

ee.setMaxListeners(30);

export const wssConfigure = (server: Server) => {
    const wss = new WebSocketServer({ server, path: "/trpc/wss" });

    var pingInt = setInterval(() => {
        ee.emit("ping");
    }, HEARTBEAT_INTERVAL);

    wss.on("connection", async (ws, req) => {
        await limiter(req, ws, undefined);

        const cookies = req.headers.cookie?.split("; ");
        const userId = cookies
            ?.find((c) => c.startsWith("userId"))
            ?.split("=")[1];
        if (!userId) return ws.terminate();

        console.log(`➕➕ Connection (${wss.clients.size})`);

        let timeoutId: NodeJS.Timeout;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);

            let temp = setTimeout(() => {
                if (temp != timeoutId) return;

                ws.terminate();
                console.log(
                    `➖➖ Connection closed due to inactivity (${timeoutId})`
                );
            }, 1000 * 20);

            timeoutId = temp;
        };

        ws.on("message", (msg) => {
            resetTimeout();
        });

        ws.once("close", async () => {
            clearTimeout(timeoutId);
            console.log(`➖➖ Connection (${wss.clients.size})`);
        });

        resetTimeout();
    });

    wss.on("close", () => {
        clearInterval(pingInt);
        console.log("Server closed");
    });

    return wss;
};
