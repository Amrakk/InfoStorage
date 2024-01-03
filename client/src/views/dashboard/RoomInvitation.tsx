export default function RoomInvitation() {
    return (
        <div className="rounded-md overflow-hidden shadow-md lg:mt-0 mt-4">
            <div className="bg-second py-2 px-4">
                <h2 className="text-xl text-white font-semibold">Lời mời</h2>
            </div>
            <div className="py-2 px-4 flex justify-between items-center">
                <div>
                    • <strong>Tri Dung</strong> đang mời bạn vào phòng
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-md relative">
                    <div className="w-3 h-3 absolute -top-1 -right-1 bg-red-500 rounded-full z-20"></div>
                    <div className="w-3 h-3 absolute -top-1 -right-1 bg-red-500 rounded-full animate-ping z-10"></div>
                    <div>Tham gia</div>
                </button>
            </div>
        </div>
    );
}
