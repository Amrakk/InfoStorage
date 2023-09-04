import { router } from "../../trpc.js";
import { addUser } from "../../api/v1/user/admin.addUser.js";
import { getUsers } from "../../api/v1/user/admin.getUsers.js";
import { updateUser } from "../../api/v1/user/admin.updateUser.js";
import { deleteUser } from "../../api/v1/user/admin.deleteUser.js";
import { resetPassword } from "../../api/v1/user/profile.resetPassword.js";

export const userRouter = router({
    addUser,
    getUsers,
    updateUser,
    deleteUser,

    resetPassword,
});
