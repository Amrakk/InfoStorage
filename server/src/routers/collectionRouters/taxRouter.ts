import { router } from "../../trpc.js";
import { addTaxes } from "../../api/v1/tax/addTaxes.js";
import { getTaxes } from "../../api/v1/tax/getTaxes.js";
import { updateTax } from "../../api/v1/tax/updateTax.js";
import { deleteTax } from "../../api/v1/tax/deleteTax.js";

export const taxRouter = router({
    addTaxes,
    getTaxes,
    updateTax,
    deleteTax,
});
