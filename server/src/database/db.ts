import { MongoClient, Db } from "mongodb";

const url =

    process.env.ENV === "development"
        ? process.env.DEV_DB_URL!
        : process.env.PROD_DB_URL!;


const client = new MongoClient(url);
let db: Db | null = null;

const init = async () => {
  try {
    await client.connect();
    db = client.db("InfoStorage");

    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
};

const close = async () => {
  try {
    await client.close();
    console.log("Database disconnected");
  } catch (err) {
    console.log(err);
  }
};

const getDB = () => {
  if (!db) throw new Error("Database not initialized");
  return db;
};

export default { init, close, getDB };
