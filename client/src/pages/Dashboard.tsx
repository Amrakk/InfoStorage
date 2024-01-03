import React, { useEffect } from "react";
import { trpc } from "../trpc";
import { UserRoles } from "../../../server/src/configs/default";

export default function Dashboard() {
  useEffect(() => {
    
  }, []);

  return <>
  
  <div className="container text-primary">
    <div className="flex justify-between mt-8">
        <div className="text-3xl font-bold">Dashboard</div>
    </div>
  </div>
  </>
}
