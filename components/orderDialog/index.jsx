"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function OrderConfirmation({
  open = false,
  setOpen,
  setDeliveryMethod,
  setPayment,
  payment,
  deliveryMethod,
  requestOrder,
  cardNumber,
  setCardNumber,
  loyaltyPoints,
}) {
  console.log(payment, "payment");

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="size-6 text-red-600"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    Would you like to complete the order?
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please review your order details and choose your payment
                      and delivery options.
                    </p>

                    {/* Payment Type Selection */}
                    <div className="mt-4">
                      <label
                        htmlFor="paymentType"
                        className="block text-gray-700 text-sm font-medium mb-2 capitalize"
                      >
                        Payment Type
                      </label>
                      <select
                        value={payment}
                        onChange={(e) => setPayment(e.target.value)}
                        id="paymentType"
                        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="wallet">Wallet</option>
                        <option value="loyalty">Loylty Points</option>
                        <option value="promotion">Promotion</option>
                      </select>
                    </div>

                    {payment === "card" && (
                      <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2 capitalize">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234-5678-9012-3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          maxLength="19"
                          style={{ color: "black" }}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    )}

                    {payment === "loyalty" && (
                      <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2 capitalize">
                          Loyalty Points {loyaltyPoints}
                        </label>

                        <input
                          type="text"
                          placeholder="1234-5678-9012-3456"
                          value={"Rs" + loyaltyPoints * 10}
                          disabled
                          style={{ color: "black" }}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Delivery Method Selection */}
                    <div className="mt-4">
                      <label
                        htmlFor="deliveryMethod"
                        className="block text-gray-700 text-sm font-medium mb-2 capitalize"
                      >
                        Delivery Method
                      </label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        id="deliveryMethod"
                        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="pickup">Pickup</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => requestOrder()}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
              >
                Pay
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
