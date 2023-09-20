import React, { forwardRef, useState, useEffect } from "react";

type TTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  curValue: string | null;
};

export default forwardRef(function Textarea(
  props: TTextareaProps,
  ref: React.Ref<HTMLTextAreaElement>
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
  }, []);
  return (
    <div className="relative">
      <textarea
        {...props}
        ref={ref}
        className="w-full h-40 border border-primary py-2 px-3  mt-1 hover:outline-none focus:outline-none focus:border focus:border-second bg-white rounded-md transition-colors duration-300 "
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
        htmlFor="note"
        className={`${
          isEmpty ? "input-text" : "input-text-not-empty"
        } absolute left-4 top-3  cursor-text  transition duration-300  text-primary text-opacity-50 origin-left pointer-events-none `}
      >
        Ghi Chú
      </label>
    </div>
  );
});
