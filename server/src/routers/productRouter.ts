import { router } from "../trpc.js";
import { addProduct } from "../api/v1/product/addProduct.js";
import { getProducts } from "../api/v1/product/getProducts.js";
import { updateProduct } from "../api/v1/product/updateProduct.js";
import { deleteProduct } from "../api/v1/product/deleteProduct.js";

export const productRouter = router({
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct,
});
