import { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { userState, officeState } from "./RecoilState";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/functions";
import { sharedStorage } from "./useStorage";
import { UserStateTypes, OfficeData } from "./Types";

const useFetchUserDetails = (onDataLoaded, setOfficeDataLoaded) => {
  const [userDetails, setUserDetails] = useRecoilState(userState);
  const [officeData, setOfficeData] = useRecoilState(officeState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [didntFindUserInOffice, setDidntFindUserInOffice] = useState(false);
  const unsubscribes = useRef([]); // Use ref instead of state for unsubscribes

  const user = auth().currentUser;

  const fetchNotifications = async (
    companyID,
    officeID,
    mobile,
    employeeUID
  ) => {
    const fetchNotifications = firebase
      .app()
      .functions("europe-west1")
      .httpsCallable("fetchUserNotificationStatus");
    return fetchNotifications({ companyID, officeID, mobile, employeeUID });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setUserDetails(null);
      setError("No user ID provided");
      
      console.log("No user");
      onDataLoaded(); // Call this if there's no user to fetch data for
      return;
    }

    const unsubscribeUserDetails = firestore()
      .collection("employees")
      .doc(user.uid)
      .onSnapshot(
        async (docSnapshot) => {
          if (docSnapshot.exists) {
            // handleSignOut()

            const userData = docSnapshot.data() as UserStateTypes;

            if ( !userData.name) {
              console.log('No Display Name')
              setUserDetails(userData);
              setupOfficeDataListener(userData.company, userData.office, setOfficeDataLoaded);
              setNeedsOnboarding(true);
              setLoading(false);
              onDataLoaded();
              return;
            }

            console.log(userData.name)



            // Consider first setting user details without notifications if notifications are not frequently updated
            // or dependent on very frequent changes in the user document.
            setUserDetails(userData);
            setError(null);
            setupOfficeDataListener(userData.company, userData.office, setOfficeDataLoaded);
            console.log('User exists')
            if (userData.company && userData.office) {
              console.log('User exists!', userData.company, userData.office)
              try {
                console.log('Fetching notification status: ')
                const notificationResult = await fetchNotifications(
                  userData.company,
                  userData.office,
                  userData.mobile,
                  user.uid
                );
                // console.log(userData.company, userData.office, userData.mobile)

                console.log(notificationResult)
             
               
                if (!notificationResult.data.found) {
                  console.log('Not found in office...')
                  setDidntFindUserInOffice(true);
                }

                if (notificationResult.data.exists) {
                  setUserDetails((currentDetails) => ({
                    ...currentDetails,
                    notifications: notificationResult.data.notifications,
                  }));
                  setDidntFindUserInOffice(false);
                } else {
                  console.log(
                    "Employee not found in notification list or no matching office found"
                  );
                  setDidntFindUserInOffice(true);
                }
              } catch (error) {
                console.error(
                  "Error fetching user's notification status:",
                  error
                );
              }
            } else {
              console.log(
                "User has been created but no company or office exists"
              );
              setNeedsOnboarding(true);
              setUserDetails(null);
              setLoading(false);
              // onDataLoaded();
            }
          } else {
            if (user) {
              if (!user.displayName) {
                console.log("User created but no phoneNumber or displayName");
                setNeedsOnboarding(true);
                setUserDetails(null);
                setLoading(false);
                onDataLoaded();
                return;
              }
            } else {
              setUserDetails(null);
              setError("No user found");

              // handleSignOut()

              onDataLoaded();
            }
          }
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching user details:", err);
          setError(err.message);
          setLoading(false);
        }
      );

    unsubscribes.current.push(unsubscribeUserDetails);

    return () => {
      unsubscribes.current.forEach((unsubscribe) => unsubscribe());
      unsubscribes.current = []; // Clear the ref
    };
  }, [user, setUserDetails, setOfficeData]); // Remove unsubscribes from dependencies

  const setupOfficeDataListener = (companyID: string, officeID: string, setOfficeDataLoaded) => {
    if (!companyID || !officeID) return;



    const officeRef = firestore().doc(
      `users/${companyID}/offices/${officeID}/public/${officeID}`
    );
    console.log('Attempting to update officeData')

    const unsubscribeOffice = officeRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          const officeData = doc.data() as OfficeData;
          setOfficeData({ ...officeData, companyID, officeID });
          console.log('Updated office data!')
          sharedStorage.set(
            "parkingSpots",
            JSON.stringify(officeData.parkingSpots)
          );
          setOfficeDataLoaded(true); // Indicate office data has been loaded
        } else {
          console.log("No such office!");
          setOfficeData(null);
          setOfficeDataLoaded(false); // Indicate office data is not loaded
        }
      },
      (error) => {
        console.error("Error fetching office data:", error);
        setError(error.message);
        setOfficeDataLoaded(false); // Indicate office data is not loaded
      }
    );

    unsubscribes.current.push(unsubscribeOffice);
  };

  return {
    userDetails,
    officeData,
    loading,
    error,
    needsOnboarding,
    didntFindUserInOffice,
  };
};

export default useFetchUserDetails;
