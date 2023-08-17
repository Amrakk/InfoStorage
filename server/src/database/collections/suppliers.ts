import database from "../db.js";
import { ObjectId } from "mongodb";
import ISupplier from "../../interfaces/collections/supplier.js";

const db = database.getDB();
const suppliers = db.collection<ISupplier>("suppliers");

const insertSupplier = async (supplier: ISupplier) => {
    try {
        const result = await suppliers.insertOne(supplier);
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const deleteSupplier = async (id: string) => {
    try {
        const result = await suppliers.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const updateSupplier = async (id: string, supplier: ISupplier) => {
    try {
        const result = await suppliers.updateOne(
            { _id: new ObjectId(id) },
            { $set: supplier }
        );
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getSuppliers = async (
    property: keyof ISupplier | "_id",
    value: string
) => {
    let query = {};

    if (property === "_id") query = { _id: new ObjectId(value) };
    else query = { [property]: { $regex: value } };

    try {
        const records = await suppliers.find(query).toArray();
        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const suppliersCollection = {
    getSuppliers,
    insertSupplier,
    updateSupplier,
    deleteSupplier,
};
