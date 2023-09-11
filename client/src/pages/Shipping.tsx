import React, { useState, useEffect } from "react";
import { trpc, type TRPCError, type TShipping } from "../trpc";
import { AiOutlineSearch, AiFillEdit } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { FaFilter, FaTrash } from "react-icons/fa";
import { BsFillSkipEndFill, BsFillSkipStartFill } from "react-icons/bs";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";
import { BsFillTrash3Fill } from "react-icons/bs";
import DeletePopup from "../components/DeletePopup";
import AddPopup from "../components/AddPopup";
import { useDeletePopupStore } from "../stores/DeletePopup";
import { useAddPopupStore } from "../stores/AddPopup";
export default function Shipping() {
  const navigate = useNavigate();
  const [shippings, setShippings] = useState<TShipping>([]);
  const [iconAppear, setIconAppear] = useState(false);
  const [binPing, setBinPing] = useState(false);
  const [editPing, setEditPing] = useState(false);
  const { isDeletePopupOpen, setIsDeletePopupOpen } = useDeletePopupStore();
  const { isAddPopupOpen, setIsAddPopupOpen } = useAddPopupStore();
  useEffect(() => {
    trpc.shipping.getShippings
      .query()
      .then((res) => {
        setShippings(res);
      })
      .catch((err) => {
        if ((err as TRPCError).data.httpStatus === 401 || 500) {
          navigate("/signin");
        }
      });

    trpc.service.searchByName.query({type: "shippings", text: "thuan"}).then((res) => {
      console.log(res);
    })
  }, []);

  return (
    <>
      <div className="container text-primary">
        <div className="flex justify-between mt-8">
          <div className="text-3xl">Shipping</div>
          <div className="flex gap-5">
            <button className="w-40 py-3 bg-gray-300 hover:bg-gray-200 transition-colors rounded-md">
              Export File
            </button>
            <button className="w-40 py-3 bg-gray-300 hover:bg-gray-200 transition-colors rounded-md">
              Import File
            </button>
            <button
              className="w-40 py-3 bg-primary hover:bg-[#5e7563] transition-colors  text-white rounded-md"
              onClick={() => setIsAddPopupOpen("Shipping")}
            >
              Create
            </button>
          </div>
        </div>
        <div className="flex mt-8 gap-5 h-10">
          <div className="group flex-1 ">
            <div className="h-full  group-focus-within:border-[#6AAFC7] transition-colors group-focus:border flex border border-primary items-center px-1 gap-2 rounded-md">
              <AiOutlineSearch size={24} />
              <input
                type="text"
                className="w-full outline-none text-primary "
                placeholder="Search Services"
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
        {/* {shippings.map((shipping) => {
          return <div>{shipping.name}</div>;
        })} */}
        <div className="mt-8 h-[500px] overflow-auto">
          <table className="w-full table-auto relative border-separate">
            <thead className="">
              <tr className="text-left select-none">
                <th className="text-center px-4 text-lg sticky top-0 border-b border-[#D1DBD3] bg-white ">
                  STT
                </th>
                <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white ">
                  Tên Đơn Vị
                </th>
                <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white ">
                  Địa Chỉ
                </th>
                <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white ">
                  Số Điện Thoại
                </th>
                <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white ">
                  Ghi Chú
                </th>
              </tr>
            </thead>

            <tbody className="h-full ">
              {shippings
                .concat(shippings)
                .concat(shippings)
                .map((shipping, index) => {
                  return (
                    <tr
                      key={shipping._id}
                      className="border-b-2 border-[#D1DBD3]  hover:bg-gray-200  hover:duration-200 hover:ease-in-out cursor-pointer"
                      draggable
                      onDragStart={(e) => {
                        setIconAppear(true);
                        e.dataTransfer.setData("shippingName", shipping.name);
                      }}
                      onDragEnd={(e) => {
                        setIconAppear(false);
                      }}
                    >
                      <td className="text-center">{index + 1}</td>
                      <td className="p-3">{shipping.name}</td>
                      <td className="p-3">{shipping.address}</td>
                      <td className="p-3">{shipping.phone}</td>
                      <td className="p-3">{shipping.note}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center gap-8 justify-end">
          <button className="w-32 py-3 bg-gray-300 hover:bg-gray-200 transition-colors rounded-md">
            10 per page
          </button>
          <div className="flex gap-2">
            <BsFillSkipStartFill size={24} />
            <GrFormPrevious size={24} />
            <div>1 of 6</div>
            <GrFormNext size={24} />
            <BsFillSkipEndFill size={24} />
          </div>
        </div>
        <span
          className={`fixed flex w-72  aspect-square transition-all  ${
            iconAppear ? "-left-32 -bottom-28" : "-left-72 -bottom-64"
          }`}
        >
          <span
            className={`${
              binPing ? "animate-ping" : ""
            } absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75`}
          ></span>
          <span
            className="relative inline-flex  w-72  aspect-square rounded-full bg-red-500 "
            onDragEnter={(e) => {
              setBinPing(true);
            }}
            onDragLeave={() => {
              setBinPing(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              setBinPing(false);
              const shippingName = e.dataTransfer.getData("shippingName");
              setIsDeletePopupOpen(shippingName);
            }}
          >
            <FaTrash
              size={50}
              className="absolute  text-white right-[72px] top-[72px] pointer-events-none"
            />
          </span>
        </span>
        <span
          className={`fixed flex w-72  aspect-square transition-all  ${
            iconAppear ? "-right-32 -bottom-28" : "-right-72 -bottom-64"
          }`}
        >
          <span
            className={`${
              editPing ? "animate-ping" : ""
            } absolute inline-flex h-full w-full rounded-full bg-[#6AAFC7] opacity-75`}
          ></span>
          <span
            className="relative inline-flex  w-72  aspect-square rounded-full bg-[#6AAFC7] "
            onDragEnter={(e) => {
              setEditPing(true);
            }}
            onDragLeave={() => {
              setEditPing(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={() => {
              setBinPing(false);
              setIsDeletePopupOpen("Shipping");
            }}
          >
            <AiFillEdit
              size={55}
              className="absolute  text-white left-[72px] top-[72px] pointer-events-none"
            />
          </span>
        </span>
        {isDeletePopupOpen && <DeletePopup message={isDeletePopupOpen} />}
        {isAddPopupOpen && <AddPopup message={isAddPopupOpen} />}
      </div>
    </>
  );
}
