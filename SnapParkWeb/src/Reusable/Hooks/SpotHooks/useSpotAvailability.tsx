import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import axios from "axios";

import { OfficeData, defaultSettings } from "@/Reusable/Types/spotTypes";

import { usePostHog } from "posthog-js/react";

export const useSpotAvailability = (
  companyID: string,
  officeID: string,
  spotID: string,
  officeData: OfficeData | undefined,
  name: string | null,
  mobile: string | null,
  setShow: (value: boolean) => void,
  setShowSpotsFull: (value: boolean) => void,
  setThreeLeft: (value: boolean) => void,
) => {
  const [loading, setLoading] = useState(false);
  const posthog = usePostHog();

  const sendNotification = async (
    companyID: string,
    officeID: string,
    notificationType: string,
    customSpotsArray?: any, // This parameter is optional and only needed for custom notifications
  ) => {
    try {
      const payload = {
        userID: companyID,
        officeID: officeID,
        notificationType: notificationType,
        ...(notificationType === "custom" && { customSpotsArray }), // Conditionally add customSpotsArray if needed
      };
      console.log("Notification Payload: ", payload);
      const response = await axios.post(
        import.meta.env.VITE_NOTIFICATION_URL,
        payload,
      );

      console.log(
        `Notification sent for type: ${notificationType}`,
        response.data,
      );
      posthog?.capture("notification_sent", {
        type: notificationType,
        companyID: companyID,
        officeID: officeID,
      });
    } catch (error) {
      console.error(`Error sending ${notificationType} notification:`, error);
    }
  };

  const toggleSpotAvailability = async (): Promise<void> => {
    if (companyID && officeID && spotID) {
      try {
        setLoading(true);

        const officeRef = doc(
          db,
          `users/${companyID}/offices/${officeID}/public/${officeID}`,
        );

        const currentDate = getFormattedDate(new Date());
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

              if (
                newAvailability === false &&
                spot.lastToggledDate.split("T")[0] !== currentDate.split("T")[0]
              ) {
                spot.totalUsedDays += 1;
                const daysSinceCreation = Math.floor(
                  (new Date().getTime() - new Date(spot.createdAt).getTime()) /
                    (1000 * 3600 * 24),
                );
                spot.utilisation =
                  (spot.totalUsedDays /
                    (daysSinceCreation > 1 ? daysSinceCreation : 1)) *
                  100;
                spot.lastToggledDate = currentDate;
              }

              updatedSpots[spotIndex] = {
                ...spot,
                available: newAvailability,
                lastToggledDate: currentDate,
                totalUsedDays: spot.totalUsedDays,
                utilisation: Number(spot.utilisation.toFixed(2)),
              };

              const activityMessage = {
                spot: spotID,
                name: name || mobile || "Unknown",
                timestamp: new Date(),
                available: newAvailability,
              };

              await updateDoc(officeRef, {
                parkingSpots: updatedSpots,
              }).then(async () => {
                const availableSpotsCount = updatedSpots.filter(
                  (spot) => spot.available,
                ).length;

                console.log(
                  "OfficeData.notificationSettings: ",
                  officeData?.notificationSettings,
                );
                console.log(
                  "data.notificationSettings: ",
                  data.notificationSettings,
                );

                const notificationSettings =
                  officeData?.notificationSettings ?? defaultSettings;

                const customSpotsArray = notificationSettings.customSpotsArray;

                if (customSpotsArray.length > 0) {
                  const customSpotsTaken = customSpotsArray.every(
                    (customSpotName: string) => {
                      const spot = updatedSpots.find(
                        (s) => s.name === customSpotName,
                      );
                      return spot && !spot.available;
                    },
                  );

                  if (
                    customSpotsTaken &&
                    !officeData?.customMessageSent &&
                    notificationSettings?.customSpotsNotification
                  ) {
                    sendNotification(
                      companyID,
                      officeID,
                      "custom",
                      customSpotsArray,
                    );
                  }
                }

                const allUnavailable = updatedSpots.every(
                  (spot) => !spot.available,
                );

                if (
                  allUnavailable &&
                  !officeData?.messageSent &&
                  notificationSettings?.fullNotification
                ) {
                  setShowSpotsFull(true);
                  sendNotification(companyID, officeID, "officeFull");

                  setTimeout(() => {
                    setShowSpotsFull(false);
                  }, 4000);
                }

                if (
                  availableSpotsCount ===
                    notificationSettings?.spotsRemainingValue &&
                  !officeData?.threeSpotsMessageSent &&
                  notificationSettings?.threeSpotsNotification
                ) {
                  setThreeLeft(true);
                  sendNotification(companyID, officeID, "threeSpaces");

                  setTimeout(() => {
                    setThreeLeft(false);
                  }, 4000);
                }
              });

              const activityRef = doc(
                db,
                `users/${companyID}/offices/${officeID}/activity/${currentDate}`,
              );
              const docSnap = await getDoc(activityRef);

              if (docSnap.exists()) {
                await updateDoc(activityRef, {
                  activity: arrayUnion(activityMessage),
                });
              } else {
                await setDoc(activityRef, {
                  activity: [activityMessage],
                });
              }

              setLoading(false);
            }
          } else {
            console.error("Spot not found in the parkingSpots array.");
            setLoading(false);
          }
        } else {
          console.error("No such office document!");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error toggling spot availability:", error);
        setLoading(false);
      }
    }
  };

  const handleToggleAvailability = () => {
    posthog?.capture("toggle_parking_spot");
    console.log("Toggling spot");
    if (
      typeof companyID === "string" &&
      typeof officeID === "string" &&
      typeof spotID === "string"
    ) {
      toggleSpotAvailability()
        .then(() => {
          const storedMobile = localStorage.getItem("mobile");
          if (!storedMobile) {
            setTimeout(() => {
              setShow(true);
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Error toggling spot availability:", error);
        });
    } else {
      console.error(
        "One or more required parameters (companyID, officeID, spotID) are missing.",
      );
    }
  };

  return { handleToggleAvailability, loading };
};

function getFormattedDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
