import IUnit from "../../interfaces/provincesApiRes.js";

const apiUrl = process.env.PROVINCES_API_URL!;

export async function getUnitsInfo(unit: "province"): Promise<IUnit[]>;
export async function getUnitsInfo(unit: "district" | "ward", code: number): Promise<IUnit[]>;
export async function getUnitsInfo(unit: unknown, code?: unknown): Promise<IUnit[]> {
    type TRes = { districts: IUnit[] } | { wards: IUnit[] } | IUnit[];

    let query = "";
    if (unit === "province") query = "/p";
    else if (unit === "district") query = `/p/${code}?depth=2`;
    else if (unit === "ward") query = `/d/${code}?depth=2`;
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
            if (a.name.includes("Thành phố") && !b.name.includes("Thành phố")) return -1;
            else if (!a.name.includes("Thành phố") && b.name.includes("Thành phố")) return 1;
            else return a.name.localeCompare(b.name);
        });
    }

    return retval.map((unit) => ({ name: unit.name, code: unit.code }));
}

export async function getUnitName(code: number, unit: "province" | "district" | "ward") {
    let query = "";
    if (unit === "province") query = `/p/${code}`;
    else if (unit === "district") query = `/d/${code}`;
    else if (unit === "ward") query = `/w/${code}`;
    else throw new Error("Invalid unit");

    const data = await fetch(apiUrl + query).then<IUnit>(async (res) => {
        if (!res.ok) throw new Error("Provinces API error");
        return await res.json();
    });

    return data.name;
}

export async function searchUnitCode(name: string, unit: "province" | "district" | "ward") {
    let query = "";
    if (unit === "province") query = `/p/search/?q=${name}`;
    else if (unit === "district") query = `/d/search/?q=${name}`;
    else if (unit === "ward") query = `/w/search/?q=${name}`;
    else throw new Error("Invalid unit");

    const data = await fetch(apiUrl + query).then<IUnit[]>(async (res) => {
        if (!res.ok) throw new Error("Provinces API error");
        return await res.json();
    });

    return data[0].code;
}

export async function getAddressInfo(
    address: string,
    provCode: number | undefined,
    distCode: number | undefined,
    wardCode: number | undefined
) {
    if (!provCode || !distCode || !wardCode) return null;

    const [provName, distName, wardName] = await Promise.all([
        getUnitName(provCode, "province"),
        getUnitName(distCode, "district"),
        getUnitName(wardCode, "ward"),
    ]);
    return `${address}, ${wardName}, ${distName}, ${provName}`;
}
