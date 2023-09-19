import { router } from "../trpc.js";
import { signin } from "../api/v1/auth/signin.js";
import { signout } from "../api/v1/auth/signout.js";

export const authRouter = router({
    /**
     * @name signin
     * Use by client to signin
     */
    signin,

    /**
     * @name signout
     * Use by verified user to signout
     */
    signout,
});
