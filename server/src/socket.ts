import { WebSocketServer } from "ws";
import { EventEmitter } from "events";
import { getTRPCErrorFromUnknown } from "@trpc/server";
import { verifyCookies } from "./middlewares/verify.js";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

import type { Server } from "http";

export const ee = new EventEmitter();

const HEARTBEAT_INTERVAL = 1000 * 5;

ee.setMaxListeners(30);

export const wssConfigure = (server: Server) => {
    const wss = new WebSocketServer({ server, path: "/trpc/wss" });

    var pingInt = setInterval(() => {
        ee.emit("ping");
    }, HEARTBEAT_INTERVAL);

    wss.on("connection", (ws, req) => {
        console.log(`➕➕ Connection (${wss.clients.size})`);

        let timeoutId: NodeJS.Timeout;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                ws.terminate();
                console.log(
                    `➖➖ Connection closed due to inactivity (${timeoutId})`
                );
            }, 1000 * 20);
        };

        ws.on("message", (msg) => {
            resetTimeout();
        });

        ws.once("close", () => {
            console.log(`➖➖ Connection (${wss.clients.size})`);
        });
    });

    wss.on("close", () => {
        clearInterval(pingInt);
        console.log("Server closed");
    });

    return wss;
};

// function handleErrorResponse(err: unknown) {
//     const trpcError = getTRPCErrorFromUnknown(err);

//     if (trpcError.code == "INTERNAL_SERVER_ERROR") {
//         console.log(err);
//         trpcError.message = "Internal Server Error";
//     }

//     return {
//         id: 0,
//         error: {
//             message: trpcError.message,
//             code: TRPC_ERROR_CODES_BY_KEY[trpcError.code],
//             data: {
//                 code: trpcError.code,
//                 httpStatus: getHTTPStatusCodeFromError(trpcError),
//                 path: "",
//             },
//         },
//     };
// }
