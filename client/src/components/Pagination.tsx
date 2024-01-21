import { useState, useRef, useEffect } from "react";
import { BsFillSkipEndFill, BsFillSkipStartFill } from "react-icons/bs";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

type TProps = {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    handlePagination: (pageNumber: number) => void;
    updatePageSize: (size: number) => void;
};

export default function Pagination(props: TProps) {
    const [showNumOfPages, setShowNumOfPages] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [numOfPages, setNumOfPages] = useState(8);

    useEffect(() => {
        if (localStorage.getItem("8perPage")) {
            setNumOfPages(Number(localStorage.getItem("8perPage")));
            props.updatePageSize(8);
        } else if (localStorage.getItem("16perPage")) {
            setNumOfPages(Number(localStorage.getItem("16perPage")));
            props.updatePageSize(16);
        } else if (localStorage.getItem("24perPage")) {
            setNumOfPages(Number(localStorage.getItem("24perPage")));
            props.updatePageSize(24);
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                // Click occurred outside of the element, so close it
                setShowNumOfPages(false);
            }
        }

        // Add the event listener when the component mounts
        document.addEventListener("click", handleClickOutside);

        // Clean up the event FaClosedCaptioningounts
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    function handleChangeNumberPerPage(
        numOfPages: number,
        pageSetName: string,
        pageRemove1: string,
        pageRemove2: string
    ) {
        setNumOfPages(numOfPages);
        localStorage.setItem(pageSetName, String(numOfPages));
        localStorage.removeItem(pageRemove1);
        localStorage.removeItem(pageRemove2);
        props.updatePageSize(numOfPages);
        setShowNumOfPages(false);
    }

    useEffect(() => {
        function handleKeyPress(event: KeyboardEvent): void {
            // next page when enter right key is pressed
            if (
                event.key === "ArrowRight" &&
                props.currentPage != Math.ceil(props.totalItems / props.itemsPerPage)
            ) {
                props.handlePagination(props.currentPage + 1);
            }
            // previous page when enter left key is pressed
            else if (event.key === "ArrowLeft" && props.currentPage != 1) {
                props.handlePagination(props.currentPage - 1);
            }
        }
        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [props.currentPage]);

    return (
        <>
            <div className="mt-8 flex items-center gap-8 justify-end">
                <div className="relative">
                    {showNumOfPages && (
                        <div className="absolute bottom-16 -left-4 bg-gray-200/50 backdrop-blur-sm border  rounded-md shadow-aesthetic px-4 py-4 flex-col gap-1 z-10 text-center font-medium">
                            <div
                                className="numOfPages"
                                onClick={() => {
                                    handleChangeNumberPerPage(24, "24perPage", "16perPage", "8perPage");
                                }}
                            >
                                24 per page
                            </div>
                            <div
                                className="numOfPages"
                                onClick={() => {
                                    handleChangeNumberPerPage(16, "16perPage", "24perPage", "8perPage");
                                }}
                            >
                                16 per page
                            </div>
                            <div
                                className="numOfPages"
                                onClick={() => {
                                    handleChangeNumberPerPage(8, "8perPage", "24perPage", "16perPage");
                                }}
                            >
                                8 per page
                            </div>
                        </div>
                    )}
                    <div ref={buttonRef}>
                        <button
                            className="w-32 py-3 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md "
                            onClick={() => {
                                setShowNumOfPages(true);
                            }}
                        >
                            {numOfPages} per page
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 ">
                    <BsFillSkipStartFill
                        className="hover-pagination"
                        size={24}
                        onClick={() => props.handlePagination(1)}
                    />
                    <GrFormPrevious
                        className={`${props.currentPage == 1 ? "disabled" : "hover-pagination"}`}
                        size={24}
                        onClick={() => props.handlePagination(props.currentPage - 1)}
                    />
                    {props.totalItems == 0 ? 0 : props.currentPage} of{" "}
                    {Math.ceil(props.totalItems / props.itemsPerPage)}
                    <GrFormNext
                        className={`${
                            props.currentPage == Math.ceil(props.totalItems / props.itemsPerPage)
                                ? "disabled"
                                : "hover-pagination"
                        }`}
                        size={24}
                        onClick={() => props.handlePagination(props.currentPage + 1)}
                    />
                    <BsFillSkipEndFill
                        size={24}
                        className="hover-pagination"
                        onClick={() =>
                            props.handlePagination(Math.ceil(props.totalItems / props.itemsPerPage))
                        }
                    />
                </div>
            </div>
        </>
    );
}
