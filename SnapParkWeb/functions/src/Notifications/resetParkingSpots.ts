import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const moment = require("moment-timezone");

export const resetParkingHourly = functions
  .region("europe-west1")
  .pubsub.schedule("0 * * * *")
  .timeZone("UTC") // Ensure that the timezone is set if needed
  .onRun(async (context) => {
    const now = moment.utc();
    const usersRef = admin.firestore().collection("users");

    try {
      // Fetch users with status 'active' or 'trialing'
      const activeUsersSnapshot = await usersRef
        .where("status", "in", ["active", "trialing"])
        .get();

      for (const userDoc of activeUsersSnapshot.docs) {
        const officesRef = userDoc.ref.collection("offices");
        const officesSnapshot = await officesRef.get();

        for (const officeDoc of officesSnapshot.docs) {
          // Directly reference the public subcollection document
          const officePublicRef = officeDoc.ref
            .collection("public")
            .doc(officeDoc.id);

          const officePrivateRef = officeDoc.ref
            .collection("private")
            .doc(officeDoc.id);

          const publicOfficeDocSnapshot = await officePublicRef.get();
          const privateOfficeDocSnapshot = await officePrivateRef.get();
          if (!publicOfficeDocSnapshot.exists) {
            console.log(`No public document for office: ${officeDoc.id}`);
            continue; // Skip if there's no public document
          }

          const publicOfficeData = publicOfficeDocSnapshot.data();
          const privateOfficeData = privateOfficeDocSnapshot.data();
          const timezoneOffset =
            privateOfficeData.countryInfo?.timezoneOffset || 0;

          // Calculate the local time in the office's timezone
          const localTime = now.clone().add(timezoneOffset, "hours");
          if (localTime.hour() === 0) {
            // Check if it's around midnight in the office's timezone
            const parkingSpots = publicOfficeData.parkingSpots.map((spot) => ({
              ...spot,
              available: true, // Reset availability
            }));

            // Update the public office document with the reset parking spots and message status
            await officePublicRef.update({
              parkingSpots,
              messageSent: false,
              threeSpotsMessageSent: false,
              customMessageSent: false,
            });

            console.log(
              `Parking spots reset for office: ${officeDoc.id} in timezone offset: ${timezoneOffset}`,
            );
          }
        }
      }
    } catch (error) {
      console.error("Error resetting parking spots hourly: ", error);
    }
  });
