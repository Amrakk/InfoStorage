import { router } from "../../trpc.js";
import { addCustomers } from "../../api/v1/customer/addCustomers.js";
import { getCustomers } from "../../api/v1/customer/getCustomers.js";
import { updateCustomer } from "../../api/v1/customer/updateCustomer.js";
import { deleteCustomer } from "../../api/v1/customer/deleteCustomer.js";

export const customerRouter = router({
    /**
     * @name addCustomers
     * Use by employee to add customers
     */
    addCustomers,

    /**
     * @name getCustomers
     * Use by employee to get customers
     */
    getCustomers,

    /**
     * @name addCustomers
     * Use by employee to add customers
     */
    updateCustomer,

    /**
     * @name deleteCustomer
     * Use by employee to delete customer
     */
    deleteCustomer,
});
