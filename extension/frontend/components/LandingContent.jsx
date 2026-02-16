import { LandingContext } from "./Dashboard.jsx";
import { useContext, useRef } from "react";
import { CashbackIcon, HazardIcon, InfoIcon } from "./Icons.jsx";
import { moneyFormatter } from "../helpers/general.js";
import Infopopup from "./InfoPopup.jsx";
import OffersCarousel from "./OffersCarousel.jsx";
import TransactionContainer from "./TransactionsContainer.jsx";

const LandingContent = () => {
  const { wallet, configs, expiringPoints } = useContext(LandingContext);
  const infoButtonRef = useRef(null);

  const formateDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("default", { month: "long" }); 
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };
  return (
    <div className="lg:cb-flex lg:cb-px-[64px] cb-gap-[104px] cb-relative">
      <div className="lg:cb-flex-[0_0_50%] lg:cb-max-w-[50%] cb-h-max lg:cb-sticky lg:cb-top-[50px] lg:cb-z-[100]">
        <div className="cb-px-4 cb-pt-4">
          <div className="cb-flex cb-gap-2 cb-items-center">
            <span>
              <CashbackIcon />
            </span>
            <span>Swiss Cash</span>
          </div>
          <div className="cb-mt-6">
            <div className="cb-flex cb-justify-between">
              <div>
                <div className="cb-flex cb-gap-2 cb-items-center lg:cb-relative">
                  <p className="cb-font-primary cb-text-[12px] lg:cb-text-[14px] cb-font-medium cb-leading-normal cb-text-[#000] sw-leading-none">
                    Available Balance
                  </p>
                  <button ref={infoButtonRef}>
                    <InfoIcon />
                  </button>
                  <Infopopup btnRef={infoButtonRef} />
                </div>
                <p className="cb-font-primary cb-text-[24px] cb-text-[#000] cb-mt-3 cb-leading-none">
                  {moneyFormatter(wallet?.balance || 0)}
                </p>
                <p className="cb-font-secondary cb-text-[12px] cb-leading-none cb-font-semibold cb-text-[#565656] cb-mt-[14px]">
                  Max Limit : {moneyFormatter(configs.max_cashback.value)}
                </p>
              </div>
              {expiringPoints?.length > 0 && (
                <div className="cb-flex cb-gap-1 cb-items-center">
                  <div>
                    <HazardIcon />
                  </div>
                  <div>
                    <p className="cb-font-secondary cb-text-[12px] cb-text-[#E31B1B] cb-font-medium cb-leading-normal">
                      Swiss Cash : {moneyFormatter(expiringPoints[0].amount)}
                    </p>
                    <p className="cb-font-secondary cb-text-[12px] cb-text-[#E31B1B] cb-font-medium cb-leading-normal">
                      Expiring on : {formateDate(expiringPoints[0].expiresOn)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="cb-font-secondary cb-text-[12px] cb-font-semibold cb-leading-none cb-mt-[32px] cb-pl-4">
          {configs.usage.type == "percentage"
            ? `Up to ${configs.usage.value}% of Order Value can be paid via Swiss Cash`
            : `Up to ${moneyFormatter(
                configs.usage.value
              )} can be paid via Swiss Cash`}
        </p>
        <OffersCarousel />
      </div>
      <div className="lg:cb-flex-[0_0_40%] lg:cb-max-w-[40%]">
        <TransactionContainer />
      </div>
    </div>
  );
};
export default LandingContent;
