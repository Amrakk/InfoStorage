import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../../trpc.js";
import {
    IUnit,
    IProvincesApiRes,
} from "../../../interfaces/provincesApiRes.js";

const apiUrl = process.env.PROVINCES_API_URL!;

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
});

export const getProvince = employeeProcedure.query(async () => {
    const provinces = await getProvincesInfo("province");

    return provinces;
});

export const getDistrict = employeeProcedure
    .input(z.object({ provinceCode: z.string() }))
    .query(async ({ input }) => {
        const { provinceCode } = input;

        const districts = await getProvincesInfo<{ districts: IUnit[] }>(
            "district",
            provinceCode
        );

        return districts;
    });

export const getWard = employeeProcedure
    .input(z.object({ districtCode: z.string() }))
    .query(async ({ input }) => {
        const { districtCode } = input;

        const wards = await getProvincesInfo<{ wards: IUnit[] }>(
            "ward",
            districtCode
        );

        return wards;
    });

async function getProvincesInfo(
    type: "province"
): Promise<IProvincesApiRes[] | "INTERNAL_SERVER_ERROR">;
async function getProvincesInfo<T>(
    type: "district" | "ward",
    code: string
): Promise<IProvincesApiRes<T>[] | "INTERNAL_SERVER_ERROR">;
async function getProvincesInfo<T>(
    type: unknown,
    code?: unknown
): Promise<IProvincesApiRes<T>[] | "INTERNAL_SERVER_ERROR"> {
    try {
        let query = "";
        if (type === "province") query = "/p";
        else if (type === "district") query = `/p/${code}?depth=2`;
        else if (type === "ward") query = `/d/${code}?depth=2`;

        const provinces = await fetch(apiUrl + query).then(async (res) => {
            if (!res.ok) throw internalErr;
            return (await res.json()) as IProvincesApiRes<T>[];
        });

        return provinces;
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
