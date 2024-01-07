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

const eventEmitter = new EventEmitter().setMaxListeners(10000000000);

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
                var int: NodeJS.Timeout;
                eventEmitter.on("subscribe", () => {
                    int = setInterval(() => {
                        var n = Math.random();
                        console.log(n);
                        emit.next(n);
                    }, 2000);
                });
                int = setInterval(() => {
                    var n = Math.random();
                    console.log(n);
                    emit.next(n);
                }, 2000);

                // eventEmitter.emit("subscribe");

                return () => {
                    console.log("Unsubscribed");
                    eventEmitter.removeAllListeners("subscribe");
                    clearInterval(int);
                };
            });
        }),

        wss: wssProcedure.query(() => {
            eventEmitter.emit("subscribe");
            return { message: "Subscribed" };
        }),
    }),
});
