import database from "../../database/db.js";
import ISupplier from "../../interfaces/collections/supplier.js";

export async function getSupplierByName(name: string) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        return await suppliers.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
