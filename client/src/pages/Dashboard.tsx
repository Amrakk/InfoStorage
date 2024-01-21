import React, { useEffect } from "react";
import { trpc, trpcWss } from "../trpc";
import { UserRoles } from "../../../server/src/configs/default";

export default function Dashboard() {
  useEffect(() => {
    
  }, []);

  var test = trpcWss.onConnect.subscribe(undefined, {
    onData: (data) => {
      console.log("onData", data);
      if((data as { type: string }).type === "ping") {
        trpcWss.pong.query().catch((err) => {
          console.log("err", err);
          if(err.code === 401) {
            trpc.service.getAccToken.query().then(() => {
              console.log("getAccToken");
            });
          }
        });
      }
    },
    onError: (error) => {
      console.log("onError", error);
      trpc.service.getAccToken.query().then(() => {
        console.log("getAccToken");
      });

      test.unsubscribe();
    },
  });

  const test1 = () => {
    trpcWss.notify.query({ message: "Hello" }).catch((err) => {
      console.log("err", err);
      test.unsubscribe();
    });
  }

  

  return <>
  
  <div className="container text-primary">
    <div className="flex justify-between mt-8">
        <div className="text-3xl font-bold">Dashboard</div>
        <button onClick={test1}>123</button>
    </div>
  </div>
  </>
  }