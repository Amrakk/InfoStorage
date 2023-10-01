import XLSX from "xlsx";
import { settings } from "./settings.js";
import { CollectionNames } from "../../configs/default.js";
import { getDataFromDB } from "../collectionHandlers/dataHandlers.js";
import {
    TErrCollections,
    TIDCollections,
} from "../../interfaces/collections/index.js";

export type TSheet = {
    name: string;
    worksheet: XLSX.WorkSheet;
};

export function generateExcelFile(sheets: TSheet[]) {
    const wb = XLSX.utils.book_new();

    for (const sheet of sheets)
        XLSX.utils.book_append_sheet(wb, sheet.worksheet, sheet.name);

    const buffer = XLSX.write(wb, { type: "buffer" }) as Buffer;
    return buffer;
}

export async function generateExcelSheet(
    collection: CollectionNames,
    data?: TIDCollections[] | TErrCollections[]
) {
    const { headers, colsWidth } = settings[collection];

    if (!data) data = await getDataFromDB(collection);
    const dataArray = data.map(({ _id, ...item }) => Object.values(item));

    if ("error" in data[0]) {
        headers.push("Nguyên nhân");
        colsWidth.push(200);
    }

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataArray]);

    worksheet["!cols"] = colsWidth.map((width) => ({ wpx: width }));

    return { worksheet, name: collection } as TSheet;
}
