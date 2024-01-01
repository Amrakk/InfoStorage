export function getErrorMessage(error: unknown): string {
    if (typeof error === "string") return error;
    else if (error instanceof Error) return error.message;
    else if (error && typeof error === "object" && "message" in error)
        return String(error.message);

    return "Unknown error";
}
