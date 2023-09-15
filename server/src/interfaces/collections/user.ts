interface IUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "admin" | "manager" | "employee";
}

export default IUser;
