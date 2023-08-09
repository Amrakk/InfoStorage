import database from "../db.js";
import { ObjectId } from "mongodb";
import IUser from "../../interfaces/collections/user.js";

const db = database.getDB();
const users = db.collection<IUser>("users");

const insertUser = async (user: IUser) => {
    try {
        const result = await users.insertOne(user);
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const deleteUser = async (id: string) => {
    try {
        const result = await users.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const updateUser = async (id: string, user: IUser) => {
    try {
        const result = await users.updateOne(
            { _id: new ObjectId(id) },
            { $set: user }
        );
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getUsers = async (property: keyof IUser | "_id", value: string) => {
    let query = {};

    if (property === "_id") query = { _id: new ObjectId(value) };
    else if (property === "roles") query = { roles: { $in: [value] } };
    else query = { [property]: { $regex: value } };

    try {
        const records = await users.find(query).toArray();
        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const usersCollection = {
    getUsers,
    insertUser,
    updateUser,
    deleteUser,
};
