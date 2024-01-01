import database from "../../database/db.js";
import { TAddressFilter } from "../filterHandlers/address.js";
import ICustomer from "../../interfaces/collections/customer.js";

export async function getCustomersFromDB(filter?: TAddressFilter) {
    const db = database.getDB();
    const customers = db.collection<ICustomer>("customers");

    if (filter) return await customers.find(filter).toArray();
    return await customers.find().toArray();
}

export async function getCustomerByName(name: string) {
    if (!name) return null;
    const db = database.getDB();
    const customers = db.collection<ICustomer>("customers");

    return await customers.findOne({ name });
}

export async function getCustomerByEmail(email: string) {
    if (!email) return null;
    const db = database.getDB();
    const customers = db.collection<ICustomer>("customers");

    return await customers.findOne({ email });
}
