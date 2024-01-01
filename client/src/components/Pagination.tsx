import { BsFillSkipEndFill, BsFillSkipStartFill } from "react-icons/bs";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

export default function Pagination() {
    return (
        <>
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
        </>
    );
}
