import database from "../../database/db.js";
import IProduct from "../../interfaces/collections/product.js";

export async function getProductByName(name: string) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        return await products.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
