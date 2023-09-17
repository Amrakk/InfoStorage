import { employeeProcedure } from "../../trpc.js";
import { UserRoles, ProductCategories } from "../../configs/default.js";

export const getUserRoles = employeeProcedure.query(() => {
    return UserRoles;
});

export const getProductCategories = employeeProcedure.query(() => {
    return ProductCategories;
});
