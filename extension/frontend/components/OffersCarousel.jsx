import { LandingContext } from "./Dashboard.jsx";
import { useContext, useEffect, useRef } from "react";
import Offer from "./Offer.jsx";
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react' 


const OffersCarousel = () => {
  const { offers = [] } = useContext(LandingContext);
  const [sliderRef, instanceRef] = useKeenSlider(
    {
        slides:{
            perView: 1.45,
            spacing: 12
        },
        breakpoints: {
          '(min-width: 768px)':{
            slides:{
              perView: 2,
              spacing: 16
            }
          }
        }
    },
    [
    ]
  )

  if (offers?.length == 0) {
    return <></>;
  }
  return (
    <>
      <div className="offer-carousel-wrapper cb-mt-[17px] cb-px-4 ">
        <div ref={sliderRef} className="offer-carousel-content keen-slider cb-flex cb-flex-nowrap cb-overflow-auto cb-w-full">
          {offers.map((el) => (
            <Offer offer={el} key={el._id} />
          ))}
        </div>
      </div>
    </>
  );
};
export default OffersCarousel;
