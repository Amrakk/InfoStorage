import database from "../database/db.js";
import IImporLog from "../interfaces/collections/importLogs.js";
import { CollectionNames } from "../configs/default.js";

export async function saveImportLog(
    userID: string,
    importedData: string[],
    collection: CollectionNames
) {
    try {
        const db = database.getDB();
        const importLogs = db.collection<IImporLog>("importLogs");

        const timestamp = new Date();
        const date = new Date(
            timestamp.getTime() + 7 * 60 * 60 * 1000
        ).toLocaleString("en-US", {
            timeZone: "UTC",
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const log: IImporLog = {
            userID,
            date,
            collection,
            importedData,
        };

        const result = await importLogs.insertOne(log);
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
