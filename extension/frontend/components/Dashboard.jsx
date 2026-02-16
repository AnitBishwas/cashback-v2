import { useEffect, useState } from "react";
import Landing from "./LandingPage.jsx";
import {  getLandingPageData } from "../helpers/cashback.js";
import { createContext } from "react";
import { eventHandler } from "../helpers/events.js";

export const LandingContext = createContext();

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const landingData = await getLandingPageData();
        setData(landingData);
        eventHandler("cashback_page_loaded", landingData);
      } catch (err) {
        console.log("Failed to get landing page data");
      }
    })();
  }, []);
  if (!data) {
    return <></>;
  }
  return (
    <>
      <LandingContext.Provider
        value={{
          ...data,
          updateData: setData,
          updateTransactionLoading: setTransactionsLoading,
          transactionsLoading,
        }}
      >
        <Landing />
      </LandingContext.Provider>
    </>
  );
}
