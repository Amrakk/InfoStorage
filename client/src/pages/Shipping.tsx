import React, { useState } from "react";
import { FaUser, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiInboxFill } from "react-icons/ri";
import { LuBuilding } from "react-icons/lu";
import { FiArrowUpRight } from "react-icons/fi";
export default function Shipping() {
  const [showAccount, setShowAccount] = useState(false);
  return (
    <>
      <header className=" border-b border-b-primary text-primary select-none">
        <div className="container py-5 flex justify-between items-center">
          <div className="flex gap-10">
            <h1 id="ifs" className="text-3xl cursor-pointer font-semibold">
              IFS
            </h1>
            <div className="flex gap-10">
              <div className="icon cursor-pointer ">
                <AiOutlineDashboard size={24} />
                <div>Dashboard</div>
              </div>
              <div className="icon cursor-pointer">
                <BsFillPeopleFill size={24} />
                <div>Customer</div>
              </div>
              <div className="icon cursor-pointer">
                <FaTruck size={24} />
                <div>Shipping</div>
              </div>
              <div className="icon cursor-pointer">
                <RiInboxFill size={24} />
                <div>Product</div>
              </div>
              <div className="icon cursor-pointer">
                <LuBuilding size={24} />
                <div>Supplier</div>
              </div>
            </div>
          </div>
          <div className="relative cursor-pointer">
            <div
              onClick={() => {
                setShowAccount(!showAccount);
              }}
              className="flex gap-4 items-center"
            >
              <div>nguyuenhoangduy</div>
              <FaUser size={24} />
            </div>

            <div
              className={` absolute right-0 top-10 bg-white border  rounded-md shadow-aesthetic py-2 px-5 flex-col gap-1 z-10 ${
                showAccount ? "flex" : "hidden"
              }`}
            >
              <div className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out">
                <div>Profile</div>
                <FiArrowUpRight />
              </div>
              <div className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out">
                <div>Tax</div>
                <FiArrowUpRight />
              </div>
              <div className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out">
                <div>Host</div>
                <FiArrowUpRight />
              </div>
              <div className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out">
                <div>Sign Out</div>
                <FiArrowUpRight />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
