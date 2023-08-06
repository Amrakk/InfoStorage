import IUser from "../../interfaces/collections/user.js";
import database from "../db.js";

const db = database.getDB();

const users = db.collection<IUser>("users");

export default users;
