import { create } from "zustand";
import type { TShipping } from "../trpc";

type TShippings = {
    searchValue: TShipping | null;
    setSearchValue: (searchValue: TShipping | null) => Promise<void>;
};

export const useSearchValue = create<TShippings>()((set) => ({
    searchValue: null,
    setSearchValue: async (searchValue: TShipping | null) => {
        set({
            searchValue: searchValue,
        });
    },
}));
