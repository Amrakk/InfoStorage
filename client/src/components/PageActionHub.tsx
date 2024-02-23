import { trpc } from "../trpc";
import { CollectionNames } from "../../../server/src/configs/default";
import { useEffect, useRef, useState } from "react";

import readXlsxFile from "read-excel-file";

import { useProvinces } from "../stores/Provinces";

type TProps = {
    handleAddPopUp: () => void;
    getShippings: () => void;
    title: string;
};

export default function PageActionHub(props: TProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { provinces } = useProvinces();
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        function handleFile() {
            const uploaded = inputRef.current!.files![0];

            if (
                uploaded.type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
                return;

            setIsImporting(true);

            readXlsxFile(uploaded).then(async (data) => {
                try {
                    const dataWithoutHeader = data.slice(1).filter((row) => row.length == 4);
                    const invalidData = data.length - 1 - dataWithoutHeader.length;
                    const processedData = dataWithoutHeader.map((row) => {
                        const splittedAddress = row[1]
                            ? row[1]
                                  .toString()
                                  .split(",")
                                  .map((e) => e.trim())
                                  .reverse()
                            : [undefined, undefined, undefined, ""];

                        const addressData = splittedAddress.reduce<(string | undefined)[]>(
                            (acc, cur, index) => {
                                if (cur == undefined) return [...acc, undefined];

                                cur = cur.trim().toLowerCase();
                                switch (index) {
                                    case 0: {
                                        const province = provinces.find(
                                            (p) =>
                                                p.name.trim().toLowerCase() == cur ||
                                                p.codename.trim().toLowerCase() == cur
                                        );
                                        return [
                                            ...acc,
                                            province?.code ? province.code.toString() : undefined,
                                        ];
                                    }
                                    case 1: {
                                        if (acc[0] == undefined) return [...acc, undefined];
                                        const district = provinces
                                            .find((p) => p.code == parseInt(acc[0]!))
                                            ?.districts.find(
                                                (d) =>
                                                    d.name.trim().toLowerCase() == cur ||
                                                    d.codename.trim().toLowerCase() == cur
                                            );
                                        return [
                                            ...acc,
                                            district?.code ? district.code.toString() : undefined,
                                        ];
                                    }
                                    case 2: {
                                        if (acc[1] == undefined) return [...acc, undefined];
                                        const ward = provinces
                                            .find((p) => p.code == parseInt(acc[0]!))
                                            ?.districts.find((d) => d.code == parseInt(acc[1]!))
                                            ?.wards.find(
                                                (w) =>
                                                    w.name.trim().toLowerCase() == cur ||
                                                    w.codename.trim().toLowerCase() == cur
                                            );
                                        return [
                                            ...acc,
                                            ward?.code ? ward.code.toString() : undefined,
                                        ];
                                    }
                                    default: {
                                        return [...acc, cur];
                                    }
                                }
                            },
                            [] as (string | undefined)[]
                        );

                        const [province, district, ward, ...addressArr] = addressData;
                        const address = addressArr.filter((e) => e).join(", ");

                        return {
                            name: row[0]?.toString(),
                            address: address,
                            provCode: province ? parseInt(province) : undefined,
                            distCode: district ? parseInt(district) : undefined,
                            wardCode: ward ? parseInt(ward) : undefined,
                            phone: row[2]?.toString() || "",
                            note: row[3]?.toString() || "",
                        };
                    });
                    await trpc.shipping.addShippings.mutate(processedData).then((resData) => {
                        const rejected = "failedEntries" in resData ? resData.failedEntries : 0;
                        const succeed = data.length - 1 - invalidData - rejected;
                        alert(
                            `File imported successfully\nSucceed: ${succeed} rows\nInvalid data: ${invalidData} rows\nRejected: ${rejected} rows`
                        );
                    });
                } catch (error) {
                    alert("Error while importing file");
                    console.error(error);
                } finally {
                    setIsImporting(false);
                    props.getShippings();
                }
            });
        }

        if (inputRef.current) {
            inputRef.current.addEventListener("change", handleFile);
        }

        return () => {
            if (inputRef.current) {
                inputRef.current.removeEventListener("change", handleFile);
            }
        };
    }, [inputRef.current, provinces]);

    function exportFile() {
        trpc.service.exportData
            .query({ type: CollectionNames.Shippings })
            .then((_) => {
                alert("File exported via email successfully");
            })
            .catch((err) => {
                alert(err.message);
            });
    }

    function importFile() {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }

    return (
        <>
            <div className="lg:flex justify-between lg:mt-8 mt-4">
                <div className="text-3xl font-semibold text-center lg:text-left">{props.title}</div>
                <div className="lg:flex gap-5 hidden">
                    <button
                        className="w-40 py-3 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md"
                        onClick={exportFile}
                    >
                        Export File
                    </button>
                    <button
                        className="w-40 py-3 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md"
                        onClick={importFile}
                        disabled={isImporting}
                    >
                        Import File
                    </button>
                    <button
                        className="w-40 py-3 bg-primary hover:bg-[#5e7563] transition-colors  text-white rounded-md"
                        onClick={props.handleAddPopUp}
                    >
                        Create
                    </button>
                </div>
            </div>
            <input type="file" name="file" id="file" className="hidden" ref={inputRef} />
        </>
    );
}
