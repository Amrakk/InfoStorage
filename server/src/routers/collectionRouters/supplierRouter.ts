import { router } from "../../trpc.js";
import { addSuppliers } from "../../api/v1/supplier/addSuppliers.js";
import { getSuppliers } from "../../api/v1/supplier/getSuppliers.js";
import { updateSupplier } from "../../api/v1/supplier/updateSupplier.js";
import { deleteSupplier } from "../../api/v1/supplier/deleteSupplier.js";

export const supplierRouter = router({
    /**
     * @name addSuppliers
     * Use by employee to add new suppliers
     */
    addSuppliers,

    /**
     * @name getSuppliers
     * Use by employee to get all suppliers
     */
    getSuppliers,

    /**
     * @name updateSupplier
     * Use by employee to update a supplier
     */
    updateSupplier,

    /**
     * @name deleteSupplier
     * Use by employee to delete a supplier
     */
    deleteSupplier,
});
