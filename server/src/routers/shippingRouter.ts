import { router } from "../trpc.js";
import { addShipping } from "../api/v1/shipping/addShipping.js";
import { getShippings } from "../api/v1/shipping/getShipping.js";
import { updateShipping } from "../api/v1/shipping/updateShipping.js";

export const shippingRouter = router({
    getShippings,
    addShipping,
    updateShipping,
});
