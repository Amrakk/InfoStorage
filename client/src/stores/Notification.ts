import { create } from "zustand";

type TNotification = {
    notification: {
        message: string;
        timestamp: number;
    }[];
    loadNotification: () => void;
    addNotification: (message: string) => void;
    removeNotification: (message: string) => void;
};

const EXPIRE_TIME = 1000 * 60 * 60 * 24 * 2; // 2 days
function filterNotification(notification: TNotification["notification"]) {
    return notification.filter((noti) => Date.now() - noti.timestamp < EXPIRE_TIME);
}

export const useNotification = create<TNotification>()((set) => ({
    notification: [],
    loadNotification: () => {
        const notification = window.localStorage.getItem("notification");
        if (notification) {
            const newState = {
                notification: filterNotification(JSON.parse(notification)),
            }

            window.localStorage.setItem("notification", JSON.stringify(newState.notification));
            set(newState);
        }
    },
    addNotification: (message) =>
        set((state) => {
            const newState = {
                notification: filterNotification([{ message: message, timestamp: Date.now() }, ...state.notification]),
            };
            window.localStorage.setItem("notification", JSON.stringify(newState.notification));

            return newState;
        }),
    removeNotification: (message) =>
        set((state) => {
            const newState = {
                notification: filterNotification(state.notification.filter((noti) => noti.message !== message)),
            };
            window.localStorage.setItem("notification", JSON.stringify(newState.notification));

            return newState;
        }),
}));
