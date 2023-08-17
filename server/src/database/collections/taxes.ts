import database from "../db.js";
import { ObjectId } from "mongodb";
import ITax from "../../interfaces/collections/tax.js";

const db = database.getDB();
const taxes = db.collection<ITax>("taxes");

const insertTax = async (tax: ITax) => {
    try {
        const result = await taxes.insertOne(tax);
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const deleteTax = async (id: string) => {
    try {
        const result = await taxes.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const updateTax = async (id: string, tax: ITax) => {
    try {
        const result = await taxes.updateOne(
            { _id: new ObjectId(id) },
            { $set: tax }
        );
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getTaxes = async (property: keyof ITax | "_id", value: string) => {
    let query = {};

    if (property === "_id") query = { _id: new ObjectId(value) };
    else if (property === "participants") query = { participants: value };
    else query = { [property]: { $regex: value } };

    try {
        const records = await taxes.find(query).toArray();
        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const taxesCollection = {
    getTaxes,
    insertTax,
    updateTax,
    deleteTax,
};
