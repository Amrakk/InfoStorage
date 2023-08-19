interface IUserToken {
    name: string;
    permissions: string[];
    iat: number;
    exp: number;
}

export default IUserToken;
