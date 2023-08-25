import { ObjectId } from "mongodb";

interface ITokenPayload {
    id: ObjectId;
    iat: number;
    exp: number;
}

export default ITokenPayload;
