import database from "../db.js";
import { ObjectId } from "mongodb";
import IShipping from "../../interfaces/collections/shipping.js";

const db = database.getDB();
const shippings = db.collection<IShipping>("shippings");

const insertShipping = async (shipping: IShipping) => {
    try {
        const result = await shippings.insertOne(shipping);
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const deleteShipping = async (id: string) => {
    try {
        const result = await shippings.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const updateShipping = async (id: string, shipping: IShipping) => {
    try {
        const result = await shippings.updateOne(
            { _id: new ObjectId(id) },
            { $set: shipping }
        );
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getShippings = async (
    property: keyof IShipping | "_id",
    value: string
) => {
    let query = {};

    if (property === "_id") query = { _id: new ObjectId(value) };
    else query = { [property]: { $regex: value } };

    try {
        const records = await shippings.find(query).toArray();
        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const shippingsCollection = {
    getShippings,
    insertShipping,
    updateShipping,
    deleteShipping,
};
