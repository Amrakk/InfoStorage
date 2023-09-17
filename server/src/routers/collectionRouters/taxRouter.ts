import { router } from "../../trpc.js";
import { addTaxes } from "../../api/v1/tax/addTaxes.js";
import { getTaxes } from "../../api/v1/tax/getTaxes.js";
import { updateTax } from "../../api/v1/tax/updateTax.js";
import { deleteTax } from "../../api/v1/tax/deleteTax.js";

export const taxRouter = router({
    /**
     * @name addTaxes
     * Use by employee to add new taxes
     */
    addTaxes,

    /**
     * @name getTaxes
     * Use by employee to get all taxes
     */
    getTaxes,

    /**
     * @name updateTax
     * Use by employee to update a tax
     */
    updateTax,

    /**
     * @name deleteTax
     * Use by employee to delete a tax
     */
    deleteTax,
});
