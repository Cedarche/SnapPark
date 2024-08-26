import React, { useState, useEffect } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { auth } from "@/firebase";

const PaymentStatus: React.FC = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState<string | null>(null);
  const user = auth.currentUser;

  if (!user) {
    return <div>Not logged in...</div>;
  }

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "setup_intent_client_secret",
    );

    if (clientSecret && user) {
      stripe
        .retrieveSetupIntent(clientSecret)
        .then(({ setupIntent, error }: any) => {
          if (error) {
            console.error("Error retrieving SetupIntent:", error);
            return;
          }

          if (
            setupIntent &&
            setupIntent.status === "succeeded" &&
            setupIntent.payment_method
          ) {
            setMessage("Success! Your payment method has been saved.");
            console.log("Payment method: ", setupIntent.payment_method);
            // Call the Cloud Function to retrieve payment method details and update Firestore
            fetchPaymentDetailsAndUpdateFirestore(setupIntent.payment_method);
          } else if (setupIntent && setupIntent.status === "processing") {
            setMessage(
              "Processing payment details. We'll update you when processing is complete.",
            );
          } else if (
            setupIntent &&
            setupIntent.status === "requires_payment_method"
          ) {
            setMessage(
              "Failed to process payment details. Please try another payment method.",
            );
          }
        });
    }
  }, [stripe, user]);

  const fetchPaymentDetailsAndUpdateFirestore = async (
    paymentMethodId: string,
  ) => {
    // Call your Cloud Function endpoint, passing the paymentMethodId
    if (user.uid && paymentMethodId) {
      try {
        const response = await fetch(
          "https://us-central1-snap-park.cloudfunctions.net/getPaymentMethodDetails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID: user.uid, paymentMethodId }), // Pass both paymentMethodId and userId to your Cloud Function
          },
        );

        console.log(response);

        if (!response.ok) {
          const errorResponse = await response.json(); // Get the detailed error message from the server
          throw new Error(
            `Failed to fetch payment method details: ${errorResponse.error}`,
          );
        }

        // Optionally handle the response, e.g., to confirm details were updated
        const details = await response.json();
        console.log("Payment details updated in Firestore:", details);
      } catch (error) {
        console.error("Error fetching payment method details:", error);
      }
    }
  };

  return <div>{message}</div>;
};

export default PaymentStatus;
