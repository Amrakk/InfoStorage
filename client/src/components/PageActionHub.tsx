type TProps = {
    handleAddPopUp: () => void;
    title: string;
};

export default function PageActionHub(props: TProps) {
    return (
        <>
            <div className="lg:flex justify-between lg:mt-8 mt-4">
                <div className="text-3xl font-semibold text-center lg:text-left">{props.title}</div>
                <div className="lg:flex gap-5 hidden">
                    <button className="w-40 py-3 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md">
                        Export File
                    </button>
                    <button className="w-40 py-3 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md">
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
