import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../trpc.js";
import {
    getProvincesInfo,
    searchProvinceInfo,
} from "../../middlewares/addressHandler.js";

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const getProvinces = employeeProcedure.query(async () => {
    const data = await getProvincesInfo("province");

    if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

    return data;
});

export const getDistricts = employeeProcedure
    .input(z.object({ provinceCode: z.number() }))
    .query(async ({ input }) => {
        const { provinceCode } = input;

        const data = await getProvincesInfo("district", provinceCode);
        if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

        return data;
    });

export const getWards = employeeProcedure
    .input(z.object({ districtCode: z.number() }))
    .query(async ({ input }) => {
        const { districtCode } = input;

        const data = await getProvincesInfo("ward", districtCode);
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

        const data = await searchProvinceInfo(name, type);
        if (data === "INTERNAL_SERVER_ERROR") throw internalErr;

        return data;
    });
