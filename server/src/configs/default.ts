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
    Taxes = "Taxes",
    Users = "Users",
    Products = "Products",
    Customers = "Customers",
    Shippings = "Shippings",
    Suppliers = "Suppliers",
}

export enum ProductCategories {
    Jam = "Jam",
    Syrup = "Syrup",
    Powder = "Powder",
    Canned = "Canned",
    Topping = "Topping",
    Others = "Others",
}
