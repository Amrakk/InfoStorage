import { router } from "../trpc.js";
import { signin } from "../api/v1/auth/signin.js";

export const authRouter = router({
    signin: signin,
});