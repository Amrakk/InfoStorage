import { UserRoles } from "../../configs/default.js";

interface IUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRoles;
}

export default IUser;
