import { useState } from "react";

import WebSteps from "./MobileSteps/WebSteps";
import MobileSteps2 from "./MobileSteps/MobileSteps2";
// import QRStickerStep from "./Redundant/QRStickerStep";
// import PaymentPlans from "./Redundant/PaymentPlan";
// import Review from "./Redundant/Review";
import "./Register.css";



export default function CompleteAuth() {
  return (
    <>
      <div className=" max-w-screen-2xl px-0 -mt-4 flex-col lg:px-1 flex justify-center items-center -mx-4 md:mx-auto">
        <div
          className="flex flex-col p-1 pt-1  md:flex-row overflow-hidden mx-auto h-full 
           lg:pt-5 rounded-lg justify-start lg:justify-center w-full md:w-4/5 lg:w-4/5 xl:w-4/5 2xl:w-3/5"
        >
          <span className=" w-full mb-1 text-lg text-blue-950 font-extrabold ">
            Complete your account
          </span>
        </div>
        <div
          className="flex flex-col p-2  bg-white md:flex-row overflow-hidden mx-auto h-full 
          md:border lg:p-10 rounded-lg justify-start lg:justify-center md:shadow-lg w-full md:w-4/5 lg:w-4/5 xl:w-4/5 2xl:w-3/5 "
         
        >
          <div className="block lg:hidden w-full">
            <MobileSteps2 />
          </div>
          <div className="hidden lg:block w-full">
            <WebSteps />
          </div>
        </div>
      </div>
    </>
  );
}
