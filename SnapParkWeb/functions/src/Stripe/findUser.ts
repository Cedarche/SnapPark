import * as admin from "firebase-admin";

export async function findUserByStripeCustomerId(customerID) {
  const db = admin.firestore();
  const userQuerySnapshot = await db
    .collection("users")
    .where("stripeCustomerId", "==", customerID)
    .get();

  if (userQuerySnapshot.empty) {
    throw new Error(`No user found with Stripe customer ID: ${customerID}`);
  }

  return userQuerySnapshot.docs[0].id;
}

