export const userRegex = {
    name: new RegExp(
        "^[a-zA-ZÀ-ỹà-ỹẠ-Ỵạ-ỵĂăĨĩĐđẾếềỀềỂểỄễỆệƠơỚớờỜờỞởỠỡỢợÔôỔổốỐốỒồỒồỔổỖỗỘộỚớờỜờỞởỠỡỢợÁáẮắẤấẤầầẨẩẪẫẬậÉéẾếẸẹỀềẺẻỄễỆệÍíỈỉỊịÓóỐốỐốỔổỒồỔổỖỗỘộỚớỜờỞởỠỡỢợÚúỨứỪừỬửỮữỰựÝýỲỳỴỵỶỷỸỹ ]+$"
    ),
    email: new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"),
    password: new RegExp("^[a-zA-Z0-9]+$"),
    phone: new RegExp("^[+0-9]+$"),
    role: new RegExp("^(admin|manager|employee)$"),
};
