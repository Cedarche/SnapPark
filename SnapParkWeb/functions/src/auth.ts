// billing.ts
import * as functions from "firebase-functions";
// import { Request, Response } from "express";
import * as admin from "firebase-admin";
// import * as corsLib from "cors";

const stripe = require("stripe")(functions.config().stripe.secret_key);

export const completeSignUp = functions
  .region("europe-west1")
  .runWith({
    minInstances: 0, // Specify the minimum number of instances
  })
  .https.onCall(async (data, context) => {
    const { email, company, uid } = data;
    const startTime = Date.now();
    console.log("Received signup request");

    try {
      // Create a Stripe customer
      const stripeStart = Date.now();
      const stripeCustomer = await stripe.customers.create({
        email,
        name: company,
      });
      const stripeEnd = Date.now();
      console.log("Stripe customer created in", stripeEnd - stripeStart, "ms");

      // Generate an 8-digit account number
      const accountNumberStart = Date.now();
      const accountNumber = generateUniqueAccountNumber();
      const accountNumberEnd = Date.now();
      console.log(
        "Account number generated in",
        accountNumberEnd - accountNumberStart,
        "ms",
      );

      // Prepare user data for Firestore
      const userDataStart = Date.now();
      const userData = {
        company,
        email,
        stripeCustomerId: stripeCustomer.id,
        trialAlert: true,
        messages: [],
        totalMessages: 0,
        paidUser: false,
        profileComplete: false,
        accountNumber,
        test2: "Server Complete",
      };
      const userDataEnd = Date.now();
      console.log("User data prepared in", userDataEnd - userDataStart, "ms");

      // Update the existing user document in Firestore
      const firestoreStart = Date.now();
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(userData, { merge: true });
      const firestoreEnd = Date.now();
      console.log(
        "Firestore update completed in",
        firestoreEnd - firestoreStart,
        "ms",
      );

      const endTime = Date.now();
      console.log("Total function execution time:", endTime - startTime, "ms");
      return { success: true };
    } catch (error) {
      console.error("Error in completeSignUp function:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error completing sign-up: " + error.message,
      );
    }
  });

const generateUniqueAccountNumber = () => {
  // Simple generation logic (you might want to replace this with your own logic)
  let accountNumber = "";
  for (let i = 0; i < 8; i++) {
    accountNumber += Math.floor(Math.random() * 10); // Append a random digit
  }
  return accountNumber;
};

export const deleteUserAccount = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Checking that the user is authenticated and has the required permissions.
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }

    const { userID, customerID } = data;

    try {
      // Delete the customer from Stripe
      await stripe.customers.del(customerID);
      console.log("Stripe customer deleted successfully with ID:", customerID);

      // Delete the user document from Firestore
      await admin.firestore().collection("users").doc(userID).delete();
      console.log(
        "Firestore user document deleted successfully with ID:",
        userID,
      );

      // Delete the user from Firebase Authentication
      await admin.auth().deleteUser(userID);
      console.log("Firebase Auth user deleted successfully with ID:", userID);

      return { success: true };
    } catch (error) {
      console.error("Error in deleteUserAccount function:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error deleting user account: " + error.message,
      );
    }
  });

export const deleteEmployeeAccount = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     "failed-precondition",
    //     "The function must be called while authenticated.",
    //   );
    // }

    const { userID } = data;

    try {
      // Delete the user document from Firestore
      await admin.firestore().collection("employees").doc(userID).delete();
      console.log(
        "Firestore user document deleted successfully with ID:",
        userID,
      );

      // Delete the user from Firebase Authentication
      await admin.auth().deleteUser(userID);
      console.log("Firebase Auth user deleted successfully with ID:", userID);

      return { success: true };
    } catch (error) {
      console.error("Error in deleteEmployeeAccount function:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error deleting user account: " + error.message,
      );
    }
  });

