import { create } from "zustand";
type TShippings = {
    filterShipping: {
        provName?: string;
        distName?: string;
        wardName?: string;
    };
    setFilterShipping: (filterShipping: {
        provName?: string;
        distName?: string;
        wardName?: string;
    }) => Promise<void>;
};

export const useFilterShipping = create<TShippings>()((set) => ({
    filterShipping: {},
    setFilterShipping: async (filterShipping: {
        provName?: string;
        distName?: string;
        wardName?: string;
    }) => {
        set({
            filterShipping: filterShipping,
        });
    },
}));
