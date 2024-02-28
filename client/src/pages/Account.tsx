import { trpc, trpcWss } from "../trpc";
import React, { useState } from "react";

const passwordRegex = new RegExp(/^[a-zA-Z0-9]+$/m);

function Warning({ message }: { message: string | undefined }) {
    return (
        <span className="absolute right-0 bottom-0 text-sm font-normal text-accent1">
            {message}
        </span>
    );
}

export default function Account() {
    const role = localStorage.getItem("role");
    const [passwordWarning, setPasswordWarning] = useState("");
    const [newPasswordWarning, setNewPasswordWarning] = useState("");
    const [confirmPasswordWarning, setConfirmPasswordWarning] = useState("");

    const [isSendingNotification, setIsSendingNotification] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        const passwordInput = e.target as HTMLInputElement;
        const passwordValue = e.target.value;
        const name = e.target.name;

        passwordInput.classList.remove("focus:border-[#6AAFC7]", "focus:border", "border-primary");
        passwordInput.classList.add("border-accent1");

        let warning = "";
        if (passwordValue === "") {
            warning = "Required";
        } else if (passwordValue.match(passwordRegex) === null) {
            warning = "Password only include a-z, A-Z, 0-9";
        } else {
            passwordInput.classList.remove("border-accent1");
            passwordInput.classList.add("focus:border-[#6AAFC7]", "focus:border", "border-primary");
        }

        if (name === "password") return setPasswordWarning(warning);
        else if (name === "newPassword") return setNewPasswordWarning(warning);
        else {
            if (
                warning === "" &&
                passwordValue !==
                    (document.getElementById("newPassword") as HTMLInputElement)?.value
            ) {
                passwordInput.classList.remove(
                    "focus:border-[#6AAFC7]",
                    "focus:border",
                    "border-primary"
                );
                passwordInput.classList.add("border-accent1");
                warning = "Confirm password not match";
            } else {
                passwordInput.classList.remove("border-accent1");
                passwordInput.classList.add(
                    "focus:border-[#6AAFC7]",
                    "focus:border",
                    "border-primary"
                );
            }

            return setConfirmPasswordWarning(warning);
        }
    }

    function handleSubmitChangePass(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const password = document.getElementById("password") as HTMLInputElement;
        const newPassword = document.getElementById("newPassword") as HTMLInputElement;

        if (passwordWarning !== "" || newPasswordWarning !== "" || confirmPasswordWarning !== "")
            return;
        trpc.user.changePassword
            .mutate({ oldPass: password.value, newPass: newPassword.value })
            .then((res) => {
                alert(res.message);
            })
            .catch((err) => {
                alert(err.message);
            });
    }

    function sendNotification(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!inputRef.current || inputRef.current.value === "") return;

        setIsSendingNotification(true);

        trpcWss.notify
            .query({ message: inputRef.current.value })
            .then((res) => {
                if (res.status == "success") {
                    // alert("Notification sent");
                } else {
                    // alert("Notification failed");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Notification failed");
            })
            .finally(() => {
                setIsSendingNotification(false);
            });
    }

    return (
        <>
            <div className="container text-primary">
                <div className="flex justify-between mt-8">
                    <h1 className="text-4xl font-semibold">Account</h1>
                </div>
            </div>

            <div className="container flex justify-between mt-8 text-primary mb-12 overflow-hidden">
                <nav className="hidden xl:flex flex-col font-sans font-extralight text-xl text-[#979E99] sticky top-0 z-10">
                    <ul className="w-40 list-none cursor-pointer">
                        <li className="mb-2" id="profileNav">
                            <a className="block px-4 py-2 rounded-md hover:bg-gray-200 hover:text-primary hover:font-normal hover:duration-200 hover:ease-in-out">
                                Profile
                            </a>
                        </li>
                        {(role === "admin" || role === "manager") && (
                            <li className="mb-2" id="hostNav">
                                <a className="block px-4 py-2 rounded-md hover:bg-gray-200 hover:text-primary  hover:font-normal hover:duration-200 hover:ease-in-out">
                                    Host
                                </a>
                            </li>
                        )}
                        {role === "admin" && (
                            <li className="mb-2" id="adminNav">
                                <a className="block px-4 py-2 rounded-md hover:bg-gray-200 hover:text-primary  hover:font-normal hover:duration-200 hover:ease-in-out">
                                    Admin
                                </a>
                            </li>
                        )}
                    </ul>
                </nav>

                <div className="flex flex-col w-full xl:ml-12 gap-5">
                    <div
                        className="flex flex-wrap h-auto border-[#979E99] border rounded-md p-4 xl:px-10 xl:py-6"
                        id="profilePanel"
                    >
                        <div className="w-full border-b border-[#979E99] pb-3">
                            <h2 className="text-2xl font-semibold">Profile</h2>
                        </div>
                        <div className="xl:flex justify-between w-full">
                            <div className="flex flex-col gap-7 pt-8 pb-2 font-normal xl:text-lg">
                                <div className="h-10 flex items-center font-medium">
                                    <label className="mr-10 w-10 xl:w-20 inline-block font-normal text-[#979E99]">
                                        NAME
                                    </label>
                                    {localStorage.getItem("username")}
                                </div>

                                <div className="h-10 flex items-center font-medium">
                                    <label className="mr-10 w-10 xl:w-20 inline-block font-normal text-[#979E99]">
                                        EMAIL
                                    </label>
                                    {localStorage.getItem("email")}
                                </div>

                                <div className="h-10 flex items-center font-medium">
                                    <label className="mr-10 w-10 xl:w-20 inline-block font-normal text-[#979E99]">
                                        PHONE
                                    </label>
                                    {localStorage.getItem("phone")}
                                </div>

                                <div className="h-10 flex items-center font-medium">
                                    <label className="mr-10 w-10 xl:w-20 inline-block font-normal text-[#979E99]">
                                        ROLE
                                    </label>
                                    {localStorage.getItem("role")}
                                </div>
                            </div>

                            <form
                                className="flex flex-col gap-2 pt-8 pb-2 font-normal xl:text-lg"
                                onSubmit={handleSubmitChangePass}
                            >
                                <div className="flex flex-row relative pb-5">
                                    <div className="w-full flex justify-between flex-col xl:flex-row items-center xl:space-x-4">
                                        <label
                                            className="w-full xl:w-60 text-[#979E99]"
                                            htmlFor="password"
                                        >
                                            PASSWORD
                                        </label>
                                        <input
                                            onChange={handlePasswordChange}
                                            placeholder="Enter your password"
                                            id="password"
                                            type="password"
                                            name="password"
                                            className="w-full xl:w-80 h-10 border border-primary rounded-md px-3 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] transition-colors"
                                        />
                                    </div>
                                    {passwordWarning && <Warning message={passwordWarning} />}
                                </div>

                                <div className="flex flex-row relative pb-5">
                                    <div className="w-full flex justify-between flex-col xl:flex-row items-center xl:space-x-4">
                                        <label
                                            className="w-full xl:w-60 text-[#979E99]"
                                            htmlFor="newPassword"
                                        >
                                            NEW PASSWORD
                                        </label>
                                        <input
                                            onChange={handlePasswordChange}
                                            placeholder="Enter your new password"
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            className="w-full xl:w-80 h-10 border border-primary rounded-md px-3 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] transition-colors"
                                        />
                                    </div>
                                    {newPasswordWarning && <Warning message={newPasswordWarning} />}
                                </div>

                                <div className="flex flex-row relative pb-5">
                                    <div className="w-full flex justify-between flex-col xl:flex-row items-center xl:space-x-4">
                                        <label
                                            className="w-full xl:w-60 text-[#979E99]"
                                            htmlFor="confirmPassword"
                                        >
                                            CONFIRM PASSWORD
                                        </label>
                                        <input
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm your password"
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            className="w-full xl:w-80 h-10 border border-primary rounded-md px-3 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] transition-colors"
                                        />
                                    </div>
                                    {confirmPasswordWarning && (
                                        <Warning message={confirmPasswordWarning} />
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button className="bg-primary text-white rounded-md w-52 h-10 hover:bg-[#5e7563] transition-colors">
                                        Change Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {(role === "admin" || role === "manager") && (
                        <div
                            className="flex flex-wrap h-auto border-[#979E99] border rounded-md p-4 xl:px-10 xl:py-6"
                            id="notificationPanel"
                        >
                            <div className="w-full border-b border-[#979E99] pb-3">
                                <h2 className="text-2xl font-semibold">Notification</h2>
                            </div>
                            <form className="mt-4 flex flex-col w-full" onSubmit={sendNotification}>
                                <input
                                    ref={inputRef}
                                    placeholder="Notification"
                                    type="text"
                                    id="notification"
                                    name="notification"
                                    className="w-full h-10 border border-primary rounded-md px-3 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] transition-colors"
                                    disabled={isSendingNotification}
                                    maxLength={200}
                                />
                                <button
                                    className="bg-primary text-white rounded-md w-full max-w-[320px] xs:max-w-[180px] h-10 hover:bg-[#5e7563] transition-colors mt-1 ml-auto"
                                    disabled={isSendingNotification}
                                >
                                    Send Notification
                                </button>
                            </form>
                        </div>
                    )}

                    {(role === "admin" || role === "manager") && (
                        <div
                            className="flex flex-wrap h-auto border-[#979E99] border rounded-md p-4 xl:px-10 xl:py-6"
                            id="hostPanel"
                        >
                            <div className="w-full border-b border-[#979E99] pb-3">
                                <h2 className="text-2xl font-semibold">Host</h2>
                            </div>
                            <div className="h-96">123</div>
                        </div>
                    )}

                    {role === "admin" && (
                        <div
                            className="flex flex-wrap h-auto border-[#979E99] border rounded-md p-4 xl:px-10 xl:py-6"
                            id="adminPanel"
                        >
                            <div className="w-full border-b border-[#979E99] pb-3">
                                <h2 className="text-2xl font-semibold">Admin</h2>
                            </div>

                            <button className="w-20 h-14 xl:h-24 border border-primary my-8 rounded-md font-semibold text-2xl flex justify-center items-center">
                                User
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
