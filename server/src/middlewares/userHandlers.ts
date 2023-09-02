import { ObjectId } from "mongodb";
import database from "../database/db.js";
import IUser from "../interfaces/collections/user.js";

export async function getUserByEmail(email: string) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.findOne({ email });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
export async function getUserByID(id: string) {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return await users.findOne({ _id: new ObjectId(id) });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
