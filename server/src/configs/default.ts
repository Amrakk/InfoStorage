export const rolePermissions = {
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

export enum UserRoles {
    Admin = "admin",
    Manager = "manager",
    Employee = "employee",
}

export enum CollectionNames {
    Taxes = "taxes",
    Users = "users",
    Products = "products",
    Customers = "customers",
    Shippings = "shippings",
    Suppliers = "suppliers",
}

export enum ProductCategories {
    Jam = "jam",
    Syrup = "syrup",
    Powder = "powder",
    Canned = "canned",
    Topping = "topping",
    Others = "others",
}
