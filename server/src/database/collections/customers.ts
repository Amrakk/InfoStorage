import database from "../db.js";
import { ObjectId } from "mongodb";
import ICustomer from "../../interfaces/collections/customer.js";

const db = database.getDB();
const customers = db.collection<ICustomer>("customers");

const insertCustomers = async (customer: ICustomer) => {
    try {
        const result = await customers.insertOne(customer);
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const deleteCustomers = async (id: string) => {
    try {
        const result = await customers.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const updateCustomers = async (id: string, customer: ICustomer) => {
    try {
        const result = await customers.updateOne(
            { _id: new ObjectId(id) },
            { $set: customer }
        );
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getCustomers = async (
    property: keyof ICustomer | "_id",
    value: string
) => {
    let query = {};

    if (property === "_id") query = { _id: new ObjectId(value) };
    else if (property === "curator") query = { [property]: value };
    else query = { [property]: { $regex: value } };

    try {
        const records = await customers.find(query).toArray();
        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const customersCollection = {
    getCustomers,
    insertCustomers,
    updateCustomers,
    deleteCustomers,
};
