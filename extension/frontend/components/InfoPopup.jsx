import { useContext, useEffect, useRef, useState } from "react";
import { LandingContext } from "./Dashboard.jsx";
import { moneyFormatter } from "../helpers/general.js";
import { CloseIcon } from "./Icons.jsx";
import { eventHandler } from "../helpers/events.js";

const Infopopup = ({ btnRef }) => {
  const { configs } = useContext(LandingContext);
  const [display, setDisplay] = useState(false);
  const popupRef = useRef()
  

  const showPopup = () =>{
    setDisplay(true);
    eventHandler("cashback_info_popup_show",{...configs});
  }
  const hidePopup = () =>{
    setDisplay(false);
    eventHandler("cashback_info_popup_hide",{...configs});
  }

  useEffect(() => {
    btnRef.current.addEventListener("click", showPopup);
    document.addEventListener('click',(e) =>{
      if (
      popupRef.current &&
      !popupRef.current.contains(event.target) &&
      btnRef.current &&
      !btnRef.current.contains(event.target)
    ) {
      hidePopup();
    }
    })
  }, []);
  if (!display) {
    return <></>;
  }
  return (
    <>
      <div onClick={hidePopup} className="cb-fixed cb-top-0 cb-left-0 cb-w-full cb-h-full cb-bg-[rgba(0,0,0,0.4)] cb-block cb-z-[1005] lg:cb-hidden"></div>
      <div ref={popupRef} className="cb-fixed lg:cb-absolute cb-bottom-0 cb-left-0 lg:cb-right-0 lg:cb-top-[50%] lg:cb-translate-x-[35%] lg:cb-shadow-md lg:cb-translate-y-[-50%] cb-w-full lg:cb-w-[416px] lg:cb-rounded-lg cb-h-max cb-bg-[#ffff] sw-z-[1006]">
        <div className="cb-relative cb-z-[100]">
          <button
            onClick={hidePopup}
            className="cb-absolute cb-left-[50%] cb-top-0 cb-translate-y-[-120%] lg:cb-hidden cb-translate-x-[-50%] cb-bg-[#fff] cb-p-1 cb-rounded-full"
          >
            <CloseIcon />
          </button>
          <div className="cb-p-4">
            <p className="cb-font-primary cb-font-medium cb-text-[#000] cb-leading-none cb-text-[16px]">
              Max Swiss Cash limit in wallet is:{" "}
              {moneyFormatter(configs.max_cashback.value)}
            </p>
            <p className="cb-mt-4 cb-font-secondary cb-text-[14px] cb-text-[#565656] cb-leading-none">
              Your wallet can hold Swiss Cash worth up to{" "}
              {moneyFormatter(configs.max_cashback.value)}. Utilise the balance
              to get more cashback.
            </p>
            <p className="cb-mt-4 cb-flex cb-gap-1 cb-items-center">
              <span className="cb-font-secondary cb-text-[14px] cb-text-[#565656] cb-font-medium cb-leading-none">
                To Read Teams & Conditions :{" "}
              </span>
              <a
                className="cb-font-secondary cb-text-[#2F80ED] cb-text-[14px] cb-font-bold cb-leading-none"
                href="/pages/cashback"
              >
                Click Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default Infopopup;
