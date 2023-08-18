interface IUserToken {
    id: string;
    permissions: string[];
    iat: number;
    exp: number;
}

export default IUserToken;
