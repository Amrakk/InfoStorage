import XLSX from "xlsx";
import { CollectionNames } from "../../configs/default.js";
import { TCollections } from "../../interfaces/collections/collections.js";

export async function generateExcelFile(sheets: XLSX.WorkSheet[]) {
    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
        XLSX.utils.book_append_sheet(wb, sheet, sheet["!name"]);
    });

    const buffer = XLSX.write(wb, { type: "buffer" });
    return buffer;
}

export async function generateExcelSheet(
    collection: CollectionNames,
    data?: TCollections[]
): Promise<XLSX.WorkSheet> {
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    worksheet["!name"] = collection;

    return worksheet;
}
