import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import {
    addressFilter,
    addressFilterShema,
} from "../../../middlewares/filterHandlers/address.js";
import { getShippingsFromDB } from "../../../middlewares/collectionHandlers/shippingHandlers.js";

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

export const getShippings = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        if (provCode)
            filter = await addressFilter({ provCode, distCode, wardCode });

        if (typeof filter === "string") throw internalErr;

        const shippings = await getShippingsFromDB(filter);
        if (shippings === "INTERNAL_SERVER_ERROR") throw internalErr;

        return shippings;
    });
