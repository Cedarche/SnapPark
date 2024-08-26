import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as corsLib from "cors";
const cors = corsLib({ origin: true });
const stripe = require("stripe")(functions.config().stripe.secret_key);

export const createSetupIntent = functions
  .region("europe-west3")
  .https.onRequest(async (req, res) => {
    const cors = require("cors")({ origin: true });

    cors(req, res, async () => {
      try {
        const setupIntent = await stripe.setupIntents.create({
          customer: req.body.customerId, // Pass the customer ID from the frontend
        });

        res.json({ clientSecret: setupIntent.client_secret });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });

export const updateDefaultPaymentMethod = functions
  .region("europe-west3")
  .https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      try {
        const { userId, paymentMethodId } = req.body;

        // Retrieve the payment method details from Stripe
        const paymentMethod =
          await stripe.paymentMethods.retrieve(paymentMethodId);
        const paymentMethodDetails = {
          brand: paymentMethod.card.brand,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          last4: paymentMethod.card.last4,
          paymentMethodId: paymentMethod.id,
        };

        // Update Firestore
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          res.status(404).send("User not found");
          return;
        }

        const currentPaymentDetails = userDoc.data().paymentDetails || {};
        let additionalPaymentDetails =
          userDoc.data().additionalPaymentDetails || [];

        // Add current payment method to additionalPaymentDetails
        if (Object.keys(currentPaymentDetails).length > 0) {
          additionalPaymentDetails.push(currentPaymentDetails);
        }

        // Remove the new default payment method from additionalPaymentDetails
        additionalPaymentDetails = additionalPaymentDetails.filter(
          (method) => method.paymentMethodId !== paymentMethodId,
        );

        await userRef.update({
          paymentDetails: paymentMethodDetails,
          additionalPaymentDetails: additionalPaymentDetails,
        });

        // Optionally update Stripe customer default payment method
        const customerId = userDoc.data().stripeCustomerId;

        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        res.status(200).send("Default payment method updated successfully.");
      } catch (error) {
        console.error("Error updating default payment method:", error);
        res.status(500).send("Internal Server Error");
      }
    });
  });
