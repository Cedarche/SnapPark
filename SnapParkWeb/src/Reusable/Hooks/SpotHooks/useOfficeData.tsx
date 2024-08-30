import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { OfficeData, officeDataCache } from "@/Reusable/Types/spotTypes";
import { usePostHog } from "posthog-js/react";

export const useOfficeData = (
  companyID: string,
  officeID: string | undefined,
  spotID: string,
) => {
  const [officeData, setOfficeData] = useState<OfficeData | undefined>(
    undefined,
  );
  const [isSpotFound, setIsSpotFound] = useState(true);
  const [available, setAvailable] = useState(true);

  const posthog = usePostHog();

  useEffect(() => {
    if (companyID && officeID) {
      const cacheKey = `${companyID}-${officeID}`;

      if (officeDataCache[cacheKey]?.unsubscribe) {
        officeDataCache[cacheKey].unsubscribe?.();
      }

      const officeRef = doc(
        db,
        `users/${companyID}/offices/${officeID}/public/${officeID}`,
      );

      const unsubscribe = onSnapshot(
        officeRef,
        async (doc) => {
          if (doc.exists()) {
            const data = doc.data() as OfficeData; // Cast the data to the OfficeData type
            setOfficeData(data);

            // Save the fetched data and unsubscribe function in the cache
            officeDataCache[cacheKey] = { data, unsubscribe };

            const parkingSpot = data.parkingSpots?.find(
              (spot) => spot.name === spotID,
            );
            if (parkingSpot) {
              setAvailable(parkingSpot.available);
              setIsSpotFound(true); // Spot is found
            } else {
              setIsSpotFound(false); // Spot is not found
            }
          } else {
            console.log("No such office!");
            setIsSpotFound(false); // In case the document does not exist, ensure UI reflects this state
          }
        },
        (error) => {
          console.error("Error fetching office data:", error);
        },
      );

      return unsubscribe;
    }
  }, [companyID, officeID, posthog]);

  return { officeData, isSpotFound, available };
};
