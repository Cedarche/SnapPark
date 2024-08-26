import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { OfficeData } from "Hooks/Types";
import { firebase } from "@react-native-firebase/functions";
import Toast from "react-native-toast-message";


export const handleToggleSpot = async (officeData, spotData) => {
  const companyID = officeData.companyID;
  const officeID = officeData.officeID;
  const spotID = spotData.name;
  const user = auth().currentUser;
  //   const expoPushToken = useRecoilValue(pushNotificationToken)

  if (officeData.companyID && officeData.officeID && spotData.name) {
    try {
      // Reference to the office document
      const officeRef = firestore().doc(
        `users/${companyID}/offices/${officeID}/public/${officeID}`
      );

      const currentDate = getFormattedDate(new Date());


      const activityRef = firestore().doc(
        `users/${companyID}/offices/${officeID}/activity/${currentDate}`
      );
      // Get the current state of the office document
      const officeSnap = await officeRef.get();

      if (officeSnap.exists) {
        const data = officeSnap.data() as OfficeData; // Cast the data to the OfficeData type

        // Find the index of the parking spot that needs to be updated
        const spotIndex = data.parkingSpots?.findIndex(
          (spot) => spot.name === spotID
        );

        if (spotIndex !== undefined && spotIndex >= 0) {
          const updatedSpots = [...data.parkingSpots!]; // Copy the parkingSpots array
          const spot = updatedSpots[spotIndex];

          if (spot) {
            // Prepare to toggle the availability
            const newAvailability = !spot.available;
            const todayFormatted = new Date().toISOString();
            console.log(
              "Last toggled date: ",
              spot.lastToggledDate.split("T")[0]
            );
            console.log("Today formatted: ", todayFormatted.split("T")[0]);

            if (
              newAvailability === false &&
              spot.lastToggledDate.split("T")[0] !==
                todayFormatted.split("T")[0] &&
              spot.totalUsedDays === 0
            ) {
              console.log("Test 1: ", spot.totalUsedDays);
              spot.utilisation = 100;
            }

            if (
              newAvailability === false &&
              spot.lastToggledDate.split("T")[0] !==
                todayFormatted.split("T")[0]
            ) {
              // Update totalUsedDays only if it's a different day and spot is becoming unavailable
              spot.totalUsedDays += 1;

              const daysSinceCreation = Math.floor(
                (new Date().getTime() - new Date(spot.createdAt).getTime()) /
                  (1000 * 3600 * 24)
              );

              const utilisation =
                (spot.totalUsedDays /
                  (daysSinceCreation > 1 ? daysSinceCreation : 1)) *
                100;

              spot.utilisation = utilisation;


              spot.lastToggledDate = todayFormatted; // Update the last toggled date
            }

            // Update the spot's available status and lastToggledDate
            updatedSpots[spotIndex] = {
              ...spot,
              available: newAvailability,
              lastToggledDate: todayFormatted, // Ensure this is always updated to today's date
              totalUsedDays: spot.totalUsedDays, // Make sure to update this in the array
              utilisation: Number(spot.utilisation.toFixed(2)), // Ensure utilisation is updated in the array
            };
          }

          // Create the activity message object
          const activityMessage = {
            spot: spotID,
            name: user.displayName || user.uid || "Unkown",
            timestamp: new Date(), // Current timestamp
            available: updatedSpots[spotIndex].available, // New availability status
          };

          // Update the document with the modified parkingSpots array and append the activity message
          await officeRef
            .update({
              parkingSpots: updatedSpots, // Directly set the entire updated array
              // activity: firestore.FieldValue.arrayUnion(activityMessage), // Append the activity message
            })
            .then(async () => {
              const availableSpotsCount = updatedSpots.filter(
                (spot) => spot.available
              ).length;

              const notificationSettings = officeData?.notificationSettings;

              const allUnavailable = updatedSpots.every(
                (spot) => !spot.available
              );
              const customSpotsArray =
                data.notificationSettings.customSpotsArray;

              //   ==============================================================================================
              // Handle all parking spots full
              if (
                allUnavailable &&
                !officeData?.messageSent &&
                notificationSettings?.fullNotification
              ) {
                Toast.show({
                  type: "notification",
                  text1: "All parking spots full",
                  text2: "Sending out a notification",
                  position: "bottom",
                  autoHide: true,
                  swipeable: true,

                  //   onPress: () => Toast.hide()
                });
                const contents = {
                  title: "All parking spots full",
                  body: "Your office carpark is now full.",
                };
                // await sendPushNotification('ExponentPushToken[wmnA4wKn_iZXMkmUniyhBd]', contents)
                sendNotification(companyID, officeID, "officeFull");

                // sendNotification(companyID, officeID); // Assuming sendNotification is defined elsewhere
              }

              //   ==============================================================================================
              //   Handling custom spots array notification
              if (customSpotsArray.length > 0) {
                const customSpotsTaken = customSpotsArray.every(
                  (customSpotName) => {
                    const spot = updatedSpots.find(
                      (s) => s.name === customSpotName
                    );
                    return spot && !spot.available; // Ensure the spot exists and is not available
                  }
                );

                // If all custom spots are taken, send the custom spots notification
                if (
                  customSpotsTaken &&
                  !officeData?.customMessageSent &&
                  !officeData?.messageSent
                ) {
                  console.log(
                    "Sending custom spots notification!",
                    customSpotsArray
                  );
                  sendNotification(
                    companyID,
                    officeID,
                    "custom",
                    customSpotsArray
                  );
                  Toast.show({
                    type: "notification",
                    text1: "Custom spots list is full",
                    text2: "Sending out a notification",
                    position: "bottom",
                  });
                }
              }
              //   ==============================================================================================
              //   Handling x spots left notification
              console.log(notificationSettings?.spotsRemainingValue);
              if (
                availableSpotsCount ===
                  notificationSettings?.spotsRemainingValue &&
                !officeData?.threeSpotsMessageSent &&
                notificationSettings?.threeSpotsNotification
              ) {
                console.log("Sending X spots remaining notification!");
                sendNotification(companyID, officeID, "threeSpaces");

                Toast.show({
                  type: "notification",
                  text1: `${notificationSettings?.spotsRemainingValue} ${
                    notificationSettings?.spotsRemainingValue === 1
                      ? "spot"
                      : "spots"
                  } remaining`,
                  text2: "Sending out a notification",
                  position: "bottom",
                });
              }
            })
            .catch((error) => {
              console.error("Error updating parking spot:", error);
            });

          await activityRef
            .set(
              {
                activity: firestore.FieldValue.arrayUnion(activityMessage),
              },
              { merge: true }
            )
            .then(() => {
              console.log("Successfully added activity message");
            })
            .catch((error) => {
              console.error("Error toggling spot availability:", error);
            });
          // console.log(`Successfully toggled availability of spot ${spotID}`);
        } else {
          console.error("Spot not found in the parkingSpots array.");
          Toast.show({
            type: "error",
            text1: "Something went wrong...",
            text2: "Spot not found in the parking spots list",
          });
        }
      } else {
        console.error("No such office document!");
      }
    } catch (error) {
      console.error("Error toggling spot availability:", error);
    }
  }
};

// async function sendPushNotification(expoPushToken, contents) {
//     const message = {
//       to: expoPushToken,
//       sound: 'default',
//       title: contents.title,
//       body: contents.body,
//       data: { someData: 'goes here' },
//     };

//     await fetch('https://exp.host/--/api/v2/push/send', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Accept-encoding': 'gzip, deflate',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(message),
//     });
//   }
function getFormattedDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

const sendNotification = async (
  companyID: string,
  officeID: string,
  notificationType: string,
  customSpotsArray?: any // This parameter is optional and only needed for custom notifications
) => {
  try {
    const payload = {
      userID: companyID,
      officeID: officeID,
      notificationType: notificationType,
      ...(notificationType === "custom" && { customSpotsArray }), // Conditionally add customSpotsArray if needed
    };

    console.log("Sending payload:", payload);

    const handleAppNotifications = firebase
      .app()
      .functions("europe-west1")
      .httpsCallable("handleAppNotifications");

    const response = await handleAppNotifications(payload);

    console.log(
      `Notification sent for type: ${notificationType}`,
      response.data
    );
  } catch (error) {
    console.error(`Error sending ${notificationType} notification:`, error);
  }
};
