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
        wss: wssProcedure.subscription(() => {
            return observable<string>((emit) => {
                console.log("Subscribing");
                eventEmitter.on("message", () => {
                    console.log("Subscribed");
                    return "Subscribed";
                });

                return () => {
                    eventEmitter.off("message", () => {
                        console.log("Unsubscribed");
                        return "Unsubscribed";
                    });
                };
            });
        }),
    }),
});
