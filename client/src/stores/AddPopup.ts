import { create } from "zustand";

type TAddPopupStore = {
  isAddPopupOpen: string;
  setIsAddPopupOpen: (isAddPopupOpen: string) => Promise<void>;
};

export const useAddPopupStore = create<TAddPopupStore>()((set) => ({
  isAddPopupOpen: "",
  setIsAddPopupOpen: async (isAddPopupOpen: string) => {
    set({
      isAddPopupOpen: isAddPopupOpen,
    });
  },
}));
