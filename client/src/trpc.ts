import type { AppRouter } from "../../server/src/server";
import { createTRPCProxyClient, createWSClient, httpBatchLink, wsLink } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// @ts-ignore
type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type TShipping = RouterOutput["shipping"]["getShippings"];
export type TCustomer = RouterOutput["customer"]["getCustomers"];
export type TProduct = RouterOutput["product"]["getProducts"];
export type TSupplier = RouterOutput["supplier"]["getSuppliers"];

export type TProvince = RouterOutput["service"]["getProvinces"];
export type TDistrict = RouterOutput["service"]["getDistricts"];
export type TWard = RouterOutput["service"]["getWards"];

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: import.meta.env.VITE_HTTP_URL,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                }).then((res) => {
                    if (res.status === 401) {
                        window.location.href = "/signin";
                    }

                    return res;
                });
            },
        }),
    ],
});

export type TRPCError = {
    message: string;
    code: number;
    data: {
        code: string;
        httpStatus: number;
        path: string;
    };
};

const UNAUTHORIZED_WS_CLOSE_CODE = 4000;
const wsClient = createWSClient({
    url: import.meta.env.VITE_WS_URL,
    onClose(cause) {
        if (cause?.code === UNAUTHORIZED_WS_CLOSE_CODE) {
            if (window.location.pathname !== "/signin") {
                window.location.href = "/signin";
            }
        }
    },
    retryDelayMs: () => 1000,
});

export const trpcWss = createTRPCProxyClient<AppRouter["wss"]>({
    links: [wsLink({ client: wsClient })],
});
