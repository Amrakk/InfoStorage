import { router } from "../trpc.js";
import { getShippings } from "../api/v1/shipping/getShipping.js";

export const shippingRouter = router({
    getShippings,
});
