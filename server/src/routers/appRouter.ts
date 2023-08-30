import { authRouter } from "./authRouter.js";
import { userRouter } from "./userRouter.js";
import { shippingRouter } from "./shippingRouter.js";
import { router, publicProcedure } from "../trpc.js";

export const appRouter = router({
    troll: publicProcedure.query(() => "troll"),

    auth: authRouter,
    user: userRouter,
    shipping: shippingRouter,
});
