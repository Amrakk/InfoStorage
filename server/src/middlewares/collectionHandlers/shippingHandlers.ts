import database from "../../database/db.js";
import IShipping from "../../interfaces/collections/shipping.js";

export async function getShippingByName(name: string) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        return await shippings.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
