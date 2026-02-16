import "vite/modulepreload-polyfill";
import React from "react";
import ReactDOM from "react-dom/client";
import Dashboard from "../components/Dashboard";
import "./theme.css";

ReactDOM.createRoot(document.getElementById("cashback-page")).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
