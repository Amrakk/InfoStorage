interface IProduct {
    name: string;
    category: string;
    quantity: number;
    price: number;
    suppliers: string[]; // supplier ids
}

export default IProduct;
