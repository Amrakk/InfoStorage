import { signin } from "./v1/auth/signin.js";
import { signout } from "./v1/auth/signout.js";
export const auth = { signin, signout };

import { addUser } from "./v1/user/admin.addUser.js";
import { getUsers } from "./v1/user/admin.getUsers.js";
export const user = { addUser, getUsers };
