interface IAccPayload {
    name: string;
    role: string;
    iat: number;
    exp: number;
}

interface IRefPayload {
    id: string;
    iat: number;
    exp: number;
}

export { IAccPayload, IRefPayload };
