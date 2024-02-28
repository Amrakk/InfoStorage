import type { AppRouter } from "../../server/src/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

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
            url: "https://ifs.ngocrongmod.xyz/trpc",
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            },
        }),
    ],
});

// export const trpc = createTRPCReact<AppRouter>();

export type TRPCError = {
    message: string;
    code: number;
    data: {
        code: string;
        httpStatus: number;
        path: string;
    };
};
