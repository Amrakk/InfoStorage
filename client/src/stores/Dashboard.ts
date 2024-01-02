import { create } from "zustand";

import type { TCustomer, TSupplier, TShipping, TProduct } from "../trpc";

type TDashboard = {
    customers?: TCustomer;
    suppliers?: TSupplier;
    shippings?: TShipping;
    products?: TProduct;
    setData: (data: {
        customers?: TCustomer;
        suppliers?: TSupplier;
        shippings?: TShipping;
        products?: TProduct;
    }) => Promise<void>;
};

export const useDashboard = create<TDashboard>()((set) => ({
    setData: async (data) => {
        set((cur) => {
            cur.customers = data.customers ?? cur.customers;
            cur.suppliers = data.suppliers ?? cur.suppliers;
            cur.shippings = data.shippings ?? cur.shippings;
            cur.products = data.products ?? cur.products;

            return { ...cur };
        });
    },
}));
