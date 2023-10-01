import React from "react";

export default function InputField({
  id,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  warning,
}: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  warning: string;
}) {
  const isInvalid = warning !== "";
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
  return (
    <div className="relative mt-7">
      <label htmlFor={id} className="block font-medium">
        {placeholder}
      </label>
      <input
        style={isBlinking}
        type={type}
        id={id}
        placeholder={`Nhập ${placeholder.toLowerCase()}`}
        className={`border ${
          isInvalid ? "border-accent1" : "[#415245]"
        } w-full px-3 py-2 mt-1 hover:outline-none focus:outline-none focus:border ${
          isInvalid ? "border-accent1" : "[#6AAFC7]"
        } bg-white rounded-md`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {isInvalid && <Warning message={warning} />}
    </div>
  );
}
