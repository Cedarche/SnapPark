import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  query,
  collection,
  getDocs,
  getDoc,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore";
import { db, auth, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import axios from "axios";
import { findParkingNearby } from "./mapFunctions";
import {
  ProfileState,
  Spot,
  Plan,
  Address,
  ParkingResult,
  ParkingPlace,
} from "../Types/types";

export const SignUp = async (
  email: string,
  password: string,
  company: string,
) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log(user);

    await updateProfile(user, {
      displayName: company,
    });

    // Create an empty document in Firestore for the user
    const userDocRef = doc(db, "users", user.uid);
    // await setDoc(userDocRef, { test: "Client Complete" });

    // Initialize Firebase Functions and call the completeSignUp Cloud Function

    const completeSignUpFunction = httpsCallable(functions, "completeSignUp");

    // Call the Cloud Function to populate the user document
    await completeSignUpFunction({ email, company, uid: user.uid });

    console.log(
      "User signed up and initial document created successfully with ID:",
      user.uid,
    );

    console.log("Response: ", completeSignUpFunction);
    return true;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const EmailSignIn = async (email: string, password: string) => {
  console.log("Attempting signin...");

  // Use try-catch to handle errors within this function
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log(userCredential.user);
    return true; // Indicate success
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const sendPasswordReset = async (email: string): Promise<boolean> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent!");
    return true; // Indicates success
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false; // Indicates failure
  }
};

export const Signout = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log("Successfully signed out...");
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
};

function generateUniqueID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface StripeSubscribeResponse {
  subscriptionId: string;
}

export const updateCompleteProfile = async (
  userId: string,
  savedProfile: ProfileState,
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    let company = "";
    if (userDocSnap.exists()) {
      company = userDocSnap.data().company;
    } else {
      console.log("No such user document!");
      return;
    }

    const currency = savedProfile?.countryInfo?.["currencies"]?.[0] || "USD";

    await updateDoc(userDocRef, {
      website: savedProfile.website,
      mobile: savedProfile.mobile,
      country: savedProfile.country,
      countryInfo: savedProfile?.countryInfo,
      address: savedProfile?.address,
      createdAt: serverTimestamp(),
      setupIntentStatus: "",
      paymentDetails: {},
      trialEndNotificationSent: false,
    });

    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const officesSubCollectionRef = collection(userDocRef, "offices");
    const office = savedProfile.offices?.[0] || "";

    const address = savedProfile?.address;

    const officeDocRef = doc(officesSubCollectionRef);

    const longURL = `https://snappark.co/all/${userId}/${officeDocRef.id}`;
    const uniqueID = generateUniqueID();
    const shortURL = `snappark.co/all/${uniqueID}`;

    const shortenedRef = doc(db, "shortenedURLs", uniqueID);
    await setDoc(shortenedRef, {
      longURL,
      userId,
      officeId: officeDocRef.id,
    });

    const publicDocRef = doc(officeDocRef, "public", officeDocRef.id);
    const privateDocRef = doc(officeDocRef, "private", officeDocRef.id);

    if (
      typeof savedProfile?.address?.latitude === "number" &&
      typeof savedProfile?.address?.longitude === "number"
    ) {
      const handleParkingResults = async (parkingResults: ParkingResult[]) => {
        const alternativeParkingList = parkingResults.map((park) => ({
          name: park.name,
          address: park.address,
          latitude: park.geometry.lat,
          longitude: park.geometry.lng,
          placeId: park.place_id,
          bookmarked: false,
        }));

        await setDoc(
          publicDocRef,
          {
            alternativeParkingList: alternativeParkingList,
          },
          { merge: true },
        );
        console.log("Updated alternative parking list successfully.");
      };

      const { latitude, longitude } = savedProfile.address;
      await findParkingNearby(
        { latitude, longitude },
        500,
        handleParkingResults,
      );
    } else {
      console.error("Invalid or incomplete address provided.");
    }

    const spotsArray = savedProfile.spotsArray
      ?.filter((spot: Spot) => spot.office === office)
      .map((spot: Spot) => ({
        ...spot,
        createdAt: Date.now(),
        totalUsedDays: 0,
        totalUnusedDays: 0,
        lastToggledDate: "",
        utilisation: 0,
      }));

    await setDoc(publicDocRef, {
      company: company,
      office: office,
      shortURL,
      activity: [],
      notificationSettings: {
        fullNotification: true,
        threeSpotsNotification: true,
        spotsRemainingValue: 3,
        allNotifications: false,
        customSpotsArray: [],
        customSpotsNotification: false,
        customMessage: "",
      },
      messageSent: false,
      threeSpotsMessageSent: false,
      customMessageSent: false,
      parkingSpots: spotsArray || [],
      id: officeDocRef.id,
      linkingCode: uniqueID,
      address: address,
      alternativeParkingList: [],
    });

    await setDoc(privateDocRef, {
      notificationList: [],
      mobile: savedProfile.mobile,
      email: user?.email || "",
      totalMessages: 0,
      country: savedProfile.country,
      countryInfo: savedProfile.countryInfo,
      active: true,
    });

    await setDoc(officeDocRef, {
      office: office,
      company: company,
      id: officeDocRef.id,
    });

    const approvedCurrencyArray = ["AUD", "EUR", "GBP", "USD"];
    let subscriptionCurrency = approvedCurrencyArray.includes(currency)
      ? currency
      : "USD";

    if (savedProfile.plan) {
      await updateDoc(userDocRef, {
        plan: {
          ...savedProfile.plan,
          localCurrency: currency,
          subscriptionCurrency,
        },
      });
    }

    if (savedProfile.plan?.id === "tier-standard-sms") {
      if (savedProfile.plan?.priceID && subscriptionCurrency) {
        const priceId = savedProfile.plan?.priceID;
        const url = import.meta.env.VITE_STRIPE_SMS_SUBSCRIBE;

        const response = await axios.post(url, {
          userID: userId,
          priceId: priceId,
          subscriptionCurrency: subscriptionCurrency,
        });

        if (!response.data || !response.data.subscriptionId) {
          throw new Error("Failed to create subscription");
        }
      }
    } else {
      if (savedProfile.plan?.priceID && subscriptionCurrency) {
        const priceId = savedProfile.plan?.priceID;

        try {
          const url = import.meta.env.VITE_STRIPE_APP_SUBSCRIBE;
          const response = await axios.post(url, {
            userID: userId,
            priceId: priceId,
            subscriptionCurrency: subscriptionCurrency,
          });

          console.log("Subscribe response: ", response);

          if (!response.data || !response.data.subscriptionId) {
            throw new Error("Failed to create subscription");
          }
        } catch (error) {
          console.error("Error creating subscription:", error);
          throw new Error("Failed to create subscription");
        }
      }
    }

    await updateDoc(userDocRef, {
      profileComplete: true,
    });

    console.log("Profile and all related information updated successfully");
  } catch (error) {
    console.error("Error updating complete profile: ", error);
  }
};

