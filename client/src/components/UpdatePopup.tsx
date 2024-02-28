import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { z } from "zod";
import { Input, Select, Textarea } from ".";
import { useProvinces } from "../stores/Provinces";
import { trpc, type TDistrict, type TWard } from "../trpc";
import { useMultipleState } from "../hooks";
export const phoneRegex = new RegExp("^[+0-9]*$", "m");
export const subjectRegex = new RegExp(/^[^\p{C}<>&`"/]*$/mu);
export const addressRegex = new RegExp(/^[\p{L}0-9 \\/,.;+-,;]+$/mu);

export const shippingRegex = {
    name: subjectRegex,
    address: addressRegex,
    phone: phoneRegex,
    note: subjectRegex,
};

const inputSchema = z.object({
    name: z.string().nonempty("Không được bỏ trống").regex(shippingRegex.name, "Tên không hợp lệ"),
    address: z.string().nonempty("Không được bỏ trống").regex(shippingRegex.address, "Địa chỉ không hợp lệ"),
    phone: z
        .string()
        .regex(shippingRegex.phone, "Số điện thoại không hợp lệ")
        .max(11, "Số điện thoại tối đa chỉ 11 số")
        .nullable(),
    note: z.string().regex(shippingRegex.note, "Ghi chú không hợp lệ").nullable(),
    provinceCode: z.string().nonempty("Không được bỏ trống"),
    districtCode: z.string().nonempty("Không được bỏ trống"),
    wardCode: z.string().nonempty("Không được bỏ trống"),
});

type TShipping = {
    name: string;
    address: string;
    provinceCode: string;
    districtCode: string;
    wardCode: string;
    phone: string | null;
    note: string | null;
};

type TProps = {
    getShippings: () => void;
    isShown: boolean;
    onCancel: () => void;
    inputValue: {
        [key: string]: string | null | undefined;
    };
};

export default function AddPopup(props: TProps) {
    const [shouldRender, setShouldRender] = useState<boolean>(false);

    useEffect(() => {
        if (props.isShown) {
            setShouldRender(true);
        }
    }, [props.isShown]);

    function handleAnimationEnd() {
        if (!props.isShown) {
            setShouldRender(false);
        }
    }
    //"C30 Thành Thái, Phường 14, Quận 10, Thành phố Hồ Chí Minh".split(",").map((e) => e.trim()).reverse()

    return shouldRender ? (
        <>
            <Content
                getShippings={props.getShippings}
                isShown={props.isShown}
                onCancel={props.onCancel}
                inputValue={props.inputValue}
                handleAnimationEnd={handleAnimationEnd}
            />
        </>
    ) : null;
}

type TPropsContent = {
    getShippings: () => void;
    isShown: boolean;
    onCancel: () => void;
    inputValue: {
        [key: string]: string | null | undefined;
    };
    handleAnimationEnd: () => void;
};

function Content(props: TPropsContent) {
    const [districts, setDistricts] = useState<TDistrict>([]);
    const [wards, setWards] = useState<TWard>([]);
    const { provinces } = useProvinces();
    const [loading, setLoading] = useState(false);
    const refButton = useRef<HTMLButtonElement>(null);
    const names = ["provinceCode", "districtCode", "wardCode"] as const;
    const [getters, setters] = useMultipleState<boolean, (typeof names)[number]>([...names], false);
    const {
        register,
        setValue,
        getValues,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TShipping>({
        resolver: zodResolver(inputSchema),
        mode: "onChange",
    });

    useEffect(() => {
        return () => reset();
    }, []);

    if (Object.keys(errors).length > 0) {
        console.log(errors);
        console.log(getValues());
    }

    useEffect(() => {
        for (let key in props.inputValue) {
            if (typeof props.inputValue[key] == "string" && props.inputValue[key]!.length > 0) {
                setValue(key as keyof TShipping, props.inputValue[key]!);
            }
        }

        if (typeof props.inputValue["address"] == "string" && props.inputValue["address"]!.length > 0) {
            const [province, district, ward, ...address] = props.inputValue["address"]!.split(",")
                .map((e) => e.trim())
                .reverse();
            setValue("address", address.reverse().join(", "));
            const targetProvince = provinces.find((prov) => prov.name == province);
            if (targetProvince) {
                setValue("provinceCode", targetProvince.code.toString());
                setDistricts(targetProvince.districts);
                const targetDistrict = targetProvince.districts.find((dist) => dist.name == district);
                if (targetDistrict) {
                    setValue("districtCode", targetDistrict.code.toString());
                    setWards(targetDistrict.wards);
                    const targetWard = targetDistrict.wards.find((w) => w.name == ward);
                    if (targetWard) {
                        setValue("wardCode", targetWard.code.toString());
                    }
                }
            }
        }
    }, []);

    const getDistricts = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const targetProvince = provinces.find((prov) => prov.code == parseInt(e.target.value));
        if (targetProvince) {
            setDistricts(targetProvince.districts);
            setValue("districtCode", "");
            setValue("wardCode", "");
            setters.provinceCode(false);
            setters.districtCode(true);
            setters.wardCode(true);
        }
    };

    const getWards = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const targetProvince = provinces.find((prov) => prov.code == parseInt(getValues("provinceCode")));
        if (targetProvince) {
            const targetDistrict = targetProvince.districts.find(
                (dist) => dist.code == parseInt(e.target.value)
            );
            if (targetDistrict) {
                setWards(targetDistrict.wards);
                setValue("wardCode", "");
                setters.wardCode(true);
                setters.districtCode(false);
            }
        }
    };

    const onSubmit = (data: TShipping) => {
        setLoading(true);
        setTimeout(() => {
            trpc.shipping.updateShipping
                .mutate({
                    id: props.inputValue._id as string,
                    provCode: parseInt(data.provinceCode),
                    distCode: parseInt(data.districtCode),
                    wardCode: parseInt(data.wardCode),
                    name: data.name,
                    address: data.address,
                    note: data.note as string,
                    phone: data.phone as string,
                })
                .then(() => {
                    props.getShippings();
                })
                .finally(() => {
                    props.onCancel();
                    setLoading(false);
                });
        }, 1000);
    };

    const handleWardSelect = () => {
        setters.wardCode(false);
    };

    return (
        <>
            <div
                className={`justify-center flex items-center fixed inset-0 z-50 select-none ${
                    props.isShown ? "animationPopup" : "animationPopout"
                } `}
                onAnimationEnd={props.handleAnimationEnd}
            >
                <div className="relative xl:w-1/3 w-2/4 2xl:w-1/4 max-h-max scale-90 2xl:scale-100">
                    {/*content*/}
                    <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none ">
                        {/*header*/}
                        <div className="h-20 flex px-6 justify-between">
                            <div className="flex items-center">
                                <div className="aspect-square w-12 bg-[#bde3f1] border border-second rounded-full flex justify-center items-center   ">
                                    <AiFillEdit className="text-second" size={20} />
                                </div>
                            </div>

                            <div className="pt-3">
                                <IoClose
                                    size={30}
                                    className="text-primary cursor-pointer hover:text-[#5e7563] transition-colors"
                                    onClick={props.onCancel}
                                />
                            </div>
                        </div>
                        {/*body*/}
                        <div className="relative px-5 flex-auto text-lg text-primary font-semibold">
                            {provinces.length == 0 || districts.length == 0 || wards.length == 0 ? null : (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* Ten Don Vi */}

                                    <Input
                                        {...register("name", {
                                            required: true,
                                        })}
                                        label="Tên Đơn Vị"
                                        error={errors.name?.message}
                                        curValue={getValues("name")}
                                    />

                                    {/* Dia Chi */}
                                    <Input
                                        {...register("address")}
                                        label="Địa Chỉ"
                                        error={errors.address?.message}
                                        curValue={getValues("address")}
                                    />

                                    {/* Thanh Pho */}

                                    <Select
                                        {...register("provinceCode", {
                                            onChange: getDistricts,
                                        })}
                                        data={provinces}
                                        label="Tỉnh/Thành"
                                        placeholder="Chọn Tỉnh/Thành"
                                        isBlur={getters.provinceCode}
                                    ></Select>

                                    {/* Quan */}
                                    <Select
                                        {...register("districtCode", {
                                            onChange: getWards,
                                        })}
                                        data={districts}
                                        label="Quận/Huyện"
                                        placeholder="Chọn Quận/Huyện"
                                        className={`${
                                            !getValues("provinceCode")
                                                ? "pointer-events-none"
                                                : "pointer-events-auto"
                                        }`}
                                        isBlur={getters.districtCode}
                                    ></Select>

                                    {/* Phuong */}
                                    <Select
                                        {...register("wardCode", {
                                            onChange: handleWardSelect,
                                        })}
                                        data={wards}
                                        label="Xã/Phường"
                                        placeholder="Chọn Xã/Phường"
                                        className={`${
                                            !getValues("districtCode")
                                                ? "pointer-events-none"
                                                : "pointer-events-auto"
                                        }`}
                                        isBlur={getters.wardCode}
                                    ></Select>

                                    {/* So Dien Thoai */}
                                    <Input
                                        {...register("phone")}
                                        label="Số Điện Thoại"
                                        error={errors.phone?.message}
                                        curValue={getValues("phone")}
                                    />

                                    {/* Ghi Chu */}
                                    <Textarea
                                        {...register("note")}
                                        label="Ghi Chú"
                                        curValue={getValues("note")}
                                    />

                                    {/*footer*/}
                                    <div className="flex items-center justify-end my-6 border-slate-200  gap-4 font-semibold">
                                        <button
                                            type="button"
                                            className="w-32 py-3 bg-gray-300 hover:bg-gray-200 transition-colors  text-primary rounded-md"
                                            onClick={() => {
                                                props.onCancel();
                                            }}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            ref={refButton}
                                            className="w-32 bg-second hover:bg-[#92cadf] transition-colors  text-white rounded-md  h-[52px] overflow-hidden"
                                        >
                                            <div
                                                className="h-full transition-transform duration-300"
                                                style={{
                                                    transform: loading
                                                        ? "translateY(-5px)"
                                                        : "translateY(-52px)",
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
                                                <div className="h-full flex justify-center items-center">
                                                    Cập Nhật
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
        </>
    );
}
