import React, { useState, useRef, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdLibraryAdd } from "react-icons/md";
import { BsChevronDown } from "react-icons/bs";
import { trpc, type TProvince, type TDistrict } from "../trpc";

const inputStyle = {
  caretColor: "transparent",
};
export default function AddPopup({ message }: { message: string }) {
  const [checkEmptyName, setCheckEmptyName] = useState(true);
  const [checkEmptyDistrict, setCheckEmptyDistrict] = useState(true);
  const [checkEmptyWard, setCheckEmptyWard] = useState(true);
  const [checkEmptyPhone, setCheckEmptyPhone] = useState(true);
  const [checkEmptyNote, setCheckEmptyNote] = useState(true);
  const [showProVince, setShowProVince] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [provinces, setProvinces] = useState<TProvince>([]);
  const [districts, setDistricts] = useState<TDistrict>([]);
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (iconRef.current && !iconRef.current.contains(event.target as Node)) {
  //       // Click occurred outside of the element, so close it
  //       setShowProVince(false);
  //     }
  //   }

  //   // Add the event listener when the component mounts
  //   document.addEventListener("click", handleClickOutside);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, []);

  useEffect(() => {
    trpc.service.getProvinces.query().then((res) => {
      setProvinces(res);
    });
  }, []);

  return (
    <>
      <div className="justify-center mt-24 fixed inset-0 z-50" id="boxAccount">
        <div className="relative w-1/4  mx-auto">
          {/*content*/}
          <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="h-20 flex px-6 justify-between">
              <div className="flex items-center">
                <div className="aspect-square w-12 bg-[#bddec4] border border-primary    rounded-full flex justify-center items-center   ">
                  <MdLibraryAdd className="text-primary" size={18} />
                </div>
              </div>

              <div className="pt-3">
                <IoClose
                  size={30}
                  className="text-primary cursor-pointer hover:text-[#5e7563] transition-colors"
                  onClick={() => {}}
                />
              </div>
            </div>
            {/*body*/}
            <div className="relative px-5 flex-auto text-lg text-primary font-semibold">
              <form action="">
                {/* Ten Don Vi */}
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    className="w-full border border-[#415245] py-2 px-3  mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md transition-colors  duration-300"
                    onChange={(e) => {
                      if (e.target.value == "") {
                        setCheckEmptyName(true);
                      } else {
                        setCheckEmptyName(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="name"
                    className={`${
                      checkEmptyName ? "input-text" : "input-text-not-empty"
                    } absolute left-4 top-3 cursor-text focus:text-xs  transition duration-300  text-primary text-opacity-50 origin-left`}
                  >
                    Tên Đơn Vị
                  </label>
                </div>

                {/* Thanh Pho */}
                <div className="relative mt-5">
                  <select
                    required
                    style={inputStyle}
                    id="province"
                    className=" w-full border
                    border-[#415245] py-2 px-3 mt-1 hover:outline-none
                    focus:outline-none focus:border focus:border-[#6AAFC7]
                    bg-white rounded-md transition-colors duration-300 text-primary appearance-none"
                    onFocus={() => {
                      setShowProVince(true);
                    }}
                    onBlur={(e) => {
                      setShowProVince(false);
                    }}
                    onChange={(e) => {
                      trpc.service.getDistricts
                        .query({ provinceCode: parseInt(e.target.value) })
                        .then((res) => {
                          setDistricts(res);
                        });
                    }}
                  >
                    <option value="" disabled selected>
                      Chọn Thành Phố
                    </option>
                    {provinces.map((province) => {
                      return (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      );
                    })}
                  </select>
                  <label
                    htmlFor="province"
                    className={` absolute left-4 top-3 cursor-text focus:text-xs  transition duration-300  text-primary text-opacity-50 origin-left input-text-not-empty`}
                  >
                    Thành Phố
                  </label>
                  <BsChevronDown
                    className={`absolute right-4 top-4 ${
                      showProVince ? "text-[#6AAFC7]" : "text-primary"
                    } cursor-pointer`}
                    size={20}
                  />
                </div>

                {/* Quan */}
                <div className="relative mt-5">
                  <select
                    required
                    style={inputStyle}
                    id="district"
                    className=" w-full border
                    border-[#415245] py-2 px-3 mt-1 hover:outline-none
                    focus:outline-none focus:border focus:border-[#6AAFC7]
                    bg-white rounded-md transition-colors duration-300 text-primary appearance-none"
                    onFocus={() => {
                      setShowDistrict(true);
                    }}
                    onBlur={(e) => {
                      setShowDistrict(false);
                    }}
                    onChange={(e) => {
                      // trpc.service.getDistricts
                      //   .query({ provinceCode: parseInt(e.target.value) })
                      //   .then((res) => {
                      //     setDistricts(res);
                      //   });
                    }}
                  >
                    <option value="" disabled selected>
                      Chọn Quận
                    </option>
                    {districts.map((district) => {
                      return (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      );
                    })}
                  </select>
                  <label
                    htmlFor="district"
                    className={` absolute left-4 top-3 cursor-text focus:text-xs  transition duration-300  text-primary text-opacity-50 origin-left input-text-not-empty`}
                  >
                    Quận
                  </label>
                  <BsChevronDown
                    className={`absolute right-4 top-4 ${
                      showDistrict ? "text-[#6AAFC7]" : "text-primary"
                    } cursor-pointer`}
                    size={20}
                  />
                </div>

                {/* Phuong */}
                <div className="relative mt-5">
                  <input
                    type="text"
                    id="ward"
                    className="w-full border border-[#415245] py-2 px-3  mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md transition-colors  duration-300"
                    onChange={(e) => {
                      if (e.target.value == "") {
                        setCheckEmptyWard(true);
                      } else {
                        setCheckEmptyWard(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="ward"
                    className={`${
                      checkEmptyWard ? "input-text" : "input-text-not-empty"
                    } absolute left-4 top-3  cursor-text  transition duration-300  text-primary text-opacity-50 origin-left`}
                  >
                    Phường
                  </label>
                  <BsChevronDown
                    className="absolute right-4 top-4 text-primary cursor-pointer"
                    size={20}
                  />
                </div>

                {/* So Dien Thoai */}
                <div className="relative mt-5">
                  <input
                    type="text"
                    id="phone"
                    className="w-full border border-[#415245] py-2 px-3  mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md transition-colors  duration-300"
                    onChange={(e) => {
                      if (e.target.value == "") {
                        setCheckEmptyPhone(true);
                      } else {
                        setCheckEmptyPhone(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="phone"
                    className={`${
                      checkEmptyPhone ? "input-text" : "input-text-not-empty"
                    } absolute left-4 top-3  cursor-text  transition duration-300  text-primary text-opacity-50 origin-left`}
                  >
                    Số Điện Thoại
                  </label>
                </div>

                {/* Ghi Chu */}
                <div className="relative mt-5 ">
                  <textarea
                    id="note"
                    className="w-full h-40 border border-[#415245] py-2 px-3  mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md transition-colors duration-300 "
                    onChange={(e) => {
                      if (e.target.value == "") {
                        setCheckEmptyNote(true);
                      } else {
                        setCheckEmptyNote(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="note"
                    className={`${
                      checkEmptyNote ? "input-text" : "input-text-not-empty"
                    } absolute left-4 top-3  cursor-text  transition duration-300  text-primary text-opacity-50 origin-left`}
                  >
                    Ghi Chú
                  </label>
                </div>
              </form>
            </div>
            {/*footer*/}

            <div className="flex items-center justify-end m-6 border-slate-200  gap-4 font-semibold">
              <button
                type="button"
                className="w-32 py-3 bg-gray-300 hover:bg-gray-200 transition-colors  text-primary rounded-md"
                onClick={() => {}}
              >
                Hủy
              </button>
              <button
                type="button"
                className="w-32 py-3 bg-primary hover:bg-[#5e7563] transition-colors  text-white rounded-md"
                onClick={() => {}}
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
