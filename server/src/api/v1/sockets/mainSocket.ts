import z from "zod";
import { ee } from "../../../socket.js";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { wssProcedure, managerWssProcedure } from "../../../trpc.js";
import { removeUser } from "../../../middlewares/userStatusHandlers.js";
import { banIp } from "../../../middlewares/collectionHandlers/bannedIPsHandlers.js";

import type { ObjectId } from "mongodb";

export type TWsResponse = { type: "ping" | "pong" | "notification"; data: any };

// ping, pong, notification
export const onConnect = wssProcedure.subscription(({ ctx }) => {
    return observable<TWsResponse>((emit) => {
        const ws = ctx.res;
        const _id = ctx.user._id;
        var counter = 0;

        const ping = async () => {
            if (counter == 3) {
                await removeUser(_id.toString());
                emit.complete();
            }

            emit.next({ type: "ping", data: ee.listenerCount("ping") });
            counter++;
        };

        const pong = async (id: ObjectId) => {
            if (!_id.equals(id)) {
                await banIp(ctx.req.socket.remoteAddress as string);
                emit.error(new TRPCError({ code: "UNAUTHORIZED" }));
            }

            counter = 0;
        };

        const notify = (msg: string) => {
            emit.next({ type: "notification", data: msg });
        };

        ee.on("notify", notify);
        ee.on("ping", ping);
        ee.on(`pong_${_id.toHexString()}`, pong);

        return () => {
            ee.off("notify", notify);
            ee.off("ping", ping);
            ee.off(`pong_${_id.toHexString()}`, pong);

            ws.terminate();
        };
    });
});

export const pong = wssProcedure.query(({ ctx }) => {
    const id = ctx.user._id;
    if (!id)
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid Id",
        });

    ee.emit(`pong_${id.toHexString()}`, id);
    return { status: "success", message: "Pong" };
});

export const notify = managerWssProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
        const { message } = input;
        ee.emit("notify", message);
        return { status: "success", message: "Notification sent" };
    });
