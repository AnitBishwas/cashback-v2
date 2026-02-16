import React from "react";
import Index from "./pages/Index";
import Discounts from "./pages/discounts/Index";
import Settings from "./pages/Settings";
import Distribution from "./pages/distributions/Index";
import StorefrontOffer from "./pages/storefront/Offer";
import OfferCreateForm from "./pages/storefront/CreateOffer";
import OfferEditForm from "./pages/storefront/EditOffer";
import CustomerWallet from "./pages/customerWallet/Index";
import CustomerWalletInfo from "./pages/customerWallet/CustomerWallet";

const routes = {
  "/": () => <Index />,
  "/discounts": () => <Discounts />,
  "/settings": () => <Settings />,
  "/distribution": () => <Distribution />,
  "/storefront-offers": () => <StorefrontOffer />,
  "/storefront-offers/create": () => <OfferCreateForm />,
  "/storefront-offers/:id": () => <OfferEditForm />,
  "/customer-wallet": () => <CustomerWallet />,
  "/customer-wallet/:id": () => <CustomerWalletInfo />,
};

export default routes;
