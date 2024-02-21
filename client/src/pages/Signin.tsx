import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TRPCError, trpc } from "../trpc";

const notBlinking = {
    caretColor: "transparent",
};

const isBlinking = {
    caretColor: "#415245",
};

function Warning({ message }: { message: string | undefined }) {
    return (
        <div className="absolute text-accent1 mt-1 right-1">
            <p>{message}</p>
        </div>
    );
}

export default function Signin() {
    const [emailWarning, setEmailWarning] = useState("");
    const [passwordWarning, setPasswordWarning] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    async function handleLogin() {
        try {
            setLoading(true);

            const user = await trpc.auth.signin.mutate({ email, password });
            localStorage.setItem("username", user.user.name);
            localStorage.setItem("email", user.user.email);
            localStorage.setItem("phone", user.user.phone);
            localStorage.setItem("role", user.user.role);
            setLoading(false);

            navigate("/dashboard");
        } catch (err) {
            alert((err as TRPCError).message);
        }
    }

    function handleSubmitForm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const email = document.getElementById("email") as HTMLInputElement;
        const password = document.getElementById("password") as HTMLInputElement;
        if (password.value === "") {
            const password = document.getElementById("password") as HTMLInputElement;
            password.classList.remove("focus:border-[#6AAFC7]", "focus:border");
            password.classList.add("border-accent1");
            setPasswordWarning("Required");
        }
        if (email.value === "") {
            const email = document.getElementById("email") as HTMLInputElement;
            email.classList.remove("focus:border-[#6AAFC7]", "focus:border");
            email.classList.add("border-accent1");
            setEmailWarning("Required");
        }
        handleLogin();
    }

    function handleEmail(e: React.ChangeEvent<HTMLInputElement>) {
        const emailInput = e.target as HTMLInputElement;
        const emailValue = e.target.value;
        setEmail(emailValue);
        const emailValid = emailValue.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );

        if (emailValue !== "" && !emailValid) {
            emailInput.classList.add("border-accent1");
            emailInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
            setEmailWarning("Invalid email");
        } else if (emailValue === "") {
            emailInput.classList.add("border-accent1");
            emailInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
            setEmailWarning("Required");
        } else {
            emailInput.classList.remove("border-accent1");
            emailInput.classList.add("focus:border-[#6AAFC7]", "focus:border");
            setEmailWarning("");
        }
    }

    function handlePassword(e: React.ChangeEvent<HTMLInputElement>) {
        const passwordValue = e.target.value;
        setPassword(passwordValue);
        const passwordInput = e.target as HTMLInputElement;

        // if (passwordValue !== "" && passwordValue.length < 8) {
        //   passwordInput.classList.add("border-accent1");
        //   passwordInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
        //   setPasswordWarning("The password is too short");
        // } else
        if (passwordValue === "") {
            passwordInput.classList.add("border-accent1");
            passwordInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
            setPasswordWarning("Required");
        }
        // else if (passwordValue.length >= 8) {
        //   passwordInput.classList.remove("border-accent1");
        //   passwordInput.classList.add("focus:border-[#6AAFC7]", "focus:border");
        //   setPasswordWarning("");
        // }
    }

    function handleOnBlur(string: string) {
        const emailAndPassword = document.getElementById(string) as HTMLInputElement;

        if (emailAndPassword.value === "") {
            emailAndPassword.classList.add("border-accent1");
            emailAndPassword.classList.remove("focus:border-[#6AAFC7]", "focus:border");
            if (string === "email") setEmailWarning("Required");
            else if (string === "password") setPasswordWarning("Required");
        }
    }

    return (
        <div className="grid" style={{
            minHeight: "100svh"
        }}>
            <div
                id="signin"
                className="w-11/12 place-self-center flex justify-center max-w-md h-max bg-white py-8 md:p-16 shadow-aesthetic rounded-md"
                style={notBlinking}
            >
                <form className="text-left w-5/6 md:w-80 text-[#415245]" onSubmit={handleSubmitForm}>
                    <h1 className="text-center font-semibold text-3xl md:text-4xl">Đăng Nhập</h1>

                    {/* Email Input */}
                    <div className="relative mt-14">
                        <label htmlFor="email" className="block font-medium">
                            Email
                        </label>
                        <input
                            style={isBlinking}
                            id="email"
                            name="email"
                            placeholder="Nhập email"
                            className="border border-[#415245] w-full px-3 py-2 mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md transition-colors"
                            onChange={(e) => {
                                handleEmail(e);
                            }}
                            onBlur={() => {
                                handleOnBlur("email");
                            }}
                        />

                        {emailWarning && <Warning message={emailWarning} />}
                    </div>

                    {/* Password Input */}
                    <div className="relative mt-7">
                        <label htmlFor="password" className="block font-medium">
                            Mật Khẩu
                        </label>
                        <input
                            style={isBlinking}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            // {...register("password", { required: true })}
                            className="border border-[#415245] w-full px-3 py-2 mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md transition-colors"
                            onChange={handlePassword}
                            onBlur={() => {
                                handleOnBlur("password");
                            }}
                        />
                        {passwordWarning && <Warning message={passwordWarning} />}
                    </div>

                    <button
                        type="submit"
                        className="block w-full  text-white rounded-md mt-14 bg-[#415245] hover:bg-[#5e7563] active:bg-[#415245] mx-auto overflow-hidden h-10"
                    >
                        <div
                            className="h-full transition-transform duration-300"
                            style={{
                                transform: loading ? "translateY(-5px)" : "translateY(-40px)",
                            }}
                        >
                            <div className="h-full flex justify-center items-center gap-3">
                                {loading && (
                                    <>
                                        <div className="w-2 aspect-square bg-white rounded-full animate-updown1"></div>
                                        <div className="w-2 aspect-square bg-white rounded-full animate-updown2"></div>
                                        <div className="w-2 aspect-square bg-white rounded-full animate-updown3"></div>
                                    </>
                                )}
                            </div>
                            <div className="h-full flex justify-center items-center">Đăng nhập</div>
                        </div>
                    </button>

                    <Link
                        to="/forgotpassword"
                        className="flex justify-center mt-7 hover:text-[#5e7563]"
                    >
                        Quên mật khẩu?
                    </Link>
                </form>
            </div>
        </div>
    );
}
