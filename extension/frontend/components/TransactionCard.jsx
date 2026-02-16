import { useState } from "react";
import { formatDateLocal } from "../helpers/cashback.js";
import { moneyFormatter } from "../helpers/general.js";
import {
  CaretDownIcon,
  CreditCancelledIcon,
  CreditIcon,
  CreditPendingIcon,
  DebitIcon,
} from "./Icons.jsx";
import { eventHandler } from "../helpers/events.js";

const TransactionCard = ({
  _id,
  type,
  updatedAt,
  orderName,
  status,
  amount = 0,
  closingBalance,
}) => {
  const [additionalInfoDisplay, setAdditoionalInfoDisplay] = useState(false);

  const showAdditionalInfo = () =>{
    setAdditoionalInfoDisplay(true);
    eventHandler("cashback_transaction_info_show",{_id,type,updatedAt,orderName,status,amount,closingBalance});
  };
  const hideAdditionalInfo = () =>{
    setAdditoionalInfoDisplay(false);
    eventHandler("cashback_transaction_info_hide",{_id,type,updatedAt,orderName,status,amount,closingBalance});
  }
  const iconMarkup = (
    <div className="cb-flex cb-flex-col cb-gap-1 cb-items-center">
      <span>
        {type == "credit" && status == "completed" && <CreditIcon />}
        {type == "credit" && status == "pending" && <CreditPendingIcon />}
        {type == "credit" && status == "cancelled" && <CreditCancelledIcon />}
        {type == "debit" && <DebitIcon />}
      </span>
      <span data-type={type}
        className={
          "cb-font-primary cb-text-[12px] cb-font-medium cb-leading-none cb-text-center" +
          `${
            type == "credit" && status == "completed"
              ? " cb-text-[#03A71C]"
              : (type ==
                  "credit" && status == "pending"
                    ? "  cb-text-[#646464]"
                    : " cb-text-[#E31B1B]")
          }`
        }
      >
        {type == "credit" && status == "completed" && "Credited"}
        {type == "credit" && status == "pending" && "Pending"}
        {type == "credit" && status == "cancelled" && "Cancelled"}
        {type == "debit" && status == 'expired' && "Expired"}
        {type == "debit" && status != 'expired' && "Debited"}
      </span>
    </div>
  );
  const amountMarkup = (
    <div className="cb-flex cb-items-center cb-gap-[2px]">
      {type == "credit" && status == "completed" && (
        <span className="cb-font-primary cb-text-[12px] cb-font-bold cb-leading-none cb-text-[#03A71C]">
          +
        </span>
      )}
      {type == "credit" && status == "pending" && (
        <span className="cb-font-primary cb-text-[12px] cb-font-bold cb-leading-none cb-text-[#03A71C]">
          +
        </span>
      )}
      {type == "debit" && (
        <span className="cb-font-primary cb-text-[12px] cb-font-bold cb-leading-none cb-text-[#E31B1B]">
          -
        </span>
      )}
      <span
        className={
          "cb-font-primary cb-text-[12px] cb-font-bold cb-leading-none" +
          `${
            type == "credit" && status == "completed"
              ? " cb-text-[#03A71C]"
              : (type == "credit" && status == "pending"
                    ? " cb-text-[#03A71C]"
                    : " cb-text-[#E31B1B]")
          }`
        }
      >
        {moneyFormatter(amount)}
      </span>
    </div>
  );
  return (
    <div className="transaction-card-container cb-border-b-[1px] cb-border-solid cb-border-b-[#A6A6A6]">
      <div className="transaction-card-content cb-flex cb-gap-[28px] cb-py-4 cb-px-2">
        {iconMarkup}
        <div>
          <p className="cb-font-primary cb-text-[14px] cb-text-[#000] cb-font-medium cb-leading-none">
            {formatDateLocal(updatedAt)}
          </p>
          <p className="cb-mt-[14px]">
            {orderName && (
              <>
                <span className="cb-font-primary cb-text-[14px] cb-text-[#000] cb-font-medium cb-leading-none">
                  Order ID
                </span>{" "}
                :{" "}
                <span className="cb-font-primary cb-text-[14px] cb-text-[#2F80ED] cb-font-medium cb-leading-none">
                  {orderName}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="cb-ml-auto cb-flex cb-flex-col">
          {amountMarkup}
          <button
            onClick={!additionalInfoDisplay ? showAdditionalInfo : hideAdditionalInfo}
            className={
              "cb-mt-[16px] cb-ml-auto" +
              `${additionalInfoDisplay ? " cb-rotate-180" : ""}`
            }
          >
            <CaretDownIcon />
          </button>
        </div>
      </div>
      {additionalInfoDisplay && (
        <div className="additional-info cb-py-4 cb-pt-0 cb-pl-[80px]">
          <p className="cb-font-primary cb-text-[12px] cb-text-[#000] cb-font-medium cb-leading-none">
            Closing balance : {moneyFormatter(closingBalance)}
          </p>
          {type == "credit" && status == "pending" && (
            <p className="cb-font-primary cb-font-normal cb-leading-none cb-text-[12px] cb-text-[#000] cb-mt-4">
              Amount will be credited within 24 hrs of successful delivery
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
