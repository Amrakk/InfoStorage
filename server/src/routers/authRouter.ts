import { router } from "../trpc.js";
import { auth } from "../api/index.js";

export const authRouter = router({
    signin: auth.signin,
    signup: auth.signup,
    signout: auth.signout,
});
