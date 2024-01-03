import type { AppRouter } from "../../server/src/server";
import {
    createTRPCProxyClient,
    createWSClient,
    httpBatchLink,
    wsLink,
} from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type TShipping = RouterOutput["shipping"]["getShippings"];
export type TProvince = RouterOutput["service"]["getProvinces"];
export type TDistrict = RouterOutput["service"]["getDistricts"];
export type TWard = RouterOutput["service"]["getWards"];

const wsClient = createWSClient({
    url: `ws://localhost:3001`,
});

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            // url: "https://infostorage.up.railway.app/trpc",
            url: "http://localhost:3000/trpc",
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            },
        }),
        wsLink({
            client: wsClient,
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
