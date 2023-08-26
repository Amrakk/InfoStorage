import { signin } from "./v1/auth/signin.js";
import { signup } from "./v1/auth/signup.js";
import { signout } from "./v1/auth/signout.js";

export const auth = { signin, signout, signup };
