export default function Notifications() {
    return (
        <div className="rounded-md overflow-hidden shadow-md min-h-[240px]">
            <div className="bg-second py-2 px-4">
                <h2 className="text-xl text-white font-semibold">Thông báo</h2>
            </div>
            <div className="py-2 px-4">
                <table className="table-fixed w-full">
                    <colgroup>
                        <col span={1} className="w-1/6" />
                        <col span={1} className="w-5/6" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="text-left border-b-2">Thời gian</th>
                            <th className="text-left px-4 py-1 border-b-2">Tin nhắn</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-left border-b-2">2021-08-01</td>
                            <td className="text-left px-4 py-1 border-b-2">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </td>
                        </tr>
                        <tr>
                            <td className="text-left border-b-2">2021-08-01</td>
                            <td className="text-left px-4 py-1 border-b-2">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </td>
                        </tr>
                        <tr>
                            <td className="text-left border-b-2">2021-08-01</td>
                            <td className="text-left px-4 py-1 border-b-2">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
