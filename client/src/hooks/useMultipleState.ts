import { Dispatch, SetStateAction, useState } from "react";
export default function useMultipleState<T, E extends string | number | symbol>(
    names: string[],
    defaultValue: T
) {
    // const getter: { [key in E]: T } = names.reduce((acc, name) => {
    //     const [value, setValue] = useState<T>(defaultValue);
    //     return { ...acc, [name as E]: value };
    // }, {} as { [key in E]: T });

    // const setter: { [key in E]: Dispatch<SetStateAction<T>> } = names.reduce((acc, name) => {
    //     const [value, setValue] = useState<T>(defaultValue);
    //     return { ...acc, [name as E]: setValue };
    // }, {} as { [key in E]: Dispatch<SetStateAction<T>> });

    const [getter, setter] = names.reduce(
        (acc, name) => {
            const [value, setValue] = useState<T>(defaultValue);
            acc[0][name as E] = value;
            acc[1][name as E] = setValue;
            return acc;
        },
        [{}, {}] as [{ [key in E]: T }, { [key in E]: Dispatch<SetStateAction<T>> }]
    );

    return [getter, setter] as const;
}

// type demoType = "name" | "age";
// const demo : { [key in demoType]: string } = {

// }
