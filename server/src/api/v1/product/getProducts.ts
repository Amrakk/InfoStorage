import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import { ProductCategories } from "../../../configs/default.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";
import { getProductsFromDB } from "../../../middlewares/collectionHandlers/productHandlers.js";

const categoryFilterShema = z.object({
    category: z.nativeEnum(ProductCategories),
});

const filterSchema = z.object({
    filter: categoryFilterShema.optional(),
});

export const getProducts = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { category } = input?.filter ?? {};

        let categoryFilter = undefined;
        if (category) categoryFilter = { category: { $regex: category } };

        try {
            const products = await getProductsFromDB(categoryFilter);
            return products;
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
