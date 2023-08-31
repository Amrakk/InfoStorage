import React from "react";
import { useDeletePopupStore } from "../stores/DeletePopup";
export default function DeletePopup({ message }: { message: string }) {
  const { setIsDeletePopupOpen } = useDeletePopupStore();
  return (
    <>
      <div className="justify-center mt-24 fixed inset-0 z-50" id="popup">
        <div className="relative w-1/4   mx-auto">
          {/*content*/}
          <div className=" rounded-md p-5 shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}

            {/*body*/}
            <div className="relative m-3 px-3 flex-auto text-lg text-primary     font-semibold">
              {message}
            </div>
            {/*footer*/}

            <div className="flex items-center justify-end m-2 border-slate-200 rounded-b gap-10 font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsDeletePopupOpen("");
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="w-40 py-3 bg-red-500 hover:bg-red-400 transition-colors  text-white rounded-md"
                onClick={() => {
                  setIsDeletePopupOpen("");
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
