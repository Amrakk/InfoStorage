import React from "react";
import { useDeletePopupStore } from "../stores/DeletePopup";
import { FaTrash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
export default function DeletePopup({ message }: { message: string }) {
  const { setIsDeletePopupOpen } = useDeletePopupStore();
  return (
    <>
      <div className="justify-center mt-24 fixed inset-0 z-50" id="boxAccount">
        <div className="relative w-1/4  mx-auto">
          {/*content*/}
          <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="h-20 flex px-6 justify-between">
              <div className="flex items-center">
                <div className="aspect-square w-12 bg-[#FFEDF1] border border-red-500 rounded-full flex justify-center items-center   ">
                  <FaTrash className="text-red-500" size={18} />
                </div>
              </div>

              <div className="pt-3">
                <IoClose
                  size={30}
                  className="text-primary cursor-pointer hover:text-[#5e7563] transition-colors"
                  onClick={() => {
                    setIsDeletePopupOpen("");
                  }}
                />
              </div>
            </div>
            {/*body*/}
            <div className="relative  px-5 flex-auto text-lg text-primary     font-semibold">
              Bạn có chắc chắn muốn xóa{" "}
              <span className="text-red-500">{message}</span> không?
            </div>
            {/*footer*/}

            <div className="flex items-center justify-end m-6 border-slate-200  gap-4 font-semibold">
              <button
                type="button"
                className="w-32 py-3 bg-gray-300 hover:bg-gray-200 transition-colors  text-primary rounded-md"
                onClick={() => {
                  setIsDeletePopupOpen("");
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="w-32 py-3 bg-red-500 hover:bg-red-400 transition-colors  text-white rounded-md"
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
