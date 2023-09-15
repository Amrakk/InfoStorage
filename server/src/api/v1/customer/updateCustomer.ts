import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { customerRegex } from "../../../configs/regex.js";
import ICustomer from "../../../interfaces/collections/customer.js";
import { getUnitName } from "../../../middlewares/addressHandlers.js";
import {
    getCustomerByName,
    getCustomerByEmail,
} from "../../../middlewares/collectionHandlers/customerHandlers.js";

const inputSchema = z.object({
    id: z.string(),
    name: z.string().regex(customerRegex.name),
    address: z.string().regex(customerRegex.address),
    provCode: z.number().int().positive(),
    distCode: z.number().int().positive(),
    wardCode: z.number().int().positive(),
    phone: z.string().regex(customerRegex.phone),
    placer: z.string().regex(customerRegex.placer),
    email: z.string().email(),
    curator: z.string().regex(customerRegex.curator),
    note: z.string().regex(customerRegex.note),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
});

export const updateCustomer = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provCode, distCode, wardCode, id, ...customer } = input;

        const isNameExist = await getCustomerByName(customer.name);
        const isEmailExist = await getCustomerByEmail(customer.email);
        if (
            isNameExist === "INTERNAL_SERVER_ERROR" ||
            isEmailExist === "INTERNAL_SERVER_ERROR"
        )
            throw internalErr;
        if (
            (isNameExist && isNameExist._id.toString() !== id) ||
            (isEmailExist && isEmailExist._id.toString() !== id)
        )
            throw new TRPCError({
                code: "CONFLICT",
                message: "Customer already exists",
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

        customer.address = `${customer.address}, ${ward}, ${district}, ${province}`;

        const result = await updateCustomerInfo(id, customer);
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
