import { create } from "zustand";
import type { TShipping } from "../trpc";

type TShippings = {
    shippings: TShipping;
    setShippings: (shippings: TShipping) => Promise<void>;
};

export const useShippingsStore = create<TShippings>()((set) => ({
    shippings: [],
    setShippings: async (shippings: TShipping) => {
        set({
            shippings: shippings,
        });
    },
}));
