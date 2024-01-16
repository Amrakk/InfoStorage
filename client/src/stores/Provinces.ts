import { create } from "zustand";

type TProvinces = {
    provinces: IProvince[];
    setProvinces: (provinces: IProvince[]) => Promise<void>;
};

export interface IProvince {
    name: string;
    code: number;
    codename: string;
    division_type: string;
    phone_code: number;
    districts: IDistrict[];
}

export interface IDistrict {
    name: string;
    code: number;
    codename: string;
    division_type: string;
    short_codename: string;
    wards: IWard[];
}

export interface IWard {
    name: string;
    code: number;
    codename: string;
    division_type: string;
    short_codename: string;
}

export const useProvinces = create<TProvinces>()((set) => ({
    provinces: [],
    setProvinces: async (provinces: IProvince[]) => {
        set({
            provinces: provinces,
        });
    },
}));
