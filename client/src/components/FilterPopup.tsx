import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFilter } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useMultipleState } from "../hooks";
import { useProvinces } from "../stores/Provinces";
import { type TDistrict, type TWard } from "../trpc";
import Select from "./Select";
type TProps = {
    isShown: boolean;
    onCancel: () => void;
};

type TShipping = {
    name: string;
    address: string;
    provinceCode: string;
    districtCode: string;
    wardCode: string;
    phone: string | null;
    note: string | null;
};

export default function FilterPopup(props: TProps) {
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

    return shouldRender ? (
        <Content isShown={props.isShown} onCancel={props.onCancel} handleAnimationEnd={handleAnimationEnd} />
    ) : null;
}

type TPropsContent = {
    isShown: boolean;
    onCancel: () => void;
    handleAnimationEnd: () => void;
};

function Content(props: TPropsContent) {
    const [districts, setDistricts] = useState<TDistrict>([]);
    const [wards, setWards] = useState<TWard>([]);
    const [loading, setLoading] = useState(false);
    const { provinces } = useProvinces();
    const names = ["provinceCode", "districtCode", "wardCode"] as const;

    const [getters, setters] = useMultipleState<boolean, (typeof names)[number]>([...names], true);

    const {
        register,
        setValue,
        getValues,
        handleSubmit,
        formState: { errors },
    } = useForm<TShipping>({
        mode: "onChange",
    });

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
        const targetProvince = provinces.find((prov) => prov.code == parseInt(data.provinceCode));
        console.log(targetProvince?.name);

        // console.log(data.districtCode);
        // console.log(data.wardCode);
    };

    return (
        <>
            <div
                className={`inset-0 fixed z-50 select-none flex justify-center items-center ${
                    props.isShown ? "animationPopup" : "animationPopout"
                } `}
                onAnimationEnd={props.handleAnimationEnd}
            >
                <div className="relative xl:w-1/3 w-2/4 2xl:w-1/4 ">
                    {/*content*/}
                    <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="h-20 flex px-6 justify-between">
                            <div className="flex items-center">
                                <div className="aspect-square w-12 bg-[#bddec4] border border-primary rounded-full flex justify-center items-center   ">
                                    <FaFilter size={18} />
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
                            <form onSubmit={handleSubmit(onSubmit)}>
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
                                    className={` ${
                                        !getValues("provinceCode")
                                            ? "pointer-events-none"
                                            : "pointer-events-auto"
                                    }`}
                                    isBlur={getters.districtCode}
                                ></Select>

                                {/* Phuong */}
                                <Select
                                    {...register("wardCode", {
                                        onChange: () => {
                                            setters.wardCode(false);
                                        },
                                    })}
                                    data={wards}
                                    label="Xã/Phường"
                                    placeholder="Chọn Xã/Phường"
                                    className={`mb-0 ${
                                        !getValues("districtCode")
                                            ? "pointer-events-none"
                                            : "pointer-events-auto"
                                    } `}
                                    isBlur={getters.wardCode}
                                ></Select>

                                {/*footer*/}
                                <div className="flex items-center justify-end my-6 border-slate-200  gap-4 font-semibold">
                                    <button
                                        type="button"
                                        className="w-32 bg-gray-300 hover:bg-gray-200 transition-colors  text-primary rounded-md h-[52px]"
                                        onClick={props.onCancel}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        className="w-32  bg-primary hover:bg-[#5e7563] transition-colors  text-white rounded-md h-[52px] overflow-hidden"
                                    >
                                        <div
                                            className="h-full transition-transform duration-300"
                                            style={{
                                                transform: loading ? "translateY(-5px)" : "translateY(-52px)",
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
                                            <div className="h-full flex justify-center items-center">Tìm</div>
                                        </div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
        </>
    );
}
