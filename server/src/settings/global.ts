export const roles = {
    admin: [
        "users",
        "host",
        "customers",
        "products",
        "shippings",
        "suppliers",
        "taxes",
    ],
    manager: [
        "host",
        "customers",
        "products",
        "shippings",
        "suppliers",
        "taxes",
    ],
    employee: ["customers", "products", "shippings", "suppliers", "taxes"],
};

export const productCategories = [
    "syrup",
    "jam",
    "powder",
    "canned",
    "topping",
    "others",
];
