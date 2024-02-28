import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { customerRegex } from "../../../configs/regex.js";
import { CollectionNames } from "../../../configs/default.js";
import ICustomer from "../../../interfaces/collections/customer.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import { contextRules } from "../../../middlewares/mailHandlers/settings.js";
import { getAddressInfo } from "../../../middlewares/utils/addressHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { exportDataViaMail } from "../../../middlewares/mailHandlers/sendDataViaMail.js";
import {
    getCustomerByName,
    getCustomerByEmail,
} from "../../../middlewares/collectionHandlers/customerHandlers.js";
import {
    generateExcelFile,
    generateExcelSheet,
} from "../../../middlewares/excelHandlers/excelGenerators.js";

type TFailedEntry = ICustomer & { error: string };

const inputSchema = z.array(
    z.object({
        name: z.string().regex(customerRegex.name),
        address: z.string().regex(customerRegex.address),
        provCode: z.number().int().positive().optional(),
        distCode: z.number().int().positive().optional(),
        wardCode: z.number().int().positive().optional(),
        phone: z.string().regex(customerRegex.phone),
        placer: z.string().regex(customerRegex.placer),
        email: z.string().email(),
        curator: z.string().regex(customerRegex.curator),
        note: z.string().regex(customerRegex.note),
    })
);

export const addCustomers = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
        const customers = input;
        const failedEntries: TFailedEntry[] = [];

        try {
            if (customers.length === 0)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No customer to add",
                });
            else if (customers.length === 1) {
                const { provCode, distCode, wardCode, ...data } = customers[0];
                data.address =
                    (await getAddressInfo(data.address, provCode, distCode, wardCode)) ?? "";
                if (data.address === "")
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Missing address info",
                    });

                const result = await insertCustomer(data);
                if (result instanceof TRPCError) throw result;
                if (typeof result === "string") throw new Error(result);
            } else {
                const successEntries: string[] = [];
                for (const customer of customers) {
                    const { provCode, distCode, wardCode, ...data } = customer;
                    data.address =
                        (await getAddressInfo(data.address, provCode, distCode, wardCode)) ?? "";
                    if (data.address === "") {
                        failedEntries.push({
                            ...data,
                            error: "Invalid address",
                        });
                        continue;
                    }

                    const result = await insertCustomer(data);
                    if (result instanceof ObjectId) successEntries.push(result.toString());
                    else if (typeof result === "string")
                        failedEntries.push({ ...data, error: result });
                    else if (result instanceof TRPCError)
                        failedEntries.push({ ...data, error: result.message });
                }

                const userID = ctx.user._id.toString();
                const result = await saveImportLog(
                    userID,
                    successEntries,
                    CollectionNames.Customers
                ).catch((err) => getErrorMessage(err));

                if (typeof result === "string") console.error(result);
            }

            if (failedEntries.length > 0) {
                const result = await sendFailedEntries(failedEntries, ctx.user.email).catch((err) =>
                    getErrorMessage(err)
                );

                if (typeof result == "string") console.error(result);
                return {
                    message: "Partial success: Review and fix failed entries.",
                    failedEntries: failedEntries.length,
                };
            }

            return { message: "Add customers successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function insertCustomer(customer: ICustomer) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        const isNameExist = await getCustomerByName(customer.name);
        const isEmailExist = await getCustomerByEmail(customer.email);
        if (isNameExist || isEmailExist)
            return new TRPCError({
                code: "CONFLICT",
                message: "Customer already exist",
            });

        const result = await customers.insertOne(customer);
        return result.acknowledged ? result.insertedId : "Failed while inserting customers";
    } catch (err) {
        return getErrorMessage(err);
    }
}

async function sendFailedEntries(failedEntries: TFailedEntry[], email: string) {
    const sheet = await generateExcelSheet(CollectionNames.Customers, failedEntries);
    const workbook = generateExcelFile([sheet]);
    const html = `Dear user,\n\nYou have requested to add customers to InfoStorage.\nHowever, some entries are failed to add.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const mailInfo = {
        to: [email],
        subject: "InfoStorage - Failed entries",
        html,
        data: workbook,
    };
    await exportDataViaMail(mailInfo, contextRules.failedEntries);
}
