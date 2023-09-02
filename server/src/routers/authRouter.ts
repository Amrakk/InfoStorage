import { router } from "../trpc.js";
import { signin } from "../api/v1/auth/signin.js";
import { signout } from "../api/v1/auth/signout.js";

export const authRouter = router({
    signin,
    signout,
});
