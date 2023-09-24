import database from "../../database/db.js";
import ITax from "../../interfaces/collections/tax.js";
import { TAddressFilter } from "../filterHandlers/address.js";

export async function getTaxesFromDB(filter?: TAddressFilter) {
    const db = database.getDB();
    const taxes = db.collection<ITax>("taxes");

    if (filter) return await taxes.find(filter).toArray();
    return await taxes.find().toArray();
}

export async function getTaxByName(name: string) {
    if (!name) return null;
    const db = database.getDB();
    const taxes = db.collection<ITax>("taxes");

    return await taxes.findOne({ name });
}

export async function getTaxByTaxCode(taxCode: string) {
    if (!taxCode) return null;
    const db = database.getDB();
    const taxes = db.collection<ITax>("taxes");

    return await taxes.findOne({ taxCode });
}

export async function getTaxByEmail(email: string) {
    if (!email) return null;
    const db = database.getDB();
    const taxes = db.collection<ITax>("taxes");

    return await taxes.findOne({ email });
}
