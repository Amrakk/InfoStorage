import React from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FaFilter } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

type TProps = {
    handleSearch: (value: string) => void;
};

export default function Search(props: TProps) {
    return (
        <>
            <div className="flex lg:mt-8 mt-4 gap-5 h-10 ">
                <div className="group flex-1 ">
                    <div className="h-full group-focus-within:border-[#6AAFC7] transition-colors group-focus:border flex border border-primary items-center px-1 gap-2 rounded-md">
                        <AiOutlineSearch
                            size={24}
                            className="group-focus-within:text-[#6AAFC7] transition-colors"
                        />
                        <input
                            type="text"
                            className="w-full outline-none text-primary "
                            placeholder="Tìm kiếm theo Tên đơn vị"
                            onChange={(e) => {
                                props.handleSearch(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <button className=" bg-[#D1DBD3] lg:flex items-center justify-center  rounded-md aspect-square hidden hover:">
                    <FaFilter size={20} />
                </button>
                <button className=" bg-[#D1DBD3] lg:flex items-center justify-center  rounded-md aspect-square hidden">
                    <IoMdSettings size={24} />
                </button>
            </div>
        </>
    );
}
