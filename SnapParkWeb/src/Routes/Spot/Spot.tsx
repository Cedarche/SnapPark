import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams
import SpotNav from "./SpotNav";
import AddNumber from "./AddNumberPopup";
import Progress from "./Progress";
import { db, auth } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  runTransaction,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import Spinner from "@/Reusable/Spinner";
import Empty from "./Empty";
import Popup from "./NumberInput";
import axios from "axios";
import SpotsFull from "./SpotsFullAlert";
import { usePostHog } from "posthog-js/react";
import ThreeSpotsLeftAlert from "./threeSpotsLeftAlert";
import PropagateLoader from "react-spinners/BarLoader";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { MobileSignUp } from "./BottomSheet/BottomSheet";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";
import { defaultSettings, OfficeData, officeDataCache } from "./spotTypes";

const fetchNotifications = httpsCallable(
  functions,
  "fetchUserNotificationStatus",
);

export default function Spot() {
  const params = useParams<{
    companyID: string;
    officeID: string;
    spotID: string;
  }>();
  const { companyID, officeID, spotID } = params;
  const [available, setAvailable] = useState(true);
  const [officeData, setOfficeData] = useState<OfficeData | undefined>(
    undefined,
  );
  const [isSpotFound, setIsSpotFound] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [spotsFull, setShowSpotsFull] = useState(false);
  const [threeLeft, setThreeLeft] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [notifications, setNotifications] = useState<boolean>(false);
  const [name, setName] = useState<any>("");
  const [mobile, setMobile] = useState<any>("");
  const [update, setUpdate] = useState(false);

  const [expandOnContentDrag, setExpandOnContentDrag] = useState(true);

  const user = auth.currentUser;
  const navigate = useNavigate();
  const posthog = usePostHog();

  useEffect(() => {
    if (user) {
      setIsCompany(true);
    }
  }, [user]);

  const fetchUserNotificationStatus = async () => {
    if (companyID && officeID && mobile) {
      setLoading(true);
      try {
        // Call the function and explicitly cast the result to any
        const result = (await fetchNotifications({
          companyID,
          officeID,
          mobile,
        })) as any;

        // Now you can use result.data without TypeScript errors
        if (result.data.exists && result.data.found) {
          setNotifications(result.data.notifications);
        } else {
          console.log(
            "Employee not found in notification list or no matching office found",
          );
        }
      } catch (error) {
        console.error("Error fetching user's notification status:", error);
        alert("Failed to fetch notification status. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (companyID && officeID) {
      fetchOfficeData(companyID, officeID);
    }
    const storedName = localStorage.getItem("name");
    const storedMobile = localStorage.getItem("mobile");
    const storedNotifications = localStorage.getItem("notifications");
    console.log(storedName, storedMobile, storedNotifications);
    setName(storedName);
    setMobile(storedMobile);
    setNotifications(storedNotifications === "true");

    // If a mobile number is stored, fetch the user's notification status
    if (storedMobile && companyID && officeID) {
      fetchUserNotificationStatus(); // This needs to be executed, so you should call it here
    }
  }, [companyID, officeID]);

  const fetchOfficeData = (companyID: string, officeID: string) => {
    const cacheKey = `${companyID}-${officeID}`;
    posthog?.capture("visited_spot_page", {
      companyID: companyID,
      officeID: officeID,
    });

    // Attempt to unsubscribe from any previous snapshot listener to avoid memory leaks and redundant listeners
    if (officeDataCache[cacheKey]?.unsubscribe) {
      officeDataCache[cacheKey].unsubscribe?.();
    }

    // Set up the listener
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

          // Save the fetched data and unsubscribe function in the cach
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

    // Store the unsubscribe function so you can stop listening to changes when the component unmounts or you no longer need updates
    return unsubscribe;
  };

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

  const handleToggleAvailability = () => {
    // Ensure all IDs are defined before proceeding
    setLoading(true);
    posthog?.capture("toggle_parking_spot");
    if (
      typeof companyID === "string" &&
      typeof officeID === "string" &&
      typeof spotID === "string"
    ) {
      toggleSpotAvailability(companyID, officeID, spotID)
        .then(async () => {
          // Handle the successful toggle, for instance:
          // - You might want to refetch the office data to get the updated availability
          // - Or, directly update the local state to reflect the change in availability
          setLoading(false);
          const storedMobile = localStorage.getItem("mobile");
          if (!storedMobile) {
            setTimeout(() => {
              setShow(true);
            }, 2000);
          } else {
          }

          // setAvailable((prevAvailable) => !prevAvailable); // This toggles the 'available' state
        })
        .catch((error) => {
          // Handle any errors that occur during the toggle
          console.error("Error toggling spot availability:", error);
          setLoading(false);

          // Optionally, display an error message to the user
        });
    } else {
      // Handle the case where one or more IDs are undefined
      console.error(
        "One or more required parameters (companyID, officeID, spotID) are missing.",
      );
      setLoading(false);
      // Optionally, display an error message to the user indicating the missing parameters
    }
  };

  const toggleSpotAvailability = async (
    companyID: string,
    officeID: string,
    spotID: string,
  ): Promise<void> => {
    if (companyID && officeID && spotID) {
      try {
        // Reference to the office document
        const officeRef = doc(
          db,
          `users/${companyID}/offices/${officeID}/public/${officeID}`,
        );

        const currentDate = getFormattedDate(new Date());

        const activityRef = doc(
          db,
          `users/${companyID}/offices/${officeID}/activity/${currentDate}`,
        );

        console.log(currentDate);

        // const name = user?.displayName || "unknown"; // Use 'unknown' if 'name' is not found

        // Get the current state of the office document
        const officeSnap = await getDoc(officeRef);

        if (officeSnap.exists()) {
          const data = officeSnap.data() as OfficeData; // Cast the data to the OfficeData type

          // Find the index of the parking spot that needs to be updated
          const spotIndex = data.parkingSpots?.findIndex(
            (spot) => spot.name === spotID,
          );

          if (spotIndex !== undefined && spotIndex >= 0) {
            const updatedSpots = [...data.parkingSpots!]; // Copy the parkingSpots array
            const spot = updatedSpots[spotIndex];

            if (spot) {
              // console.log("Spot Data: ", spot);

              // Prepare to toggle the availability
              const newAvailability = !spot.available;
              const todayFormatted = new Date().toISOString();

              // Check if spot is becoming unavailable and if it's a new day

              if (
                newAvailability === false &&
                spot.lastToggledDate.split("T")[0] !==
                  todayFormatted.split("T")[0] &&
                spot.totalUsedDays === 0
              ) {
                // console.log("Test 1: ", spot.totalUsedDays);
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
                    (1000 * 3600 * 24),
                );

                const utilisation =
                  (spot.totalUsedDays /
                    (daysSinceCreation > 1 ? daysSinceCreation : 1)) *
                  100;
                // const utilisation =
                //   ((daysSinceCreation > 1 ? daysSinceCreation : 1) /
                //     spot.totalUsedDays) *
                //   100;
                // console.log("New Utilisation", utilisation);
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
              name: name || mobile || "Unkown",
              timestamp: new Date(), // Current timestamp
              available: updatedSpots[spotIndex].available, // New availability status
            };

            // Update the document with the modified parkingSpots array and append the activity message
            await updateDoc(officeRef, {
              parkingSpots: updatedSpots,
              // activity: arrayUnion(activityMessage), // Append the activity message
            }).then(async () => {
              const availableSpotsCount = updatedSpots.filter(
                (spot) => spot.available,
              ).length;

              const notificationSettings =
                officeData?.notificationSettings ?? defaultSettings;

              const customSpotsArray =
                data.notificationSettings.customSpotsArray; // Ensure this path is correct

              if (customSpotsArray.length > 0) {
                const customSpotsTaken = customSpotsArray.every(
                  (customSpotName) => {
                    const spot = updatedSpots.find(
                      (s) => s.name === customSpotName,
                    );
                    return spot && !spot.available; // Ensure the spot exists and is not available
                  },
                );

                // If all custom spots are taken, send the custom spots notification
                if (
                  customSpotsTaken &&
                  !officeData?.customMessageSent &&
                  notificationSettings?.customSpotsNotification
                ) {
                  console.log(
                    "Sending custom spots notification!",
                    customSpotsArray,
                  );

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

              // Check if all spots are unavailable, messageSent is false, and fullNotification setting is true
              if (
                allUnavailable &&
                !officeData?.messageSent &&
                notificationSettings?.fullNotification
              ) {
                setShowSpotsFull(true);
                sendNotification(companyID, officeID, "officeFull");

                // sendNotification(companyID, officeID); // Assuming sendNotification is defined elsewhere
                console.log("Sending full parking notification!");

                // Update the messageSent field in the office document to true

                setTimeout(() => {
                  setShowSpotsFull(false);
                }, 4000);
              }

              // Check if there are exactly X spots remaining, threeSpotsMessageSent is not true, and threeSpotsNotification setting is true
              if (
                availableSpotsCount ===
                  notificationSettings?.spotsRemainingValue &&
                !officeData?.threeSpotsMessageSent &&
                notificationSettings?.threeSpotsNotification
              ) {
                console.log("Sending X spots remaining notification!");
                setThreeLeft(true);
                // await
                // sendThreeSpotsNotification(companyID, officeID);
                sendNotification(companyID, officeID, "threeSpaces");

                setTimeout(() => {
                  setThreeLeft(false);
                }, 4000);
              }
            });

            try {
              const docSnap = await getDoc(activityRef);
              if (docSnap.exists()) {
                console.log("Exists");
                // If the document exists, update it
                await updateDoc(activityRef, {
                  activity: arrayUnion(activityMessage),
                });
                console.log("Successfully added Activity");
              } else {
                console.log("Doesnt Exist... adding activity");

                // If the document doesn't exist, create it with the activity array
                await setDoc(activityRef, {
                  activity: [activityMessage],
                });

                console.log("Success!");
              }
            } catch (error) {
              console.error("Error adding activity:", error);
            }

            // console.log(`Successfully toggled availability of spot ${spotID}`);
          } else {
            console.error("Spot not found in the parkingSpots array.");
          }
        } else {
          console.error("No such office document!");
        }
      } catch (error) {
        console.error("Error toggling spot availability:", error);
      }
    }
  };

  const handleNavigate = () => {
    const url = `/all/${companyID}/${officeID}`;
    navigate(url);
  };

  const statusClasses = available
    ? "bg-green-100 fill-green-500 ring-green-200"
    : "bg-red-100 fill-red-500 ring-red-200";
  const statusText = available ? "Available" : "Taken";

  if (!isSpotFound) {
    return (
      <>
        <SpotNav />
        <Empty />
      </>
    );
  }

  return (
    <>
      {officeData ? (
        <>
          <BottomSheet
            open={openBottomSheet}
            onDismiss={() => setOpenBottomSheet(false)}
            defaultSnap={({ maxHeight }) => maxHeight / 2}
            snapPoints={({ maxHeight }) => [maxHeight * 0.5]}
            expandOnContentDrag={expandOnContentDrag}
          >
            <MobileSignUp
              setOpenBottomSheet={setOpenBottomSheet}
              companyID={companyID}
              officeName={officeData?.office}
              officeID={officeID}
              update={update}
              setUpdate={setUpdate}
            />
          </BottomSheet>
          <AddNumber
            show={show}
            setShow={setShow}
            open={openBottomSheet}
            setOpen={setOpenBottomSheet}
          />

          <SpotsFull show={spotsFull} setShow={setShowSpotsFull} />
          <ThreeSpotsLeftAlert
            show={threeLeft}
            setShow={setThreeLeft}
            notificationSettings={
              officeData?.notificationSettings ?? defaultSettings
            }
          />

          <SpotNav
            companyID={companyID}
            officeID={officeID}
            setOpenBottomSheet={setOpenBottomSheet}
            isCompany={isCompany}
            notifications={notifications}
            setNotifications={setNotifications}
            name={name}
            setName={setName}
            mobile={mobile}
            setMobile={setMobile}
          />
          <div
            className="container mx-auto px-4 sm:px-6 lg:px-8 "
            style={{ maxWidth: "400px" }}
          >
            <div
              className="divide-y divide-none overflow-hidden rounded-xl border
             bg-white shadow-xl mt-5 flex-row"
            >
              <div className="py-4 pt-3 bg-white ">
                <div className="w-full px-4 py-1 p-6 flex flex-row items-center justify-between ">
                  <span className="text-sm font-medium">Company: </span>
                  <span
                    className="inline-flex items-center rounded-md bg-gray-50 px-2 py-2 
                  text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                    onClick={handleNavigate}
                  >
                    {officeData?.company}
                  </span>
                </div>
                <div className="w-full px-4 py-1 p-6 flex flex-row items-center justify-between ">
                  <span className="text-sm font-medium">Office: </span>
                  <span
                    className="inline-flex items-center rounded-md bg-gray-50 px-2 py-2 
                  text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                    onClick={handleNavigate}
                  >
                    {officeData?.office}
                  </span>
                </div>
              </div>

              <div
                className={`mt-0 px-4 py-5 sm:p-6  flex flex-row justify-between ring-2 mx-3
                 bg-green-100 bg-opacity-25 ${statusClasses} ring-inset rounded-xl `}
              >
                <p className="text-2xl font-bold">{spotID}</p>
                <span
                  className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm 
                  font-medium ${statusClasses}`}
                >
                  <svg
                    className="h-1.5 w-1.5"
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                  >
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                  {statusText}
                </span>
              </div>
              <div
                className="px-4 py-6 sm:px-6"
                style={{
                  borderTop: "none",
                  borderBottom: "1px solid lightgrey",
                }}
              >
                <Progress data={officeData?.parkingSpots ?? []} />
              </div>
              <div
                className="px-4 py-4 sm:p-6 flex flex-row justify-center items-center
               bg-gray-100 ring-gray-900/5 ring-inset"
              >
                <button
                  type="button"
                  onClick={handleToggleAvailability}
                  className="rounded-xl w-full bg-blue-600 px-6 py-3 text-center text-md font-semibold
                   text-white shadow-md hover:bg-indigo-500 focus-visible:outline 
                   focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-indigo-600"
                >
                  {loading ? (
                    <div className="w-full flex justify-center min-h-full">
                      {/* <Spinner /> */}
                      <PropagateLoader
                        color="#fff"
                        loading={loading}
                        // size={24}
                        cssOverride={{ margin: 9, borderRadius: 4 }}
                        height={6}
                        width={100}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </div>
                  ) : available ? (
                    "Mark as taken"
                  ) : (
                    "Vacate parking spot"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-center h-screen pb-40">
          <Spinner />
        </div>
      )}
    </>
  );
}

function getFormattedDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
