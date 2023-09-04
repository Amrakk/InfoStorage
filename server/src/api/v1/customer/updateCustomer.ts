import { z } from "zod";
import { ObjectId } from "mongodb";
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
    id: z.string(),
    name: z.string().regex(customerRegex.name),
    address: z.string().regex(customerRegex.address),
    phone: z.string().regex(customerRegex.phone),
    placer: z.string().regex(customerRegex.placer),
    email: z.string().email().nullable(),
    curator: z.string().regex(customerRegex.curator),
    note: z.string().regex(customerRegex.note).nullable(),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const updateCustomer = employeeProcedure
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
        if (
            isNameExist?._id !== new ObjectId(customer.id) ||
            isEmailExist?._id !== new ObjectId(customer.id)
        )
            throw new TRPCError({
                code: "CONFLICT",
                message: "Customer already exists",
            });

        const result = await updateCustomerInfo(customer.id, customer);
        if (!result) throw internalErr;

        return { message: "Update successfully" };
    });

async function updateCustomerInfo(id: string, customer: ICustomer) {
    try {
        const db = database.getDB();
        const customers = db.collection<ICustomer>("customers");

        const result = await customers.updateOne(
            { _id: new ObjectId(id) },
            { $set: customer }
        );

        return result.acknowledged;
    } catch (err) {
        return false;
    }
}
