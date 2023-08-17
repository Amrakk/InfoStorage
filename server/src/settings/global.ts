export const roles = [
    {
        role: "admin",
        permissions: [
            "users",
            "host",
            "customers",
            "products",
            "shippings",
            "suppliers",
            "taxes",
        ],
    },
    {
        role: "manager",
        permissions: [
            "host",
            "customers",
            "products",
            "shippings",
            "suppliers",
            "taxes",
        ],
    },
    {
        role: "employee",
        permissions: [
            "customers",
            "products",
            "shippings",
            "suppliers",
            "taxes",
        ],
    },
];

export const productCategories = [
    "syrup",
    "jam",
    "powder",
    "canned",
    "topping",
    "others",
];
