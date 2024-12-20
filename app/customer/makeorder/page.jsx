"use client";
import http from "@/http/http";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrderConfirmation from "@/components/orderDialog";
import SuccessDialog from "@/components/orderSuccess";

export const extra = [
  { id: 1, name: "Toppings +Rs200", price: 200 },
  { id: 2, name: "Cheese +Rs250", price: 250 },
  { id: 3, name: "Sauce +Rs100", price: 170 },
];
export const packingList = [
  { id: 1, name: "Package without labeling +Rs100", price: 100 },
  { id: 2, name: "Package with labeling +Rs150", price: 150 },
  { id: 3, name: "Package with labeling and extra bill +Rs170", price: 170 },
];

const PizzaOrder = () => {
  const router = useRouter();
  const [order, setOrder] = useState({
    size: "",
    crust: "",
    topping: "",
    sauce: "",
    cheese: "",
    name: " ",
    extra: "",
    packing: "",
  });
  const [options, setOptions] = useState({
    crust: [],
    topping: [],
    sauce: [],
    cheese: [],
    size: [],
  });
  const [orderList, setOrderList] = useState([]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [payment, setPayment] = useState("cash");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [fave, setFave] = useState(false);
  const [faveList, setFaveList] = useState([]);
  const [cardNumber, setCardNumber] = useState("");
  const [loyaltyPoints, setLoyalityPoints] = useState(0);

  const handleRemoveFromList = (index) => {
    setOrderList((prevList) => prevList.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      try {
        const [toppings, sauces, crusts, cheeses, sizes, loyalty] =
          await Promise.all([
            http.get("pizza/topping"),
            http.get("pizza/sauces"),
            http.get("pizza/crusts"),
            http.get("pizza/cheeses"),
            http.get("pizza/sizes"),
            http.get(`customer/getLoyaltyPoints?customerId=${user.id}`),
          ]);

        setOptions({
          crust: crusts.data,
          topping: toppings.data,
          sauce: sauces.data,
          cheese: cheeses.data,
          size: sizes.data,
        });
        setLoyalityPoints(loyalty.data);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    getFavouriteList();
    fetchOptions();
  }, []);

  const requestOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);
    await http
      .post("/order/create", {
        pizzaList: orderList,
        deliveryMethod,
        paymentType: payment,
        customerId: user.id,
        cardDetails: cardNumber,
      })
      .then((res) => {
        setOpen(false);
        setOpenSuccess(true);
        setOrderId(res.data);
      })
      .catch((e) => {
        alert("Payment unsuccessfull!");
      });
  };

  const addToFavourite = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (order.name === " " || !order.name || order.name.length < 2) {
      alert("Please add a name");
      return;
    }

    await http
      .post("/customer/addFavourite", {
        customerId: user.id,
        pizzaList: order,
      })
      .then((res) => {
        alert("Added to favourite list");
        setOrder({
          crust: "",
          topping: "",
          sauce: "",
          cheese: "",
          name: " ",
          extra: "",
          packing: "",
          size: "",
        });
        getFavouriteList();
      })
      .catch((e) => console.log(e));
  };

  const getFavouriteList = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    await http
      .get(`/customer/getFavourite?customerId=${user.id}`)
      .then((res) => {
        setFaveList([...res.data]);
        console.log(res.data);
      })
      .catch((e) => console.log(e));
  };

  const changeUseFaves = (e, a) => {
    setFave(e.target.checked);
  };

  const onClose = () => {
    setOpenSuccess(false);
    router.push(`order/${orderId}`);
  };

  const handleAddToList = () => {
    const sizePrice =
      options.size.find((item) => item.id === Number(order.size))?.price || 0;
    const crustPrice =
      options.crust.find((item) => item.id === Number(order.crust))?.price || 0;
    const toppingPrice =
      options.topping.find((item) => item.id === Number(order.topping))
        ?.price || 0;
    const saucePrice =
      options.sauce.find((item) => item.id === Number(order.sauce))?.price || 0;
    const cheesePrice =
      options.cheese.find((item) => item.id === Number(order.cheese))?.price ||
      0;
    const extraPrice =
      extra.find((item) => item.name === order.extra)?.price || 0;
    const packingPrice =
      packingList.find((item) => item.name === order.packing)?.price || 0;

    const pizzaTotal =
      (sizePrice +
        crustPrice +
        toppingPrice +
        saucePrice +
        cheesePrice +
        extraPrice +
        packingPrice) *
      selectedQty;

    setOrderList((prevList) => [
      ...prevList,
      { ...order, qty: selectedQty, total: pizzaTotal },
    ]);

    setOrder({
      crust: "",
      topping: "",
      sauce: "",
      cheese: "",
      name: " ",
      extra: "",
      packing: "",
      size: "",
    });
    setSelectedQty(1);
  };

  const onChangeFavlist = (e) => {
    const faveName = e.target.value;
    const faveListItem = faveList.find((s) => s.name === faveName);
    console.log(faveListItem, "faveListItem");
    setOrder((prev) => ({
      ...prev,
      crust: faveListItem?.crust,
      topping: faveListItem?.topping,
      sauce: faveListItem?.sauce,
      cheese: faveListItem?.cheese,
      size: faveListItem.size,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pizza Order</h1>
      <div className="flex flex-col md:flex-row w-full max-w-4xl space-y-6 md:space-y-0 md:space-x-6">
        {/* Pizza Order Form */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Customize Your Pizza
          </h2>
          <div className="mb-4">
            <label
              htmlFor="crust"
              className="block text-gray-700 text-sm font-medium mb-2 capitalize"
            >
              Select Crust
            </label>
            <select
              id="crust"
              value={order.crust}
              disabled={fave}
              onChange={(e) =>
                setOrder((state) => ({
                  ...state,
                  crust: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choose an option --</option>
              {options.crust.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} (+Rs{option.price})
                </option>
              ))}
            </select>
          </div>

          {[
            { label: "Topping", field: "topping" },
            { label: "Size", field: "size" },
            { label: "Sauce", field: "sauce" },
            { label: "Cheese", field: "cheese" },
          ].map(({ label, field }) => (
            <div className="mb-4" key={field}>
              <label
                htmlFor={field}
                className="block text-gray-700 text-sm font-medium mb-2 capitalize"
              >
                Select {label}
              </label>
              <select
                id={field}
                disabled={fave}
                value={order[field]}
                onChange={(e) =>
                  setOrder((state) => ({
                    ...state,
                    [field]: Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Choose an option --</option>
                {options[field].map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.name} (+Rs{option.price})
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="mb-4">
            <label
              htmlFor="qty"
              className="block text-gray-700 text-sm font-medium mb-2 capitalize"
            >
              Name - Optional -
            </label>
            <input
              id="qty"
              value={order.name}
              disabled={fave}
              onChange={(e) => {
                setOrder((state) => ({
                  ...state,
                  name: e.target.value,
                }));
              }}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <br />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              onChange={changeUseFaves}
            />
            <label
              htmlFor="checkbox"
              className="text-sm font-medium text-gray-700"
            >
              Use My Favourite List
            </label>
          </div>

          <div className="mb-4">
            <label
              htmlFor="extra"
              className="block text-gray-700 text-sm font-medium mb-2 capitalize"
            >
              My Favourite List
            </label>
            <select
              id="extra"
              // value={order.extra}
              disabled={!fave}
              onChange={onChangeFavlist}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choose an option --</option>
              {faveList.map((pack, index) => (
                <option value={pack.name} key={index}>
                  {pack.name}
                </option>
              ))}
            </select>
          </div>

          <br />

          <div className="mb-4">
            <label
              htmlFor="extra"
              className="block text-gray-700 text-sm font-medium mb-2 capitalize"
            >
              Add Extra - Optional -
            </label>
            <select
              id="extra"
              value={order.extra}
              onChange={(e) =>
                setOrder((state) => ({
                  ...state,
                  extra: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choose an option --</option>
              {extra.map((pack) => (
                <option value={pack.name} key={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="packing"
              className="block text-gray-700 text-sm font-medium mb-2 capitalize"
            >
              Packing - Optional -
            </label>
            <select
              id="packing"
              value={order.packing}
              onChange={(e) =>
                setOrder((state) => ({
                  ...state,
                  packing: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choose an option --</option>
              {packingList.map((pack) => (
                <option value={pack.name} key={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="block text-gray-700 text-sm font-medium mb-2 capitalize"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={selectedQty}
              onChange={(e) => setSelectedQty(Number(e.target.value))}
              min="1"
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4 flex flex-row items-center space-x-3">
            {!fave ? (
              <button
                onClick={addToFavourite}
                disabled={fave}
                className={`py-2 px-4 bg-blue-500 text-white rounded-lg`}
              >
                Save to Favourite List
              </button>
            ) : (
              ""
            )}

            <button
              onClick={handleAddToList}
              className="py-2 px-4 bg-blue-500 text-white rounded-lg"
            >
              Add To Order
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Order Review</h2>
          <div className="space-y-4">
            {orderList.length === 0 ? (
              <p>No items in your order.</p>
            ) : (
              <>
                {orderList.map((item, index) => (
                  <div key={index} className="border-b pb-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qty: {item.qty}</span>
                      <span className="text-gray-600">Rs {item.total}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700">
                        <strong>Siza:</strong>{" "}
                        {options.size.find((o) => o.id === item.size)?.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Crust:</strong>{" "}
                        {options.crust.find((o) => o.id === item.crust)?.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Topping:</strong>{" "}
                        {
                          options.topping.find((o) => o.id === item.topping)
                            ?.name
                        }
                      </p>
                      <p className="text-gray-700">
                        <strong>Sauce:</strong>{" "}
                        {options.sauce.find((o) => o.id === item.sauce)?.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Cheese:</strong>{" "}
                        {options.cheese.find((o) => o.id === item.cheese)?.name}
                      </p>
                      {item.extra && (
                        <p className="text-gray-700">
                          <strong>Extra:</strong>{" "}
                          {extra.find((e) => e.name === item.extra)?.name}
                        </p>
                      )}
                      {item.packing && (
                        <p className="text-gray-700">
                          <strong>Packing:</strong>{" "}
                          {
                            packingList.find((p) => p.name === item.packing)
                              ?.name
                          }
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFromList(index)}
                      className="mt-2 text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setOpen(true)}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-lg"
                >
                  Proceed To Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <OrderConfirmation
        open={open}
        setOpen={setOpen}
        setDeliveryMethod={setDeliveryMethod}
        setPayment={setPayment}
        payment={payment}
        deliveryMethod={deliveryMethod}
        requestOrder={requestOrder}
        setCardNumber={setCardNumber}
        cardNumber={cardNumber}
        loyaltyPoints={loyaltyPoints}
      />
      <SuccessDialog isOpen={openSuccess} onClose={onClose} />
    </div>
  );
};

export default PizzaOrder;
