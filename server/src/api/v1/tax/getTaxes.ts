import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import { getTaxesFromDB } from "../../../middlewares/collectionHandlers/taxHandlers.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers/getErrorMessage.js";
import {
    addressFilter,
    addressFilterShema,
} from "../../../middlewares/filterHandlers/address.js";

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

export const getTaxes = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        try {
            if (provCode)
                filter = await addressFilter({ provCode, distCode, wardCode });

            const taxes = await getTaxesFromDB(filter);
            return taxes;
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
