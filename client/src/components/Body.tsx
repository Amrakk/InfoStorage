import React from "react";

interface IProps {
  children: React.ReactNode; //co the truyen mot cai element khac vao day
  className?: string;
}

export default function Body(props: IProps) {
  return (
    <div
      className={`bg-[url('assets/img/image.png')] min-h-screen w-full bg-no-repeat bg-cover relative  ${props.className} overflow-hidden flex flex-col`}
    >
      {props.children}
    </div>
  );
}
