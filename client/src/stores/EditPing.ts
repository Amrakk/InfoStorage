import { create } from "zustand";

type TEditPing = {
    editPing: boolean;
    setEditPing: (editPing: boolean) => Promise<void>;
};

export const useEditPing = create<TEditPing>()((set) => ({
    editPing: false,
    setEditPing: async (editPing: boolean) => {
        set({
            editPing: editPing,
        });
    },
}));
