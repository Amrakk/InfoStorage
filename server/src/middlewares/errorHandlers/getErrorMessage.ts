import { getTRPCErrorFromUnknown } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

export function getErrorMessage(error: unknown): string {
    if (typeof error === "string") return error;
    else if (error instanceof Error) return error.message;
    else if (error && typeof error === "object" && "message" in error)
        return String(error.message);

    return "Unknown error";
}

export function handleErrorResponse(err: unknown) {
    const trpcError = getTRPCErrorFromUnknown(err);

    if (trpcError.code == "INTERNAL_SERVER_ERROR") {
        console.log(err);
        trpcError.message = "Internal Server Error";
    }

    return {
        id: 0,
        error: {
            message: trpcError.message,
            code: TRPC_ERROR_CODES_BY_KEY[trpcError.code],
            data: {
                code: trpcError.code,
                httpStatus: getHTTPStatusCodeFromError(trpcError),
                path: "",
            },
        },
    };
}
