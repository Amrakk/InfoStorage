import { pong, notify, onConnect } from "../api/v1/sockets/mainSocket.js";
import { router } from "../trpc.js";

export const wssRouter = router({
    /**
     * @name pong
     * Use by client to pong
     */
    pong,

    /**
     * @name notify
     * Use by client to notify
     */
    notify,

    /**
     * @name onConnect
     * Use by client to connect
     */
    onConnect,
});
