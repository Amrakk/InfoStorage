export function valEmail(email: string) {
    var emailRegex = new RegExp(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"
    );
    return emailRegex.test(email);
}

export function valPassword(password: string) {
    var passwordRegex = new RegExp("^[a-zA-Z0-9]$");
    return passwordRegex.test(password);
}
