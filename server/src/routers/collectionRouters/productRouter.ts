import { router } from "../../trpc.js";
import { addProducts } from "../../api/v1/product/addProducts.js";
import { getProducts } from "../../api/v1/product/getProducts.js";
import { updateProduct } from "../../api/v1/product/updateProduct.js";
import { deleteProduct } from "../../api/v1/product/deleteProduct.js";

export const productRouter = router({
    /**
     * @name addProducts
     * Use by employee to add products
     */
    addProducts,

    /**
     * @name getProducts
     * Use by employee to get products
     */
    getProducts,

    /**
     * @name updateProduct
     * Use by employee to update product
     */
    updateProduct,

    /**
     * @name deleteProduct
     * Use by employee to delete product
     */
    deleteProduct,
});
