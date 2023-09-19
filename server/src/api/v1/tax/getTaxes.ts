import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import {
    addressFilter,
    addressFilterShema,
} from "../../../middlewares/filterHandlers/address.js";
import { getTaxesFromDB } from "../../../middlewares/collectionHandlers/taxHandlers.js";

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

export const getTaxes = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const taxes = await getTaxesFromDB(filter);
        if (taxes === "INTERNAL_SERVER_ERROR") throw internalErr;

        return taxes;
    });
