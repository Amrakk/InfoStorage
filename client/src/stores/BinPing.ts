import { create } from "zustand";

type TBinPing = {
    binPing: boolean;
    setBinPing: (binPing: boolean) => Promise<void>;
};

export const useBinPing = create<TBinPing>()((set) => ({
    binPing: false,
    setBinPing: async (binPing: boolean) => {
        set({
            binPing: binPing,
        });
    },
}));
