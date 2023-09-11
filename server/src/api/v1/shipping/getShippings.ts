import { z } from "zod";
import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { employeeProcedure } from "../../../trpc.js";
import IShipping from "../../../interfaces/collections/shipping.js";
import { getUnitName } from "../../../middlewares/addressHandlers.js";

const addressFilterShema = z.object({
    provCode: z.number(),
    distCode: z.number().optional(),
    wardCode: z.number().optional(),
});

const filterSchema = z.object({
    filter: addressFilterShema.optional(),
});

type TFilter = z.infer<typeof filterSchema>;

export const getShippings = employeeProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
        const { provCode, distCode, wardCode } = input?.filter ?? {};
        const shippings = await getShippingsFromDB();

        if (shippings === "INTERNAL_SERVER_ERROR")
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return shippings;
    });

async function getShippingsFromDB(filter?: TFilter) {
    try {
        const db = database.getDB();
        const shippings = db.collection<IShipping>("shippings");

        return await shippings.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
