import { router } from "../../trpc.js";
import { addShipping } from "../../api/v1/shipping/addShipping.js";
import { getShippings } from "../../api/v1/shipping/getShippings.js";
import { deleteShipping } from "../../api/v1/shipping/deleteShipping.js";
import { updateShipping } from "../../api/v1/shipping/updateShipping.js";

export const shippingRouter = router({
    addShipping,
    getShippings,
    updateShipping,
    deleteShipping,
});
