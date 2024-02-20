import { useEffect, useRef, useState } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { BsFillPeopleFill, BsList } from "react-icons/bs";
import { FaTruck, FaUser } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import { LuBuilding } from "react-icons/lu";
import { RiInboxFill } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TRPCError, trpc } from "../trpc";

export default function Header() {
    const [showAccount, setShowAccount] = useState(false);
    const [showOption, setShowOption] = useState(false);
    const [username, setUsername] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const iconRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const boxAccountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                iconRef.current &&
                !iconRef.current.contains(event.target as Node) &&
                !boxAccountRef.current?.contains(event.target as Node)
            ) {
                // Click occurred outside of the element, so close it
                setShowAccount(false);
            }
            if (
                listRef.current &&
                !listRef.current.contains(event.target as Node) &&
                !boxAccountRef.current?.contains(event.target as Node)
            ) {
                // Click occurred outside of the element, so close it
                setShowOption(false);
            }
        }

        // Add the event listener when the component mounts
        document.addEventListener("click", handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);
    useEffect(() => {
        const arrIcon = ["/dashboard", "/customer", "/shipping", "/product", "/supplier"];
        let index = arrIcon.findIndex((item) => item === location.pathname);
        index = index === -1 ? 0 : index;
        const left = index * 80 + index * 40;
        barRef.current!.style.setProperty("left", `${left}px`);
    }, [location.pathname]);

    useEffect(() => {
        const username = localStorage.getItem("username");
        setUsername(username || "");
    }, []);

    async function handleNavigation(link: string) {
        try {
            navigate("/" + link);
        } catch (err) {
            alert((err as TRPCError).message);
        }
    }

    async function handleSignOut() {
        try {
            await trpc.auth.signout.mutate();
            navigate("/signin");
        } catch (err) {
            alert((err as TRPCError).message);
        }
    }

    return (
        <header className="border-b border-b-gray-300 text-primary select-none ">
            <div className="relative container mx-auto">
                <div className="h-24 lg:flex justify-between items-center hidden">
                    <div className="flex gap-10 h-full items-center">
                        <h1 id="ifs" className="text-3xl cursor-pointer font-semibold">
                            IFS
                        </h1>
                        <div className="flex gap-10 h-full font-semibold relative ">
                            <Link
                                to="/dashboard"
                                id="dashboard"
                                className={`icon cursor-pointer ${
                                    location.pathname === "/dashboard" ? "text-primary brightness-100" : ""
                                }`}
                            >
                                <AiOutlineDashboard size={24} />
                                <div>Dashboard</div>
                            </Link>
                            <Link
                                to="/customer"
                                className={`icon cursor-pointer ${
                                    location.pathname === "/customer" ? "text-primary brightness-100" : ""
                                }`}
                            >
                                <BsFillPeopleFill size={24} />
                                <div>Customer</div>
                            </Link>
                            <Link
                                className={`icon cursor-pointer ${
                                    location.pathname === "/shipping" ? "text-primary brightness-100" : ""
                                }`}
                                to="/shipping"
                            >
                                <FaTruck size={24} />
                                <div>Shipping</div>
                            </Link>
                            <Link
                                to="/product"
                                className={`icon cursor-pointer ${
                                    location.pathname === "/product" ? "text-primary brightness-100" : ""
                                }`}
                            >
                                <RiInboxFill size={24} />
                                <div>Product</div>
                            </Link>
                            <Link
                                to="/supplier"
                                className={`icon cursor-pointer ${
                                    location.pathname === "/supplier" ? "text-primary brightness-100" : ""
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
                            ref={iconRef}
                            onClick={() => {
                                setShowAccount(true);
                            }}
                            className="flex gap-4 items-center"
                        >
                            <div>{username}</div>
                            <FaUser size={24} />
                        </div>
                    </div>
                </div>
                <div className="lg:hidden h-12 flex justify-between items-center mx-auto">
                    <h1 id="ifs" className="text-3xl cursor-pointer font-semibold">
                        IFS
                    </h1>
                    <div
                        ref={listRef}
                        className="active:bg-gray-200 active:rounded-full active:duration-200 active:ease-in-out"
                        onClick={() => {
                            setShowOption(true);
                        }}
                    >
                        <BsList size={32} />
                    </div>

                    {showOption && (
                        <div
                            id="boxOption"
                            className="absolute right-0 top-16 bg-white border  rounded-md shadow-aesthetic py-3 px-3 flex-col gap-1 z-10 "
                        >
                            <div
                                className="option"
                                onClick={() => {
                                    handleNavigation("dashboard");
                                }}
                            >
                                <div>Dashboard</div>
                                <FiArrowUpRight />
                            </div>
                            <div
                                className="option"
                                onClick={() => {
                                    handleNavigation("customer");
                                }}
                            >
                                <div>Customer</div>
                                <FiArrowUpRight />
                            </div>
                            <div
                                className="option"
                                onClick={() => {
                                    handleNavigation("shipping");
                                }}
                            >
                                <div>Shipping</div>
                                <FiArrowUpRight />
                            </div>
                            <div
                                className="option"
                                onClick={() => {
                                    handleNavigation("product");
                                }}
                            >
                                <div>Product</div>
                                <FiArrowUpRight />
                            </div>
                            <div
                                className="option"
                                onClick={() => {
                                    handleNavigation("supplier");
                                }}
                            >
                                <div>Supplier</div>
                                <FiArrowUpRight />
                            </div>
                            <div
                                ref={boxAccountRef}
                                className="option"
                                onClick={() => {
                                    setShowAccount(true);
                                }}
                            >
                                <div>Profile</div>
                                <FiArrowUpRight />
                            </div>
                        </div>
                    )}
                </div>
                {showAccount && (
                    <div
                        id="boxAccount"
                        className="absolute lg:right-0 right-40 top-60 lg:top-16 bg-white border  rounded-md shadow-aesthetic py-4 lg:px-5 px-3 flex-col gap-1 z-10 "
                    >
                        <div
                            className="option"
                            onClick={() => {
                                handleNavigation("account");
                            }}
                        >
                            <div>Account</div>
                            <FiArrowUpRight />
                        </div>
                        <div className="option">
                            <div>Tax</div>
                            <FiArrowUpRight />
                        </div>
                        <div className="option" onClick={handleSignOut}>
                            <div>Sign Out</div>
                            <FiArrowUpRight />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
