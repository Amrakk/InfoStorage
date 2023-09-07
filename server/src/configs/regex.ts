export const phoneRegex = new RegExp("^[+0-9]*$", "m");
export const humanNameRegex = new RegExp(`^[\\p{L}\s|_]+$`, "mu");
export const subjectRegex = new RegExp(`^[^\\p{C}<>&\`\'\"/]*$`, "mu");
export const addressRegex = new RegExp(`^[\\p{C}0-9 \\/,.;+-]+$`, "mu");

export const userRegex = {
    name: humanNameRegex,
    password: new RegExp("^[a-zA-Z0-9]+$", "m"),
    phone: phoneRegex,
};

export const shippingRegex = {
    name: subjectRegex,
    address: addressRegex,
    phone: phoneRegex,
    note: subjectRegex,
};

export const customerRegex = {
    name: subjectRegex,
    phone: phoneRegex,
    address: addressRegex,
    curator: humanNameRegex,
    placer: humanNameRegex,
    note: subjectRegex,
};

export const taxRegex = {
    name: subjectRegex,
    taxCode: new RegExp("^[0-9+-]+$", "m"),
    address: addressRegex,
    representative: humanNameRegex,
    phone: phoneRegex,
};

export const supplierRegex = {
    name: subjectRegex,
    contact: humanNameRegex,
    phone: phoneRegex,
    address: addressRegex,
    note: subjectRegex,
};

export const productRegex = {
    name: subjectRegex,
};
