import { create } from "zustand";

type TCurrentPageStore = {
    currentPage: number;
    setCurrentPage: (currentPage: number) => Promise<void>;
};

export const useCurrentPageStore = create<TCurrentPageStore>()((set) => ({
    currentPage: 1,
    setCurrentPage: async (currentPage: number) => {
        set({
            currentPage: currentPage,
        });
    },
}));
