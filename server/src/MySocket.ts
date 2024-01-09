import { Server } from "http";
import { WebSocketServer } from "ws";
import { AppRouter } from "./server.js";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

export class MySocketServer {
    wss: WebSocketServer;
    path: string;

    constructor(
        server: Server,
        path: string,
        appRouter: AppRouter,
        createContext: any
    ) {
        this.path = path;
        this.wss = new WebSocketServer({ server, path });

        const handler = applyWSSHandler({
            wss: this.wss,
            router: appRouter,
            createContext,
        });

        process.on("SIGINT", () => {
            console.log("Got SIGTERM signal on path: " + this.path);
            handler.broadcastReconnectNotification();
            this.wss.close();
        });
    }

    run() {
        this.wss.on("connection", (ws) => {
            console.log(`Got a connection ${this.wss.clients.size}`);
            this.wss.once("close", () => {
                console.log(`Closed connection ${this.wss.clients.size}`);
            });
            ws.on("message", (message) => {
                console.log(message.toString());
            });
        });

        console.log("WebSocketServer is running on path: " + this.path);
    }
}
