import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/Header.tsx";

import Account from "./pages/Account.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Forgotpassword from "./pages/Forgotpassword.tsx";
import Notfound from "./pages/Notfound.tsx";
import Shipping from "./pages/Shipping.tsx";
import Signin from "./pages/Signin.tsx";

import { useNotification } from "./stores/Notification.ts";
import { useProvinces } from "./stores/Provinces.ts";

import toaster, { Toaster } from "react-hot-toast";
import { trpc, trpcWss } from "./trpc.ts";

import { v4 } from "uuid";
import { IoClose } from "react-icons/io5";

type NotificationProps = {
    message: string;
    timestamp: number;
    total: number;
    dismiss: () => void;
    onRead: () => void;
};
function Notification({ message, timestamp, total, dismiss, onRead }: NotificationProps) {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <span
            className={`relative flex${
                showDetail ? " flex-col" : " items-center"
            } transition-all max-w-60 w-full`}
            style={{
                height: showDetail ? `${Math.ceil(message.length / 29) * 24 + 28}px` : `24px`,
            }}
        >
            {!showDetail && (
                <span className="absolute -left-6 -top-4 drop-shadow-md rounded-full bg-red-600 px-2 text-white">
                    {total}
                </span>
            )}
            {!showDetail ? (
                <>
                    <div className="ml-auto">Bạn có thông báo mới</div>
                    <button
                        className="ml-2 pl-2 border-l-2 border-primary text-cyan-600"
                        onClick={() => {
                            onRead();
                            setShowDetail(true);
                            setTimeout(() => {
                                dismiss();
                            }, 1000 * 5);
                        }}
                    >
                        Xem
                    </button>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <small className="text-xs text-cyan-600">
                            {new Date(timestamp).toLocaleString()}
                        </small>
                        <button className="text-sm" onClick={() => dismiss()}>
                            <IoClose size={22} />
                        </button>
                    </div>
                    <div className="mt-2 flex-1 break-words overflow-hidden w-60">{message}</div>
                </>
            )}
        </span>
    );
}

function App() {
    const location = useLocation();
    const { setProvinces } = useProvinces();
    const { notification, loadNotification, addNotification, removeNotification } =
        useNotification();
    const curNotificationId = useRef<string | null>(null);
    const curReadingNotificationId = useRef<string | null>(null);
    const abortController = useRef(new AbortController());

    const toast = (message: string, timestamp: number, id: string) => {
        toaster(
            (t) => (
                <Notification
                    message={message}
                    timestamp={timestamp}
                    total={notification.length}
                    dismiss={() => {
                        toaster.dismiss(t.id);
                        if (curReadingNotificationId.current == t.id) curReadingNotificationId.current = null;
                    }}
                    onRead={() => {
                        if (curNotificationId.current === t.id) curNotificationId.current = null;
                        if (curReadingNotificationId.current)
                            toaster.dismiss(curReadingNotificationId.current);
                        curReadingNotificationId.current = t.id;
                        removeNotification(message);
                    }}
                />
            ),
            {
                position: "top-right",
                id: id,
                duration: 1000 * 60 * 60 * 24 * 2, // 2 days
            }
        );
    };

    useEffect(() => {
        loadNotification();

        fetch("/provinces.json", {
            signal: abortController.current.signal,
        }).then((res) => {
            const parsed = res.json();
            parsed.then((data) => {
                setProvinces(data);
            });
        });

        return () => {
            abortController.current.abort();
        };
    }, []);

    useEffect(() => {
        const id = v4();
        if (notification.length > 0) {
            curNotificationId.current = id;
            toast(notification[0].message, notification[0].timestamp, id);
        }

        return () => {
            if (curNotificationId.current) toaster.dismiss(curNotificationId.current);
        };
    }, [notification]);

    useEffect(() => {
        const subscription = trpcWss.onConnect.subscribe(undefined, {
            onData: (data) => {
                if ((data as { type: string }).type === "ping") {
                    trpcWss.pong.query().catch(() => {
                        trpc.service.getAccToken.query().then(() => {
                            console.log("getAccToken");
                        });
                    });
                } else if ((data as { type: string }).type === "notification") {
                    addNotification(data.data as string);
                }
            },
            onStopped() {
                console.log("Unsubscribed");
            },
            onError: (error) => {
                console.log("onError", error);
                trpc.service.getAccToken.query().then(() => {
                    console.log("getAccToken");
                });
            },
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const arrRoutes = [
        "/",
        "/home",
        "/dashboard",
        "/customer",
        "/shipping",
        "/product",
        "/supplier",
        "/account",
    ];
    return (
        <>
            {!arrRoutes.includes(location.pathname) ? (
                <Routes>
                    <Route path="/signin" element={<Signin />} />
                    <Route path="*" element={<Notfound />} />
                    <Route path="/forgotpassword" element={<Forgotpassword />} />
                </Routes>
            ) : (
                <>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/home" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/account" element={<Account />} />
                    </Routes>
                </>
            )}
            <Toaster />
        </>
    );
}

export default App;
