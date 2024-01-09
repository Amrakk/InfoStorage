import React, { useEffect } from "react";
import { trpc } from "../trpc";
import { UserRoles } from "../../../server/src/configs/default";

export default function Dashboard() {
  useEffect(() => {
    
  }, []);


  // @ts-ignore
  var test;
  var int = 0;

  test = trpc.wssRouter.onWss.subscribe(undefined, {
    onError: (err) => {
      console.log(err);
      trpc.service.getAccToken.query().then((res) => {
        console.log(res);
      });
    },
    onData: (data) => {
      console.log(data);
    },
    onStopped() {
      console.log("Unsubscribed");
    },
  });

  const subscription = () => {
    trpc.wssRouter.wss.query({num: int++});
  }

  const subscription2 = () => {
    trpc.wssRouter.offWss.query();
  }

  const unsubscribe = () => {
    // @ts-ignore
    test.unsubscribe();

    // console.log(trpc.wssRouter.subscribe.query());
  }

  return <>
  
  <div className="container text-primary">
    <div className="flex justify-between mt-8">
        <div className="text-3xl font-bold">Dashboard</div>
        <button onClick={subscription} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"></button>
        <button onClick={subscription2} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"></button>
        <button onClick={unsubscribe} className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"></button>
    </div>
  </div>
  </>
  }