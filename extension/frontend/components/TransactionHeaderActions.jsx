import CalendarPopup from "./CalendarPopup.jsx";
import { CalendarIcon } from "./Icons.jsx";
import { useRef, useContext } from "react";
import { LandingContext } from "./Dashboard.jsx";
import { formatDateLocal } from "../helpers/cashback.js";

const TransactionHeaderActions = () => {
  const popupBtnRef = useRef();
  const cashbackData = useContext(LandingContext);
  const { transactions } = cashbackData;

  return (
    <div>
      <button
        ref={popupBtnRef}
        className="cb-flex cb-gap-1 cb-items-center cb-bg-[#FFF3F4] cb-rounded-lg cb-p-[6px]"
      >
        <span>
          <CalendarIcon />
        </span>
        {!transactions?.filters?.startDate && !transactions?.filters?.endDate && (
          <span className="cb-font-primary cb-text-[12px] cb-leading-none cb-text-center cb-text-[#000]">
            Date Range
          </span>
        )}
        {transactions?.filters?.startDate && transactions?.filters?.endDate && (
          <span className="cb-font-primary cb-text-[12px] cb-leading-none cb-text-center cb-text-[#000]">
            {formatDateLocal(transactions.filters.startDate) + " - " + formatDateLocal(transactions.filters.endDate)}
          </span>
        )}
      </button>
      <CalendarPopup btnRef={popupBtnRef} />
    </div>
  );
};

export default TransactionHeaderActions;
