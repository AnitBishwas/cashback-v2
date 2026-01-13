import { useEffect, useState } from "react"
import { getCartData, getWidgetData } from "../helpers/widget.js"
import { WalletIcon } from "./Icons.jsx"

export default function () {
  const [widgetData, setWidgetData] = useState(null);
  const [cartData, setCartData] = useState(null);


  useEffect(() => {
    (async () => {
      const [widgetData, cartData] = await Promise.all([
        getWidgetData(),
        getCartData()
      ]);
      setWidgetData(widgetData);
      setCartData(cartData);
    })()
  }, []);
  if (!widgetData || !cartData) {
    return <></>
  }
  return (
    <div className="cashback-cart-widget cb-mx-4 cb-mb-4">
      <div className="cb-bg-[linear-gradient(0deg,_#FFF3F4_-9.23%,_#FFD7E3_66.15%)] cb-rounded-ss-[12px] cb-rounded-se-[12px] cb-border-solid cb-border-[1px] cb-border-[#FFD2D6] cb-border-b-0">
        <div>
          <div className="cb-px-3 cb-pt-3 cb-flex cb-gap-3">
            <div>
              <WalletIcon />
            </div>
            <div>
              <p className="cb-font-primary cb-text-[16px] cb-font-medium cb-leading-none">Swiss Cash</p>
              <p className="cb-font-secondary cb-text-[10px] cb-font-medium cb-mt-3 cb-leading-none">
                {
                  widgetData.cashbackSettings.usage.type == 'percentage' && `${widgetData.cashbackSettings.usage.value}%  of order total can be paid via swiss cash`
                }
                {
                  widgetData.cashbackSettings.usage.type == 'fixed' && `Upto ₹${widgetData.cashbackSettings.usage.value} can be paid via swiss cash`
                }
              </p>
              <p className="cb-font-primary cb-font-medium cb-leading-none cb-text-[14px] cb-mt-[27px]">Available Swiss Cash : <span className="cb-font-primary cb-font-medium cb-leading-none cb-text-[14px] cb-text-[#FC2679]">₹{widgetData.balance}</span></p>
            </div>
          </div>
          <div className="cb-mx-4 cb-mt-6 cb-pb-2">
            <div className="cb-bg-[#EFFFF1] cb-rounded-[8px] cb-border-solid cb-border-[#03A71C] cb-border-[1px] cb-py-[6px] cb-flex cb-justify-center cb-items-center">
              <p className="cb-font-secondary cb-leading-none cb-text-[12px] cb-font-medium cb-text-[#08831A]">
                {
                  widgetData.cashbackSettings.order_allocation.type == 'percentage' && `You will get ₹${Math.round((cartData.items_subtotal_price * widgetData.cashbackSettings.order_allocation.value) / 10000)} cashback after delivery`
                }
                {
                  widgetData.cashbackSettings.order_allocation.type == 'fixed' && `You will get ₹${Math.round(widgetData.cashbackSettings.order_allocation.value)} cashback after delivery`
                }
              </p>
            </div>
            {
              widgetData.expiringCredits?.length > 0 && <div className="cb-bg-[#FFE1E1] cb-rounded-[8px] cb-border-solid cb-border-[#FF5B6F] cb-border-[1px] cb-py-[6px] cb-flex cb-justify-center cb-items-center">
                <p className="cb-font-secondary cb-leading-none cb-text-[12px] cb-font-medium cb-text-[#F00]">
                  Your cashback worth ₹{widgetData.expiringCredits[0].amount} will expire in
                </p>
              </div>
            }
          </div>
        </div>
      </div>
      <div className="cb-bg-[#fff] cb-rounded-ee-[12px] cb-rounded-es-[12px] cb-py-2 cb-flex cb-justify-center cb-items-center cb-border-solid cb-border-[1px] cb-border-[#FFD2D6] cb-border-t-0 cb-relative">
        <div className="cb-block before:cb-absolute before:cb-w-4 before:cb-h-4 before:cb-rounded-full before:cb-bg-[#fff] before:cb-top-0 before:cb-left-0 before:-cb-translate-x-1/2 before:-cb-translate-y-1/2 before:cb-rotate-45 before:cb-border-solid before:cb-border-[1px] before:cb-border-[#ffd2d6] before:cb-border-b-0 before:cb-border-l-0      after:cb-absolute after:cb-w-4 after:cb-h-4 after:cb-rounded-full after:cb-bg-[#fff] after:cb-top-0 after:cb-right-0 after:cb-translate-x-1/2 after:-cb-translate-y-1/2 after:-cb-rotate-45 after:cb-border-solid after:cb-border-[1px] after:cb-border-[#ffd2d6] after:cb-border-b-0 after:cb-border-r-0"></div>
        <p className="cb-font-secondary cb-text-[12px] cb-font-bold cb-text-[#FC2679] cb-leading-none">Apply Swiss Cash at Checkout</p>
      </div>
    </div>
  )
}