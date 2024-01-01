import React from "react";

type TProps = {
    handleAddPopUp: () => void;
};

export default function PageActionHub(props: TProps) {
    return (
        <>
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
                        onClick={props.handleAddPopUp}
                    >
                        Create
                    </button>
                </div>
            </div>
        </>
    );
}
