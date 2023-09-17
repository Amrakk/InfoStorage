import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { customerRegex } from "../../../configs/regex.js";
import { CollectionNames } from "../../../configs/default.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import ICustomer from "../../../interfaces/collections/customer.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import {
    getCustomerByName,
    getCustomerByEmail,
} from "../../../middlewares/collectionHandlers/customerHandlers.js";

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

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addCustomers = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
        const customers = input;

        const failedEntries: (ICustomer & { error: string })[] = [];
        if (customers.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No customer to add",
            });
        else if (customers.length === 1) {
            const { provCode, distCode, wardCode, ...data } = customers[0];
            if (!provCode || !distCode || !wardCode)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Missing address info",
                });

            const province = await getUnitName(provCode, "province");
            const district = await getUnitName(distCode, "district");
            const ward = await getUnitName(wardCode, "ward");
            if (
                province === "INTERNAL_SERVER_ERROR" ||
                district === "INTERNAL_SERVER_ERROR" ||
                ward === "INTERNAL_SERVER_ERROR"
            )
                throw internalErr;

            data.address = `${data.address}, ${ward}, ${district}, ${province}`;

            const result = await insertCustomer(data);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            const successEntries: string[] = [];
            for (const customer of customers) {
                const { provCode, distCode, wardCode, ...data } = customer;
                const result = await insertCustomer(data);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...data, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...data, error: result });
                if (result instanceof ObjectId)
                    successEntries.push(result.toString());
            }

            const userID = ctx.user._id.toString();
            const result = await saveImportLog(
                userID,
                successEntries,
                CollectionNames.Customers
            );

            if (result === "INTERNAL_SERVER_ERROR") {
                // TODO: log error
            }
        }

        if (failedEntries.length > 0)
            return {
                message: "Partial success: Review and fix failed entries.",
                failedEntries,
            };
        else return { message: "Add customers successfully!" };
    });

async function insertCustomer(customer: ICustomer) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        const isNameExist = await getCustomerByName(customer.name);
        const isEmailExist = await getCustomerByEmail(customer.email);
        if (
            isNameExist === "INTERNAL_SERVER_ERROR" ||
            isEmailExist === "INTERNAL_SERVER_ERROR"
        )
            throw internalErr;
        if (isNameExist || isEmailExist)
            throw new TRPCError({
                code: "CONFLICT",
                message: "Customer already exist",
            });

        const result = await customers.insertOne(customer);
        return result.acknowledged
            ? result.insertedId
            : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
