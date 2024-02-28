import { useState } from "react";
import dataNotFound from "../assets/img/data not found.png";
import { useIconAppear } from "../stores/IconAppear";
import TableSkeleton from "./TableSkeleton";
const inputStyle = {
    caretColor: "transparent",
};

type TProps = {
    currentItem:
        | {
              _id: string;
              name: string;
              phone: string;
              address: string;
              note: string;
          }[]
        | null;
    currentPage: number;
    itemsPerPage: number;
    handleId: (id: string) => void;
    handleCopy: (data: string) => () => void;
};

export default function Table(props: TProps) {
    const { setIconAppear } = useIconAppear();
    const [grabbing, setGrabbing] = useState(true);
    if (props.currentItem?.length == 0) {
        return (
            <div className="mt-8 h-[500px] overflow-auto">
                <div className="flex justify-center flex-col items-center">
                    <img src={dataNotFound} alt="" className="max-w-sm" />
                    <div className="font-medium text-xl">Không có dữ liệu</div>
                </div>
            </div>
        );
    }
    return (
        <div className="mt-8 h-[500px] overflow-auto">
            <table className="w-[1480px] table-fixed relative border-separate text-left " style={inputStyle}>
                <thead className="">
                    <tr className="select-none">
                        <th className="text-center px-4 text-lg sticky top-0 border-b border-[#D1DBD3] bg-white w-[5%] ">
                            STT
                        </th>
                        <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white w-[20%]">
                            Tên đơn vị
                        </th>
                        <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white w-[40%]">
                            Địa chỉ
                        </th>
                        <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white w-[10%]">
                            Số điện thoại
                        </th>
                        <th className="border-l-2 border-[#D1DBD3] p-3 text-lg sticky top-0 border-b bg-white ">
                            Ghi chú
                        </th>
                    </tr>
                </thead>

                <tbody className="h-full">
                    {props.currentItem == null ? (
                        <TableSkeleton />
                    ) : (
                        <>
                            {props.currentItem.map((shipping, index) => {
                                return (
                                    <tr
                                        key={shipping._id}
                                        className={` border-b-2 border-[#D1DBD3]  hover:bg-gray-200 cursor-pointer active:bg-gray-300 hover:rounded-xl ${
                                            grabbing ? "cursor-grabbing" : "cursor-pointer"
                                        }`}
                                        draggable
                                        onDragStart={(e) => {
                                            e.stopPropagation();
                                            setIconAppear(true);
                                            setGrabbing(true);
                                            console.log(grabbing);
                                            e.dataTransfer.setData("shippingId", shipping._id);
                                            e.dataTransfer.setData("shippingName", shipping.name);
                                            e.dataTransfer.setData("shippingAddress", shipping.address);
                                            e.dataTransfer.setData("shippingPhone", shipping.phone);
                                            e.dataTransfer.setData("shippingNote", shipping.note);
                                            props.handleId(shipping._id);
                                        }}
                                        onDragEnd={(e) => {
                                            setIconAppear(false);
                                            setGrabbing(false);
                                        }}
                                    >
                                        <td
                                            className="text-center stt hover:bg-gray-400 hover:bg-opacity-30 transition-all rounded-lg"
                                            onClick={props.handleCopy(
                                                `${shipping.name}\n${shipping.address}\n${shipping.phone}\n\n${shipping.note}`
                                            )}
                                        >
                                            {index + 1 + (props.currentPage - 1) * props.itemsPerPage}
                                        </td>
                                        <td
                                            className="p-3 hover:bg-gray-400 hover:bg-opacity-30 transition-all rounded-lg"
                                            onClick={props.handleCopy(shipping.name)}
                                        >
                                            {shipping.name}
                                        </td>
                                        <td
                                            className="p-3 hover:bg-gray-400 hover:bg-opacity-30 transition-all rounded-lg"
                                            onClick={props.handleCopy(shipping.address)}
                                        >
                                            {shipping.address}
                                        </td>
                                        <td
                                            className="p-3 hover:bg-gray-400 hover:bg-opacity-30 transition-all rounded-lg"
                                            onClick={props.handleCopy(shipping.phone)}
                                        >
                                            {shipping.phone}
                                        </td>
                                        <td
                                            className="p-3 whitespace-normal break-words hover:bg-gray-400 hover:bg-opacity-30 transition-all rounded-lg"
                                            onClick={props.handleCopy(shipping.note)}
                                        >
                                            <p>
                                                {shipping.note.split("\n").map((item) => {
                                                    return (
                                                        <>
                                                            {item}
                                                            <br />
                                                        </>
                                                    );
                                                })}
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}
