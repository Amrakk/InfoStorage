import { create } from "zustand";

type TBlurSelect = {
    blurSelect: boolean;
    setBlurSelect: (blurSelect: boolean) => Promise<void>;
};

export const useBlurSelect = create<TBlurSelect>()((set) => ({
    blurSelect: true,
    setBlurSelect: async (blurSelect: boolean) => {
        set({
            blurSelect: blurSelect,
        });
    },
}));
