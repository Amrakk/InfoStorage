import { ObjectId } from "mongodb";
import database from "../../database/db.js";
import { CollectionNames } from "../../configs/default.js";
import * as Collections from "../../interfaces/collections/index.js";

export async function getDataFromDB(
    type: CollectionNames
): Promise<Collections.TIDCollections[]>;
export async function getDataFromDB(
    type: CollectionNames,
    dataIDs: string[]
): Promise<Collections.TIDCollections[]>;
export async function getDataFromDB(
    type: CollectionNames,
    dataIDs?: string[]
): Promise<Collections.TIDCollections[]> {
    const db = database.getDB();

    let filter = {};
    let ids: ObjectId[] = [];
    if (dataIDs) {
        ids = dataIDs.map((id) => new ObjectId(id));
        filter = { _id: { $in: ids } };
    }

    if (type === "Taxes")
        return await db
            .collection<Collections.ITax>("taxes")
            .find(filter)
            .toArray();
    if (type === "Users")
        return await db
            .collection<Collections.IUser>("users")
            .find(filter)
            .toArray();
    if (type === "Products")
        return await db
            .collection<Collections.IProduct>("products")
            .find(filter)
            .toArray();
    if (type === "Customers")
        return await db
            .collection<Collections.ICustomer>("customers")
            .find(filter)
            .toArray();
    if (type === "Shippings")
        return await db
            .collection<Collections.IShipping>("shippings")
            .find(filter)
            .toArray();
    if (type === "Suppliers")
        return await db
            .collection<Collections.ISupplier>("suppliers")
            .find(filter)
            .toArray();
    throw new Error("Invalid type");
}
