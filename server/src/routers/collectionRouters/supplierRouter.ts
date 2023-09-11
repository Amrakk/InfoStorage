import { router } from "../../trpc.js";
import { addSuppliers } from "../../api/v1/supplier/addSuppliers.js";
import { getSuppliers } from "../../api/v1/supplier/getSuppliers.js";
import { updateSupplier } from "../../api/v1/supplier/updateSupplier.js";
import { deleteSupplier } from "../../api/v1/supplier/deleteSupplier.js";

export const supplierRouter = router({
    addSuppliers,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
});
