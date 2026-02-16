import { useEffect, useMemo, useRef, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

import { getCartData, getWidgetData } from "../helpers/widget.js";
import { WalletIcon } from "./Icons.jsx";

function AutoPlay(ms = 2500) {
  return (slider) => {
    let timer;

    const clear = () => timer && clearInterval(timer);
    const start = () => {
      clear();
      if (slider.slides.length <= 1) return;
      timer = setInterval(() => slider.next(), ms);
    };

    slider.on("created", start);
    slider.on("updated", start);
    slider.on("destroyed", clear);
  };
}

function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number(style.opacity || 1) === 0) return false;
  return rect.width > 0 && rect.height > 0;
}

function findMiniCartContainer() {
  return document.querySelector('mini-cart [data-role="container"]') ||
    document.querySelector('[data-role="mini-cart"] [data-role="container"]') ||
    document.querySelector('[data-role="container"][data-mini-cart="true"]') ||
    document.querySelector('[data-role="container"]');
}

export default function CashbackCartWidget({ isDrawerOpen: isDrawerOpenProp } = {}) {
  const [widgetData, setWidgetData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const sliderElRef = useRef(null);

  const handleCartUpdate = async () => {
    const c = await getCartData();
    setCartData(c);
  };
  useEffect(() => {
    (async () => {
      const [w, c] = await Promise.all([getWidgetData(), getCartData()]);
      setWidgetData(w);
      setCartData(c);
    })();

    document.addEventListener("custom:miniCartUpdated", handleCartUpdate);
    return () => document.removeEventListener("custom:miniCartUpdated", handleCartUpdate);
  }, []);

  const slides = useMemo(() => {
    if (!widgetData || !cartData) return [];

    const cashbackMsg =
      widgetData.cashbackSettings?.order_allocation?.type === "percentage"
        ? `You will get ₹${Math.round(
            (Number(cartData.items_subtotal_price || 0) *
              Number(widgetData.cashbackSettings.order_allocation.value || 0)) /
              10000
          )} cashback after delivery`
        : `You will get ₹${Math.round(
            Number(widgetData.cashbackSettings?.order_allocation?.value || 0)
          )} cashback after delivery`;

    const base = [
      { tone: "success", text: cashbackMsg },
      { tone: "success", text: "Cashback will be credited in swiss wallet" },
    ];

    if (widgetData.expiringCredits?.length > 0) {
      base.push({
        tone: "warn",
        text: `Your cashback worth ₹${widgetData.expiringCredits[0].amount} will expire soon`,
      });
    }

    return base;
  }, [widgetData, cartData]);

  const effectiveDrawerOpen =
    typeof isDrawerOpenProp === "boolean" ? isDrawerOpenProp : isCartDrawerOpen;

  const shouldInitSlider = slides.length > 0 && effectiveDrawerOpen;
  const [keenRef, instanceRef] = useKeenSlider(
    shouldInitSlider
      ? {
          loop: slides.length > 1,
          vertical: true,
          rubberband: false,
          slides: { perView: 1, spacing: 10 },
          drag: false,
        }
      : null,
    [AutoPlay(2500)]
  );

  const setRefs = (node) => {
    sliderElRef.current = node;
    if (node) keenRef(node);
  };
  useEffect(() => {
    let containerEl = null;
    let mo = null;
    let ro = null;
    let rafId = null;

    const computeAndSet = () => {
      if (!containerEl) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const open = isElementVisible(containerEl);
        setIsCartDrawerOpen(open);
      });
    };

    const attach = () => {
      containerEl = findMiniCartContainer();
      if (!containerEl) return false;

      computeAndSet();

      mo = new MutationObserver(() => computeAndSet());
      mo.observe(containerEl, {
        attributes: true,
        attributeFilter: ["style", "class", "aria-hidden", "hidden"],
      });
      ro = new ResizeObserver(() => computeAndSet());
      ro.observe(containerEl);

      containerEl.addEventListener("transitionend", computeAndSet, true);

      return true;
    };

    if (!attach()) {
      const bodyMo = new MutationObserver(() => {
        if (attach()) bodyMo.disconnect();
      });
      bodyMo.observe(document.body, { childList: true, subtree: true });

      return () => {
        bodyMo.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (mo) mo.disconnect();
      if (ro) ro.disconnect();
      if (containerEl) containerEl.removeEventListener("transitionend", computeAndSet, true);
    };
  }, []);
  useEffect(() => {
    const slider = instanceRef.current;
    if (!slider) return;

    if (!effectiveDrawerOpen) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slider.update();
        slider.moveToIdx(0, true);
      });
    });
  }, [effectiveDrawerOpen, instanceRef]);
  useEffect(() => {
    const slider = instanceRef.current;
    if (!slider) return;
    requestAnimationFrame(() => slider.update());
  }, [slides.length, instanceRef]);

  if (!widgetData || !cartData || cartData?.item_count <= 0) return null;

  return (
    <div className="cashback-cart-widget cb-mx-4 cb-mb-4 cb-mt-4">
      <div className="cb-bg-[linear-gradient(0deg,_#FFF3F4_-9.23%,_#FFD7E3_66.15%)] cb-rounded-ss-[12px] cb-rounded-se-[12px] cb-border-solid cb-border-[1px] cb-border-[#FFD2D6] cb-border-b-0">
        <div>
          <div className="cb-px-3 cb-pt-3 cb-flex cb-gap-3">
            <div>
              <WalletIcon />
            </div>

            <div>
              <p className="cb-font-primary cb-text-[16px] cb-font-medium cb-leading-none">
                Swiss Cash
              </p>

              <p className="cb-font-secondary cb-text-[10px] cb-font-medium cb-mt-3 cb-leading-none">
                {widgetData.cashbackSettings.usage.type == "percentage" &&
                  `${widgetData.cashbackSettings.usage.value}% of order total can be paid via swiss cash`}
                {widgetData.cashbackSettings.usage.type == "fixed" &&
                  `Upto ₹${widgetData.cashbackSettings.usage.value} can be paid via swiss cash`}
              </p>

              {widgetData.balance > 0 ? (
                <p className="cb-font-primary cb-font-medium cb-leading-none cb-text-[14px] cb-mt-[27px]">
                  Available Swiss Cash :{" "}
                  <span className="cb-font-primary cb-font-medium cb-leading-none cb-text-[14px] cb-text-[#FC2679]">
                    ₹{widgetData.balance}
                  </span>
                </p>
              ) : (
                <p className="cb-font-primary cb-font-medium cb-leading-none cb-text-[14px] cb-mt-[27px]">
                  Swiss cash applicable on checkout page
                </p>
              )}
            </div>
          </div>

          <div className="cb-mx-4 cb-mt-6 cb-pb-2">
            {shouldInitSlider && (
              <div
                ref={setRefs}
                className="keen-slider"
                style={{ height: 26, overflow: "hidden", touchAction: "none" }}
              >
                {slides.map((s, idx) => {
                  const isWarn = s.tone === "warn";
                  return (
                    <div className="keen-slider__slide" key={idx} style={{maxWidth: '100%!important'}}>
                      <div
                        className={[
                          "cb-rounded-[8px] cb-border-solid cb-border-[1px] cb-py-[6px] cb-flex cb-justify-center cb-items-center",
                          isWarn
                            ? "cb-bg-[#FFE1E1] cb-border-[#FF5B6F]"
                            : "cb-bg-[#EFFFF1] cb-border-[#03A71C]",
                        ].join(" ")}
                      >
                        <p
                          className={[
                            "cb-font-secondary cb-leading-none cb-text-[12px] cb-font-medium",
                            isWarn ? "cb-text-[#F00]" : "cb-text-[#08831A]",
                          ].join(" ")}
                        >
                          {s.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cb-bg-[#fff] cb-rounded-ee-[12px] cb-rounded-es-[12px] cb-py-2 cb-flex cb-justify-center cb-items-center cb-border-solid cb-border-[1px] cb-border-[#FFD2D6] cb-border-t-0 cb-relative">
        <div className="cb-block before:cb-absolute before:cb-w-4 before:cb-h-4 before:cb-rounded-full before:cb-bg-[#fff] before:cb-top-0 before:cb-left-0 before:-cb-translate-x-1/2 before:-cb-translate-y-1/2 before:cb-rotate-45 before:cb-border-solid before:cb-border-[1px] before:cb-border-[#ffd2d6] before:cb-border-b-0 before:cb-border-l-0 after:cb-absolute after:cb-w-4 after:cb-h-4 after:cb-rounded-full after:cb-bg-[#fff] after:cb-top-0 after:cb-right-0 after:cb-translate-x-1/2 after:-cb-translate-y-1/2 after:-cb-rotate-45 after:cb-border-solid after:cb-border-[1px] after:cb-border-[#ffd2d6] after:cb-border-b-0 after:cb-border-r-0"></div>

        <p className="cb-font-secondary cb-text-[12px] cb-font-bold cb-text-[#FC2679] cb-leading-none">
          Apply Swiss Cash at Checkout
        </p>
      </div>
    </div>
  );
}
