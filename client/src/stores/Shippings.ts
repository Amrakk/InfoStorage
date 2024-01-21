import { create } from "zustand";
import type { TShipping } from "../trpc";

type TShippings = {
    shippings: TShipping | null;
    setShippings: (shippings: TShipping) => Promise<void>;
};

export const useShippingsStore = create<TShippings>()((set) => ({
    shippings: null,
    setShippings: async (shippings: TShipping) => {
        set({
            shippings: shippings,
        });
    },
}));
