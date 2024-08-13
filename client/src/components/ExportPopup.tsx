import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaFileExport } from "react-icons/fa6";

import { trpc } from "../trpc";
import { CollectionNames } from "../../../server/src/configs/default";
import { set } from "react-hook-form";

type TProps = {
    isShown: boolean;
    onCancel: () => void;
};

export default function ExportPopup(props: TProps) {
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
        <Content isShown={props.isShown} onCancel={props.onCancel} handleAnimationEnd={handleAnimationEnd} />
    ) : null;
}

type TPropsContent = {
    isShown: boolean;
    onCancel: () => void;
    handleAnimationEnd: () => void;
};

function Content(props: TPropsContent) {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <div
                className={`justify-center top-24 fixed inset-0 z-50 ${
                    props.isShown ? "animationPopup" : "animationPopout"
                }`}
                // id="animationPopup"
                onAnimationEnd={props.handleAnimationEnd}
            >
                <div className="relative w-1/6  mx-auto">
                    {/*content*/}
                    <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="h-20 flex px-6 justify-between">
                            <div className="flex items-center">
                                <div className="aspect-square w-12 bg-[#fab98e] border border-cusOgrange rounded-full flex justify-center items-center">
                                    <FaFileExport className="text-cusOgrange" size={16} />
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
                            Xác nhận xuất file
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
                                className="w-32  bg-cusOgrange hover:bg-orange-400 transition-colors  text-white rounded-md h-[52px] overflow-hidden"
                                onClick={() => {
                                    setLoading(true);
                                    trpc.service.exportData
                                        .query({ type: CollectionNames.Shippings })
                                        .then((_) => {
                                            props.onCancel();
                                            setLoading(false);
                                        })
                                        .catch((err) => {
                                            alert(err.message);
                                            setLoading(false);
                                        });
                                }}
                            >
                                <div
                                    className="h-full transition-transform duration-300 active:brightness-150"
                                    style={{
                                        transform: loading ? "translateY(-5px)" : "translateY(-52px)",
                                    }}
                                >
                                    <div className="h-full flex justify-center items-center gap-3">
                                        {loading && (
                                            <>
                                                <div className="w-2 aspect-square bg-white rounded-full animate-updown1"></div>
                                                <div className="w-2 aspect-square bg-white rounded-full animate-updown2"></div>
                                                <div className="w-2 aspect-square bg-white rounded-full animate-updown3"></div>
                                            </>
                                        )}
                                    </div>
                                    <div className="h-full flex justify-center items-center">Xác nhận</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
        </>
    );
}
