import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { Link } from "react-router-dom";

const notBlinking = {
  caretColor: "transparent",
};

const isBlinking = {
  caretColor: "#415245",
};

let renderCount = 0;

function Warning({ message }: { message: string | undefined }) {
  return (
    <div className="absolute text-red-500 mt-1 right-1">
      <p>{message}</p>
    </div>
  );
}

export default function Signin() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  renderCount++;

  const [emailWarning, setEmailWarning] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");

  function handleSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    if (password.value === "") {
      const password = document.getElementById("password") as HTMLInputElement;
      password.classList.remove("focus:border-[#6AAFC7]", "focus:border");
      password.classList.add("border-red-500");
      setPasswordWarning("Required");
    }
    if (email.value === "") {
      const email = document.getElementById("email") as HTMLInputElement;
      email.classList.remove("focus:border-[#6AAFC7]", "focus:border");
      email.classList.add("border-red-500");
      setEmailWarning("Required");
    }
  }

  function handleEmail(e: React.ChangeEvent<HTMLInputElement>) {
    const emailInput = e.target as HTMLInputElement;
    const emailValue = e.target.value;
    const emailValid = emailValue.match(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (emailValue !== "" && !emailValid) {
      emailInput.classList.add("border-red-500");
      emailInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
      setEmailWarning("Invalid email");
    } else if (emailValue === "") {
      emailInput.classList.add("border-red-500");
      emailInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
      setEmailWarning("Required");
    } else {
      emailInput.classList.remove("border-red-500");
      emailInput.classList.add("focus:border-[#6AAFC7]", "focus:border");
      setEmailWarning("");
    }
  }

  function handlePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const passwordValue = e.target.value;
    const passwordInput = e.target as HTMLInputElement;

    if (passwordValue !== "" && passwordValue.length < 8) {
      passwordInput.classList.add("border-red-500");
      passwordInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
      setPasswordWarning("The password is too short");
    } else if (passwordValue === "") {
      passwordInput.classList.add("border-red-500");
      passwordInput.classList.remove("focus:border-[#6AAFC7]", "focus:border");
      setPasswordWarning("Required");
    } else if (passwordValue.length >= 8) {
      passwordInput.classList.remove("border-red-500");
      passwordInput.classList.add("focus:border-[#6AAFC7]", "focus:border");
      setPasswordWarning("");
    }
  }

  // console.log("renderCount: ", renderCount);
  // console.log(errors);

  return (
    <>
      <div
        id="signin"
        className=" flex justify-center mx-auto mt-52 max-w-md bg-white py-16 shadow-aesthetic rounded-md"
        style={notBlinking}
      >
        <form
          className="text-left md:w-80  text-[#415245]"
          onSubmit={handleSubmitForm}
        >
          <h1 className="text-center font-semibold  text-4xl ">Đăng Nhập</h1>

          {/* Email Input */}
          <div className="relative mt-14">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              style={isBlinking}
              // type="email"
              id="email"
              placeholder="Nhập email"
              // {...register("email", { required: true })}
              className="border border-[#415245] w-full px-3 py-2 mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md "
              onChange={handleEmail}
              onBlur={() => {
                const email = document.getElementById(
                  "email"
                ) as HTMLInputElement;

                if (email.value === "") {
                  email.classList.add("border-red-500");
                  email.classList.remove(
                    "focus:border-[#6AAFC7]",
                    "focus:border"
                  );
                  setEmailWarning("Required");
                }
              }}
            />
            {/* <div className="absolute text-red-500 mt-1 right-1">
              <p>{errors.email?.message}</p>
            </div> */}

            {/* <Warning message={errors.email?.message} /> */}
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
              placeholder="Nhập mật khẩu"
              // {...register("password", { required: true })}
              className="border border-[#415245] w-full px-3 py-2 mt-1 hover:outline-none focus:outline-none focus:border focus:border-[#6AAFC7] bg-white rounded-md"
              onChange={handlePassword}
              onBlur={() => {
                const password = document.getElementById(
                  "password"
                ) as HTMLInputElement;

                if (password.value === "") {
                  password.classList.add("border-red-500");
                  password.classList.remove(
                    "focus:border-[#6AAFC7]",
                    "focus:border"
                  );
                  setPasswordWarning("Required");
                }
              }}
            />

            {/* <Warning message={errors.password?.message} /> */}
            {passwordWarning && <Warning message={passwordWarning} />}
          </div>

          <button
            type="submit"
            className="block w-full py-2 text-white rounded-md mt-14 bg-[#415245] hover:bg-[#5e7563] active:bg-[#415245] mx-auto"
          >
            Đăng Nhập
          </button>

          <Link
            to="/home"
            className="flex justify-center mt-7 hover:text-[#5e7563]"
          >
            Quên mật khẩu?
          </Link>
        </form>
      </div>
    </>
  );
}
