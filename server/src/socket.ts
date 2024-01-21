import { WebSocketServer } from "ws";
import { EventEmitter } from "events";

import { TRPCError, getTRPCErrorFromUnknown } from "@trpc/server";
import type { Server } from "http";
import { verifyCookies } from "./middlewares/verify.js";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import { verifyUser } from "./middlewares/userStatusHandlers.js";

export const ee = new EventEmitter();

const HEARTBEAT_INTERVAL = 1000 * 5;
const VERIFY_INTERVAL = 1000 * 5;

ee.setMaxListeners(30);

export const wssConfigure = (server: Server) => {
    const wss = new WebSocketServer({ server, path: "/trpc/wss" });

    var pingInt = setInterval(() => {
        ee.emit("ping");
    }, HEARTBEAT_INTERVAL);

    wss.on("connection", (ws, req) => {
        console.log(`➕➕ Connection (${wss.clients.size})`);

        var verifyInt = setInterval(async () => {
            try {
                await verifyCookies(req, ws);
            } catch (err) {
                const errRes = handleErrorResponse(err);
                ws.send(JSON.stringify(errRes));
                ws.terminate();
            }
        }, VERIFY_INTERVAL);

        ws.once("close", () => {
            clearInterval(verifyInt);
            console.log(`➖➖ Connection (${wss.clients.size})`);
        });
    });

    wss.on("close", () => {
        clearInterval(pingInt);
        console.log("Server closed");
    });

    return wss;
};

function handleErrorResponse(err: unknown) {
    const trpcError = getTRPCErrorFromUnknown(err);

    if (trpcError.code == "INTERNAL_SERVER_ERROR") {
        console.log(err);
        trpcError.message = "Internal Server Error";
    }

    return {
        id: 0,
        error: {
            message: trpcError.message,
            code: TRPC_ERROR_CODES_BY_KEY[trpcError.code],
            data: {
                code: trpcError.code,
                httpStatus: getHTTPStatusCodeFromError(trpcError),
                path: "",
            },
        },
    };
}
