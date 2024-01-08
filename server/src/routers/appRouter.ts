import { router, wssProcedure } from "../trpc.js";
import { authRouter } from "./authRouter.js";
import { serviceRouter } from "./serviceRouter.js";
import { taxRouter } from "./collectionRouters/taxRouter.js";
import { userRouter } from "./collectionRouters/userRouter.js";
import { productRouter } from "./collectionRouters/productRouter.js";
import { customerRouter } from "./collectionRouters/customerRouter.js";
import { supplierRouter } from "./collectionRouters/supplierRouter.js";
import { shippingRouter } from "./collectionRouters/shippingRouter.js";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

import z from "zod";
const eventEmitter = new EventEmitter().setMaxListeners(10000000000);
var int: NodeJS.Timeout;
export const appRouter = router({
    tax: taxRouter,
    auth: authRouter,
    user: userRouter,
    service: serviceRouter,
    product: productRouter,
    customer: customerRouter,
    shipping: shippingRouter,
    supplier: supplierRouter,

    wssRouter: router({
        onWss: wssProcedure.subscription(() => {
            return observable<number>((emit) => {
                eventEmitter.on("subscribe", (num) => {
                    int = setInterval(() => {
                        var n = Math.random() + num;
                        console.log(n);
                        emit.next(n);
                    }, 1500);
                });

                return () => {
                    console.log("Unsubscribed");
                    eventEmitter.removeAllListeners("subscribe");

                    clearInterval(int);
                };
            });
        }),

        wss: wssProcedure.input(z.object({ num: z.number() })).query((ctx) => {
            console.log(ctx.input.num);
            eventEmitter.emit("subscribe", ctx.input.num);
            return { message: "Subscribed" };
        }),

        offWss: wssProcedure.query(() => {
            clearInterval(int);

            return { message: "off" };
        }),
    }),
});
