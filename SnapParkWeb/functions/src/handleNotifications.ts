import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import axios from "axios";
import * as corsLib from "cors";

const stripe = require("stripe")(functions.config().stripe.secret_key);

const cors = corsLib({ origin: true });

interface NotificationPayload {
  userID: string;
  officeID: string;
  notificationType: string;
  customSpotsArray: any;
}

export const handleNotifications = functions
  .region("europe-west1")
  .runWith({
    minInstances: 1, // Specify the minimum number of instances
  })
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).send({ error: "Only POST requests are accepted" });
        return;
      }
      // Extract common payload
      const {
        userID,
        officeID,
        notificationType,
        customSpotsArray,
      }: NotificationPayload = req.body;

      if (!userID || !officeID) {
        res
          .status(400)
          .send({ error: "Missing userID or officeID in the request body" });
        return;
      }

      // Base references
      const db = admin.firestore();
      const userRef = db.collection("users").doc(userID);
      const officePublicRef = db
        .collection("users")
        .doc(userID)
        .collection("offices")
        .doc(officeID)
        .collection("public")
        .doc(officeID);

      const officePrivateRef = db
        .collection("users")
        .doc(userID)
        .collection("offices")
        .doc(officeID)
        .collection("private")
        .doc(officeID);

      try {
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const officePublicDoc = await transaction.get(officePublicRef);
          const officePrivateDoc = await transaction.get(officePrivateRef);

          if (!userDoc.exists || !officePublicDoc.exists) {
            console.log("One or both documents do not exist");
            res.status(404).send({ error: "Document(s) not found" });
            return;
          }

          // Usage document handling
          const timezoneOffset =
            officePrivateDoc.data().countryInfo?.timezoneOffset || 0;
          const currentDate = getLocalDateFromOffset(timezoneOffset);

          const month = currentDate.toLocaleString("default", {
            month: "long",
          });
          const year = currentDate.getFullYear();
          const usageDocId = `${month}${year}`;
          const usageRef = userRef.collection("usage").doc(usageDocId);
          const usageDoc = await transaction.get(usageRef);

          // Subscription status checks
          const subStatus = userDoc.data()?.status;
          if (
            ["past_due", "unpaid", "canceled", "suspended"].includes(subStatus)
          ) {
            console.log("User's plan has expired. Aborting message send.");
            const companyNumber = userDoc.data()?.mobile;
            const message = `Your 30 Day trial with Snap Park has ended. Please update your payment method in the Billing section of the dashboard.
        
                    snappark.co/dashboard/billing
                     `;
            await sendTextMessages(message, [companyNumber]);
            res.status(403).send({
              error: "User's plan has expired. Cannot send notifications.",
            });
            return;
          }

          const planType = userDoc.data()?.plan.name;

          // Retrieve 'company' from userDoc
          const company = userDoc.data()?.company;
          const shortURL = officePublicDoc.data()?.shortURL;

          // Retrieve 'office' and 'notificationList' from officeDoc
          const office = officePublicDoc.data()?.office;

          const notificationList =
            officePrivateDoc.data()?.notificationList || [];

          // Filter notificationList to get items with notifications: true
          const numbersToNotify = notificationList
            .filter((item) => item.notifications)
            .map((item) => item.mobile);

          console.log("Details: ", company, shortURL, office, numbersToNotify);
          let customSent = false;
          let threeSpacesSent = false;
          let officeFullSent = false;

          console.log("Notification type:", notificationType);
          // Notification type handling
          switch (notificationType) {
            case "custom":
              customSent = await handleCustomNotification(
                officePublicDoc,
                company,
                office,
                shortURL,
                numbersToNotify,
                customSpotsArray,
              );
              break;
            case "threeSpaces":
              threeSpacesSent = await handleThreeSpacesNotification(
                officePublicDoc,
                company,
                office,
                shortURL,
                numbersToNotify,
              );
              break;
            case "officeFull":
              officeFullSent = await handleOfficeFullNotification(
                officePublicDoc,
                company,
                office,
                shortURL,
                numbersToNotify,
              );
              break;
            default:
              console.log("Invalid notification type");
              res.status(400).send({ error: "Invalid notification type" });
              return;
          }

          if (customSent || threeSpacesSent || officeFullSent) {
            console.log("Updating usage documents...");
            // Access the array of subscription item IDs safely
            const subscriptionItemIds =
              userDoc.data()?.subscriptionDetails?.subscriptionItemIds;

            // Check if the array exists and has at least one element, then access the first element
            const subscriptionItemId =
              subscriptionItemIds?.length > 0 ? subscriptionItemIds[0] : null;

            if (!subscriptionItemId) {
              console.log("Subscription item ID not found for user");
              res.status(404).send({ error: "Subscription item ID not found" });
              return;
            }

            // Create a usage record in Stripe for the subscription item

            const messageCount = numbersToNotify.length;

            const usageRecord =
              await stripe.subscriptionItems.createUsageRecord(
                subscriptionItemId,
                {
                  quantity: messageCount, // Increment by 1 or another value as needed
                  timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
                  action: "increment",
                },
              );

            console.log("Usage record created:", usageRecord);

            const firebaseUsageRecord = {
              date: admin.firestore.Timestamp.now(), // Use Firestore Timestamp
              messageSent: true,
              messageType: notificationType,
              officeID: officeID,
              status: subStatus,
              subType: "sms",
              messageCount,
              notifyList: numbersToNotify,
            };

            // Update Firestore documents if SMS was sent
            transaction.update(userRef, {
              totalMessages: admin.firestore.FieldValue.increment(messageCount),
            });

            let updateFields = {
              totalMessages: admin.firestore.FieldValue.increment(messageCount),
            };

            // Conditionally add fields based on notificationType
            switch (notificationType) {
              case "custom":
                updateFields["customMessageSent"] = true;
                break;
              case "threeSpaces":
                updateFields["threeSpotsMessageSent"] = true;
                break;
              case "officeFull":
                updateFields["messageSent"] = true;
                break;
              default:
                console.log("Invalid notification type"); // Ideally, this check should happen before you start processing.
                res.status(400).send({ error: "Invalid notification type" });
                return;
            }

            transaction.update(officePublicRef, updateFields);

            if (usageDoc.exists) {
              const data = usageDoc.data();
              const officeUsage = data[officeID]
                ? [...data[officeID], firebaseUsageRecord]
                : [firebaseUsageRecord];

              const combinedUsage = data.combinedUsage
                ? [...data.combinedUsage, firebaseUsageRecord]
                : [firebaseUsageRecord];

              // Construct a new update object dynamically based on subStatus
              const updateObject = {
                totalUsage: admin.firestore.FieldValue.increment(messageCount),
                [subStatus === "trialing" ? "trialUsage" : "activeUsage"]:
                  admin.firestore.FieldValue.increment(messageCount),
                [officeID]: officeUsage, // Directly update the specific officeID array
                combinedUsage: combinedUsage,
              };

              // Update the document with the new or appended office usage data
              transaction.update(usageRef, updateObject);
            } else {
              // If the document doesn't exist, create it with appropriate usage counts

              transaction.set(usageRef, {
                [officeID]: [firebaseUsageRecord],
                totalUsage: messageCount,
                combinedUsage: [firebaseUsageRecord],
                trialUsage: subStatus === "trialing" ? messageCount : 0, // Initialize based on subscription status
                activeUsage: subStatus === "trialing" ? 0 : messageCount, // Initialize the opposite field with 0
              });
            }
            res
              .status(200)
              .send({ message: "Notification processed successfully" });
            return;
          } else {
            res.status(400).send({
              message: `Something went wrong... ${officeFullSent} - ${threeSpacesSent} - ${customSent}`,
            });
          }
        });
      } catch (error) {
        console.error("Error processing notifications:", error);
        res.status(500).send({ error: "Internal server error" });
        return;
      }
    });
  });

