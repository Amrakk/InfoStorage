import ITax from "../../interfaces/collections/tax.js";
import database from "../db.js";

const db = database.getDB();

const tax = db.collection<ITax>("tax");

export default tax;
