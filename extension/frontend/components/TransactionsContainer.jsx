import TransactionHeaderActions from "./TransactionHeaderActions.jsx";
import { LandingContext } from "./Dashboard.jsx";
import { useContext, useEffect, useState } from "react";
import { EmptyTransactionIcon } from "./Icons.jsx";
import TransactionCard from "./TransactionCard.jsx";
import TransactionPagination from "./TransactionPagination.jsx";
import Loader from "./Loader.jsx";

const TransactionContainer = () => {
  const cashbackData = useContext(LandingContext);
  const { transactions, updateTransactionsLoading, transactionsLoading } =
    cashbackData;
  const transactionsList = transactions?.transactions
    ? transactions.transactions
    : [];

  const emptyMarkup = (
    <div className="cb-py-[20px] cb-flex cb-justify-center cb-items-center cb-flex-col">
      <span>
        <EmptyTransactionIcon />
      </span>
      <p className="cb-font-primary cb-font-normal cb-text-[#A6A6A6] cb-text-[14px] cb-text-center cb-mt-[16px]">
        No Transaction History
      </p>
    </div>
  );
  return (
    <div className="transaction-container cb-border-t-[2px] lg:cb-border-t-0 cb-sticky cb-top-[100px] cb-border-t-[#D9D9D9] cb-border-solid cb-mt-[17px] cb-px-4">
      <div className="transaction-header cb-flex cb-justify-between cb-py-[14px] cb-items-center cb-border-b-[1px] cb-border-b-[#D9D9D9] cb-border-solid">
        <p className="cb-font-primary cb-text-[14px] cb-text-[#000] cb-font-medium cb-leading-none">
          Swiss Cash History :{" "}
        </p>
        <TransactionHeaderActions />
      </div>
      <div className="transaction-content cb-relative">
        {transactionsList.length == 0 && emptyMarkup}
        {transactionsList.map((el) => (
          <TransactionCard key={el._id} {...el} />
        ))}
        {transactionsLoading && (
          <div className="cb-absolute cb-bg-[rgba(0,0,0,0.1)] cb-w-full cb-h-full cb-top-0 cb-lef-0 cb-flex cb-justify-center cb-items-center">
            <Loader />
          </div>
        )}
      </div>
      <TransactionPagination />
    </div>
  );
};

export default TransactionContainer;
