import React, { useEffect } from "react";
import { trpc } from "../trpc";
import { UserRoles } from "../../../server/src/configs/default";
export default function Dashboard() {
    useEffect(() => {
        trpc.service.getProvinces.query().then((res) => console.log(res));
    }, []);
    return <div>Dashboard</div>;
}
