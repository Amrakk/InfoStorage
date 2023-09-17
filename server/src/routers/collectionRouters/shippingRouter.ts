import { router } from "../../trpc.js";
import { addShippings } from "../../api/v1/shipping/addShippings.js";
import { getShippings } from "../../api/v1/shipping/getShippings.js";
import { deleteShipping } from "../../api/v1/shipping/deleteShipping.js";
import { updateShipping } from "../../api/v1/shipping/updateShipping.js";

export const shippingRouter = router({
    /**
     * @name addShippings
     * Use by employee to add new shippings
     */
    addShippings,

    /**
     * @name getShippings
     * Use by employee to get all shippings
     */
    getShippings,

    /**
     * @name updateShipping
     * Use by employee to update a shipping
     */
    updateShipping,

    /**
     * @name deleteShipping
     * Use by employee to delete a shipping
     */
    deleteShipping,
});
