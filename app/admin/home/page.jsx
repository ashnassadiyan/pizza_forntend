"use client";
import http from "@/http/http";
import React, { useState, useEffect } from "react";
import UpdateOrder from "../../../components/UpdateOrder";

const Home = () => {
  const [orders, setOrders] = useState([]);

  const getOrder = () => {
    http
      .get("/order/getAllOrders")
      .then((res) => {
        console.log(res.data);
        setOrders([...res.data]);
        // localStorage.setItem("user", JSON.stringify(res.data));
        // router.push("customer/home");
      })
      .catch(() => {});
  };

  useEffect(() => {
    getOrder();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await http.post(`/order/status`, { status: newStatus, orderId: orderId });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
      alert("Order status updated successfully!");
      getOrder();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-8">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Pizza Orders</h1>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Total
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Payment Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">
                  {order.orderId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  Rs {order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {order.payment}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <UpdateOrder
                    order={order}
                    handleStatusChange={handleStatusChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
