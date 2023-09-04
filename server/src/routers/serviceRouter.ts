import { router } from "../trpc.js";
import {
    getWards,
    getDistricts,
    getProvinces,
} from "../api/services/getProvincesInfo.js";
import { searchByName } from "../api/services/searchByName.js";

export const serviceRouter = router({
    getWards,
    getDistricts,
    getProvinces,

    searchByName,
});
