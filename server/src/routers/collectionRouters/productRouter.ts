import { router } from "../../trpc.js";
import { addProducts } from "../../api/v1/product/addProducts.js";
import { getProducts } from "../../api/v1/product/getProducts.js";
import { updateProduct } from "../../api/v1/product/updateProduct.js";
import { deleteProduct } from "../../api/v1/product/deleteProduct.js";

export const productRouter = router({
    addProducts,
    getProducts,
    updateProduct,
    deleteProduct,
});
