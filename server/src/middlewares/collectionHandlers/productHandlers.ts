import database from "../../database/db.js";
import IProduct from "../../interfaces/collections/product.js";

export type TCategoryFilter = { category: { $regex: string } };

export async function getProductsFromDB(filter?: TCategoryFilter) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        if (filter) return await products.find(filter).toArray();
        return await products.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}

export async function getProductByName(name: string) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        return await products.findOne({ name });
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
