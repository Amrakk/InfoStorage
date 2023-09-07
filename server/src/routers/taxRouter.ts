import { router } from "../trpc.js";
import { addTax } from "../api/v1/tax/addTax.js";
import { getTaxes } from "../api/v1/tax/getTaxes.js";
import { updateTax } from "../api/v1/tax/updateTax.js";
import { deleteTax } from "../api/v1/tax/deleteTax.js";

export const taxRouter = router({
    addTax,
    getTaxes,
    updateTax,
    deleteTax,
});
