interface IUser {
    name: string;
    email: string;
    password: string;
    roles: string[];
    isActivated: boolean;
}

export default IUser;
