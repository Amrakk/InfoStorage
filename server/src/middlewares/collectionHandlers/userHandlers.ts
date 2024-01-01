import { ObjectId } from "mongodb";
import database from "../../database/db.js";
import IUser from "../../interfaces/collections/user.js";

export type TRoleFilter = { role: { $regex: string } };

export async function getUsersFromDB(filter?: TRoleFilter) {
    const db = database.getDB();
    const users = db.collection<IUser>("users");

    if (filter) return await users.find(filter).toArray();
    return await users.find().toArray();
}

export async function getUserByID(id: string) {
    if (!id) return null;
    const db = database.getDB();
    const users = db.collection<IUser>("users");

    return await users.findOne({ _id: new ObjectId(id) });
}

export async function getUserByEmail(email: string) {
    if (!email) return null;
    const db = database.getDB();
    const users = db.collection<IUser>("users");

    return await users.findOne({ email });
}
