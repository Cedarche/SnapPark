import { useEffect, useState } from "react";
import { auth, functions } from "@/firebase";
import { DocumentData } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { useRecoilState } from "recoil";
import { userState } from "@/Reusable/RecoilState";
import Spinner from "@/Reusable/Spinner";
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import ConfirmNotification from "./ConfirmNotification";

export default function PreviewChange({
  newPlanData,
  setConfirm,
  handleCloseModal,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [userData] = useRecoilState<DocumentData | undefined>(userState);
  const [show, setShow] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [notificationType, setNotificiationType] = useState("success");

  const user = auth.currentUser;

  useEffect(() => {
    console.log(userData);
  }, []);

  const handleSubmit = async () => {
    if (newPlanData.name !== userData?.data.plan.name) {
      setLoading(true);
      try {
        const changePlan = httpsCallable(functions, "changeSubscription");

        const result = await changePlan({
          userID: userData.id,
          newPlanData,
        });

        console.log("Function result:", result.data);
        setShow(true);
        setNotificationText("Successfully changed plan");
        setNotificiationType("success");
        setTimeout(() => {
          setShow(false);
        }, 3500);
        setLoading(false);
        handleCloseModal();
      } catch (error) {
        console.log("Something went wrong: ", error);
        setShow(true);
        setNotificationText("Something went wrong, please try again.");
        setNotificiationType("error");

        setTimeout(() => {
          setShow(false);
        }, 3500);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="bg-white shadow w-full sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="inline-flex gap-x-3 items-center">
            <h3 className="px-0 pb-0 text-base font-semibold leading-6 text-gray-900">
              Choose a New Plan
            </h3>
            <div className="flex items-center justify-end  pr-2 text-xs">
              <span
                className="inline-flex mb-3 mt-3 lg:mb-0 lg:mt-0 items-center gap-x-1.5 rounded-md bg-blue-50 px-3 py-1 text-sm 
          font-light text-black-900 hover:cursor-pointer"
              >
                <InformationCircleIcon
                  className="h-4 w-4 text-blue-400"
                  aria-hidden="true"
                />
                Learn more
              </span>
            </div>
          </div>
          <div className="mt-2  text-sm font-light text-gray-500">
            <p>
              Plan changes take effect immediately after confirmation, and
              future usage within the billing period will be charged at the new
              price.
            </p>
            {newPlanData.name === "Standard SMS" ? (
              <p className="text-sm inline-flex gap-x-2 font-light my-2.5">
                <ExclamationCircleIcon
                  className="h-8 w-8  text-green-400"
                  aria-hidden="true"
                />
                No change required for employees, they can continue to use the
                App as normal. However, notifications will now be sent as SMS
                messages.
              </p>
            ) : (
              <p className="text-sm inline-flex gap-x-2 font-light my-2.5">
                <ExclamationCircleIcon
                  className="h-8 w-8  text-green-400"
                  aria-hidden="true"
                />
                Employees will need to download the Snap Park mobile application
                to continue recieving parking updates. Installation instructions
                can be found in the Setup page.
              </p>
            )}
          </div>

          <section
            aria-labelledby="summary-heading"
            className="mt-3 rounded-xl border bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-3 lg:p-6"
          >
            <h2
              id="summary-heading"
              className="text-lg font-medium text-gray-900"
            >
              New Plan Summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">
                  {newPlanData.name} Notifications
                </dt>
                <dd className="text-sm font-medium text-gray-900 text-right">
                  {currencySymbols[newPlanData.currencyCode]}
                  {newPlanData.price}
                  {newPlanData.currencyCode}/{newPlanData.metricName}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex text-sm text-gray-600">
                  <span>Usage this billing period:</span>
                </dt>
                <dd className="text-sm font-medium text-gray-900">0</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex text-sm text-gray-600">
                  <span>Cost this billing period:</span>
                </dt>
                <dd className="text-sm font-medium text-gray-900">$0.00</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">
                  Order total
                </dt>
                <dd className="text-base font-medium text-gray-900">$0.00</dd>
              </div>
            </dl>
          </section>
          {error && (
            <div className="inline-flex items-center mt-3">
              <XCircleIcon
                className="h-5 w-5 mr-2 text-red-400"
                aria-hidden="true"
              />

              <div className=" text-sm text-red-400">
                Something went wrong, please review details and try again.
              </div>
            </div>
          )}

          <div className="mt-3  flex items-center justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setConfirm(false);
              }}
              className="rounded-md inline-flex items-center gap-x-1.5 bg-white px-3 py-2 mr-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 " aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-end rounded-md bg-indigo-600 px-3 py-2 
            text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {loading ? (
                <div className="inline-flex gap-x-2">
                  <Spinner />
                </div>
              ) : (
                "Change Plan"
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmNotification
        show={show}
        setShow={setShow}
        notificationText={notificationText}
        notificationType={notificationType}
      />
    </>
  );
}

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "$",
  // Add more currencies and symbols as needed
};
