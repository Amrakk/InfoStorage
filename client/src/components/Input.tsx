import React, { forwardRef, useEffect, useState } from "react";

type TInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    curValue: string | null;
};

export default forwardRef(function Input(
    props: TInputProps,
    ref: React.Ref<HTMLInputElement>
) {
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        if (
            props.curValue != null &&
            props.curValue.length > 0 &&
            props.curValue != undefined
        ) {
            setIsEmpty(false);
        }
    }, [props.curValue]);

    // function abc () {

    // }
    return (
        <div className={`relative pb-5 ${props.className}`}>
            <input
                {...props}
                type={props.type || "text"}
                ref={ref}
                className={`w-full border 
    py-2 px-3  mt-1 hover:outline-none focus:outline-none focus:border  bg-white rounded-md transition-colors  duration-300 ${
        props.error ? "border-accent1 " : "border-primary focus:border-second"
    } `}
                onChange={(e) => {
                    props.onChange && props.onChange(e);
                    if (e.target.value == "") {
                        setIsEmpty(true);
                    } else {
                        setIsEmpty(false);
                    }
                }}
            />
            <label
                className={`absolute left-4 top-3  cursor-text  transition duration-300  text-primary text-opacity-50 origin-left pointer-events-none ${
                    isEmpty ? "input-text" : "input-text-not-empty"
                } ${props.error ? "input-text-error" : ""}`}
            >
                {props.label}
            </label>
            {props.error && (
                <span className="absolute right-0 bottom-0 text-sm font-normal text-accent1">
                    {props.error}
                </span>
            )}
        </div>
    );
});
