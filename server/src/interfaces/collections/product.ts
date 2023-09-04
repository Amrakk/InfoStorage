interface IProduct {
    name: string;
    category: "syrup" | "jam" | "powder" | "canned" | "topping" | "others";
    quantity: number;
    price: number;
    suppliers: string[];
}

export default IProduct;
