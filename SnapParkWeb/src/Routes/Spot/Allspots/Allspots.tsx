import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams

import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  getFirestore,
} from "firebase/firestore";
import Spinner from "@/Reusable/Spinner";
import Empty from "../Empty";
import Progress from "../Progress";
import SpotNav from "../SpotNav";
import AllSpotNav from "./AllSpotsNav";
import { db, auth } from "@/firebase";
import { MobileSignUp } from "../BottomSheet/BottomSheet";
import "react-spring-bottom-sheet/dist/style.css";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";
import UserSection from "./UserSection";
import { usePostHog } from "posthog-js/react";


interface OfficeData {
  company?: string;
  office?: string;
  parkingSpots?: {
    name: string;
    available: boolean;
    office: string;
    utilisation: number;
    lastToggledDate: string;
  }[];
  logoURL?: string;
  logoAlt?: string;
  messageSent?: boolean;
}

interface CacheEntry {
  data: OfficeData;
  unsubscribe?: () => void; // Make unsubscribe optional
}

const officeDataCache: { [key: string]: CacheEntry } = {};

const fetchNotifications = httpsCallable(
  functions,
  "fetchUserNotificationStatus",
);

function Allspots() {
  const params = useParams<{
    companyID: string;
    officeID: string;
    addNumber?: string;
  }>();
  const { companyID, officeID, addNumber } = params;
  const [officeData, setOfficeData] = useState<OfficeData | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [isOfficeFound, setIsOfficeFound] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [expandOnContentDrag, setExpandOnContentDrag] = useState(true);
  const [notifications, setNotifications] = useState<boolean>(false);
  const [name, setName] = useState<any>("");
  const [mobile, setMobile] = useState<any>("");
  const [update, setUpdate] = useState(false)

  const navigate = useNavigate();
  const posthog = usePostHog();

  const user = auth.currentUser;

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
      posthog?.capture("visited_allspots_page", {
        companyID: companyID,
        officeID: officeID,
      });
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

          const parkingSpot = data.parkingSpots;

          if (parkingSpot) {
          } else {
            setIsOfficeFound(false); // Spot is not found
          }
        } else {
          console.log("No such office!");
          setIsOfficeFound(false); // In case the document does not exist, ensure UI reflects this state
        }
      },
      (error) => {
        console.error("Error fetching office data:", error);
      },
    );

    // Store the unsubscribe function so you can stop listening to changes when the component unmounts or you no longer need updates
    return unsubscribe;
  };

  const handleNavigate = (spotName: string) => {
    const url = `/spot/${companyID}/${officeID}/${spotName}`;
    navigate(url);
  };

  useEffect(() => {
    if(officeData && addNumber){
      setOpenBottomSheet(true)
    }
  },[officeData])

  const data = officeData?.parkingSpots ?? [];
  const sortedData = [...data].sort((a, b) => {
    // If both are equal (both true or both false), no change in order
    if (a.available === b.available) {
      return 0;
    }
    // If 'a' is available and 'b' is not, 'a' should come first, so return negative
    else if (a.available && !b.available) {
      return -1;
    }
    // Otherwise, 'b' is available and 'a' is not, so 'b' should come first
    else {
      return 1;
    }
  });

  if (!officeData) {
    return (
      <>
        <SpotNav />
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen pb-60"
          style={{ maxWidth: "400px" }}
        >
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <BottomSheet
        // defaultSnap="100%"
        open={openBottomSheet}
        onDismiss={() => setOpenBottomSheet(false)}
        defaultSnap={({ maxHeight }) => maxHeight / 2}
        snapPoints={({ maxHeight }) => [maxHeight * 0.6]}
        expandOnContentDrag={expandOnContentDrag}

      >
        <MobileSignUp
          setOpenBottomSheet={setOpenBottomSheet}
          companyID={companyID}
          officeName={officeData?.office}
          officeID={officeID}
          setName={setName}
          setUserMobile={setMobile}
          setNotifications={setNotifications}
          update={update}
          setUpdate={setUpdate}
        />
      </BottomSheet>
      <AllSpotNav
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
        setUpdate={setUpdate}
      />
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 mb-5"
        style={{ maxWidth: "400px" }}
      >
        <div
          className="divide-y divide-none overflow-auto rounded-xl border
             bg-white shadow-lg mt-5 flex-row pb-2 "
        >
          <div className="py-4 border-b mb-3">
            <div className="w-full px-4 py-1 p-6 flex flex-row items-center justify-between ">
              <span className="text-sm font-medium">Company: </span>
              <span
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-2 
                  text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              >
                {officeData?.company}
              </span>
            </div>
            <div className="w-full px-4 py-1 p-6 flex flex-row items-center justify-between ">
              <span className="text-sm font-medium">Office: </span>
              <span
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-2 
                  text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              >
                {officeData?.office}
              </span>
            </div>
          </div>
          <div
            className=" pt-0 sm:px-6 mb-4 pb-0.5 border-b"
            style={{
              borderTop: "none",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            {/* <Progress data={officeData?.parkingSpots ?? []} /> */}
            <UserSection
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
          </div>

          {sortedData.map((spot, index) => {
            const statusClasses = spot.available
              ? "bg-green-100 fill-green-500 ring-green-100"
              : "bg-red-100 fill-red-500 ring-red-100";
            const statusText = spot.available ? "Available" : "Taken";
            return (
              <div
                key={index}
                className={`px-4 py-4 sm:p-4 mb-1.5 flex flex-row items-center justify-between ring-2 mx-3 bg-green-50 bg-opacity-25 ${statusClasses} ring-inset rounded-xl`}
                onClick={() => handleNavigate(spot.name)}
              >
                {/* <p className="text-xl font-bold">{spot.name}</p> */}
                <p className="text-xl font-bold min-w-20">{spot.name}</p>
                <div className="w-full pl-2">
                  <p className="text-sm font-light">
                    {spot?.lastToggledDate && !spot.available ? (
                      new Date(spot.lastToggledDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )
                    ) : (
                      <></>
                    )}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${statusClasses}`}
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
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Allspots;
