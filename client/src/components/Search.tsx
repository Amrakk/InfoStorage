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
            <div className="lg:flex lg:mt-8 mt-4 gap-5 h-10 hidden">
                <div className="group flex-1 ">
                    <div className="h-full  group-focus-within:border-[#6AAFC7] transition-colors group-focus:border flex border border-primary items-center px-1 gap-2 rounded-md">
                        <AiOutlineSearch
                            size={24}
                            className="group-focus-within:text-[#6AAFC7] transition-colors"
                        />
                        <input
                            type="text"
                            className="w-full outline-none text-primary "
                            placeholder="Search Services"
                            onChange={(e) => {
                                props.handleSearch(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <button className=" bg-[#D1DBD3] flex items-center justify-center  rounded-md aspect-square">
                    <FaFilter size={20} />
                </button>
                <button className=" bg-[#D1DBD3] flex items-center justify-center  rounded-md aspect-square">
                    <IoMdSettings size={24} />
                </button>
            </div>
        </>
    );
}
