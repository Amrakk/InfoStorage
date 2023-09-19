import { CollectionNames } from "../../configs/default.js";

interface IImporLog {
    userID: string;
    date: string;
    collection: CollectionNames;
    importedData: string[];
}

export default IImporLog;
