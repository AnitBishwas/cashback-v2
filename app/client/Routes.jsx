import React from "react";
import Index from "./pages/Index";
import Discounts from "./pages/discounts/Index";
import Settings from "./pages/Settings";
import Distribution from "./pages/distributions/Index";

const routes = {
  "/": () => <Index />,
  "/discounts": () => <Discounts />,
  "/settings": () => <Settings />,
  "/distribution": () => <Distribution />,
};

export default routes;
