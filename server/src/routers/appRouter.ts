import { router, publicProcedure } from "../trpc.js";
import { authRouter } from "./authRouter.js";

export const appRouter = router({
    troll: publicProcedure.query(() => "troll"),

    auth: authRouter,
});
