import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../trpc.js";
import { getErrorMessage } from "../../middlewares/errorHandlers/getErrorMessage.js";
import {
    getUnitsInfo,
    searchUnitCode,
} from "../../middlewares/utils/addressHandlers.js";

export const getProvinces = employeeProcedure.query(async () => {
    try {
        const data = await getUnitsInfo("province");
        return data;
    } catch (err) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(err),
        });
    }
});

export const getDistricts = employeeProcedure
    .input(z.object({ provCode: z.number() }))
    .query(async ({ input }) => {
        const { provCode } = input;

        try {
            const data = await getUnitsInfo("district", provCode);
            return data;
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });

export const getWards = employeeProcedure
    .input(z.object({ distCode: z.number() }))
    .query(async ({ input }) => {
        const { distCode } = input;

        try {
            const data = await getUnitsInfo("ward", distCode);
            return data;
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
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

        try {
            const data = await searchUnitCode(name, type);
            return data;
        } catch (err) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
