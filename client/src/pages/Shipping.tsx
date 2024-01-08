import { useState, useEffect, useRef } from "react";
import { trpc, type TRPCError, type TShipping } from "../trpc";
import { useNavigate } from "react-router-dom";
import { DeletePopup, AddPopup, UpdatePopup } from "../components";
import { useDeletePopupStore } from "../stores/DeletePopup";
import { useShippingsStore } from "../stores/Shippings";
import { Drag, PageActionHub, Search, Table, Pagination } from "../components";

export default function Shipping() {
    const navigate = useNavigate();
    // const [shippings, setShippings] = useState<TShipping>([]);
    const { setShippings } = useShippingsStore();

    const { isDeletePopupOpen } = useDeletePopupStore();
    const [isAddPopupOpen, setIsAddPopupOpen] = useState<boolean>(false);
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState<boolean>(false);
    const [_id, set_Id] = useState("");
    const mouseFollowRef = useRef<HTMLCanvasElement>(null);
    const [isShowCopyBox, setIsShowCopyBox] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");

    const [inputValue, setInputValue] = useState<{
        [key: string]: string | null | undefined;
    }>({});

    const [idTimeOut, setIdTimeOut] = useState<ReturnType<typeof setTimeout>>();

    const handleCopyBox = (x: number, y: number) => {
        if (!isShowCopyBox) {
            mouseFollowRef.current?.style.setProperty("opacity", "0");
            return;
        }

        const mouseFollow = mouseFollowRef.current;
        if (mouseFollow) {
            const ctx = mouseFollow.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, mouseFollow.width, mouseFollow.height);

                ctx.fillStyle = "transparent";
                ctx.strokeStyle = "transparent";
                ctx.beginPath();
                ctx.roundRect(x + 12, y - 20, 70, 40, 10);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = "#6AAFC7";
                ctx.font = `bold 12px ui-sans-serif, system-ui`;
                ctx.fillText("Copied!", x + 22, y + 5);
            }
        }
    };

    function handleSearch(value: string) {
        setSearchValue(value);
    }

    function handleId(_id: string) {
        set_Id(_id);
    }

    useEffect(() => {
        const mouseMoveListener = (e: MouseEvent) => {
            handleCopyBox(e.clientX, e.clientY);
        };
        document.addEventListener("mousemove", mouseMoveListener);
        return () => {
            document.removeEventListener("mousemove", mouseMoveListener);
        };
    }, [isShowCopyBox]);

    useEffect(() => {
        return () => {
            idTimeOut && clearTimeout(idTimeOut);
        };
    }, [idTimeOut]);

    function handleCopy(data: string) {
        return () => {
            navigator.clipboard.writeText(data);

            setIsShowCopyBox(true);
            mouseFollowRef.current?.style.setProperty("opacity", "1");
            setIdTimeOut(
                setTimeout(() => {
                    mouseFollowRef.current?.style.setProperty("opacity", "0");
                }, 1000)
            );
        };
    }

    function getShippings() {
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
    }

    useEffect(() => {
        getShippings();
    }, []);

    function handleAddPopUp() {
        setIsAddPopupOpen(true);
    }

    function handleUpdatePopUp(
        shippingId: string,
        shippingName: string,
        shippingAddress: string,
        shippingPhone: string,
        shippingNote: string
    ) {
        setInputValue({
            _id: shippingId,
            name: shippingName,
            address: shippingAddress,
            phone: shippingPhone,
            note: shippingNote,
        });
        setIsUpdatePopupOpen(true);
    }

    function hideAddPopUp() {
        setIsAddPopupOpen(false);
    }
    function hideUpdatePopUp() {
        setIsUpdatePopupOpen(false);
    }

    return (
        <>
            <canvas
                ref={mouseFollowRef}
                className="fixed inset-0 transition-all duration-300 pointer-events-none justify-center flex items-center text-primary z-10"
                width={window.innerWidth}
                height={window.innerHeight}
            >
                {/* Sao chép thành công */}
            </canvas>

            <div className="container text-primary mx-auto">
                <PageActionHub handleAddPopUp={handleAddPopUp} title="Shipping" />

                <Search handleSearch={handleSearch} />

                <Table handleCopy={handleCopy} handleId={handleId} />

                <Pagination />

                <Drag handleUpdatePopUp={handleUpdatePopUp} />

                {isDeletePopupOpen && (
                    <DeletePopup message={isDeletePopupOpen} _id={_id} getShippings={getShippings} />
                )}
                <AddPopup getShippings={getShippings} isShown={isAddPopupOpen} onCancel={hideAddPopUp} />
                <UpdatePopup
                    getShippings={getShippings}
                    isShown={isUpdatePopupOpen}
                    onCancel={hideUpdatePopUp}
                    inputValue={inputValue}
                />
            </div>
        </>
    );
}
