import { z } from "zod";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import { productRegex } from "../../../configs/regex.js";
import IProduct from "../../../interfaces/collections/product.js";
import { saveImportLog } from "../../../middlewares/saveImportLog.js";
import { contextRules } from "../../../middlewares/mailHandlers/settings.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import { exportDataViaMail } from "../../../middlewares/mailHandlers/sendDataViaMail.js";
import { getProductByName } from "../../../middlewares/collectionHandlers/productHandlers.js";
import {
    CollectionNames,
    ProductCategories,
} from "../../../configs/default.js";
import {
    generateExcelFile,
    generateExcelSheet,
} from "../../../middlewares/excelHandlers/excelGenerators.js";

type TFailedEntry = IProduct & { error: string };

const inputSchema = z.array(
    z.object({
        name: z.string().regex(productRegex.name),
        category: z.nativeEnum(ProductCategories),
        quantity: z.number().int().positive(),
        price: z.number().int().positive(),
        suppliers: z.array(z.string()),
    })
);

export const addProducts = employeeProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
        const products = input;
        const failedEntries: TFailedEntry[] = [];

        try {
            if (products.length === 0)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No product to add",
                });
            else if (products.length === 1) {
                const result = await insertProduct(products[0]);
                if (result instanceof TRPCError) throw result;
                if (typeof result === "string") throw new Error(result);
            } else {
                const successEntries: string[] = [];
                for (const product of products) {
                    const result = await insertProduct(product);
                    if (result instanceof ObjectId)
                        successEntries.push(result.toString());
                    else if (typeof result === "string")
                        failedEntries.push({ ...product, error: result });
                    else if (result instanceof TRPCError)
                        failedEntries.push({
                            ...product,
                            error: result.message,
                        });
                }

                const userID = ctx.user._id.toString();
                const result = await saveImportLog(
                    userID,
                    successEntries,
                    CollectionNames.Products
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

            return { message: "Add products successfully!" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

async function insertProduct(product: IProduct) {
    try {
        const db = database.getDB();
        const products = db.collection<IProduct>("products");

        const isNameExist = await getProductByName(product.name);
        if (isNameExist)
            return new TRPCError({
                code: "CONFLICT",
                message: "Product already exist",
            });

        const isDuplicate = product.suppliers.some((supplier, index) => {
            return product.suppliers.indexOf(supplier) !== index;
        });
        if (isDuplicate)
            return new TRPCError({
                code: "CONFLICT",
                message: "Duplicate suppliers",
            });

        const result = await products.insertOne(product);
        return result.acknowledged
            ? result.insertedId
            : "Failed while inserting products";
    } catch (err) {
        return getErrorMessage(err);
    }
}

async function sendFailedEntries(failedEntries: TFailedEntry[], email: string) {
    const sheet = await generateExcelSheet(
        CollectionNames.Products,
        failedEntries
    );
    const workbook = generateExcelFile([sheet]);
    const text = `Dear user,\n\nYou have requested to add products to InfoStorage.\nHowever, some entries are failed to add.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

    const mailInfo = {
        to: [email],
        text,
        data: workbook,
    };
    await exportDataViaMail(mailInfo, contextRules.failedEntries);
}
