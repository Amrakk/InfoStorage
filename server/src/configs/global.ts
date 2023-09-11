export const roles = {
    admin: [
        "host",
        "users",
        "taxes",
        "products",
        "customers",
        "shippings",
        "suppliers",
    ],
    manager: [
        "host",
        "taxes",
        "products",
        "customers",
        "shippings",
        "suppliers",
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
] as const;
