import { router } from "../trpc.js";
import { addSupplier } from "../api/v1/supplier/addSupplier.js";
import { getSuppliers } from "../api/v1/supplier/getSuppliers.js";
import { updateSupplier } from "../api/v1/supplier/updateSupplier.js";
import { deleteSupplier } from "../api/v1/supplier/deleteSupplier.js";

export const supplierRouter = router({
    addSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
});
