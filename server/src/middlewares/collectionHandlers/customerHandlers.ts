import database from "../../database/db.js";
import { TAddressFilter } from "../filterHandlers/address.js";
import ICustomer from "../../interfaces/collections/customer.js";

export async function getCustomersFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        if (filter) return await customers.find(filter).toArray();
        return await customers.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getCustomerByName(name: string) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        return await customers.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getCustomerByEmail(email: string) {
    if (email === "") return null;
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        return await customers.findOne({ email });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
