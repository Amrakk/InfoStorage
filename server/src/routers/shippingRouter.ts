import { router } from "../trpc.js";
import { shipping } from "../api/index.js";

export const shippingRouter = router({
    getShippings: shipping.getShippings,
});
