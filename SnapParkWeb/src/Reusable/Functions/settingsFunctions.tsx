import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";

type Employee = {
  name: string;
  notifications: boolean;
  mobile: string;
  // Include other properties of the employee object here
};

interface NotificationSettings {
  allNotifications: boolean;
  fullNotification: boolean;
  threeSpotsNotification: boolean;
  customSpotsArray: any;
  customMessage: string;
  
}

export const updateNotificationSettings = async (
  officeId: string,
  newSettings: Partial<NotificationSettings>,
) => {
  if (!officeId) {
    throw new Error("Office ID is required");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated to update settings");
  }

  // Reference to the public subdocument for the specific office
  const publicOfficeDocRef = doc(
    db,
    "users",
    user.uid,
    "offices",
    officeId,
    "public",
    officeId,
  );

  try {
    // Generate update paths for nested fields within notificationSettings
    const updates = Object.entries(newSettings).reduce((acc, [key, value]) => {
      acc[`notificationSettings.${key}`] = value; // Construct the update path
      return acc;
    }, {});

    await updateDoc(publicOfficeDocRef, updates);
    console.log("Notification settings updated successfully.");
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

export const updateOfficeSettings = async (
  officeId: string,
  mobile?: number,
  timezoneOffset?: number,
  officeName?: string,
) => {
  if (!officeId) {
    throw new Error("Missing officeId");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Reference to the private subdocument for the specific office
  const privateOfficeDocRef = doc(
    db,
    "users",
    user.uid,
    "offices",
    officeId,
    "private",
    officeId,
  );

  // Reference to the public subdocument for the specific office
  const publicOfficeDocRef = doc(
    db,
    "users",
    user.uid,
    "offices",
    officeId,
    "public",
    officeId,
  );

  const updatePrivateData: Record<string, any> = {};
  const updatePublicData: Record<string, any> = {};

  // Only add mobile to updatePrivateData if it's not undefined
  if (mobile !== undefined) {
    updatePrivateData.mobile = mobile;
  }

  // Only add timezoneOffset to updatePrivateData if it's not undefined
  if (timezoneOffset !== undefined) {
    updatePrivateData["countryInfo.timezoneOffset"] = timezoneOffset; // Correct path assuming countryInfo is an object
  }

  // Only add officeName to updatePublicData if it's not undefined
  if (officeName !== undefined) {
    updatePublicData.office = officeName;
  }

  try {
    if (Object.keys(updatePrivateData).length > 0) {
      await updateDoc(privateOfficeDocRef, updatePrivateData);
      console.log("Private office settings updated successfully.");
    }

    if (Object.keys(updatePublicData).length > 0) {
      await updateDoc(publicOfficeDocRef, updatePublicData);
      console.log("Public office settings updated successfully.");
    }

    if (
      Object.keys(updatePrivateData).length === 0 &&
      Object.keys(updatePublicData).length === 0
    ) {
      console.log("No valid fields to update");
      return; // Return early if there's nothing to update
    }
  } catch (error) {
    console.error("Error updating office settings:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
