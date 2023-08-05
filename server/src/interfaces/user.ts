interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string[];
    isActivated: boolean;
}

export default IUser;
