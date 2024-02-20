import { useState, useEffect, useRef } from "react";
import { trpc, type TRPCError, type TShipping } from "../trpc";
import { useNavigate } from "react-router-dom";
import { useDeletePopupStore } from "../stores/DeletePopup";
import { useShippingsStore } from "../stores/Shippings";
import {
    DeletePopup,
    AddPopup,
    UpdatePopup,
    Drag,
    PageActionHub,
    Search,
    Table,
    Pagination,
    FilterPopup,
} from "../components";
import { v4 } from "uuid";

export default function Shipping() {
    const navigate = useNavigate();
    const { shippings, setShippings } = useShippingsStore();

    const { isDeletePopupOpen } = useDeletePopupStore();
    const [isAddPopupOpen, setIsAddPopupOpen] = useState<boolean>(false);
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState<boolean>(false);
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState<boolean>(false);

    const [_id, set_Id] = useState("");
    const mouseFollowRef = useRef<HTMLCanvasElement>(null);
    const [isShowCopyBox, setIsShowCopyBox] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState(shippings);
    const [inputValue, setInputValue] = useState<{
        [key: string]: string | null | undefined;
    }>({});

    const [idTimeOut, setIdTimeOut] = useState<ReturnType<typeof setTimeout>>();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    // Logic to calculate currentItems based on currentPage and itemsPerPage
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems =
        shippings == null
            ? null
            : (searchValue == null ? shippings : searchValue).slice(indexOfFirstItem, indexOfLastItem);
    const totalLength = shippings == null ? 0 : searchValue == null ? shippings.length : searchValue.length;
    const handlePagination = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const updatePageSize = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1); // Reset to the first page when changing items per page
    };

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
        if (shippings == null) return;
        setCurrentPage(1);
        if (value === "") {
            setSearchValue(null);
            return;
        }
        const filteredData = shippings.filter((item) =>
            toLowerNonAccentVietnamese(item.name).includes(toLowerNonAccentVietnamese(value))
        );

        if (filteredData.length === 0) {
            if (searchValue?.length !== 0) {
                setSearchValue([]);
            }
        } else {
            setSearchValue(filteredData);
        }
    }

    function handleFilter(value: string) {}

    function toLowerNonAccentVietnamese(str: string) {
        str = str.toLowerCase();
        str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");

        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
        str = str.replace(/\u02C6|\u0306|\u031B/g, "");
        return str;
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

    async function getShippings() {
        try {
            const res = await trpc.shipping.getShippings.query();
            const updatedShippings = Array.from({ length: 11 }, () => [...res])
                .flat()
                .map((s) => {
                    s._id = v4();
                    return { ...s };
                });

            setShippings(updatedShippings);
        } catch (err) {
            if ((err as TRPCError).data.httpStatus === 401 || (err as TRPCError).data.httpStatus === 500) {
                navigate("/signin");
            }
        }
    }

    useEffect(() => {
        getShippings();
    }, []);

    function handleAddPopUp() {
        setIsAddPopupOpen(true);
    }

    function handleFilterPopUp() {
        setIsFilterPopupOpen(true);
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

    function hideFilterPopUp() {
        setIsFilterPopupOpen(false);
    }

    function onFilter(value: {
        name: string;
        address: string;
        provinceCode: string;
        districtCode: string;
        wardCode: string;
        phone: string | null;
        note: string | null;
    }) {}

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

                <Search handleSearch={handleSearch} handleFilterPopUp={handleFilterPopUp} />

                <Table
                    currentItem={currentItems}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    handleCopy={handleCopy}
                    handleId={handleId}
                />

                <Pagination
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalLength}
                    handlePagination={handlePagination}
                    updatePageSize={updatePageSize}
                />

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

                <FilterPopup isShown={isFilterPopupOpen} onCancel={hideFilterPopUp} />
            </div>
        </>
    );
}
