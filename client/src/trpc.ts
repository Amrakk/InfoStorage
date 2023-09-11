import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../../server/src/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type TShipping = RouterOutput["shipping"]["getShippings"];
export type TProvince = RouterOutput["service"]["getProvinces"];
export type TDistrict = RouterOutput["service"]["getDistricts"];

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
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
