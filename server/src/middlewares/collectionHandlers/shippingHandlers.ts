import database from "../../database/db.js";
import { TAddressFilter } from "../filterHandlers/address.js";
import IShipping from "../../interfaces/collections/shipping.js";

export async function getShippingsFromDB(filter?: TAddressFilter) {
    const db = database.getDB();
    const shippings = db.collection<IShipping>("shippings");

    if (filter) return await shippings.find(filter).toArray();
    return await shippings.find().toArray();
}

export async function getShippingByName(name: string) {
    if (!name) return null;
    const db = database.getDB();
    const shippings = db.collection<IShipping>("shippings");

    return await shippings.findOne({ name });
}
