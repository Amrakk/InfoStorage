import { ProductCategories } from "../../configs/default.js";

interface IProduct {
    name: string;
    category: ProductCategories;
    quantity: number;
    price: number;
    suppliers: string[];
}

export default IProduct;
