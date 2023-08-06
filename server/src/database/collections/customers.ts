import ICustomer from "../../interfaces/collections/customer.js";
import database from "../db.js";

const db = database.getDB();

const customers = db.collection<ICustomer>("customers");

export default customers;
