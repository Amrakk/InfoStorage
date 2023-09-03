import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { customerRegex } from "../../../configs/regex.js";
import ICustomer from "../../../interfaces/collections/customer.js";
import {
    getCustomerByName,
    getCustomerByEmail,
} from "../../../middlewares/collectionHandlers/customerHandlers.js";

const inputSchema = z.object({
    name: z.string().regex(customerRegex.name),
    address: z.string().regex(customerRegex.address),
    phone: z.string().regex(customerRegex.phone),
    placer: z.string().regex(customerRegex.placer),
    email: z.string().regex(customerRegex.email).nullable(),
    curator: z.string().regex(customerRegex.curator),
    note: z.string().regex(customerRegex.note).nullable(),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const addCustomer = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { ...customer } = input;

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

        const result = await insertCustomer(customer);
        if (!result) throw internalErr;

        return { message: "Add successfully" };
    });

async function insertCustomer(customer: ICustomer) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        const result = await customers.insertOne(customer);
        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
