import database from "../../database/db.js";
import ITax from "../../interfaces/collections/tax.js";

export async function getTaxByName(name: string) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        return await taxes.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getTaxByTaxCode(taxCode: string) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        return await taxes.findOne({ taxCode });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getTaxByEmail(email: string) {
    if (email === "") return null;
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        return await taxes.findOne({ email });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
