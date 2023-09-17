import { z } from "zod";
import { getUnitName } from "../utils/addressHandlers.js";

export const addressFilterShema = z.object({
    provCode: z.number(),
    distCode: z.number().optional(),
    wardCode: z.number().optional(),
});

type TAddressCodes = z.infer<typeof addressFilterShema>;

export type TAddressFilter = { address: { $regex: string } };

export async function addressFilter(codes: TAddressCodes) {
    const { provCode, distCode, wardCode } = codes;

    let addressRegex = "";
    if (wardCode) {
        const ward = await getUnitName(wardCode, "ward");
        if (ward === "INTERNAL_SERVER_ERROR") return ward;
        addressRegex += ward;
    }
    if (distCode) {
        const district = await getUnitName(distCode, "district");
        if (district === "INTERNAL_SERVER_ERROR") return district;
        addressRegex += ", " + district;
    }
    const province = await getUnitName(provCode, "province");
    if (province === "INTERNAL_SERVER_ERROR") return province;
    addressRegex += ", " + province;

    return { address: { $regex: addressRegex } } as TAddressFilter;
}
