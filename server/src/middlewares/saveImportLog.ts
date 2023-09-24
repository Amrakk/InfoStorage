import database from "../database/db.js";
import { CollectionNames } from "../configs/default.js";
import { getCurrentTime } from "./utils/getCurrentTime.js";
import IImporLog from "../interfaces/collections/importLogs.js";
import { getErrorMessage } from "./errorHandlers.ts/getErrorMessage.js";

export async function saveImportLog(
    userID: string,
    importedData: string[],
    collection: CollectionNames
) {
    const db = database.getDB();
    const importLogs = db.collection<IImporLog>("importLogs");
    const date = getCurrentTime();

    const log: IImporLog = {
        userID,
        date,
        collection,
        importedData,
    };

    const result = await importLogs.insertOne(log);
    return result.acknowledged ? true : "Failed while saving import log";
}
