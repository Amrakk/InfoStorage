import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { trpc } from "../trpc";
type TProps = {
    message: string;
    _id: string;
    getShippings: () => void;
    isShown: boolean;
    onCancel: () => void;
};
export default function DeletePopup(props: TProps) {
    const [shouldRender, setShouldRender] = useState<boolean>(false);

    useEffect(() => {
        if (props.isShown) {
            setShouldRender(true);
        }
    }, [props.isShown]);

    function handleAnimationEnd() {
        if (!props.isShown) {
            setShouldRender(false);
        }
    }

    return shouldRender ? (
        <>
            <Content
                _id={props._id}
                getShippings={props.getShippings}
                message={props.message}
                isShown={props.isShown}
                onCancel={props.onCancel}
                handleAnimationEnd={handleAnimationEnd}
            />
        </>
    ) : null;
}

type TPropsContent = {
    message: string;
    _id: string;
    getShippings: () => void;
    isShown: boolean;
    onCancel: () => void;
    handleAnimationEnd: () => void;
};

function Content(props: TPropsContent) {
    return (
        <>
            <div
                className={`justify-center top-24 fixed inset-0 z-50 ${
                    props.isShown ? "animationPopup" : "animationPopout"
                }`}
                // id="animationPopup"
                onAnimationEnd={props.handleAnimationEnd}
            >
                <div className="relative w-1/3   mx-auto">
                    {/*content*/}
                    <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="h-20 flex px-6 justify-between">
                            <div className="flex items-center">
                                <div className="aspect-square w-12 bg-[#eeb1bd] border border-accent1 rounded-full flex justify-center items-center">
                                    <FaTrash className="text-accent1" size={16} />
                                </div>
                            </div>
                            <div className="pt-3">
                                <IoClose
                                    size={30}
                                    className="text-primary cursor-pointer hover:text-[#5e7563] transition-colors"
                                    onClick={() => {
                                        props.onCancel();
                                    }}
                                />
                            </div>
                        </div>
                        {/*body*/}
                        <div className="relative  px-5 flex-auto text-lg text-primary     font-semibold">
                            Bạn có chắc chắn muốn xóa <span className="text-accent1">{props.message}</span>{" "}
                            không?
                        </div>
                        {/*footer*/}

                        <div className="flex items-center justify-end m-6 border-slate-200  gap-4 font-semibold">
                            <button
                                type="button"
                                className="w-32 py-3 bg-gray-300 hover:bg-gray-200 transition-colors  text-primary rounded-md"
                                onClick={() => {
                                    props.onCancel();
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="w-32 py-3 bg-accent1 hover:bg-red-400 transition-colors  text-white rounded-md"
                                onClick={() => {
                                    trpc.shipping.deleteShipping
                                        .mutate({ id: props._id })
                                        .then(() => {
                                            props.getShippings();
                                        })
                                        .finally(() => {
                                            props.onCancel();
                                        });
                                }}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
        </>
    );
}
