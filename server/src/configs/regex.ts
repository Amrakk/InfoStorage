export const phoneRegex = new RegExp("^[+0-9]+$");
export const subjectRegex = new RegExp(`^[^<>&"'\\\/]*$`);
export const humanNameRegex = new RegExp(
    "^[a-zA-ZÀ-ỹà-ỹẠ-Ỵạ-ỵĂăĨĩĐđẾếềỀềỂểỄễỆệƠơỚớờỜờỞởỠỡỢợÔôỔổốỐốỒồỒồỔổỖỗỘộỚớờỜờỞởỠỡỢợÁáẮắẤấẤầầẨẩẪẫẬậÉéẾếẸẹỀềẺẻỄễỆệÍíỈỉỊịÓóỐốỐốỔổỒồỔổỖỗỘộỚớỜờỞởỠỡỢợÚúỨứỪừỬửỮữỰựÝýỲỳỴỵỶỷỸỹ ]+$"
);
export const addressRegex = new RegExp(
    "^[a-zA-Z0-9À-ỹà-ỹẠ-Ỵạ-ỵĂăĨĩĐđẾếềỀềỂểỄễỆệƠơỚớờỜờỞởỠỡỢợÔôỔổốỐốỒồỒồỔổỖỗỘộỚớờỜờỞởỠỡỢợÁáẮắẤấẤầầẨẩẪẫẬậÉéẾếẸẹỀềẺẻỄễỆệÍíỈỉỊịÓóỐốỐốỔổỒồỔổỖỗỘộỚớỜờỞởỠỡỢợÚúỨứỪừỬửỮữỰựÝýỲỳỴỵỶỷỸỹ \\/,.;-]+$"
);

export const userRegex = {
    name: humanNameRegex,
    password: new RegExp("^[a-zA-Z0-9]+$"),
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
    taxCode: new RegExp("^[0-9-]+$"),
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
