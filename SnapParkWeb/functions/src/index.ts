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
} from "./auth";

import { addToNewsletterList, addToAppLaunchList, contact } from "./marketing";

import { handleAppNotifications } from "./handleAppNotifications";

import { handleNotifications } from "./handleNotifications";

import { resetParkingHourly } from "./resetParkingSpots";

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

import { confirmEmployeeDetails } from "./confirmEmployee";

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







