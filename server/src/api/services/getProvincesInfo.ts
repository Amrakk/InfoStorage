import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { employeeProcedure } from "../../trpc.js";
import IUnit from "../../interfaces/provincesApiRes.js";

const apiUrl = process.env.PROVINCES_API_URL!;

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

async function getProvincesInfo(
    type: "province"
): Promise<IUnit[] | "INTERNAL_SERVER_ERROR">;
async function getProvincesInfo(
    type: "district" | "ward",
    code: number
): Promise<IUnit[] | "INTERNAL_SERVER_ERROR">;
async function getProvincesInfo(
    type: unknown,
    code?: unknown
): Promise<IUnit[] | "INTERNAL_SERVER_ERROR"> {
    try {
        type TRes = { districts: IUnit[] } | { wards: IUnit[] } | IUnit[];

        let query = "";
        if (type === "province") query = "/p";
        else if (type === "district") query = `/p/${code}?depth=2`;
        else if (type === "ward") query = `/d/${code}?depth=2`;
        else throw new Error("Invalid type");

        const data = await fetch(apiUrl + query).then<TRes>(async (res) => {
            if (!res.ok) throw new Error("Provinces API error");
            return await res.json();
        });

        let retval: IUnit[] = [];

        if (!Array.isArray(data)) {
            if ("districts" in data) retval = data.districts;
            if ("wards" in data) retval = data.wards;
        } else {
            retval = data.sort((a, b) => {
                if (
                    a.name.includes("Thành phố") &&
                    !b.name.includes("Thành phố")
                )
                    return -1;
                else if (
                    !a.name.includes("Thành phố") &&
                    b.name.includes("Thành phố")
                )
                    return 1;
                else return a.code - b.code;
            });
        }

        return retval.map((unit) => ({ name: unit.name, code: unit.code }));
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
