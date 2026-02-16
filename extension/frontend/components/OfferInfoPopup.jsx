import { useEffect, useState, useRef } from "react";
import { CloseIcon } from "./Icons.jsx";
import { eventHandler } from "../helpers/events.js";

const OfferInfoPopup = ({ info, btnRef, changes }) => {
  const [display, setDisplay] = useState(false);
  const popupRef = useRef();

  const updatePosition = () => {
    if (btnRef.current && popupRef.current && window.innerWidth > 768) {
      const rect = btnRef.current.getBoundingClientRect();
      popupRef.current.style.position = "fixed";
      popupRef.current.style.top = `${rect.y + 10}px`;
      popupRef.current.style.left = `${rect.x + 20}px`;
      popupRef.current.style.transform = `translateY(-50%)`;
    }
  };
  const showPopup = () => {
    setDisplay(true);
    updatePosition();
    eventHandler("cashback_offer_info_popup_show", { ...info });
  };
  const closePopup = () => {
    setDisplay(false);
    eventHandler("cashback_offer_info_popup_hide", { ...info });
  };
  useEffect(() => {
    btnRef.current.addEventListener("click", showPopup);
    document.addEventListener("click", (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        btnRef.current &&
        !btnRef.current.contains(event.target)
      ) {
        closePopup();
      }
    });
  }, []);
  useEffect(() => {
    updatePosition();
  }, [changes]);
  if (!display) {
    return <></>;
  }
  return (
    <>
      <div
        className="cb-fixed lg:cb-hidden cb-left-0 cb-top-0 cb-bg-[rgba(0,0,0,0.4)] cb-z-[1005] cb-w-full cb-h-full"
        onClick={closePopup}
      ></div>
      <div
        ref={popupRef}
        className="cb-fixed lg:cb-absolute lg:cb-w-[416px] cb-left-0 cb-bottom-0 cb-bg-[#fff] lg:cb-h-max lg:cb-shadow-lg lg:cb-rounded-md cb-p-4 cb-w-full cb-z-[1006]"
      >
        <div className="cb-relative">
          <button
            onClick={closePopup}
            className="cb-absolute cb-top-0 lg:cb-hidden cb-left-[50%] cb-translate-x-[-50%] cb-translate-y-[-200%] cb-bg-[#fff] cb-p-1 cb-rounded-full"
          >
            <CloseIcon />
          </button>
          {info.title && info.title.trim().length > 0 && (
            <p className="cb-font-primary cb-text-[16px] cb-font-medium cb-leading-none cb-text-[#000]">
              {info.title}
            </p>
          )}
          {info.description && info.description.trim().length > 0 && (
            <p
              dangerouslySetInnerHTML={{ __html: info.description }}
              className="cb-font-secondary cb-text-[14px] cb-text-[#565656] cb-leading-none cb-font-medium cb-mt-4"
            />
          )}
          {info.terms && info.terms.length > 0 && (
            <p
              dangerouslySetInnerHTML={{ __html: info.terms }}
              className="cb-text-[14px] cb-font-secondary cb-font-medium cb-text-[#565656] cb-leading-none cb-mt-4"
            />
          )}
        </div>
      </div>
    </>
  );
};
export default OfferInfoPopup;
