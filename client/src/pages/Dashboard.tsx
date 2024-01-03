import { useEffect, useState } from "react";
import { useDashboard } from "../stores/Dashboard";
import { trpc } from "../trpc";
import { DashboardViews } from "../views";

export default function Dashboard() {
    const { customers, shippings, products, suppliers, setData } = useDashboard();
    const [notiLoading, setNotiLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [willShow, setWillShow] = useState(false);

    useEffect(() => {
        trpc.customer.getCustomers.query().then((customers) => setData({ customers }));
        trpc.shipping.getShippings.query().then((shippings) => setData({ shippings }));
        trpc.product.getProducts.query().then((products) => setData({ products }));
        trpc.supplier.getSuppliers.query().then((suppliers) => setData({ suppliers }));

        setTimeout(() => {
            setNotiLoading(false);
        }, 2000);

        setTimeout(() => {
            setTasksLoading(false);
        }, 1000);

        setTimeout(() => {
            setWillShow(true);
        }, 2000);
    }, []);

    return (
        <div className="container lg:mt-8 mt-4">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <div className="grid grid-cols-3 lg:mt-8 mt-4 lg:gap-8 gap-4">
                <div className="col-span-2">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {!customers || !shippings || !products || !suppliers ? (
                            <DashboardViews.InfoCardsSkeleton />
                        ) : (
                            <DashboardViews.InfoCards
                                customers={customers}
                                shippings={shippings}
                                products={products}
                                suppliers={suppliers}
                            />
                        )}
                    </div>
                    <div className="lg:mt-8 mt-4 w-full">
                        {notiLoading ? (
                            <DashboardViews.NotificationsSkeleton />
                        ) : (
                            <DashboardViews.Notifications />
                        )}
                    </div>
                </div>
                <div>
                    {willShow && <DashboardViews.RoomInvitation />}
                    <div className={`${willShow ? "lg:mt-8 mt-4" : ""} transition-all`} key={"ALNBC"}>
                        {tasksLoading ? <DashboardViews.TasksSkeleton /> : <DashboardViews.Tasks />}
                    </div>
                </div>
            </div>
        </div>
    );
}
