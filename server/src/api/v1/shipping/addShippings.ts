import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { shippingRegex } from "../../../configs/regex.js";
import { CollectionNames } from "../../../configs/default.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { contextRules } from "../../../middlewares/mailHandlers/settings.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { exportDataViaMail } from "../../../middlewares/mailHandlers/sendDataViaMail.js";
import { getShippingByName } from "../../../middlewares/collectionHandlers/shippingHandlers.js";
import {
    generateExcelFile,
    generateExcelSheet,
} from "../../../middlewares/excelHandlers/excelGenerators.js";

type TFailedEntry = IShipping & { error: string };

const inputSchema = z.array(
    z.object({
        name: z.string().regex(shippingRegex.name),
        address: z.string().regex(shippingRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
        phone: z.string().regex(shippingRegex.phone),
        note: z.string().regex(shippingRegex.note),
    })
);

export const addShippings = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
        const shippings = input;
        const failedEntries: TFailedEntry[] = [];

        try {
            if (shippings.length === 0)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No shipping to add",
                });
            else if (shippings.length === 1) {
                const { provCode, distCode, wardCode, ...data } = shippings[0];
                if (!provCode || !distCode || !wardCode)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Missing address info",
                    });

                const ward = await getUnitName(wardCode, "ward");
                const district = await getUnitName(distCode, "district");
                const province = await getUnitName(provCode, "province");
                data.address = `${data.address}, ${ward}, ${district}, ${province}`;

                const result = await insertShipping(data);
                if (result instanceof TRPCError) throw result;
                if (typeof result === "string") throw new Error(result);
            } else {
                const successEntries: string[] = [];
                for (const shipping of shippings) {
                    const { provCode, distCode, wardCode, ...data } = shipping;
                    const result = await insertShipping(data);
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
                    CollectionNames.Shippings
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

            return { message: "Add shippings successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function insertShipping(shipping: IShipping) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        const isNameExist = await getShippingByName(shipping.name);
        if (isNameExist)
            return new TRPCError({
                code: "BAD_REQUEST",
                message: "Shipping already exist",
            });

        const result = await shippings.insertOne(shipping);
        return result.acknowledged
            ? result.insertedId
            : "Failed while inserting shippings";
    } catch (err) {
        return getErrorMessage(err);
    }
}

async function sendFailedEntries(failedEntries: TFailedEntry[], email: string) {
    const sheet = await generateExcelSheet(
        CollectionNames.Shippings,
        failedEntries
    );
    const workbook = generateExcelFile([sheet]);
    const text = `Dear user,\n\nYou have requested to add shippings to InfoStorage.\nHowever, some entries are failed to add.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const mailInfo = {
        to: [email],
        text,
        data: workbook,
    };
    await exportDataViaMail(mailInfo, contextRules.failedEntries);
}
