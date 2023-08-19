import { authRouter } from "./authRouter.js";
import { router, publicProcedure } from "../trpc.js";

export const appRouter = router({
    troll: publicProcedure.query(() => "troll"),

    auth: authRouter,
});
