import { create } from "zustand";

type TDeletePopupStore = {
  isDeletePopupOpen: string;
  setIsDeletePopupOpen: (isDeletePopupOpen: string) => Promise<void>;
};

export const useDeletePopupStore = create<TDeletePopupStore>()((set) => ({
  isDeletePopupOpen: "",
  setIsDeletePopupOpen: async (isDeletePopupOpen: string) => {
    set({
      isDeletePopupOpen: isDeletePopupOpen,
    });
  },
}));
