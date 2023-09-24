import { router } from "../../trpc.js";
import { addUsers } from "../../api/v1/user/admin.addUsers.js";
import { getUsers } from "../../api/v1/user/admin.getUsers.js";
import { updateUser } from "../../api/v1/user/admin.updateUser.js";
import { deleteUser } from "../../api/v1/user/admin.deleteUser.js";
import { changePassword } from "../../api/v1/user/profile.changePassword.js";

export const userRouter = router({
    /**
     * @name addUsers
     * Use by admin to add new users
     */
    addUsers,

    /**
     * @name getUsers
     * Use by admin to get all users
     */
    getUsers,

    /**
     * @name updateUser
     * Use by admin to update a user
     */
    updateUser,

    /**
     * @name deleteUser
     * Use by admin to delete a user
     */
    deleteUser,

    /**
     * @name changePassword
     * Use by user to change their password
     */
    changePassword,
});
