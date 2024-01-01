import { create } from "zustand";

type TIconAppear = {
    iconAppear: boolean;
    setIconAppear: (iconAppear: boolean) => Promise<void>;
};

export const useIconAppear = create<TIconAppear>()((set) => ({
    iconAppear: false,
    setIconAppear: async (iconAppear: boolean) => {
        set({
            iconAppear: iconAppear,
        });
    },
}));
