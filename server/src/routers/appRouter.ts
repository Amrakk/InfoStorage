import { taxRouter } from "./taxRouter.js";
import { authRouter } from "./authRouter.js";
import { userRouter } from "./userRouter.js";
import { productRouter } from "./productRouter.js";
import { serviceRouter } from "./serviceRouter.js";
import { customerRouter } from "./customerRouter.js";
import { supplierRouter } from "./supplierRouter.js";
import { shippingRouter } from "./shippingRouter.js";
import { router, publicProcedure } from "../trpc.js";

export const appRouter = router({
    troll: publicProcedure.query(() => "troll"),

    tax: taxRouter,
    auth: authRouter,
    user: userRouter,
    service: serviceRouter,
    product: productRouter,
    customer: customerRouter,
    shipping: shippingRouter,
    supplier: supplierRouter,
});