async function handleOfficeFullNotification(
  officePublicDoc,
  company,
  office,
  shortURL,
  numbersToNotify,
): Promise<boolean> {
  console.log(
    "Handling full office notificaiton, sending to: ",
    numbersToNotify,
  );
  if (officePublicDoc.data()?.messageSent) {
    console.log("Already sent office full message today");
    return false;
  }
  const message = `${company} - The ${office} office parking is full. 
  
  See ${shortURL} for the status of all parking spots.`;
  if (numbersToNotify.length > 0) {
    console.log("Sending text.");
    await sendTextMessages(message, numbersToNotify);
    return true;
  }
  console.log(
    "Something went wrong... ",
    company,
    office,
    shortURL,
    numbersToNotify,
  );

  return false;
}
async function handleThreeSpacesNotification(
  officePublicDoc,
  company,
  office,
  shortURL,
  numbersToNotify,
): Promise<boolean> {
  if (officePublicDoc?.data().threeSpotsMessageSent) {
    console.log("Already sent three space message today");
    return false;
  }
  const remainingSpots = officePublicDoc.data()?.parkingSpots;
  const remaintingSpotsSetting =
    officePublicDoc.data()?.notificationSettings?.spotsRemainingValue ?? 3;
  const availableSpots = remainingSpots
    .filter((spot) => spot.available) // Keep only available spots
    .sort((a, b) => a.name.localeCompare(b.name)) // Sort spots by their 'name'
    .slice(0, remaintingSpotsSetting); // Take the first three spots

  // Construct the list of spots as a string
  const spotsList = availableSpots.map((spot) => `• ${spot.name}`).join("\n");

  const message = `${company} - ${remaintingSpotsSetting} Parking ${remaintingSpotsSetting === 1 ? "Spot" : "Spots"} ${remaintingSpotsSetting === 1 ? "remains" : "remain"} in the ${office} office. 

  ${spotsList}
  
  See ${shortURL} for available parks.
  `;

  if (numbersToNotify.length > 0) {
    await sendTextMessages(message, numbersToNotify);
    return true;
  }
  return false;
}
async function handleCustomNotification(
  officePublicDoc,
  company,
  office,
  shortURL,
  numbersToNotify,
  customSpotsArray,
): Promise<boolean> {
  if (officePublicDoc?.data().customMessageSent) {
    console.log("Already sent custom message today");
    return false;
  }
  // Construct the list of spots as a string
  const spotsList = customSpotsArray.map((spot) => `• ${spot}`).join("\n");
  const customMessage =
    officePublicDoc.data()?.notificationSettings?.customMessage;
  let message = "";
  if (customMessage.length > 1) {
    message = customMessage;
  } else {
    message = `${company} - Specific Parking Spots in the ${office} office are now taken: 

    ${spotsList}
    
    See ${shortURL} for available parks.
    `;
  }

  if (numbersToNotify.length > 0) {
    await sendTextMessages(message, numbersToNotify);
    return true;
  }
  return false;
}

async function sendTextMessages(
  message: string,
  numbers: string[],
): Promise<void> {
  console.log("Sending text messages", { message, numbers }); // Log what's being sent

  const clickSendEndpoint = "https://rest.clicksend.com/v3/sms/send";
  const clickSendUsername = functions.config().clicksend.username;
  const clickSendApiKey = functions.config().clicksend.apikey;

  const smsPayload = {
    messages: numbers.map((number) => ({
      source: "sdk",
      from: "SNAPPARK",
      body: message,
      to: number,
    })),
  };

  try {
    const response = await axios.post(clickSendEndpoint, smsPayload, {
      auth: {
        username: clickSendUsername,
        password: clickSendApiKey,
      },
      headers: { "Content-Type": "application/json" },
    });
    console.log("SMS API Response:", response.data); // Log the API response
  } catch (error) {
    console.error(
      "Error sending SMS:",
      error.response ? error.response.data : error,
    ); // Log more detailed error
  }
}

function getLocalDateFromOffset(timezoneOffset) {
  const now = new Date();
  const localTime = new Date(now.getTime() + timezoneOffset * 3600 * 1000);
  return localTime;
}
