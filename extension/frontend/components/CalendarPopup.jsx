import "react-calendar/dist/Calendar.css";
import { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import { CalendarArrowIcon, PrevIcon } from "./Icons.jsx";
import { filterTransaction, formatDateLocal } from "../helpers/cashback.js";
import { LandingContext } from "./Dashboard.jsx";
import Loader from "./Loader.jsx";
import { eventHandler } from "../helpers/events.js";

const CalendarPopup = ({ btnRef }) => {
  const [startValue, startValueChange] = useState(new Date());
  const [endValue, endValueChange] = useState(new Date());
  const [startRangeDisplay, setStartRangeDisplay] = useState(true);
  const [endRangeDisplay, setEndRangeDisplay] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startMonthHeading, setStartMonthHeading] = useState(new Date());
  const [startYearHeading, setStartYearHeading] = useState(new Date());
  const [popupDisplay, setPopupDisplay] = useState(false);
  const cashbackData = useContext(LandingContext);
  const [loading, setLoading] = useState(false);
  const { updateData, updateTransactionLoading } = cashbackData;

  const monthFormatter = (index) => {
    const monthArray = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthArray[index];
  };
  const weekFormatter = (locale, date) => {
    const day = new Date(date).getDay();
    const weekArray = ["S", "M", "T", "W", "T", "F", "S"];
    return weekArray[day];
  };
  const handleStartCalendarChange = (value) => {
    setStartDate(value);
  };
  const handleStartRangeChange = ({ activeStartDate }) => {
    setStartMonthHeading(activeStartDate);
    setStartYearHeading(activeStartDate);
  };
  const handleEndCalendarChange = (value) => {
    setEndDate(value);
  };
  const handleNavigationControls = (start, btn) => {
    let selectorClass = start
      ? '[data-role="start-calendar"] .react-calendar__navigation button'
      : '[data-role="end-calendar"] .react-calendar__navigation button';
    switch (btn) {
      case "prev-year":
        selectorClass += ".react-calendar__navigation__prev2-button";
        break;
      case "next-year":
        selectorClass += ".react-calendar__navigation__next2-button";
        break;
      case "prev-month":
        selectorClass += ".react-calendar__navigation__prev-button";
        break;
      case "next-month":
        selectorClass += ".react-calendar__navigation__next-button";
        break;
    }
    document
      .querySelector(selectorClass)
      .dispatchEvent(new CustomEvent("click", { bubbles: true }));
  };
  const resetForm = async () => {
    setStartDate(null);
    setEndDate(null);
    if (window.innerWidth < 768) {
      setEndRangeDisplay(false);
      setStartRangeDisplay(true);
    } else {
      setEndRangeDisplay(true);
      setStartRangeDisplay(true);
    }
    startValueChange(new Date());
    endValueChange(new Date());
    setPopupDisplay(false);
    if (cashbackData?.transactions?.filters?.startDate) {
      try {
        updateTransactionLoading(true);
        const updatedTransaction = await filterTransaction("");
        let updatedData = {
          ...cashbackData,
          ...updatedTransaction,
        };
        updateData(updatedData);
        updateTransactionLoading(false);
        eventHandler("cashback_filters_updated", { ...updatedTransaction });
      } catch (err) {
        console.log(
          "Failed to reset transactions history properly reason -->" +
            err.message
        );
      }
    }
  };

  const handleFormSubmission = async () => {
    try {
      setLoading(true);
      updateTransactionLoading(true);
      let query = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const updatedTransaction = await filterTransaction(query);
      let updatedData = {
        ...cashbackData,
        ...updatedTransaction,
      };
      updateData(updatedData);
      eventHandler("cashback_filters_updated", { ...updatedTransaction });
    } catch (err) {
      console.log("Failed to handle form submission reason -->" + err.message);
    } finally {
      setPopupDisplay(false);
      setLoading(false);
      updateTransactionLoading(false);
    }
  };
  useEffect(() => {
    if (window.innerWidth > 768 || startDate) {
      setEndRangeDisplay(true);
    }
    if (window.innerWidth < 768 && startDate) {
      setStartRangeDisplay(false);
    }
  }, [startDate]);
  useEffect(() => {
    btnRef.current.addEventListener("click", () => setPopupDisplay(true));
  }, []);
  if (!popupDisplay) {
    return <></>;
  }
  return (
    <>
      {createPortal(
        <>
          {" "}
          <div
            className="cb-fixed cb-top-0 cb-left-0 cb-w-full cb-h-full cb-bg-[rgba(0,0,0,0.4)] cb-z-[1005]"
            onClick={() => setPopupDisplay(false)}
          ></div>
          <div className="cb-fixed cb-max-w-[calc(100%_-_70px)] lg:cb-max-w-[720px] cb-left-[50%] cb-top-[50%] cb-translate-x-[-50%] cb-translate-y-[-50%] cb-z-[1006] cb-bg-[#fff] cb-p-6 cb-rounded-xl">
            <div
              data-role="start-calendar"
              className="lg:cb-flex lg:cb-flex-wrap lg:cb-gap-x-[72px]"
            >
              <div className="calendar-header cb-flex cb-gap-[14px] cb-items-center cb-mb-6 lg:cb-flex-[0_0_100%] lg:cb-gap-0">
                <input
                  className={
                    "cb-max-w-[110px] cb-font-primary cb-text-[12px] lg:cb-h-[26px] cb-text-center cb-text-[#FC2679] cb-font-medium cb-border-[#A6A6A6] cb-border-solid cb-border-[1px] cb-rounded-lg !cb-outline-none focus:cb-border-[#FC2679] [&.active]:cb-border-[#FC2679] lg:cb-flex-[0_0_calc(50%_-_36px)] lg:cb-max-w-[calc(50%_-_36px)]" +
                    `${startRangeDisplay ? " active" : ""}`
                  }
                  type="text"
                  value={startDate ? formatDateLocal(startDate) : ""}
                  onClick={() => {
                    setEndRangeDisplay(false);
                    setStartRangeDisplay(true);
                  }}
                  readOnly
                />
                <span className="lg:cb-flex-[0_0_72px] lg:cb-max-w-[72px] lg:cb-flex lg:cb-justify-center">
                  <CalendarArrowIcon />
                </span>
                <input
                  className={
                    "cb-max-w-[110px] cb-font-primary cb-text-[12px] lg:cb-h-[26px] cb-text-center cb-text-[#FC2679] cb-font-medium cb-border-[#A6A6A6] cb-border-solid cb-border-[1px] cb-rounded-lg !cb-outline-none focus:cb-border-[#FC2679] [&.active]:cb-border-[#FC2679] lg:cb-flex-[0_0_calc(50%_-_36px)] lg:cb-max-w-[calc(50%_-_36px)]" +
                    `${endRangeDisplay ? " active" : ""}`
                  }
                  type="text"
                  value={endDate ? formatDateLocal(endDate) : ""}
                  readOnly
                  onClick={() => {
                    setEndRangeDisplay(true);
                    setStartRangeDisplay(false);
                  }}
                />
              </div>
              {startRangeDisplay && (
                <div className="lg:cb-flex-[0_0_calc(50%_-_36px)] lg:cb-max-w-[calc(50%_-_36px)]">
                  <div className="header-year-actions cb-flex cb-justify-between cb-items-center cb-mb-6">
                    <button
                      onClick={() =>
                        handleNavigationControls(true, "prev-year")
                      }
                    >
                      <PrevIcon />
                    </button>
                    <p className="cb-font-primary cb-text-[12px] cb-font-medium cb-leading-none">
                      {startYearHeading.getFullYear()}
                    </p>
                    <button
                      className="cb-scale-x-[-1]"
                      onClick={() =>
                        handleNavigationControls(true, "next-year")
                      }
                    >
                      <PrevIcon />
                    </button>
                  </div>
                  <div className="header-year-actions cb-flex cb-justify-between cb-items-center cb-mb-6">
                    <button
                      o
                      onClick={() =>
                        handleNavigationControls(true, "prev-month")
                      }
                    >
                      <PrevIcon />
                    </button>
                    <p className="cb-font-primary cb-text-[12px] cb-font-medium cb-leading-none">
                      {monthFormatter(startMonthHeading.getMonth())}
                    </p>
                    <button
                      className="cb-scale-x-[-1]"
                      onClick={() =>
                        handleNavigationControls(true, "next-month")
                      }
                    >
                      <PrevIcon />
                    </button>
                  </div>
                  <Calendar
                    next2Label=""
                    prev2Label=""
                    nextLabel={<PrevIcon />}
                    prevLabel={<PrevIcon />}
                    onChange={startValueChange}
                    value={startValue}
                    showNeighboringMonth={false}
                    formatShortWeekday={weekFormatter}
                    onClickDay={handleStartCalendarChange}
                    onActiveStartDateChange={handleStartRangeChange}
                  />
                </div>
              )}
              {endRangeDisplay && (
                <div
                  data-role="end-calendar"
                  className="lg:cb-flex-[0_0_calc(50%_-_36px)] lg:cb-max-w-[calc(50%_-_36px)]"
                >
                  <div className="header-year-actions cb-flex cb-justify-between cb-items-center cb-mb-6">
                    <button
                      onClick={() =>
                        handleNavigationControls(false, "prev-year")
                      }
                    >
                      <PrevIcon />
                    </button>
                    <p className="cb-font-primary cb-text-[12px] cb-font-medium cb-leading-none">
                      {startValue.getFullYear()}
                    </p>
                    <button
                      className="cb-scale-x-[-1]"
                      onClick={() =>
                        handleNavigationControls(false, "next-year")
                      }
                    >
                      <PrevIcon />
                    </button>
                  </div>
                  <div className="header-year-actions cb-flex cb-justify-between cb-items-center cb-mb-6">
                    <button
                      onClick={() =>
                        handleNavigationControls(false, "prev-month")
                      }
                    >
                      <PrevIcon />
                    </button>
                    <p className="cb-font-primary cb-text-[12px] cb-font-medium cb-leading-none">
                      {monthFormatter(startValue.getMonth())}
                    </p>
                    <button
                      className="cb-scale-x-[-1]"
                      onClick={() =>
                        handleNavigationControls(false, "next-month")
                      }
                    >
                      <PrevIcon />
                    </button>
                  </div>
                  <Calendar
                    next2Label=""
                    prev2Label=""
                    nextLabel={<PrevIcon />}
                    prevLabel={<PrevIcon />}
                    onChange={endValueChange}
                    value={endValue}
                    showNeighboringMonth={false}
                    onClickDay={handleEndCalendarChange}
                    formatShortWeekday={weekFormatter}
                  />
                </div>
              )}
            </div>
            <div className="calendar-footer cb-flex cb-gap-6 cb-mt-[14px] lg:cb-justify-end">
              <button
                onClick={resetForm}
                className="cb-border-[1px] cb-w-full cb-border-solid cb-border-[#A6A6A6] cb-bg-[#fff] cb-font-primary cb-text-[12px] cb-font-semibold cb-text-[#565656] cb-rounded-lg cb-h-[25px] cb-flex cb-items-center cb-justify-center lg:cb-max-w-[140px] lg:cb-h-[34px]"
              >
                {cashbackData?.transactions?.filters?.startDate && "Reset"}
                {!cashbackData?.transactions?.filters?.startDate && "Cancel"}
              </button>
              <button
                onClick={handleFormSubmission}
                disabled={startDate && endDate ? false : true}
                className="cb-font-primary disabled:cb-bg-[#A6A6A6] lg:cb-max-w-[140px] cb-text-[12px] cb-w-full cb-rounded-lg cb-font-semibold cb-text-[#fff] cb-bg-[#FC2679] cb-border-[#FC2679] cb-border-[1px] cb-border-solid cb-h-[25px] cb-flex cb-items-center cb-justify-center disabled:cb-border-[#A6A6A6] lg:cb-h-[34px]"
              >
                {loading && <Loader classes="cb-w-[16px] cb-h-[16px]" />}
                {!loading && "Apply"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default CalendarPopup;
