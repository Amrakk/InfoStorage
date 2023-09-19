import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import { ProductCategories } from "../../../configs/default.js";
import {
    getProductsFromDB,
    TCategoryFilter,
} from "../../../middlewares/collectionHandlers/productHandlers.js";

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

        let categoryFilter: TCategoryFilter | undefined = undefined;
        if (category) categoryFilter = { category: { $regex: category } };

        const products = await getProductsFromDB(categoryFilter);
        if (products === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return products;
    });
