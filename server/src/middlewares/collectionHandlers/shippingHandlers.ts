import database from "../../database/db.js";
import { TAddressFilter } from "../filterHandlers/address.js";
import IShipping from "../../interfaces/collections/shipping.js";

export async function getShippingsFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        if (filter) return await shippings.find(filter).toArray();
        return await shippings.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getShippingByName(name: string) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        return await shippings.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