export const deleteUser = async (userID: string, customerID: string) => {
  try {
    // Initialize Firebase Functions

    // Reference to the deleteUserAccount Cloud Function
    const deleteUserAccountFunction = httpsCallable(
      functions,
      "deleteUserAccount",
    );

    // Call the Cloud Function with the necessary data
    const result = await deleteUserAccountFunction({ userID, customerID });

    console.log("User and associated data deleted successfully:", result);
    Signout();
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const suspendAccount = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Reference to the user's document in the 'users' collection
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        status: "suspended",
      });
    } catch (error) {
      console.error("Error adding employee to notification list: ", error);
    }
  }
};

export const reactivateAccount = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Reference to the user's document in the 'users' collection
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        status: "active",
      });
    } catch (error) {
      console.error("Error adding employee to notification list: ", error);
    }
  }
};

export async function updateAlternativeParkingList(
  userId: string,
  officeId: string,
  address: Address,
): Promise<void> {
  const userDocRef = doc(db, "users", userId);
  const officeDocRef = doc(userDocRef, "offices", officeId);
  const publicDocRef = doc(officeDocRef, "public", officeId);

  const { latitude, longitude } = address;

  if (typeof latitude === "number" && typeof longitude === "number") {
    const handleParkingResults = async (parkingResults: ParkingResult[]) => {
      const alternativeParkingList = parkingResults.map((park) => ({
        name: park.name,
        address: park.address,
        latitude: park.geometry.lat,
        longitude: park.geometry.lng,
        placeId: park.place_id,
      }));

      await updateDoc(publicDocRef, {
        alternativeParkingList: alternativeParkingList,
      });

      console.log(
        "Alternative parking list updated successfully for office ID:",
        officeId,
      );
    };

    // Call the findParkingNearby function to fetch parking locations
    findParkingNearby({ latitude, longitude }, 1000, handleParkingResults);
  } else {
    console.error("Invalid or incomplete address provided.");
  }
}

export async function removeParkingPlace(
  userId: string,
  officeId: string,
  placeId: string,
): Promise<void> {
  const userDocRef = doc(db, "users", userId);
  const officeDocRef = doc(userDocRef, "offices", officeId);
  const publicDocRef = doc(officeDocRef, "public", officeId);

  try {
    const docSnap = await getDoc(publicDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const alternativeParkingList: ParkingPlace[] =
        data.alternativeParkingList || [];

      const updatedParkingList = alternativeParkingList.filter(
        (park) => park.placeId !== placeId,
      );

      await updateDoc(publicDocRef, {
        alternativeParkingList: updatedParkingList,
      });

      console.log(
        "Updated alternative parking list after removal of placeId:",
        placeId,
      );
    } else {
      console.log("No existing document found for office ID:", officeId);
    }
  } catch (error) {
    console.error("Error removing parking place: ", error);
  }
}
