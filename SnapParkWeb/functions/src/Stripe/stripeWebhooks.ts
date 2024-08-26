import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { DocumentData } from "@google-cloud/firestore";
const { onSchedule } = require("firebase-functions/v2/scheduler");
import { Request, Response } from "express";
import axios from "axios";
import * as corsLib from "cors";
import { setGlobalOptions } from "firebase-functions/v2";
const moment = require("moment-timezone");
import { sendTextMessages } from "../sendTextMessage";
import { findUserByStripeCustomerId } from "./findUser";
const cors = corsLib({ origin: true });
const stripe = require("stripe")(functions.config().stripe.secret_key);

export const stripeWebhook = functions.https.onRequest((req, res) => {
  // Enable CORS using the `cors` express middleware.
  cors(req, res, async () => {
    if (req.method !== "POST") {
      // Only allow POST requests
      res.status(405).end();
      return;
    }

    const sig = req.headers["stripe-signature"];

    // Prod
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
      if (req.rawBody) {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          endpointSecret,
        );
      } else {
        throw new Error("Missing rawBody");
      }
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const db = admin.firestore();

    // Handle the event
    switch (event.type) {
      case "customer.subscription.trial_will_end":
        const customerSubscriptionTrialWillEnd = event.data.object;
        const cust_id1 = customerSubscriptionTrialWillEnd.customer;
        // const status = customerSubscriptionTrialWillEnd.status;

        console.log("Trial will end", customerSubscriptionTrialWillEnd);
        try {
          const userID1 = await findUserByStripeCustomerId(cust_id1);
          if (userID1) {
            const userRef = db.collection("users").doc(userID1);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
              console.log("User document does not exist");
              res.status(404).send({ error: "User document not found" });
              return;
            }

            let message = "";
            const companyNumber = userDoc.data()?.mobile;
            const paymentStatus = userDoc.data()?.setupIntentStatus;

            if (!paymentStatus) {
              message = `Your 30 Day trial is about to end, we hope you found Snap Park useful!
              
                Please visit the dashboard and update your billing details to continue the notification service.
            
                snappark.co/dashboard/billing
                `;
            } else {
              message = `Your 30 Day trial is about to end, we hope you found Snap Park useful!
              
                If you'd like to continue using the service, no action is required. Otherwise you can pause or cancel your account in the Settings page. 
                snappark.co/dashboard/settings
                `;
            }

            await sendTextMessages(message, [companyNumber]);
          }
        } catch (error) {
          console.error(error);
          res.status(500).send({ error: "Internal server error" });
        }
        break;

      case "customer.subscription.updated":
        const customerSubscriptionUpdated = event.data.object;
        const cust_id = customerSubscriptionUpdated.customer;
        console.log("Subscription updated", customerSubscriptionUpdated);
        try {
          const userID = await findUserByStripeCustomerId(cust_id);
          console.log(userID);

          if (customerSubscriptionUpdated.status && userID) {
            const userRef = db.collection("users").doc(userID);
            await db.runTransaction(async (transaction) => {
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists) {
                console.log("User document does not exist");
                res.status(404).send({ error: "User document not found" });
                return;
              }

              if (
                customerSubscriptionUpdated.status === "active" &&
                !customerSubscriptionUpdated.default_payment_method
              ) {
                transaction.update(userRef, {
                  status: "past_due",
                  "subscriptionDetails.status": "past_due",
                });
              } else {
                transaction.update(userRef, {
                  status: customerSubscriptionUpdated.status,
                  "subscriptionDetails.status":
                    customerSubscriptionUpdated.status,
                });
              }
            });
          }
        } catch (error) {
          console.error(error);
          return;
        }

        // Define and call a function to handle the event customer.subscription.updated
        // For example, update Firestore database
        break;

      case "customer.subscription.deleted":
        const customerSubscriptionDeleted = event.data.object;
        const cust_deleted_id = customerSubscriptionDeleted.customer;
        try {
          const userID = await findUserByStripeCustomerId(cust_deleted_id);
          console.log(userID);

          if (customerSubscriptionDeleted.status && userID) {
            const userRef = db.collection("users").doc(userID);
            await db.runTransaction(async (transaction) => {
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists) {
                console.log("User document does not exist");
                res.status(404).send({ error: "User document not found" });
                return;
              }

              transaction.update(userRef, {
                status: customerSubscriptionUpdated.status,
                "subscriptionDetails.status":
                  customerSubscriptionUpdated.status,
              });
            });
          }
        } catch (error) {
          console.error(error);
          return;
        }
        break;

      case "setup_intent.setup_failed":
        const setupIntentSetupFailed = event.data.object;
        console.log("Setup failed: ", setupIntentSetupFailed);
        // Then define and call a function to handle the event setup_intent.setup_failed
        break;

      case "setup_intent.succeeded":
        const setupIntentSucceeded = event.data.object;
        console.log("Setup succeeded: ", setupIntentSucceeded);
        const setupCustomer_id = setupIntentSucceeded.customer;

        try {
          const userID = await findUserByStripeCustomerId(setupCustomer_id);
          console.log("Firebase user ID: ", userID);
          const paymentMethodId = setupIntentSucceeded.payment_method;

          if (userID && paymentMethodId) {
            await getPaymentMethodDetails(userID, paymentMethodId);
            console.log(
              "Payment method details updated successfully for user:",
              userID,
            );
          } else {
            console.log(
              "Invalid userID or paymentMethodId, unable to update payment method details.",
            );
          }

          if (setupIntentSucceeded.status && userID) {
            const userRef = db.collection("users").doc(userID);
            await db.runTransaction(async (transaction) => {
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists) {
                console.log("User document does not exist");
                res.status(404).send({ error: "User document not found" });
                return;
              }

              const companyNumber = userDoc.data()?.mobile;
              const message = `Successfully updated payment method!`;
              await sendTextMessages(message, [companyNumber]);

              transaction.update(userRef, {
                setupIntentStatus: "succeeded",
              });
            });
          }
        } catch (error) {
          console.error(error);
          return;
        }
        break;

      case "payment_method.updated":
        const paymentMethodUpdated = event.data.object;
        console.log("Payment method updated: ", paymentMethodUpdated);
        // Then define and call a function to handle the event payment_method.updated
        break;

      case "payment_method.attached":
        const paymentMethodAttached = event.data.object;
        console.log("Payment method attached: ", paymentMethodAttached);

        // Then define and call a function to handle the event payment_method.attached
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send("Received webhook");
  });
});

