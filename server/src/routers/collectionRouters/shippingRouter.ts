import { router } from "../../trpc.js";
import { addShippings } from "../../api/v1/shipping/addShippings.js";
import { getShippings } from "../../api/v1/shipping/getShippings.js";
import { deleteShipping } from "../../api/v1/shipping/deleteShipping.js";
import { updateShipping } from "../../api/v1/shipping/updateShipping.js";

export const shippingRouter = router({
    addShippings,
    getShippings,
    updateShipping,
    deleteShipping,
});
