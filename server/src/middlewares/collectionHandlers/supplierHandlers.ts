import database from "../../database/db.js";
import { TAddressFilter } from "../filterHandlers/address.js";
import ISupplier from "../../interfaces/collections/supplier.js";

export async function getSuppliersFromDB(filter?: TAddressFilter) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        if (filter) return await suppliers.find(filter).toArray();
        return await suppliers.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getSupplierByName(name: string) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        return await suppliers.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
