"use client";

import React from "react";
import { useRouter } from "next/navigation";

function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-700 mb-8">
        Welcome to the Home
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <div
          onClick={() => {
            router.push("/customer/makeorder");
          }}
          style={{ cursor: "pointer" }}
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center 
             hover:bg-blue-50 hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Make an Order
          </h2>
          <p className="text-gray-600 text-center">
            Start a new order and enjoy our services.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
