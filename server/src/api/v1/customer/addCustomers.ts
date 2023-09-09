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
import { getProvinceInfo } from "../../../middlewares/addressHandlers.js";

const inputSchema = z.array(
    z.object({
        name: z.string().regex(customerRegex.name),
        address: z.string().regex(customerRegex.address),
        provinceCode: z.number().int().positive().nullish(),
        districtCode: z.number().int().positive().nullish(),
        wardCode: z.number().int().positive().nullish(),
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
    .mutation(async ({ input }) => {
        const { ...customers } = input;

        const failedEntries: (ICustomer & { error: string })[] = [];
        if (customers.length === 0)
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No customer to add",
            });
        else if (customers.length === 1) {
            const { provinceCode, districtCode, wardCode } = customers[0];
            if (!provinceCode || !districtCode || !wardCode)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Missing address info",
                });

            const province = await getProvinceInfo(provinceCode, "province");
            const district = await getProvinceInfo(districtCode, "district");
            const ward = await getProvinceInfo(wardCode, "ward");
            if (
                province === "INTERNAL_SERVER_ERROR" ||
                district === "INTERNAL_SERVER_ERROR" ||
                ward === "INTERNAL_SERVER_ERROR"
            )
                throw internalErr;

            customers[0].address = `${customers[0].address}, ${ward}, ${district}, ${province}`;

            const result = await insertCustomer(customers[0]);
            if (result instanceof TRPCError) throw result;
            if (result === "INTERNAL_SERVER_ERROR") throw internalErr;
        } else {
            for (const customer of customers) {
                const result = await insertCustomer(customer);
                if (result instanceof TRPCError)
                    failedEntries.push({ ...customer, error: result.message });
                if (result === "INTERNAL_SERVER_ERROR")
                    failedEntries.push({ ...customer, error: result });
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
        return result.acknowledged ? true : "INTERNAL_SERVER_ERROR";
    } catch (err) {
        if (err instanceof TRPCError) return err;
        return "INTERNAL_SERVER_ERROR";
    }
}
