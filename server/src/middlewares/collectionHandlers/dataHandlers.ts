import { ObjectId } from "mongodb";
import database from "../../database/db.js";
import { CollectionNames } from "../../configs/default.js";
import * as Collections from "../../interfaces/collections/collections.js";

export async function getDataFromDB(
    type: CollectionNames
): Promise<Collections.TCollections[]> {
    const db = database.getDB();

    if (type === "Taxes")
        return await db.collection<Collections.ITax>("taxes").find().toArray();
    if (type === "Users")
        return await db.collection<Collections.IUser>("users").find().toArray();
    if (type === "Products")
        return await db
            .collection<Collections.IProduct>("products")
            .find()
            .toArray();
    if (type === "Customers")
        return await db
            .collection<Collections.ICustomer>("customers")
            .find()
            .toArray();
    if (type === "Shippings")
        return await db
            .collection<Collections.IShipping>("shippings")
            .find()
            .toArray();
    if (type === "Suppliers")
        return await db
            .collection<Collections.ISupplier>("suppliers")
            .find()
            .toArray();
    throw new Error("INVALID_TYPE");
}

export async function getDataByID(type: CollectionNames, dataIDs: string[]) {
    const db = database.getDB();
    const ids = dataIDs.map((id) => new ObjectId(id));

    if (type === "Taxes")
        return await db
            .collection<Collections.ITax>("taxes")
            .find({ _id: { $in: ids } })
            .toArray();
    if (type === "Users")
        return await db
            .collection<Collections.IUser>("users")
            .find({ _id: { $in: ids } })
            .toArray();
    if (type === "Products")
        return await db
            .collection<Collections.IProduct>("products")
            .find({ _id: { $in: ids } })
            .toArray();
    if (type === "Customers")
        return await db
            .collection<Collections.ICustomer>("customers")
            .find({ _id: { $in: ids } })
            .toArray();
    if (type === "Shippings")
        return await db
            .collection<Collections.IShipping>("shippings")
            .find({ _id: { $in: ids } })
            .toArray();
    if (type === "Suppliers")
        return await db
            .collection<Collections.ISupplier>("suppliers")
            .find({ _id: { $in: ids } })
            .toArray();
    throw new Error("INVALID_TYPE");
}
