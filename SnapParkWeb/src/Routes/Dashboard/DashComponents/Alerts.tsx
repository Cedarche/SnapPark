import { Fragment, useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation
import { auth,  } from "@/firebase";
import { updateTrialAlert } from "@/Reusable/Functions/billingFunctions";

interface AlertDetails {
  icon: any;
  title: string;
  message: string;
  iconColor: string; // Add iconColor property
}

export function TrialAlerts({
  show,
  setShow,
  alertType,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  alertType: string;
}) {
  const alertContent: Record<string, AlertDetails> = {
    trialEnding: {
      icon: ExclamationTriangleIcon,
      title: "Trial Ending Soon",
      message:
        "Your free trial will end in 3 days. You'll be billed based on notification usage from next month onwards.",
      iconColor: "text-yellow-400",
    },
    noPaymentMethod: {
      icon: ExclamationCircleIcon,
      title: "No Payment Method",
      message:
        "Your trial is ending, but no payment method is saved. Please add a payment method to continue enjoying our services.",
      iconColor: "text-red-400",
    },
    inActive: {
      icon: ExclamationTriangleIcon,
      title: "No Payment Method",
      message:
        "Your 30 day trial has ended - Please update your payment details to continue with the service.",
      iconColor: "text-red-400",
    },
    unpaid: {
      icon: ExclamationCircleIcon,
      title: "Expired Payment Method",
      message:
        "There was an issue with your last invoice payment. Please head to Billing to learn more.",
      iconColor: "text-red-400",
    },
  };

  const currentAlert = alertContent[alertType as keyof typeof alertContent] || {
    icon: CheckCircleIcon,
    title: "Notification",
    message: "You have a new notification.",
    iconColor: "text-blue-400",
  };

  const handleCloseAndUpdateAlertStatus = async () => {
    setShow(false);
    await updateTrialAlert();
  };

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 md:-mr-4"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end md:mt-12 ">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {currentAlert.icon && (
                      <currentAlert.icon
                        className={`h-6 w-6 mt-0.5 ${currentAlert.iconColor}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {currentAlert.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {currentAlert.message}
                    </p>


                    {alertType !== "trialEnding" &&(

                      <div className="flex items-center justify-end w-full mt-2 text-xs">
                        <Link
                          to="/dashboard/billing"
                          className="inline-flex mb-3 mt-3 lg:mb-0 lg:mt-0 items-center gap-x-1.5 rounded-md bg-blue-50 px-3 py-1 text-sm 
                    font-light text-black-900 hover:cursor-pointer"
                        >
                          <svg
                            className="h-1.5 w-1.5 fill-blue-500"
                            viewBox="0 0 6 6"
                            aria-hidden="true"
                          >
                            <circle cx={3} cy={3} r={3} />
                          </svg>
                          Go to billing
                          <ArrowTrendingUpIcon
                            className="h-4 w-4 text-blue-400"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      // onClick={() => setShow(false)}
                      onClick={
                        alertType === "trialEnding"
                          ? handleCloseAndUpdateAlertStatus
                          : () => setShow(false)
                      }
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}

interface AlertPropDetails {
  showAlert: boolean;
  alertType: string;
}

interface TrialCheckProps {
  subscriptionStatus: string;
  createdAt: { seconds: number; nanoseconds: number };
  trialDaysTotal: number;
  setupStatus: string;
  trialAlert: boolean;
}

export const checkTrialStatus = ({
  subscriptionStatus,
  createdAt,
  trialDaysTotal,
  setupStatus,
  trialAlert,
}: TrialCheckProps): AlertPropDetails => {
  const user = auth.currentUser;
  if (subscriptionStatus === "trialing" && createdAt && user) {
    const createdAtDate = new Date(createdAt.seconds * 1000);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdAtDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = trialDaysTotal - diffDays;

    if (daysRemaining <= 3) {
      if (setupStatus !== "succeeded") {
        return { showAlert: true, alertType: "noPaymentMethod" };
      } else if (trialAlert) {
        return { showAlert: true, alertType: "trialEnding" };
      }
    }
  } else if (subscriptionStatus === "past_due" ) {
    return { showAlert: true, alertType: "inActive" };
  } else if (subscriptionStatus === "unpaid" ){
    return { showAlert: true, alertType: "unpaid" };

  }

  return { showAlert: false, alertType: "" };
};

// const sendTrialMessage = () => {
//   const user = auth.currentUser;
//   if (user) {
//     // Now, make a request to your Cloud Function
//     fetch(
//       "https://us-central1-yourprojectid.cloudfunctions.net/notifyTrialEnding",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userID: user.uid, // Assuming you have the user's UID
//         }),
//       },
//     )
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to call notifyTrialEnding function");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         console.log("Cloud function executed successfully:", data);
//         // Here you might want to update the local state or Firestore to indicate the notification has been sent
//       })
//       .catch((error) => {
//         console.error("Error calling notifyTrialEnding function:", error);
//       });
//   }
// };
