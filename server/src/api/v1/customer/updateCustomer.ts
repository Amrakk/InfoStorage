import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { customerRegex } from "../../../configs/regex.js";
import ICustomer from "../../../interfaces/collections/customer.js";
import { getUnitName } from "../../../middlewares/utils/addressHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
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

export const updateCustomer = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
        const { provCode, distCode, wardCode, id, ...customer } = input;

        try {
            const isNameExist = await getCustomerByName(customer.name);
            const isEmailExist = await getCustomerByEmail(customer.email);
            if (
                (isNameExist && isNameExist._id.toString() !== id) ||
                (isEmailExist && isEmailExist._id.toString() !== id)
            )
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Customer already exists",
                });

            const ward = await getUnitName(wardCode, "ward");
            const district = await getUnitName(distCode, "district");
            const province = await getUnitName(provCode, "province");
            customer.address = `${customer.address}, ${ward}, ${district}, ${province}`;

            const result = await updateCustomerInfo(id, customer);
            if (typeof result === "string") throw new Error(result);

            return { message: "Update customer successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function updateCustomerInfo(id: string, customer: ICustomer) {
    const db = database.getDB();
    const customers = db.collection<ICustomer>("customers");

    const result = await customers.updateOne(
        { _id: new ObjectId(id) },
        { $set: customer }
    );

    return result.acknowledged ? true : "Failed while updating customer";
}
