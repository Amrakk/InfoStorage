import database from "../db.js";
import { ObjectId } from "mongodb";
import IProduct from "../../interfaces/collections/product.js";

const db = database.getDB();
const products = db.collection<IProduct>("products");

const insertProduct = async (product: IProduct) => {
    try {
        const result = await products.insertOne(product);
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const deleteProduct = async (id: string) => {
    try {
        const result = await products.deleteOne({ _id: new ObjectId(id) });
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const updateProduct = async (id: string, product: IProduct) => {
    try {
        const result = await products.updateOne(
            { _id: new ObjectId(id) },
            { $set: product }
        );
        return result.acknowledged;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getProducts = async (property: keyof IProduct | "_id", value: string) => {
    let query = {};

    if (property === "_id") query = { _id: new ObjectId(value) };
    else if (property === "name") query = { [property]: { $regex: value } };
    else query = { [property]: value };

    try {
        const records = await products.find(query).toArray();
        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const productsCollection = {
    getProducts,
    insertProduct,
    deleteProduct,
    updateProduct,
};

export default products;
