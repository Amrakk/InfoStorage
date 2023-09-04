import { router } from "../../trpc.js";
import { addCustomer } from "../../api/v1/customer/addCustomer.js";
import { getCustomers } from "../../api/v1/customer/getCustomers.js";
import { updateCustomer } from "../../api/v1/customer/updateCustomer.js";
import { deleteCustomer } from "../../api/v1/customer/deleteCustomer.js";

export const customerRouter = router({
    addCustomer,
    getCustomers,
    updateCustomer,
    deleteCustomer,
});
