import React from "react";
import Index from "./pages/Index";
import Discounts from "./pages/discounts/Index";

const routes = {
  "/": () => <Index />,
  "/discounts": () => <Discounts />,
};

export default routes;
