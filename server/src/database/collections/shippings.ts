import IShipping from "../../interfaces/collections/shipping.js";
import database from "../db.js";

const db = database.getDB();

const shippings = db.collection<IShipping>("shippings");

export default shippings;
