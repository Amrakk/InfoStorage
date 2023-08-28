import React, { useState, useEffect } from "react";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../../../server/src/server";

const client = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000/trpc" })],
});

const test = async () => {
  const result = await client.troll.query();
  console.log(result);
};

export default function Shipping() {
  useEffect(() => {
    test();
  }, []);
  return (
    <>
      <div className="container text-primary select-none">
        <div className="flex justify-between mt-5">
          <div className="text-3xl">Shipping</div>
          <div className="flex gap-5">
            <button className="w-40 py-3 bg-gray-300 hover:bg-gray-200 transition-colors rounded-md">
              Export File
            </button>
            <button className="w-40 py-3 bg-gray-300 hover:bg-gray-200 transition-colors rounded-md">
              Import File
            </button>
            <button className="w-40 py-3 bg-primary hover:bg- text-white rounded-md">
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
