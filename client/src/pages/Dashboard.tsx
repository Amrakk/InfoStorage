import React, { useEffect } from "react";
import { trpc } from "../trpc";
import { UserRoles } from "../../../server/src/configs/default";

export default function Dashboard() {
  useEffect(() => {
    
  }, []);

  const subscription = () => {
    trpc.wssRouter.wss.subscribe(undefined, {
      onData: (data) => {
        console.log(1)
        console.log(data);
      },
    });
  }

  return <>
  
  <div className="container text-primary">
    <div className="flex justify-between mt-8">
        <div className="text-3xl font-bold">Dashboard</div>
        <button onClick={subscription} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"></button>
    </div>
  </div>
  </>
  }