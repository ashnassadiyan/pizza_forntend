"use client";
import React, { useEffect, useRef, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import http from "@/http/http";

import * as SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Dialog, Transition } from "@headlessui/react";

const MyOrder = () => {
  const router = useParams();
  const stompClient = useRef(null);

  const [orderList, setOrderList] = useState([]);
  const [options, setOptions] = useState({
    crust: [],
    topping: [],
    sauce: [],
    cheese: [],
  });
  const [orderStatus, setOrderStatus] = useState("accepted");
  const [total, setTotal] = useState(0);
  const [payment, setPayment] = useState("");
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const getCurrntActive = (status) => {
    if (status === orderStatus) {
      if (status === "completed") {
        return `flex md:w-full items-center text-green-600 dark:text-green-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700`;
      }
      return `flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700`;
    }
    return "flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700";
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [toppings, sauces, crusts, cheeses] = await Promise.all([
          http.get("pizza/topping"),
          http.get("pizza/sauces"),
          http.get("pizza/crusts"),
          http.get("pizza/cheeses"),
        ]);

        setOptions({
          crust: crusts.data,
          topping: toppings.data,
          sauce: sauces.data,
          cheese: cheeses.data,
        });
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    const getOrder = async () => {
      await http
        .get(`/order/myOrder?id=${router.id}`)
        .then((res) => {
          console.log(res.data);
          setOrderList([...res.data.pizzaList]);
          setOrderStatus(res.data.orderStatus);
          setTotal(res.data.total);
          setPayment(res.data.payment);
        })
        .catch((e) => console.log(e));
    };

    fetchOptions();
    getOrder();
  }, [router.id]);

  useEffect(() => {
    // Create SockJS connection
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("STOMP connection established");
        // Subscribe to a topic
        stompClient.current.subscribe(
          `/topic/order/${router.id}`,
          (message) => {
            console.log("Received message:", JSON.parse(message.body)?.status);

            setOrderStatus(JSON.parse(message.body)?.status);
            if (JSON.parse(message.body)?.status === "completed") {
              setIsOpen(true);
            }
          }
        );
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    stompClient.current.activate();

    return () => {
      // Cleanup connection on component unmount
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [router.id]);

  const sendFeedback = async () => {
    await http
      .post(`/order/customerFeedback`, {
        comment: comment,
        orderId: router.id.toString(),
      })
      .then((res) => {
        alert("Feedback is updated, Thank You !");
        setIsOpen(false);
      })
      .catch((e) => console.log(e));
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Status</h1>
        <div className="flex flex-col md:flex-row w-full max-w-4xl space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-1 bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Order Review</h2>
            <div className="space-y-4">
              {orderList.length === 0 ? (
                <p>No items in your order.</p>
              ) : (
                <>
                  {orderList.map((item, index) => (
                    <div key={index} className="border-b pb-4 mb-4">
                      <h3 className="text-lg  text-gray-800">
                        {item.description}
                      </h3>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Rs {total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Payment type : {payment}
                    </span>
                  </div>

                  <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
                    <li className={getCurrntActive("accepted")}>
                      <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                        {orderStatus === "accepted" && (
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                          </svg>
                        )}
                        Accepted
                      </span>
                    </li>

                    <li className={getCurrntActive("preparing")}>
                      <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                        {orderStatus === "preparing" ? (
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                          </svg>
                        ) : (
                          <span className="me-2">2</span>
                        )}
                        Preparing
                      </span>
                    </li>

                    <li className={getCurrntActive("delivering")}>
                      <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                        {orderStatus === "delivering" ? (
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                          </svg>
                        ) : (
                          <span className="me-2">3</span>
                        )}
                        Delivering
                      </span>
                    </li>

                    <li className={getCurrntActive("completed")}>
                      {orderStatus === "completed" ? (
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                        </svg>
                      ) : (
                        <span className="me-2">4</span>
                      )}
                      Completed
                    </li>
                  </ol>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div>
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Order Completed Please Provide An Update
                    </Dialog.Title>
                    <br />
                    <input
                      type="text"
                      placeholder="your feedback"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength="19"
                      style={{ color: "black" }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={sendFeedback}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Send
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default MyOrder;
