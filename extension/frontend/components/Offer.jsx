import { useState,useRef,useEffect } from "react";
import { OfferCopyCheckIcon, OfferCopyIcon, OfferInfoIcon } from "./Icons.jsx";
import OfferInfoPopup from "./OfferInfoPopup.jsx";
import { eventHandler } from "../helpers/events.js";

const useMutationObserver = (
  ref,
  callback,
  options = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  }
) => {
  useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);
      observer.observe(ref.current, options);
      return () => observer.disconnect();
    }
  }, [callback, options]);
};

////
const Offer = ({ offer }) => {
  const [copied, setCopied] = useState(false);
  const infoBtnRef = useRef();
  const cardRef = useRef();
  const mutationRef = useRef();
  const [mutationCount, setMutationCount] = useState(0);
  const incrementMutationCount = () => {
    return setMutationCount(mutationCount + 1);
  };
  useMutationObserver(mutationRef, incrementMutationCount);

  const handleCopyButton = () => {
    window.navigator.clipboard.writeText(offer.code);
    setCopied(true);
    eventHandler("cashback_offer_copied",{
      ...offer
    })
    let timeout = setTimeout(() => {
      setCopied(false);
      clearTimeout(timeout);
    }, 3000);
  };
  const handleCtabtn = (e) =>{
    e.preventDefault();
    eventHandler("cashback_offer_redirection_btn_click",{...offer});
    console.log(e.target.getAttribute('href'));
    window.location = e.target.getAttribute('href'); 
  }
  return (
    <>
      <div ref={mutationRef} className="offer-block keen-slider__slide cb-flex-[0_0_84%]">
        <div className="offer-content-wrapper cb-relative cb-overflow-hidden">
          <div className="offer-body cb-bg-[linear-gradient(0deg,_#FFF3F4_0%,_#FFD2D6_100%)] cb-p-3 cb-rounded-t-xl">
            <div className="cb-flex cb-justify-between cb-items-center lg:cb-relative">
              <p className="cb-font-primary cb-text-[12px] cb-leading-none cb-text-[#000] cb-font-medium">
                {offer.title}
              </p>
              <button ref={infoBtnRef}>
                <OfferInfoIcon />
              </button>
            </div>
            {offer.description && offer.description.trim().length > 0 && (
              <p dangerouslySetInnerHTML={{__html: offer.description}} className="cb-font-primary cb-text-[12px] cb-leading-none cb-text-[#000] cb-font-normal cb-mt-3"/>
            )}
          </div>
          <div className="offer-action cb-px-3 cb-py-2 cb-flex cb-gap-2 cb-items-center cb-border-solid cb-border-[1px] cb-border-[#FFD2D6] [border-top-style:dashed] cb-rounded-b-xl cb-relative">
            <div className="cb-block cb-absolute cb-left-0 cb-top-0 cb-w-4 cb-h-4 cb-border-[1px] cb-border-solid cb-border-[#FFD2D6] cb-rounded-full cb-translate-x-[-50%] cb-translate-y-[-50%] cb-bg-[#fff]"></div>
            <div className="cb-block cb-absolute cb-right-0 cb-top-0 cb-w-4 cb-h-4 cb-border-[1px] cb-border-solid cb-border-[#FFD2D6] cb-rounded-full cb-translate-x-[50%] cb-translate-y-[-50%] cb-bg-[#fff]"></div>
            <button
              onClick={handleCopyButton}
              className="cb-h-[31px] cb-px-2 cb-items-center cb-justify-center cb-flex cb-gap-1 cb-border-solid cb-border-[1px] cb-border-[#A6A6A6] cb-rounded-lg"
            >
              <span>
                {!copied && <OfferCopyIcon />}
                {copied && <OfferCopyCheckIcon />}
              </span>
              <span className="cb-font-primary cb-text-[12px] cb-font-normal cb-leading-none cb-text-center">
                {offer.code}
              </span>
            </button>
            {offer.url && offer.btnText && (
              <a
                className="cb-h-[31px] cb-w-full cb-text-[12px] cb-font-semibold cb-leading-none cb-rounded-lg cb-bg-[#FC2679] cb-text-[#fff] cb-font-primary cb-items-center cb-justify-center cb-flex cb-border-[1px] cb-border-[solid] cb-border-[#FC2679]"
                href={offer.url}
                onClick={handleCtabtn}
              >
                {offer.btnText}
              </a>
            )}
          </div>
        </div>
      </div>
     <OfferInfoPopup info={offer.info} btnRef={infoBtnRef} cardRef={cardRef} changes={mutationCount}/>
    </>
  );
};

export default Offer;
