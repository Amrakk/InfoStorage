import type { AppRouter } from "../../server/src/server";
import {
    createTRPCProxyClient,
    createWSClient,
    httpBatchLink,
    splitLink,
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
    url: "ws://localhost:3001/trpc",
});

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        splitLink({
            condition: (op) => op.type === "subscription",
            true: wsLink({ client: wsClient }),
            false: httpBatchLink({
                // url: "https://infostorage.up.railway.app/trpc",
                url: "http://localhost:3000/trpc",
                fetch(url, options) {
                    return fetch(url, {
                        ...options,
                        credentials: "include",
                    });
                },
            }),
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
