import { router } from "../trpc.js";
import { exportData } from "../api/services/exportData.js";
import { getAccToken } from "../api/services/getAccToken.js";
import { searchByName } from "../api/services/searchByName.js";
import {
    getUserRoles,
    getProductCategories,
} from "../api/services/defaultHandlers.js";
import {
    getProvinces,
    getDistricts,
    getWards,
    getUnitCode,
} from "../api/services/addressHandlers.js";

export const serviceRouter = router({
    /**
     * @name getUnitCode
     * Use by employee to get unit code of a unit
     */
    getUnitCode,

    /**
     * @name getProvinces
     * Use by employee to get all provinces
     */
    getProvinces,
    /**
     * @name getDistricts
     * Use by employee to get all districts of a province
     */
    getDistricts,
    /**
     * @name getWards
     * Use by employee to get all wards of a district
     */
    getWards,

    /**
     * @name getUserRoles
     * Use by employee to get all user roles
     */
    getUserRoles,
    /**
     * @name getProductCategories
     * Use by employee to get all product categories
     */
    getProductCategories,

    /**
     * @name exportData
     * Use by verified user to export data base on their role via email
     */
    exportData,
    /**
     * @name searchByName
     * Use by verified user to search data base on their role
     */
    searchByName,

    /**
     * @name getAccToken
     * Use by verified user to get a new access token
     */
    getAccToken,
});
