import { FaTrash } from "react-icons/fa";
import { useDeletePopupStore } from "../stores/DeletePopup";
import { useIconAppear } from "../stores/IconAppear";
import { useBinPing } from "../stores/BinPing";
import { useEditPing } from "../stores/EditPing";
import { AiFillEdit } from "react-icons/ai";

type TProps = {
    handleUpdatePopUp: (
        shippingId: string,
        shippingName: string,
        shippingAddress: string,
        shippingPhone: string,
        shippingNote: string
    ) => void;
};

export default function Drag(props: TProps) {
    const { setIsDeletePopupOpen } = useDeletePopupStore();
    const { iconAppear } = useIconAppear();
    const { binPing, setBinPing } = useBinPing();
    const { editPing, setEditPing } = useEditPing();
    return (
        <>
            <span
                className={`fixed flex w-72  aspect-square transition-all duration-300  ${
                    iconAppear ? "-left-32 -bottom-28" : "-left-72 -bottom-64"
                }`}
            >
                <span
                    className={`${
                        binPing ? "animate-ping" : ""
                    } absolute inline-flex h-full w-full rounded-full bg-accent1 opacity-75`}
                ></span>
                <span
                    className="relative inline-flex  w-72  aspect-square rounded-full bg-accent1 "
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
                        const shippingName =
                            e.dataTransfer.getData("shippingName");
                        setIsDeletePopupOpen(shippingName);
                    }}
                >
                    <FaTrash
                        size={50}
                        className="absolute text-white right-[72px] top-[72px] pointer-events-none"
                    />
                </span>
            </span>
            <span
                className={`fixed flex w-72  aspect-square transition-all  duration-300  ${
                    iconAppear ? "-right-32 -bottom-28" : "-right-72 -bottom-64"
                }`}
            >
                <span
                    className={`${
                        editPing ? "animate-ping" : ""
                    } absolute inline-flex h-full w-full rounded-full bg-second opacity-75`}
                ></span>
                <span
                    className="relative inline-flex  w-72  aspect-square rounded-full bg-second "
                    onDragEnter={(e) => {
                        setEditPing(true);
                    }}
                    onDragLeave={() => {
                        setEditPing(false);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setEditPing(false);
                        const shippingId = e.dataTransfer.getData("shippingId");
                        const shippingName =
                            e.dataTransfer.getData("shippingName");
                        const shippingAddress =
                            e.dataTransfer.getData("shippingAddress");
                        const shippingPhone =
                            e.dataTransfer.getData("shippingPhone");
                        const shippingNote =
                            e.dataTransfer.getData("shippingNote");

                        props.handleUpdatePopUp(
                            shippingId,
                            shippingName,
                            shippingAddress,
                            shippingPhone,
                            shippingNote
                        );
                    }}
                >
                    <AiFillEdit
                        size={55}
                        className="absolute  text-white left-[72px] top-[72px] pointer-events-none"
                    />
                </span>
            </span>
        </>
    );
}
