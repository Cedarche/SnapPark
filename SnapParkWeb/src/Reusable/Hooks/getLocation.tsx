import { useEffect } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import { ipLocationState } from "../RecoilState";

import { usePostHog } from "posthog-js/react";

const useLocation = () => {
  const [ipLocation, setIPLocation] = useRecoilState(ipLocationState);
  const posthog = usePostHog();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get("https://ipinfo.io/json", {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_IPINFO_KEY}`, // Replace with your API key if required
          },
        });
        const locationData = response.data;
        // console.log(locationData);


        let currency = "USD";
        switch (locationData.country) {
          case "US":
            currency = "USD";
            break;
          case "AU":
            currency = "AUD";
            break;
          case "GB":
            currency = "GBP";
            break;
          case "EU":
            currency = "EUR";
            break;
          // Add more cases as needed
          default:
            currency = "GBP";
        }

        setIPLocation({
          country: locationData.country,
          currency: currency,
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchLocation();
  }, [setIPLocation]);
};

export default useLocation;