export const stripeInvoiceWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const sig = req.headers["stripe-signature"];
    const endpointSecret = functions.config().stripe.endpoint_secret;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const db = admin.firestore();
    const invoiceObject = event.data.object;
    const customerID = invoiceObject.customer;
    const invoiceID = invoiceObject.id;

    // Find the corresponding userID in your database based on the Stripe customerID
    let userID;
    try {
      userID = await findUserByStripeCustomerId(customerID);
    } catch (err) {
      console.error(`Error finding user by Stripe customer ID: ${err.message}`);
      return res.status(500).send("Internal Server Error");
    }

    if (!userID) {
      console.error(`User not found for customer ID: ${customerID}`);
      return res.status(404).send("User not found");
    }

    const invoiceRef = db
      .collection("users")
      .doc(userID)
      .collection("invoices")
      .doc(invoiceID);

    try {
      await invoiceRef.set(invoiceObject);
      console.log(`Invoice ${invoiceID} created for user ${userID}`);
    } catch (err) {
      console.error(`Error creating invoice document: ${err.message}`);
      return res.status(500).send("Internal Server Error");
    }

    // Handle the event
    switch (event.type) {
      case "invoice.created":
        console.log("Invoice created: ", invoiceObject);
        break;
      case "invoice.overdue":
        console.log("Invoice Overdue: ", invoiceObject);
        break;
      case "invoice.paid":
        console.log("Invoice Paid: ", invoiceObject);
        break;
      case "invoice.payment_action_required":
        console.log("Invoice Action Required: ", invoiceObject);
        break;
      case "invoice.payment_failed":
        console.log("Invoice Payment Failed: ", invoiceObject);
        break;
      case "invoice.payment_succeeded":
        console.log("Invoice Payment Succeeded: ", invoiceObject);
        break;
      case "invoice.sent":
        console.log("Invoice Sent: ", invoiceObject);
        break;
      case "invoice.updated":
        console.log("Invoice Updated: ", invoiceObject);
        break;
      case "invoice.voided":
        console.log("Invoice Voided: ", invoiceObject);
        break;
      case "invoice.marked_uncollectible":
        console.log("Invoice Marked Uncollectible: ", invoiceObject);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return res.status(200).send("Received webhook");
  });
});

export async function getPaymentMethodDetails(userID, paymentMethodId) {
  console.log(
    `Received userID: ${userID}, paymentMethodId: ${paymentMethodId}`,
  );
  const db = admin.firestore();
  if (!userID || !paymentMethodId) {
    throw new Error("Missing userID or paymentMethodId");
  }

  console.log("Attempting to retrieve payment method details");
  const userRef = db.collection("users").doc(userID);

  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User document not found");
      }

      const paymentMethod =
        await stripe.paymentMethods.retrieve(paymentMethodId);
      console.log("Retrieved payment method:", paymentMethod);

      const details = {
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
        paymentMethodId,
      };

      const userData = userDoc.data();
      const additionalPaymentDetails = userData.additionalPaymentDetails || [];

      if (userData.paymentDetails) {
        console.log("Added additional payment details: ", details);

        // Add the new payment method to the additionalPaymentDetails array
        additionalPaymentDetails.push(details);
        transaction.update(userRef, { additionalPaymentDetails });
      } else {
        // Set the new payment method as the main payment method
        console.log("Set new payment details");
        transaction.update(userRef, { paymentDetails: details });
      }
    });

    console.log("Payment method details updated successfully");
  } catch (error) {
    console.error("Error retrieving payment method details:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
