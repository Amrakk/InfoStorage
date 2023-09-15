import IUnit from "../interfaces/provincesApiRes.js";

const apiUrl = process.env.PROVINCES_API_URL!;

export async function getProvincesInfo(
  type: "province"
): Promise<IUnit[] | "INTERNAL_SERVER_ERROR">;
export async function getProvincesInfo(
  type: "district" | "ward",
  code: number
): Promise<IUnit[] | "INTERNAL_SERVER_ERROR">;
export async function getProvincesInfo(
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
        if (a.name.includes("Thành phố") && !b.name.includes("Thành phố"))
          return -1;
        else if (!a.name.includes("Thành phố") && b.name.includes("Thành phố"))
          return 1;
        else return a.name.localeCompare(b.name);
      });
    }

    return retval.map((unit) => ({ name: unit.name, code: unit.code }));
  } catch (err) {
    return "INTERNAL_SERVER_ERROR";
  }
}

export async function getProvinceInfo(
  code: number,
  type: "province" | "district" | "ward"
) {
  try {
    let query = "";
    if (type === "province") query = `/p/${code}`;
    else if (type === "district") query = `/d/${code}`;
    else if (type === "ward") query = `/w/${code}`;
    else throw new Error("Invalid type");

    const data = await fetch(apiUrl + query).then<IUnit>(async (res) => {
      if (!res.ok) throw new Error("Provinces API error");
      return await res.json();
    });

    return data.name;
  } catch (err) {
    return "INTERNAL_SERVER_ERROR";
  }
}

export async function searchProvinceInfo(
  name: string,
  type: "province" | "district" | "ward"
) {
  try {
    let query = "";

    if (type === "province") query = `/p/search/?q=${name}`;
    else if (type === "district") query = `/d/search/?q=${name}`;
    else if (type === "ward") query = `/w/search/?q=${name}`;
    else throw new Error("Invalid type");

    const data = await fetch(apiUrl + query).then<IUnit[]>(async (res) => {
      if (!res.ok) throw new Error("Provinces API error");
      return await res.json();
    });

    return data[0].code;
  } catch (err) {
    console.log(err);
    return "INTERNAL_SERVER_ERROR";
  }
}
