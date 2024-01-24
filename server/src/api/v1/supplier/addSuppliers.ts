import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { supplierRegex } from "../../../configs/regex.js";
import { CollectionNames } from "../../../configs/default.js";
import ISupplier from "../../../interfaces/collections/supplier.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { contextRules } from "../../../middlewares/mailHandlers/settings.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { exportDataViaMail } from "../../../middlewares/mailHandlers/sendDataViaMail.js";
import { getSupplierByName } from "../../../middlewares/collectionHandlers/supplierHandlers.js";
import {
    generateExcelFile,
    generateExcelSheet,
} from "../../../middlewares/excelHandlers/excelGenerators.js";

type TFailedEntry = ISupplier & { error: string };

const inputSchema = z.array(
    z.object({
        name: z.string().regex(supplierRegex.name),
        address: z.string().regex(supplierRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
        contact: z.string().regex(supplierRegex.contact),
        phone: z.string().regex(supplierRegex.phone),
        note: z.string().regex(supplierRegex.note),
    })
);

export const addSuppliers = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
        const suppliers = input;
        const failedEntries: TFailedEntry[] = [];

        try {
            if (suppliers.length === 0)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No supplier to add",
                });
            else if (suppliers.length === 1) {
                const { provCode, distCode, wardCode, ...data } = suppliers[0];
                if (!provCode || !distCode || !wardCode)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Missing address info",
                    });

                const ward = await getUnitName(wardCode, "ward");
                const district = await getUnitName(distCode, "district");
                const province = await getUnitName(provCode, "province");
                data.address = `${data.address}, ${ward}, ${district}, ${province}`;

                const result = await insertSupplier(data);
                if (result instanceof TRPCError) throw result;
                if (typeof result === "string") throw new Error(result);
            } else {
                const successEntries: string[] = [];
                for (const supplier of suppliers) {
                    const { provCode, distCode, wardCode, ...data } = supplier;
                    const result = await insertSupplier(data);
                    if (result instanceof ObjectId)
                        successEntries.push(result.toString());
                    else if (typeof result === "string")
                        failedEntries.push({ ...data, error: result });
                    else if (result instanceof TRPCError)
                        failedEntries.push({ ...data, error: result.message });
                }

                const userID = ctx.user._id.toString();
                const result = await saveImportLog(
                    userID,
                    successEntries,
                    CollectionNames.Suppliers
                ).catch((err) => getErrorMessage(err));
                if (typeof result === "string") console.error(result);
            }

            if (failedEntries.length > 0) {
                const result = await sendFailedEntries(
                    failedEntries,
                    ctx.user.email
                ).catch((err) => getErrorMessage(err));
                if (typeof result === "string") console.error(result);
                return {
                    message: "Partial success: Review and fix failed entries.",
                };
            }

            return { message: "Add suppliers successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function insertSupplier(supplier: ISupplier) {
    try {
        const db = database.getDB();
        const suppliers = db.collection<ISupplier>("suppliers");

        const isNameExist = await getSupplierByName(supplier.name);
        if (isNameExist)
            return new TRPCError({
                code: "CONFLICT",
                message: "Supplier already exist",
            });

        const result = await suppliers.insertOne(supplier);
        return result.acknowledged
            ? result.insertedId
            : "Failed while inserting suppliers";
    } catch (err) {
        return getErrorMessage(err);
    }
}

async function sendFailedEntries(failedEntries: TFailedEntry[], email: string) {
    const sheet = await generateExcelSheet(
        CollectionNames.Suppliers,
        failedEntries
    );
    const workbook = generateExcelFile([sheet]);
    const html = `Dear user,\n\nYou have requested to add suppliers to InfoStorage.\nHowever, some entries are failed to add.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const mailInfo = {
        to: [email],
        subject: "InfoStorage - Failed entries",
        html,
        data: workbook,
    };
    await exportDataViaMail(mailInfo, contextRules.failedEntries);
}
