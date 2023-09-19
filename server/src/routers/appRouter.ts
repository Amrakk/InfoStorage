import { router } from "../trpc.js";
import { authRouter } from "./authRouter.js";
import { serviceRouter } from "./serviceRouter.js";
import { taxRouter } from "./collectionRouters/taxRouter.js";
import { userRouter } from "./collectionRouters/userRouter.js";
import { productRouter } from "./collectionRouters/productRouter.js";
import { customerRouter } from "./collectionRouters/customerRouter.js";
import { supplierRouter } from "./collectionRouters/supplierRouter.js";
import { shippingRouter } from "./collectionRouters/shippingRouter.js";

export const appRouter = router({
    tax: taxRouter,
    auth: authRouter,
    user: userRouter,
    service: serviceRouter,
    product: productRouter,
    customer: customerRouter,
    shipping: shippingRouter,
    supplier: supplierRouter,
});
