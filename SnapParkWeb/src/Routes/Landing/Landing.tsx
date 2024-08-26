import React from "react";
import Navbar from "./Navbar";
import Hero from "./Components/Hero";
import NotificationSection from "./Components/NotificationDisplay";
import DashSection from "./Components/DashSection";
import StickerSection from "./Components/StickerSection";
import Pricing from "./Pricing/Pricing";
import AppPricing from "./Pricing/AppPricing";
import OutrightPricing from "./Pricing/OutrightPricing";
import Footer from "./Components/Footer"; 
import SMSPricing from "./Pricing/SMSPricing";
import JoinAppNotifications from "./Components/JoinAppNotifications";
import FAQ from "./Components/FAQ";

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <NotificationSection />
      <StickerSection/>
      <DashSection/>
      {/* <Pricing/> */}
      <SMSPricing/>
      <AppPricing/>
      <JoinAppNotifications/>
      <FAQ/>
      {/* <OutrightPricing/> */}
      <Footer/>
    </>
  );
}
