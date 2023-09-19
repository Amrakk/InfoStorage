import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../trpc.js";
import {
    getUnitsInfo,
    searchUnitCode,
} from "../../middlewares/utils/addressHandlers.js";

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const getProvinces = employeeProcedure.query(async () => {
    const data = await getUnitsInfo("province");

    if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

    return data;
});

export const getDistricts = employeeProcedure
    .input(z.object({ provCode: z.number() }))
    .query(async ({ input }) => {
        const { provCode } = input;

        const data = await getUnitsInfo("district", provCode);
        if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

        return data;
    });

export const getWards = employeeProcedure
    .input(z.object({ distCode: z.number() }))
    .query(async ({ input }) => {
        const { distCode } = input;

        const data = await getUnitsInfo("ward", distCode);
        if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

        return data;
    });

export const getUnitCode = employeeProcedure
    .input(
        z.object({
            name: z.string(),
            type: z.enum(["province", "district", "ward"]),
        })
    )
    .query(async ({ input }) => {
        const { name, type } = input;

        const data = await searchUnitCode(name, type);
        if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

        return data;
    });
