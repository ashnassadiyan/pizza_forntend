import React from "react";

const index = ({ order, handleStatusChange }) => {
  console.log(order, "order");
  if (order.deliveryMethod === "cash")
    return (
      <select
        value={order.orderStatus}
        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="accepted">Accepted</option>
        <option value="preparing">Preparing</option>
        <option value="done">Done</option>
        <option value="collected">Collected</option>
      </select>
    );

  return (
    <select
      value={order.orderStatus}
      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option value="accepted">Accepted</option>
      <option value="preparing">Preparing</option>
      <option value="delivering">Out for Delivery</option>
      <option value="completed">Completed</option>
    </select>
  );
};

export default index;
