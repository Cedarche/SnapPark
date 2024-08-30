import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { OfficeData } from "@/Reusable/Types/spotTypes";
import { usePostHog } from "posthog-js/react";
import axios from "axios";

export const useToggleSpotAvailability = (
  companyID: string,
  officeID: string,
  spotID: string,
  officeData: OfficeData | undefined,
) => {
  const [loading, setLoading] = useState(false);
  const posthog = usePostHog();

  const toggleSpotAvailability = async () => {
    if (companyID && officeID && spotID) {
      setLoading(true);
      try {
        const officeRef = doc(
          db,
          `users/${companyID}/offices/${officeID}/public/${officeID}`,
        );
        const currentDate = new Date().toISOString();
        const officeSnap = await getDoc(officeRef);

        if (officeSnap.exists()) {
          const data = officeSnap.data() as OfficeData;
          const spotIndex = data.parkingSpots?.findIndex(
            (spot) => spot.name === spotID,
          );

          if (spotIndex !== undefined && spotIndex >= 0) {
            const updatedSpots = [...data.parkingSpots!];
            const spot = updatedSpots[spotIndex];

            if (spot) {
              const newAvailability = !spot.available;
              updatedSpots[spotIndex] = {
                ...spot,
                available: newAvailability,
                lastToggledDate: currentDate,
              };

              await updateDoc(officeRef, {
                parkingSpots: updatedSpots,
              });

              const activityMessage = {
                spot: spotID,
                name: spot.name || "Unknown",
                timestamp: new Date(),
                available: newAvailability,
              };

              const activityRef = doc(
                db,
                `users/${companyID}/offices/${officeID}/activity/${currentDate}`,
              );

              const activitySnap = await getDoc(activityRef);

              if (activitySnap.exists()) {
                await updateDoc(activityRef, {
                  activity: arrayUnion(activityMessage),
                });
              } else {
                await setDoc(activityRef, {
                  activity: [activityMessage],
                });
              }

              posthog?.capture("toggle_parking_spot", {
                spotID,
                available: newAvailability,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error toggling spot availability:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return { toggleSpotAvailability, loading };
};
