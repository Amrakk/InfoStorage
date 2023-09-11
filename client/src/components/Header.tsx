import React, { useState, useEffect, useRef } from "react";
import { TRPCError, trpc } from "../trpc";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiInboxFill } from "react-icons/ri";
import { LuBuilding } from "react-icons/lu";
import { FiArrowUpRight } from "react-icons/fi";
export default function Header() {
  const [showAccount, setShowAccount] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const arrIcon = [
      "/dashboard",
      "/customer",
      "/shipping",
      "/product",
      "/supplier",
    ];
    let index = arrIcon.findIndex((item) => item === location.pathname);
    index = index === -1 ? 0 : index;
    const left = index * 80 + index * 40;
    barRef.current!.style.setProperty("left", `${left}px`);
  }, [location.pathname]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    setUsername(username || "");
  }, []);

  async function handleSignOut() {
    try {
      await trpc.auth.signout.mutate();
      navigate("/signin");
    } catch (err) {
      alert((err as TRPCError).message);
    }
  }

  return (
    <header className=" border-b border-b-gray-300 text-primary select-none">
      <div className="container h-24 flex justify-between items-center">
        <div className="flex gap-10 h-full items-center">
          <h1 id="ifs" className="text-3xl cursor-pointer font-semibold">
            IFS
          </h1>
          <div className="flex gap-10 h-full font-semibold relative">
            <Link
              to="/dashboard"
              id="dashboard"
              className={`icon cursor-pointer ${
                location.pathname === "/dashboard"
                  ? "text-primary brightness-100"
                  : ""
              }`}
            >
              <AiOutlineDashboard size={24} />
              <div>Dashboard</div>
            </Link>
            <Link
              to="/customer"
              className={`icon cursor-pointer ${
                location.pathname === "/customer"
                  ? "text-primary brightness-100"
                  : ""
              }`}
            >
              <BsFillPeopleFill size={24} />
              <div>Customer</div>
            </Link>
            <Link
              className={`icon cursor-pointer ${
                location.pathname === "/shipping"
                  ? "text-primary brightness-100"
                  : ""
              }`}
              to="/shipping"
            >
              <FaTruck size={24} />
              <div>Shipping</div>
            </Link>
            <Link
              to="/product"
              className={`icon cursor-pointer ${
                location.pathname === "/product"
                  ? "text-primary brightness-100"
                  : ""
              }`}
            >
              <RiInboxFill size={24} />
              <div>Product</div>
            </Link>
            <Link
              to="/supplier"
              className={`icon cursor-pointer ${
                location.pathname === "/supplier"
                  ? "text-primary brightness-100"
                  : ""
              }`}
            >
              <LuBuilding size={24} />
              <div>Supplier</div>
            </Link>
            <div
              className="absolute left-0 bottom-0 h-[2px] w-20 bg-primary transition-[left] duration-[250ms] "
              ref={barRef}
            ></div>
          </div>
        </div>
        <div className="relative cursor-pointer">
          <div
            onClick={() => {
              setShowAccount(!showAccount);
            }}
            className="flex gap-4 items-center"
          >
            <div>{username}</div>
            <FaUser size={24} />
          </div>

          {showAccount && (
            <div
              id="boxAccount"
              className="absolute right-0 top-10 bg-white border  rounded-md shadow-aesthetic py-4 px-5 flex-col gap-1 z-10 "
            >
              <div className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out">
                <div>Profile</div>
                <FiArrowUpRight />
              </div>
              <div className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out">
                <div>Tax</div>
                <FiArrowUpRight />
              </div>
              <div
                className="flex items-center w-32 px-2 py-1 justify-between hover:bg-gray-200 hover:rounded-md hover:duration-200 hover:ease-in-out"
                onClick={handleSignOut}
              >
                <div>Sign Out</div>
                <FiArrowUpRight />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
