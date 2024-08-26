import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as validator from "validator";

export const addToNewsletterList = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    const { email } = data;

    // Validate the email
    if (!email || !validator.isEmail(email)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email.",
      );
    }

    try {
      const newsletterDocRef = admin
        .firestore()
        .collection("admin")
        .doc("marketing");
      const newsletterDocSnap = await newsletterDocRef.get();

      if (!newsletterDocSnap.exists) {
        console.log("Newsletter document not found");
        return { added: false };
      }

      const newsletterList = newsletterDocSnap.data()?.newsletterList || [];

      // Check if the email already exists in the newsletter list
      const emailExists = newsletterList.some(
        (item: any) => item.email === email,
      );

      if (emailExists) {
        console.log("Email already exists in the newsletter list");
        return { added: false, message: "Email already exists" };
      }

      // Add the new email with a timestamp and emailsSent value
      const newEntry = {
        email,
        timestamp: Date.now(),
        emailsSent: 0,
      };

      newsletterList.push(newEntry);

      await newsletterDocRef.update({ newsletterList });

      return { added: true };
    } catch (error) {
      console.error("Failed to add email to newsletter list:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to add email to newsletter list",
        error,
      );
    }
  });

export const addToAppLaunchList = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    const { email } = data;

    // Validate the email
    if (!email || !validator.isEmail(email)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email.",
      );
    }

    try {
      const marketingDocRef = admin
        .firestore()
        .collection("admin")
        .doc("marketing");
      const marketingDocSnap = await marketingDocRef.get();

      if (!marketingDocSnap.exists) {
        console.log("Marketing document not found");
        return { added: false };
      }

      const appLaunchList = marketingDocSnap.data()?.appLaunchList || [];

      // Check if the email already exists in the app launch list
      const emailExists = appLaunchList.some(
        (item: any) => item.email === email,
      );

      if (emailExists) {
        console.log("Email already exists in the app launch list");
        return { added: false, message: "Email already exists" };
      }

      // Add the new email with a timestamp and notified value
      const newEntry = {
        email,
        timestamp: Date.now(),
        notified: false,
      };

      appLaunchList.push(newEntry);

      await marketingDocRef.update({ appLaunchList });

      return { added: true };
    } catch (error) {
      console.error("Failed to add email to app launch list:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to add email to app launch list",
        error,
      );
    }
  });

export const contact = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    const { firstName, lastName, email,  message } = data;

    // Validate the inputs
    if (!firstName || !lastName || !email || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with valid first name, last name, email, and message.",
      );
    }

    if (!validator.isEmail(email)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The email provided is not valid.",
      );
    }

    try {
      const contactEntry = {
        firstName,
        lastName,
        email,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin
        .firestore()
        .collection("support")
        .doc("contact")
        .collection("messages")
        .add(contactEntry);

      return { added: true, message: "Contact details added successfully." };
    } catch (error) {
      console.error("Failed to add contact details:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to add contact details",
        error,
      );
    }
  });
