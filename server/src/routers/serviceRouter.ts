import { router } from "../trpc.js";
import {
    getWards,
    getDistricts,
    getProvinces,
} from "../api/services/getProvincesInfo.js";

export const serviceRouter = router({
    getWards,
    getDistricts,
    getProvinces,
});
