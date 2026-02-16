import { CaretRightIcon } from "./Icons.jsx";
import { LandingContext } from "./Dashboard.jsx";
import { useContext } from "react";
import { filterTransaction } from "../helpers/cashback.js";
import { eventHandler } from "../helpers/events.js";

const TransactionPagination = () => {
  const cashbackData = useContext(LandingContext);
  const { transactions, updateData, updateTransactionLoading } = cashbackData;

  const emptyTransaction = {
    pagination: {
      currentPage: 1,
      nextPage: null,
      prevPage: null,
      pages: [1],
      totalPages: 1,
    },
    filters: {
      startDate: null,
      endDate: null,
    },
  };
  const { pagination, filters } = transactions
    ? transactions
    : emptyTransaction;

  const handleNavigationBtns = async (page) => {
    try {
      updateTransactionLoading(true);
      let query = `?page=${page}`;
      filters.startDate ? (query += `&startDate=${filters.startDate}`) : "";
      filters.endDate ? (query += `&endDate=${filters.endDate}`) : "";
      let updatedTransactionsList = await filterTransaction(query);
      let updatedData = {
        ...cashbackData,
        ...updatedTransactionsList,
      };
      updateData(updatedData);
      eventHandler('cashback_pagination_clicked',{...transactions});
    } catch (err) {
      console.log("Failed to update transaction reason -->" + err.message);
    } finally{
        updateTransactionLoading(false);
    }
  };
  return (
    <div className="cb-flex cb-gap-4 cb-items-center cb-justify-center cb-pt-3 cb-mb-10 cb-border-solid cb-border-t-[1px] cb-border-[#D9D9D9]">
      <button
        className="cb-scale-[-1]"
        disabled={pagination.prevPage ? false : true}
        onClick={() => handleNavigationBtns(--pagination.currentPage)}
      >
        <CaretRightIcon
          classes={pagination.prevPage ? "cb-fill-[#000]" : "cb-fill-[#A6A6A6]"}
        />
      </button>
      <ul className="cb-flex cb-gap-4 cb-items-center">
        {pagination.pages.map((el) => (
          <li className="cb-mb-0" key={el}>
            <button
              onClick={() => handleNavigationBtns(el)}
              className={
                "cb-font-primary cb-text-[14px] cb-font-normal cb-leading-none cb-text-[#A6A6A6] [&.active]:cb-text-[#FC2679] [&.active]:cb-font-[18px]" +
                `${pagination.currentPage == el ? " active" : ""}`
              }
            >
              {el}
            </button>
          </li>
        ))}
      </ul>
      <button
        disabled={pagination.nextPage ? false : true}
        onClick={() => handleNavigationBtns(++pagination.currentPage)}
      >
        <CaretRightIcon
          classes={pagination.nextPage ? "cb-fill-[#000]" : "cb-fill-[#A6A6A6]"}
        />
      </button>
    </div>
  );
};

export default TransactionPagination;
