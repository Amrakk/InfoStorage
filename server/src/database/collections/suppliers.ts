import ISupplier from "../../interfaces/collections/supplier.js";
import database from "../db.js";

const db = database.getDB();

const suppliers = db.collection<ISupplier>("suppliers");

export default suppliers;
