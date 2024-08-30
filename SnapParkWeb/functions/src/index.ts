import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import {
  completeSignUp,
  deleteUserAccount,
  createOffice,
  addToNotificationList,
  fetchUserNotificationStatus,
  toggleEmployeeNotification,
  removeFromNotificationList,
  deleteEmployeeAccount,
} from "./Authentication/auth";
import { confirmEmployeeDetails } from "./Authentication/confirmEmployee";
import { addToNewsletterList, addToAppLaunchList, contact } from "./Authentication/marketing";

import { handleAppNotifications } from "./Notifications/handleAppNotifications";
import { handleNotifications } from "./Notifications/handleNotifications";
import { resetParkingHourly } from "./Notifications/resetParkingSpots";

import { stripeWebhook, stripeInvoiceWebhook } from "./Stripe/stripeWebhooks";

import {
  subTest,
  changeSubscription,
  notifyTrialEnding,
} from "./Stripe/stripeSubscribe";

import {
  createSetupIntent,
  updateDefaultPaymentMethod,
} from "./Stripe/defaultStripeFunctions";

admin.initializeApp();
setGlobalOptions({ region: "europe-west1" });

export {
  completeSignUp,
  deleteUserAccount,
  createOffice,
  handleNotifications,
  addToNotificationList,
  removeFromNotificationList,
  fetchUserNotificationStatus,
  toggleEmployeeNotification,
  handleAppNotifications,
  deleteEmployeeAccount,
  addToNewsletterList,
  addToAppLaunchList,
  contact,
  resetParkingHourly,
  stripeWebhook,
  stripeInvoiceWebhook,
  subTest,
  createSetupIntent,
  updateDefaultPaymentMethod,
  changeSubscription,
  notifyTrialEnding,
  confirmEmployeeDetails
};







