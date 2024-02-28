import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { taxRegex } from "../../../configs/regex.js";
import { employeeProcedure } from "../../../trpc.js";
import ITax from "../../../interfaces/collections/tax.js";
import { CollectionNames } from "../../../configs/default.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import { contextRules } from "../../../middlewares/mailHandlers/settings.js";
import { getAddressInfo } from "../../../middlewares/utils/addressHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { exportDataViaMail } from "../../../middlewares/mailHandlers/sendDataViaMail.js";
import {
    getTaxByName,
    getTaxByEmail,
    getTaxByTaxCode,
} from "../../../middlewares/collectionHandlers/taxHandlers.js";
import {
    generateExcelFile,
    generateExcelSheet,
} from "../../../middlewares/excelHandlers/excelGenerators.js";

type TFailedEntry = ITax & { error: string };

const inputSchema = z.array(
    z.object({
        name: z.string().regex(taxRegex.name),
        taxCode: z.string().regex(taxRegex.taxCode),
        address: z.string().regex(taxRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
        representative: z.string().regex(taxRegex.representative),
        phone: z.string().regex(taxRegex.phone),
        email: z.string().email(),
        participants: z.array(z.string()),
    })
);

export const addTaxes = employeeProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
    const taxes = input;
    const failedEntries: TFailedEntry[] = [];

    try {
        if (taxes.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No supplier to add",
            });
        else if (taxes.length === 1) {
            const { provCode, distCode, wardCode, ...data } = taxes[0];
            data.address = (await getAddressInfo(data.address, provCode, distCode, wardCode)) ?? "";
            if (data.address === "")
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Missing address info",
                });

            const result = await insertTax(data);
            if (result instanceof TRPCError) throw result;
            if (typeof result === "string") throw new Error(result);
        } else {
            const successEntries: string[] = [];
            for (const tax of taxes) {
                const { provCode, distCode, wardCode, ...data } = tax;
                data.address =
                    (await getAddressInfo(data.address, provCode, distCode, wardCode)) ?? "";
                if (data.address === "") {
                    failedEntries.push({
                        ...data,
                        error: "Invalid address",
                    });
                    continue;
                }
                const result = await insertTax(data);
                if (result instanceof ObjectId) successEntries.push(result.toString());
                else if (typeof result === "string") failedEntries.push({ ...data, error: result });
                else if (result instanceof TRPCError)
                    failedEntries.push({ ...data, error: result.message });
            }

            const userID = ctx.user._id.toString();
            const result = await saveImportLog(userID, successEntries, CollectionNames.Taxes).catch(
                (err) => getErrorMessage(err)
            );
            if (typeof result === "string") console.error(result);
        }

        if (failedEntries.length > 0) {
            const result = await sendFailedEntries(failedEntries, ctx.user.email).catch((err) =>
                getErrorMessage(err)
            );
            if (typeof result === "string") console.error(result);
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries: failedEntries.length,
            };
        }

        return { message: "Add taxes successfully!" };
    } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(err),
        });
    }
});

async function insertTax(tax: ITax) {
    try {
        const db = database.getDB();
        const taxes = db.collection<ITax>("taxes");

        const isNameExist = await getTaxByName(tax.name);
        const isEmailExist = await getTaxByEmail(tax.email);
        const isTaxCodeExist = await getTaxByTaxCode(tax.taxCode);
        if (isNameExist || isEmailExist || isTaxCodeExist)
            return new TRPCError({
                code: "CONFLICT",
                message: "Tax already exist",
            });

        const result = await taxes.insertOne(tax);
        return result.acknowledged ? result.insertedId : "Failed while inserting taxes";
    } catch (err) {
        return getErrorMessage(err);
    }
}

async function sendFailedEntries(failedEntries: TFailedEntry[], email: string) {
    const sheet = await generateExcelSheet(CollectionNames.Taxes, failedEntries);
    const workbook = generateExcelFile([sheet]);
    const html = `Dear user,\n\nYou have requested to add taxes to InfoStorage.\nHowever, some entries are failed to add.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const mailInfo = {
        to: [email],
        subject: "InfoStorage - Failed entries",
        html,
        data: workbook,
    };
    await exportDataViaMail(mailInfo, contextRules.failedEntries);
}