// const db = admin.firestore();
const generateUniqueID = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOffice = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    const userId = context.auth.uid; // User ID from Firebase Authentication
    const { officeName, country, countryInfo, mobile } = data as {
      officeName: string;
      country: string;
      countryInfo: any;
      mobile: string;
    };

    try {
      // Fetch user data from Firestore
      const userDocRef = admin.firestore().collection("users").doc(userId);
      const userSnapshot = await userDocRef.get();
      if (!userSnapshot.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }
      const userData = userSnapshot.data();

      // Reference to offices sub-collection
      const officesSubCollectionRef = admin
        .firestore()
        .collection(`${userDocRef.path}/offices`);

      // Create a new office document
      const officeDocRef = officesSubCollectionRef.doc();

      // Generate the URL components
      const uniqueID = generateUniqueID();
      const longURL = `https://snappark.co/all/${userId}/${officeDocRef.id}`;
      const shortURL = `snappark.co/all/${uniqueID}`;

      // Create shortened URL entry
      const shortenedRef = admin.firestore().doc(`shortenedURLs/${uniqueID}`);
      await shortenedRef.set({
        longURL,
        userId,
        officeId: officeDocRef.id,
      });

      // Setup public and private subcollections
      const publicDocRef = officeDocRef
        .collection("public")
        .doc(officeDocRef.id);
      const privateDocRef = officeDocRef
        .collection("private")
        .doc(officeDocRef.id);

      // Public data
      await publicDocRef.set({
        company: data.company,
        office: data.officeName,
        shortURL,
        activity: [],
        notificationSettings: {
          fullNotification: true,
          threeSpotsNotification: true,
          spotsRemainingValue: 3,
          allNotifications: false,
          customSpotsArray: [],
        },
        messageSent: false,
        threeSpotsMessageSent: false,
        customMessageSent: false,
        parkingSpots: data.parkingSpots,
        id: officeDocRef.id,
        linkingCode: uniqueID,
      });

      // Private data
      await privateDocRef.set({
        notificationList: [],
        mobile: data.mobile,
        email: data.email,
        totalMessages: 0,
        country: data.country,
        countryInfo: data.countryInfo,
        active: true,
      });

      await officeDocRef.set({
        company: data.company,
        office: data.officeName,
      });

      return { message: "Office created successfully" };
    } catch (error) {
      console.error("Error creating office:", error);
      throw new functions.https.HttpsError("internal", "Error creating office");
    }
  });

  export const addToNotificationList = functions
  .region("europe-west1")
  .runWith({
    minInstances: 0,
  })
  .https.onCall(async (data, context) => {
    const { userId, officeId, newEmployee } = data;

    try {
      const officePrivateRef = admin
        .firestore()
        .doc(`users/${userId}/offices/${officeId}/private/${officeId}`);

      const officeDoc = await officePrivateRef.get();

      if (!officeDoc.exists) {
        console.log("Office document does not exist");
        return { message: "Office document does not exist", success: false };
      }

      const officeData = officeDoc.data();
      let notificationList = officeData.notificationList || [];

      // Check if the new employee already exists in the notification list
      const existingEmployeeIndex = notificationList.findIndex((employee) =>
        (newEmployee.mobile && employee.mobile === newEmployee.mobile) ||
        (newEmployee.uid && employee.uid === newEmployee.uid) ||
        (newEmployee.name && employee.name === newEmployee.name)
      );

      if (existingEmployeeIndex !== -1) {
        const existingEmployee = notificationList[existingEmployeeIndex];

        // Update the existing employee details if there are any changes
        const updatedEmployee = {
          ...existingEmployee,
          ...newEmployee,
        };

        notificationList[existingEmployeeIndex] = updatedEmployee;

        await officePrivateRef.update({
          notificationList: notificationList,
        });

        console.log("Employee details updated successfully in the notification list.");
        return {
          message: "Employee details updated successfully in the notification list",
          success: true,
        };
      } else {
        // Add new employee to the notification list
        await officePrivateRef.update({
          notificationList: admin.firestore.FieldValue.arrayUnion(newEmployee),
        });

        console.log("Employee added successfully to the notification list.");
        return {
          message: "Employee added successfully to the notification list",
          success: true,
        };
      }
    } catch (error) {
      console.error("Error modifying the notification list: ", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Error modifying the notification list",
        error
      );
    }
  });


