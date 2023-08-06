import { t } from "../global.js";
import { authRouter } from "./authRouter.js";

export const appRouter = t.router({
    auth: authRouter,
});
