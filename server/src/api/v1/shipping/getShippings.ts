import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import { getErrorMessage } from "../../../middlewares/errorHandlers.ts/getErrorMessage.js";
import { getShippingsFromDB } from "../../../middlewares/collectionHandlers/shippingHandlers.js";
import {
    addressFilter,
    addressFilterShema,
} from "../../../middlewares/filterHandlers/address.js";

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

export const getShippings = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};

        let filter = undefined;
        try {
            if (provCode)
                filter = await addressFilter({ provCode, distCode, wardCode });

            const shippings = await getShippingsFromDB(filter);
            return shippings;
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
