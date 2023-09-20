import { router } from "../trpc.js";
import { user } from "../api/index.js";

export const userRouter = router({
    addUser: user.addUser,
    getUsers: user.getUsers,
});
