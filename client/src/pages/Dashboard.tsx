import React, { useEffect } from "react";
import { trpc } from "../trpc";
export default function Dashboard() {
  useEffect(() => {
    trpc.service.getDistricts
      .query({ provinceCode: 1 })
      .then((res) => console.log(res));
  }, []);

  useEffect(() => {
    trpc.service.getProvinces.query().then((res) => console.log(res));
  }, []);
  return <div>Dashboard</div>;
}
