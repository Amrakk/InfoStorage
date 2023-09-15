import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { AiFillEdit } from "react-icons/ai";

import { trpc, type TProvince, type TDistrict, type TWard } from "../trpc";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select, Textarea } from ".";
export const phoneRegex = new RegExp("^[+0-9]*$");
export const subjectRegex = new RegExp(`^[^\p{C}<>&]*$`, "gm");
export const addressRegex = new RegExp(`^[\\p{L}0-9 \\/,.;+-]+$`, "mu");

export const shippingRegex = {
  name: subjectRegex,
  address: addressRegex,
  phone: phoneRegex,
  note: subjectRegex,
};

const inputSchema = z.object({
  name: z
    .string()
    .nonempty("Không được bỏ trống")
    .regex(shippingRegex.name, "Tên không hợp lệ"),
  address: z
    .string()
    .nonempty("Không được bỏ trống")
    .regex(shippingRegex.address, "Địa chỉ không hợp lệ"),
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
  provinceCode: number | string;
  districtCode: number | string;
  wardCode: number | string;
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

const inputStyle = {
  caretColor: "transparent",
};

export default function AddPopup(props: TProps) {
  const [provinces, setProvinces] = useState<TProvince>([]);
  const [districts, setDistricts] = useState<TDistrict>([]);
  const [wards, setWards] = useState<TWard>([]);

  const [loading, setLoading] = useState(false);
  const refButton = useRef<HTMLButtonElement>(null);
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
  const [shouldRender, setShouldRender] = useState<boolean>(false);

  if (Object.keys(errors).length > 0) {
    console.log(errors);
    console.log(getValues());
  }

  useEffect(() => {
    for (let key in props.inputValue) {
      if (
        typeof props.inputValue[key] == "string" &&
        props.inputValue[key]!.length > 0
      ) {
        setValue(
          key as
            | "name"
            | "address"
            | "phone"
            | "note"
            | "provinceCode"
            | "districtCode"
            | "wardCode",
          props.inputValue[key]!
        );
      }
    }

    if (
      typeof props.inputValue["address" as string] == "string" &&
      props.inputValue["address" as string]!.length > 0
    ) {
      // console.log(
      //   props.inputValue["address" as string]!.split(",")
      //     .map((e) => e.trim())
      //     .reverse()
      // );
      const [province, district, ward, ...address] = props.inputValue[
        "address" as string
      ]!.split(",")
        .map((e) => e.trim())
        .reverse();

      setValue("address", address.reverse().join(", "));

      trpc.service.getUnitCode
        .query({ name: province, type: "province" })
        .then(async (res) => {
          setValue("provinceCode", res.toString());
          const districts = await trpc.service.getDistricts.query({
            provinceCode: res,
          });

          const findDistrict = districts.findIndex((e) => e.name == district)!;
          districts.unshift(districts.splice(findDistrict, 1)[0]);
          setDistricts(districts);
          setValue("districtCode", districts[0].code.toString());

          const wards = await trpc.service.getWards.query({
            districtCode: districts[0].code,
          });

          const findWard = wards.findIndex((e) => e.name == ward)!;
          wards.unshift(wards.splice(findWard, 1)[0]);
          setWards(wards);
          setValue("wardCode", wards[0].code.toString());
        });
    }

    if (props.isShown) {
      setShouldRender(true);
    }
  }, [props.isShown]);

  function handleAnimationEnd() {
    if (!props.isShown) {
      setShouldRender(false);
      reset();
    }
  }
  //"C30 Thành Thái, Phường 14, Quận 10, Thành phố Hồ Chí Minh".split(",").map((e) => e.trim()).reverse()
  useEffect(() => {
    // trpc.service.getUnitCode
    //   .query({ name: "Hồ", type: "province" })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });
    trpc.service.getProvinces.query().then((res) => {
      setProvinces(res);
    });
  }, []);

  const getDistricts = (e: React.ChangeEvent<HTMLSelectElement>) => {
    trpc.service.getDistricts
      .query({ provinceCode: parseInt(e.target.value) })
      .then((res) => {
        setDistricts(res);
      });
    let current = getValues("provinceCode");
    current = current == "" ? -1 : current;
    if (current != -1) {
      setValue("districtCode", "");
      setValue("wardCode", "");
    }
  };

  const getWards = (e: React.ChangeEvent<HTMLSelectElement>) => {
    trpc.service.getWards
      .query({ districtCode: parseInt(e.target.value) })
      .then((res) => {
        setWards(res);
      });
    let current = getValues("districtCode");
    current = current == "" ? -1 : current;
    if (current != -1) {
      setValue("wardCode", "");
    }
  };

  const onSubmit = (data: TShipping) => {
    // trpc.shipping.addShipping
    //   .mutate({
    //     provinceCode: parseInt(data.provinceCode as unknown as string),
    //     districtCode: parseInt(data.districtCode as unknown as string),
    //     wardCode: parseInt(data.wardCode as unknown as string),
    //     name: data.name,
    //     address: data.address,
    //     note: data.note as string,
    //     phone: data.phone as string,
    //   })
    //   .then(() => {
    //     props.getShippings();
    //   })
    //   .finally(() => {
    //     props.onCancel();
    //   });
    // console.log(getValues());
    // console.log("hello");
    setLoading(true);
    trpc.shipping.updateShipping
      .mutate({
        _id: props.inputValue._id as string,
        provinceCode: parseInt(data.provinceCode as unknown as string),
        districtCode: parseInt(data.districtCode as unknown as string),
        wardCode: parseInt(data.wardCode as unknown as string),
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
  };

  return shouldRender ? (
    <>
      <div
        className={`justify-center mt-24 fixed inset-0 z-50 select-none ${
          props.isShown ? "animationPopup" : "animationPopout"
        } `}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="relative w-1/4  mx-auto">
          {/*content*/}
          <div className="rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
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
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Ten Don Vi */}

                <Input
                  {...register("name", { required: true })}
                  label="Tên Đơn Vị"
                  error={errors.name?.message}
                  curValue={getValues("name")}
                  onClick={() => {
                    // console.log(props.inputValue["address" as string]);
                  }}
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
                ></Select>

                {/* Phuong */}
                <Select
                  {...register("wardCode")}
                  data={wards}
                  label="Xã/Phường"
                  placeholder="Chọn Xã/Phường"
                  className={`${
                    !getValues("districtCode")
                      ? "pointer-events-none"
                      : "pointer-events-auto"
                  }`}
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
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
    </>
  ) : null;
}
