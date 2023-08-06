import IProduct from "../../interfaces/collections/product.js";
import database from "../db.js";

const db = database.getDB();

const products = db.collection<IProduct>("products");

export default products;
