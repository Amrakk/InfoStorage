import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import {
    addressFilter,
    addressFilterShema,
} from "../../../middlewares/filterHandlers/address.js";
import { getSuppliersFromDB } from "../../../middlewares/collectionHandlers/supplierHandlers.js";

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

export const getSuppliers = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const suppliers = await getSuppliersFromDB(filter);
        if (suppliers === "INTERNAL_SERVER_ERROR") throw internalErr;

        return suppliers;
    });
