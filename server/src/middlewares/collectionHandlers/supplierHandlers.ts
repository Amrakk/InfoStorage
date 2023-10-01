import database from "../../database/db.js";
import { TAddressFilter } from "../filterHandlers/address.js";
import ISupplier from "../../interfaces/collections/supplier.js";

export async function getSuppliersFromDB(filter?: TAddressFilter) {
    const db = database.getDB();
    const suppliers = db.collection<ISupplier>("suppliers");

    if (filter) return await suppliers.find(filter).toArray();
    return await suppliers.find().toArray();
}

export async function getSupplierByName(name: string) {
    if (!name) return null;
    const db = database.getDB();
    const suppliers = db.collection<ISupplier>("suppliers");

    return await suppliers.findOne({ name });
}
