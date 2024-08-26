import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import * as corsLib from "cors";
import { sendTextMessages } from "./sendTextMessage";
const cors = corsLib({ origin: true });
const appName = "SNAP PARK";

interface NotificationPayload {
  userID: string;
  officeID: string;
  officeURL: string;
  employeeMobile: any;
}

export const confirmEmployeeDetails = functions
  .region("europe-west1")
  .https.onRequest((req: Request, res: Response) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).send({ error: "Only POST requests are accepted" });
        return;
      }
      const {
        userID,
        officeID,
        officeURL,
        employeeMobile,
      }: NotificationPayload = req.body;

      if (!userID || !officeID) {
        res
          .status(400)
          .send({ error: "Missing userID or officeID in the request body" });
        return;
      }

      const db = admin.firestore();
      const userRef = db.collection("users").doc(userID);
      const officePublicRef = db
        .collection("users")
        .doc(userID)
        .collection("offices")
        .doc(officeID)
        .collection("public")
        .doc(officeID);

      try {
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const officePublicDoc = await transaction.get(officePublicRef);

          if (!userDoc.exists || !officePublicDoc.exists) {
            console.log("One or both documents do not exist");
            res.status(404).send({ error: "Document(s) not found" });
            return;
          }

          // const planLimit = userDoc.data()?.plan?.limit;
          const subStatus = userDoc.data()?.status;
          if (
            ["past_due", "unpaid", "canceled", "suspended"].includes(subStatus)
          ) {
            console.log("User's plan has expired. Aborting message send.");
            const companyNumber = userDoc.data()?.mobile;
            const message = `Your 30 Day trial with ${appName} has ended. Please update your payment method in the Billing section of the dashboard.
  
              snappark.co/dashboard/billing
               `;
            await sendTextMessages(message, [companyNumber]);

            res.status(403).send({
              error: "User's plan has expired. Cannot send notifications.",
            });

            return; // Exit the transaction early
          }

          // Retrieve 'company' from userDoc
          const company = userDoc.data()?.company;

          // Retrieve 'office' and 'notificationList' from officeDoc
          const office = officePublicDoc.data()?.office;

          const message = `Welcome to Snap Park! You've been added to the ${company} - ${office} office parking notification list.
            
            To continue, please visit the link below and confirm your details:
            ${officeURL}
  
            For any issues, please contact your administator or head to snappark.co/contact.
            `;
          await sendTextMessages(message, [employeeMobile]);
        });

        res
          .status(200)
          .send({ message: "Confirm employee request processed successfully" });
      } catch (error) {
        console.error("Error processing notifications:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });
  });
