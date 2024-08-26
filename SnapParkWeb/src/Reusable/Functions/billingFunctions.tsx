import { updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/firebase";

export const updatingBillingAddress = async (billingAddress: any) => {
  const user = auth.currentUser;
  if (!user) {
    return;
  }
  try {
    const userDocRef = doc(db, "users", user.uid);

    await updateDoc(userDocRef, {
      billingAddress,
    });
  } catch (e) {
    console.log("Update address error: ", e);
  }
};

export const updateTrialAlert = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Reference to the user's document in the 'users' collection
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        trialAlert: false,
      });
    } catch (error) {
      console.error("Error adding employee to notification list: ", error);
    }
  }
};
