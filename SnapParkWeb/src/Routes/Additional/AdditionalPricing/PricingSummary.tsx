import Navbar from "../../Landing/Navbar";
import Footer from "../../Landing/Components/Footer";

import SMSPricing from "../../Landing/Pricing/SMSPricing";
import AppPricing from "../../Landing/Pricing/AppPricing";
import JoinAppNotifications from "../../Landing/Components/JoinAppNotifications";

export default function PricingSummary() {
  return (
    <>
      <Navbar />
      <SMSPricing />
      <AppPricing />
      <JoinAppNotifications />
      <Footer />
    </>
  );
}
