import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import * as corsLib from "cors";

import { sendTextMessages } from "../sendTextMessage";

const cors = corsLib({ origin: true });
const stripe = require("stripe")(functions.config().stripe.secret_key);
const appName = "SNAP PARK";

interface CreateSubscriptionPayload {
  userID: string;
  priceId: string;
  subscriptionCurrency: string;
}

export const subTest = functions
  .region("europe-west1")
  .runWith({
    minInstances: 0, // Specify the minimum number of instances
  })
  .https.onRequest((req: Request, res: Response) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).send({ error: "Only POST requests are accepted" });
        return;
      }

      const {
        userID,
        priceId,
        subscriptionCurrency,
      }: CreateSubscriptionPayload = req.body;

      if (!userID || !priceId) {
        res
          .status(400)
          .send({ error: "Missing userID or priceId in the request body" });
        return;
      }

      const db = admin.firestore();
      const userRef = db.collection("users").doc(userID);
      const billingSettingsRef = db.collection("admin").doc("billingSettings");

      try {
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const billingSettings = await transaction.get(billingSettingsRef);
          // const officeDoc = await transaction.get(officeRef);

          if (!userDoc.exists || !billingSettings.exists) {
            console.log("Documents do not exist");
            res.status(404).send({ error: "Document(s) not found" });
            return;
          }

          const customerID = userDoc?.data().stripeCustomerId;

          // 1. Current date for the trial start
          const trialStartDate = new Date();

          // 2. Add 30 days to get the trial end date
          const trialEndDate = new Date(trialStartDate);
          trialEndDate.setDate(
            trialEndDate.getDate() + billingSettings.data()?.freeTrialLength,
          );

          // 3. Find the end of the month for the trial end date
          const endOfMonth = new Date(
            trialEndDate.getFullYear(),
            trialEndDate.getMonth() + 1,
            0,
          );

          // 4. Convert to a UNIX timestamp as expected by Stripe
          const billingCycleAnchorTimestamp = Math.floor(
            endOfMonth.getTime() / 1000,
          );

          if (customerID) {
            // Create the subscription with a 30-day trial period
            const subscription = await stripe.subscriptions.create({
              customer: customerID,
              items: [{ price: priceId }],
              currency: subscriptionCurrency.toLowerCase(),
              trial_period_days: billingSettings.data()?.freeTrialLength, // Set a 30-day trial period
              // trial_period_days: TRIAL_DAYS_TOTAL, // Set a 30-day trial period
              payment_behavior: "default_incomplete",
              payment_settings: {
                save_default_payment_method: "on_subscription",
              },
              // billing_cycle_anchor_config: {
              //   day_of_month: 31,
              // },
              billing_cycle_anchor: billingCycleAnchorTimestamp,
              // expand: ["latest_invoice.payment_intent"],
              expand: ["pending_setup_intent"],
            });

            const subscriptionItemIds = subscription.items.data.map(
              (item) => item.id,
            );
            console.log(subscription.items.data);

            // Extract relevant details from the subscription object
            const subscriptionDetails = {
              id: subscription.id,
              object: subscription.object,
              billing: subscription.collection_method,
              billing_cycle_anchor: subscription.billing_cycle_anchor,
              customer: subscription.customer,
              trialStart: subscription.trial_start,
              trialEnd: subscription.trial_end,

              default_payment_method: subscription.default_payment_method,
              subscriptionItemIds: subscriptionItemIds, // Array of subscription item IDs
              productInfo: subscription.items.data[0],
              // pending_setup_intent: subscription.pending_setup_intent,
              clientSecret: subscription.pending_setup_intent.client_secret,
              // Add other fields as needed
            };

            transaction.update(userRef, {
              subscriptionDetails: subscriptionDetails,
              status: subscription.status,
            });

            res.send({
              subscriptionId: subscription.id,
            });

            // res.status(200).send({ message: `Customer ID: ${customerID}, priceID: ${priceId}` });
          } else {
            res
              .status(404)
              .send({ error: { message: "CustomerID not found" } });
          }
        });
      } catch (error) {
        console.error("Error processing notifications:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });
  });

export const changeSubscription = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Context includes auth if authentication is used; check context.auth.uid
    const { userID, newPlanData } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    if (!userID || !newPlanData || !newPlanData.priceID) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing userID or newPriceID in the request data",
      );
    }

    try {
      const db = admin.firestore();
      const userRef = db.collection("users").doc(userID);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "User document not found",
          );
        }

        const userData = userDoc.data();
        const subscriptionItemIds =
          userData?.subscriptionDetails?.subscriptionItemIds;

        if (!subscriptionItemIds || subscriptionItemIds.length === 0) {
          throw new functions.https.HttpsError(
            "not-found",
            "Subscription details not found or invalid",
          );
        }

        const updatedItems = [];
        for (const itemId of subscriptionItemIds) {
          const updatedItem = await stripe.subscriptionItems.update(itemId, {
            price: newPlanData.priceID,
          });
          updatedItems.push(updatedItem);
        }

        transaction.update(userRef, {
          "subscriptionDetails.subscriptionItemIds": updatedItems.map(
            (item) => item.id,
          ),
          plan: newPlanData,
        });
      });

      return { message: "Subscription plan changed successfully" };
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Internal server error",
        error,
      );
    }
  });

interface TrialNotificationPayload {
  userID: string;
}

export const notifyTrialEnding = functions
  .region("europe-west1")
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).send({ error: "Only POST requests are accepted" });
        return;
      }

      const { userID }: TrialNotificationPayload = req.body;

      if (!userID) {
        res.status(400).send({ error: "Missing userID in the request body" });
        return;
      }

      const db = admin.firestore();
      const userRef = db.collection("users").doc(userID);
      const billingSettingsRef = db.collection("admin").doc("billingSettings");

      try {
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const billingSettings = await transaction.get(billingSettingsRef);

          if (!userDoc.exists) {
            console.log("User document does not exist");
            res.status(404).send({ error: "User document not found" });
            return;
          }

          const userData = userDoc.data();
          const createdAt = userData?.createdAt;
          const setupStatus = userData?.setupIntentStatus;
          const subscriptionStatus = userData?.subscriptionDetails?.status;
          const companyNumber = userData?.mobile;

          const trialLength = Number(billingSettings.data()?.freeTrialLength);

          if (!createdAt || subscriptionStatus !== "trialing") {
            console.log("User is not in trial or createdAt is missing");
            return; // Exit the function if the user is not in trial or createdAt is missing
          }

          const createdAtDate = new Date(createdAt.seconds * 1000);
          const currentDate = new Date();
          const diffTime = Math.abs(
            currentDate.getTime() - createdAtDate.getTime(),
          );
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const daysRemaining = trialLength - diffDays;

          if (daysRemaining <= 3 && setupStatus !== "succeeded") {
            const message = `Your free trial with ${appName} ends in ${daysRemaining} days. Please update your payment method to continue using our services. Visit: http://yourwebsite.com/billing`;

            if (companyNumber) {
              await sendTextMessages(message, [companyNumber]);
              console.log("Trial ending notification sent to:", companyNumber);

              // Update Firestore document to mark that the notification has been sent
              transaction.update(userRef, {
                trialEndNotificationSent: true,
              });

              res.send({
                message: "Trial ending notification sent successfully",
              });
            } else {
              console.log("Company phone number is missing");
              res
                .status(404)
                .send({ error: "Company phone number is missing" });
            }
          } else {
            console.log("No notification needed");
            res.send({ message: "No notification needed at this time" });
          }
        });
      } catch (error) {
        console.error("Error sending trial ending notification:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });
  });
