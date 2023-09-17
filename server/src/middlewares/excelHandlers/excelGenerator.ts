import XLSX from "xlsx";
import { settings } from "./settings.js";
import { CollectionNames } from "../../configs/default.js";
import { getDataFromDB } from "../collectionHandlers/dataHandlers.js";
import { TCollections } from "../../interfaces/collections/collections.js";

type TSheet = {
    name: string;
    worksheet: XLSX.WorkSheet;
};

export async function generateExcelFile(sheets: TSheet[]) {
    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
        XLSX.utils.book_append_sheet(wb, sheet.worksheet, sheet.name);
    });

    const buffer = XLSX.write(wb, { type: "buffer" }) as Buffer;
    return buffer;
}

export async function generateExcelSheet(
    collection: CollectionNames,
    data?: TCollections[]
): Promise<TSheet> {
    const { headers, colsWidth } = settings[collection];
    if (!data) data = await getDataFromDB(collection);

    const dataArray = data.map(({ _id, ...item }) => Object.values(item));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataArray]);

    worksheet["!cols"] = colsWidth.map((width) => ({ wpx: width }));

    return { worksheet, name: collection };
}
