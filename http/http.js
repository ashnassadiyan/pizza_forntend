"use client";
import axios from "axios";

const url = process.env.NEXT_PUBLIC_API_PATH;

const http = axios.create({
  baseURL: `${url}`,
  headers: {
    "Content-type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  return config;
});

http.interceptors.response.use(
  (response) => {
    // Do something with the response data
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
      }
    }

    return Promise.reject(error);
  }
);

export default http;
