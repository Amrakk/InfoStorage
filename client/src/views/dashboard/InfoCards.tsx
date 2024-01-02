import type { TCustomer, TSupplier, TShipping, TProduct } from "../../trpc";
import { Link } from "react-router-dom";

import { BsFillPeopleFill } from "react-icons/bs";
import { FaTruck } from "react-icons/fa";
import { LuBuilding } from "react-icons/lu";
import { RiInboxFill } from "react-icons/ri";

type Props = {
    customers: TCustomer;
    shippings: TShipping;
    products: TProduct;
    suppliers: TSupplier;
};

export default function InfoCards(props: Props) {
    return (
        <>
            <Link
                to="/customer"
                className="h-32 w-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col rounded-lg overflow-hidden"
            >
                <div className="bg-cyan-400 h-10 w-full text-white text-lg font-bold flex justify-start items-center pl-4">
                    Customers
                </div>
                <div className="flex-1 flex justify-between items-center px-4">
                    <BsFillPeopleFill size={48} className="text-cyan-400" />
                    <div className="text-2xl font-semibold">{props.customers.length}</div>
                </div>
            </Link>
            <Link
                to="/shipping"
                className="h-32 w-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col rounded-lg overflow-hidden"
            >
                <div className="bg-second h-10 w-full text-white text-lg font-bold flex justify-start items-center pl-4">
                    Shippings
                </div>
                <div className="flex-1 flex justify-between items-center px-4">
                    <FaTruck size={48} className="text-second" />
                    <div className="text-2xl font-semibold">{props.shippings.length}</div>
                </div>
            </Link>
            <Link
                to="/product"
                className="h-32 w-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col rounded-lg overflow-hidden"
            >
                <div className="bg-primary h-10 w-full text-white text-lg font-bold flex justify-start items-center pl-4">
                    Products
                </div>
                <div className="flex-1 flex justify-between items-center px-4">
                    <RiInboxFill size={48} className="text-primary" />
                    <div className="text-2xl font-semibold">{props.products.length}</div>
                </div>
            </Link>
            <Link
                to="/supplier"
                className="h-32 w-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col rounded-lg overflow-hidden"
            >
                <div className="bg-teal-800 h-10 w-full text-white text-lg font-bold flex justify-start items-center pl-4">
                    Suppliers
                </div>
                <div className="flex-1 flex justify-between items-center px-4">
                    <LuBuilding size={48} className="text-teal-800" />
                    <div className="text-2xl font-semibold">{props.suppliers.length}</div>
                </div>
            </Link>
        </>
    );
}
