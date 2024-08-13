import { useEffect, useState } from "react";
import dataNotFound from "../assets/img/data not found.png";
import { useIconAppear } from "../stores/IconAppear";
import OptionSelected from "./OptionSelected";
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
    handleUpdatePopUp: (
        shippingId: string,
        shippingName: string,
        shippingAddress: string,
        shippingPhone: string,
        shippingNote: string
    ) => void;
    handleDeletePopUp: (shippingId: string, shippingName: string) => void;
};

export default function Table(props: TProps) {
    const { setIconAppear } = useIconAppear();
    const [grabbing, setGrabbing] = useState(false);
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const actions = [
        {
            name: "Chỉnh sửa",
            icon: "edit_icon.svg",
            action: "edit",
            color: "#6AAFC7",
            background: "#B8DDEA",
        },

        {
            name: "Hủy",
            icon: "cancel_icon.svg",
            action: "cancel",
            color: "#415245",
            background: "#B5D4BC",
        },
        {
            name: "Xóa",
            icon: "delete_icon.svg",
            action: "delete",
            color: "#CD0F0F",
            background: "#EEB1BD",
        },
    ];
    const [action, setAction] = useState<number>(-1);
    const [currentShipping, setCurrentShipping] = useState<{
        _id: string;
        name: string;
        phone: string;
        address: string;
        note: string;
    } | null>(null);

    useEffect(() => {
        if (action === 0 && grabbing == false) {
            props.handleUpdatePopUp(
                currentShipping!._id,
                currentShipping!.name,
                currentShipping!.address,
                currentShipping!.phone,
                currentShipping!.note
            );
        } else if (action === 2 && grabbing == false) {
            // setIsDeletePopupOpen(currentShipping!.name);
            props.handleDeletePopUp(currentShipping!._id, currentShipping!.name);
        }
    }, [grabbing, action]);
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
            <table
                id="table"
                className="w-[1480px] table-fixed relative border-separate text-left "
                style={inputStyle}
            >
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
                                        className={` border-b-2 border-[#D1DBD3]  hover:bg-gray-200 cursor-pointer active:bg-gray-300 hover:rounded-xl
                                            grabbing
                                            ${grabbing ? "cursor-grabbing" : "cursor-pointer "}
                                            `}
                                        draggable
                                        onDragStart={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setGrabbing(true);
                                            setCoordinates({
                                                x: e.clientX,
                                                y: e.clientY,
                                            });
                                            setCurrentShipping({
                                                _id: shipping._id,
                                                name: shipping.name,
                                                phone: shipping.phone,
                                                address: shipping.address,
                                                note: shipping.note,
                                            });
                                            props.handleId(shipping._id);
                                        }}
                                        onDragEnd={() => {
                                            setIconAppear(false);
                                            setGrabbing(false);
                                        }}
                                        key={shipping._id}
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
                                            {shipping.note.split("\n").map((item, index) => {
                                                return (
                                                    <p key={index}>
                                                        {item}
                                                        <br />
                                                    </p>
                                                );
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    )}
                </tbody>
            </table>
            {/* {grabbing && (
                
            )} */}
            <OptionSelected
                x={coordinates.x}
                y={coordinates.y}
                grabbing={grabbing}
                setGrabbing={setGrabbing}
                setAction={setAction}
                actions={actions}
            />
        </div>
    );
}
