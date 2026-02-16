import { useEffect, useState,useContext } from "react";
import { moneyFormatter } from "../helpers/general";
import { LandingContext } from "./Dashboard.jsx";


const Announcement = () => {
  const [announcementText, setAnnouncementText] = useState("");
  const {configs} = useContext(LandingContext);

  useEffect(() => {
    if (configs?.order_allocation?.type == "percentage") {
      setAnnouncementText(
        `${configs?.order_allocation?.value} % of order Order Value is credited as Swiss Cash in your wallet with every order within 24 hours of successful delivery.`
      );
    } else {
      setAnnouncementText(
        `${moneyFormatter(
          configs?.order_allocation?.value
        )} is credited as Swiss Cash in your wallet with every order within 24 hours of successful delivery.`
      );
    }
  }, [configs]);
  return (
    <>
      <div className="cashback_announcement cb-bg-[#FFF3F4] cb-flex cb-justify-center cb-items-center cb-px-4 cb-py-3">
        <p className="cb-font-secondary cb-text-[12px] cb-text-[#000] cb-leading-normal cb-text-center cb-font-semibold">{announcementText}</p>
      </div>
    </>
  );
};
export default Announcement;
