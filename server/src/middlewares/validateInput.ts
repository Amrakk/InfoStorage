export function valName(name: string) {
    var nameRegex = new RegExp(
        "^[a-zA-ZÀ-ỹà-ỹẠ-Ỵạ-ỵĂăĨĩĐđẾếềỀềỂểỄễỆệƠơỚớờỜờỞởỠỡỢợÔôỔổốỐốỒồỒồỔổỖỗỘộỚớờỜờỞởỠỡỢợÁáẮắẤấẤầầẨẩẪẫẬậÉéẾếẸẹỀềẺẻỄễỆệÍíỈỉỊịÓóỐốỐốỔổỒồỔổỖỗỘộỚớỜờỞởỠỡỢợÚúỨứỪừỬửỮữỰựÝýỲỳỴỵỶỷỸỹ ]+$"
    );
    return nameRegex.test(name);
}

export function valEmail(email: string) {
    var emailRegex = new RegExp(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"
    );
    return emailRegex.test(email);
}

export function valPassword(password: string) {
    var passwordRegex = new RegExp("^[a-zA-Z0-9]+$");
    return passwordRegex.test(password);
}

export function valPhone(phone: string) {
    var phoneRegex = new RegExp("^[+0-9]+$");
    return phoneRegex.test(phone);
}

export function valRole(role: string) {
    var roleRegex = new RegExp("^(admin|manager|employee)$");
    return roleRegex.test(role);
}
