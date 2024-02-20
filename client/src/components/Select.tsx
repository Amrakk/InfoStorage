import { BsChevronDown } from "react-icons/bs";
import React, { forwardRef, useState } from "react";
import type { TDistrict, TProvince, TWard } from "../trpc";

type TSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    placeholder: string;
    error?: string;
    data: TProvince | TDistrict | TWard;
    isBlur: boolean;
};

const inputStyle = {
    caretColor: "transparent",
};

export default forwardRef(function Select(props: TSelectProps, ref: React.Ref<HTMLSelectElement>) {
    const [iconColor, setIconColor] = useState(false);

    return (
        <div className="relative">
            <select
                {...props}
                style={inputStyle}
                ref={ref}
                defaultValue=""
                className={`mb-5 w-full border 
        border-primary py-2 px-3 mt-1 hover:outline-none
        focus:outline-none focus:border focus:border-second
        bg-white rounded-md transition-colors duration-300 text-primary appearance-none cursor-pointer ${
            props.className
        }
        ${props.isBlur ? " text-zinc-400" : "text-primary"}`}
                onFocus={(e) => {
                    props.onFocus && props.onFocus(e);
                    setIconColor(true);
                }}
                onBlur={(e) => {
                    props.onBlur && props.onBlur(e);
                    setIconColor(false);
                }}
                onChange={(e) => {
                    props.onChange && props.onChange(e);
                }}
            >
                <option value="" disabled>
                    {props.placeholder}
                </option>
                {props.data.map((item) => {
                    return (
                        <option key={item.code} value={item.code} className="hover:bg-accent1">
                            {item.name}
                        </option>
                    );
                })}
            </select>
            <label
                className={` absolute left-4 top-3 cursor-text focus:text-xs  transition duration-300  text-primary text-opacity-50 origin-left input-text-not-empty pointer-events-none`}
            >
                {props.label}
            </label>
            <BsChevronDown
                className={`absolute right-4 top-4 pointer-events-none ${
                    iconColor ? "text-second" : "text-primary"
                } cursor-pointer`}
                size={20}
            />
        </div>
    );
});