export const removeFromNotificationList = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    const { userId, officeId, mobile, employeeUID } = data;

    if (!userId || !officeId || (!mobile && !employeeUID)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with userId, officeId, and either mobile number or employeeUID.",
      );
    }

    try {
      const officePrivateRef = admin
        .firestore()
        .doc(`users/${userId}/offices/${officeId}/private/${officeId}`);

      const officeDoc = await officePrivateRef.get();

      if (!officeDoc.exists) {
        console.log("Office document does not exist");
        return { message: "Office document does not exist", success: false };
      }

      const officeData = officeDoc.data();
      let notificationList = officeData.notificationList || [];

      let employeeIndex = notificationList.findIndex(
        (emp) => emp.mobile === mobile || emp.uid === employeeUID,
      );

      if (employeeIndex === -1) {
        console.log("Employee not found in the notification list.");
        return {
          message: "Employee not found in the notification list",
          success: false,
        };
      }

      // Remove the employee from the notificationList
      notificationList.splice(employeeIndex, 1);

      await officePrivateRef.update({
        notificationList: notificationList,
      });

      console.log("Employee removed successfully from the notification list.");
      return {
        message: "Employee removed successfully from the notification list",
        success: true,
      };
    } catch (error) {
      console.error(
        "Error removing the employee from the notification list: ",
        error,
      );
      throw new functions.https.HttpsError(
        "unknown",
        "Error removing the employee from the notification list",
        error,
      );
    }
  });

export const fetchUserNotificationStatus = functions
  .region("europe-west1")
  .runWith({
    minInstances: 0, // Specify the minimum number of instances
  })
  .https.onCall(async (data, context) => {
    const { companyID, officeID, mobile, employeeUID } = data;

    if (!companyID || !officeID || (!mobile && !employeeUID)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with companyID, officeID, and either mobile number or employeeUID.",
      );
    }

    try {
      const officeDocRef = admin
        .firestore()
        .doc(`users/${companyID}/offices/${officeID}/private/${officeID}`);

      const officeDocSnap = await officeDocRef.get();

      if (!officeDocSnap.exists) {
        console.log("No matching office found");
        return { exists: false };
      }

      const officeDocData = officeDocSnap.data();
      const notificationList = officeDocData?.notificationList || [];

      let employee = null;

      if (mobile) {
        employee = notificationList.find((emp: any) => emp.mobile === mobile);
      }

      if (!employee && employeeUID) {
        employee = notificationList.find((emp: any) => emp.uid === employeeUID);
      }

      if (employee) {
        return {
          exists: true,
          notifications: employee.notifications,
          found: true,
        };
      } else {
        return { exists: true, notifications: null, found: false };
      }
    } catch (error) {
      console.error("Error fetching user's notification status:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to fetch user notification status",
        error,
      );
    }
  });

// Cloud Function to toggle notification status
export const toggleEmployeeNotification = functions
  .region("europe-west1")
  .runWith({
    minInstances: 0, // Specify the minimum number of instances
  })
  .https.onCall(async (data, context) => {
    const { companyID, officeID, mobile, employeeUID } = data;

    if (!companyID || !officeID || (!mobile && !employeeUID)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with companyID, officeID, and either mobile number or employeeUID.",
      );
    }

    try {
      const officeDocRef = admin
        .firestore()
        .doc(`users/${companyID}/offices/${officeID}/private/${officeID}`);
      const officeDocSnap = await officeDocRef.get();

      if (!officeDocSnap.exists) {
        console.log("No matching office found");
        return { updated: false };
      }

      console.log("Received mobile: ", mobile);
      console.log("Received uid: ", employeeUID);

      const officeDocData = officeDocSnap.data();
      const notificationList = officeDocData?.notificationList || [];
      console.log(notificationList);
      let employeeIndex = notificationList.findIndex(
        (emp: any) => emp.mobile === mobile,
      );

      console.log("Employee index: ", employeeIndex);

      if (employeeIndex === -1 && employeeUID) {
        employeeIndex = notificationList.findIndex(
          (emp: any) => emp.uid === employeeUID,
        );
      }

      console.log("Employee index2: ", employeeIndex);

      if (employeeIndex !== -1) {
        const newNotifications = !notificationList[employeeIndex].notifications;
        notificationList[employeeIndex].notifications = newNotifications;

        await officeDocRef.update({
          notificationList: notificationList,
        });

        return { updated: true, newNotifications: newNotifications };
      } else {
        return { updated: false, found: false };
      }
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to toggle notifications",
        error,
      );
    }
  });
