import { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  BellSlashIcon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import { toggleEmployeeNotification } from "@/Reusable/Functions/notificationFunctions";
import Spinner from "@/Reusable/Spinner";
import QRViewLogo from "../../assets/QRView_Logo_200.png";
import SnapParkLogo from "../../assets/SnapParkLogo-01.png";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface Employee {
  mobile: string;
  notifications: boolean;
}

export default function UserSection({
  companyID,
  officeID,
  isCompany,
  setOpenBottomSheet,
  notifications,
  setNotifications,
  name,
  setName,
  mobile,
  setMobile,
}: any) {
  const [loading, setLoading] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const navigate = useNavigate();
  // const user = auth.currentUser;

  const handleNotificationToggle = async () => {
    setLoading(true);
    if (companyID && officeID && mobile) {
      try {
        const toggleNotifications = httpsCallable(
          functions,
          "toggleEmployeeNotification",
        );
        const result = (await toggleNotifications({
          companyID,
          officeID,
          mobile,
        })) as any;

        if (result.data.updated) {
          const newNotifications = result.data.newNotifications;
          setNotifications(newNotifications);
          localStorage.setItem("notifications", newNotifications.toString());
          // localStorage.setItem("mobile", mobile);
        } else {
          console.log("Failed to update notifications or employee not found.");
        }
      } catch (error) {
        console.error(
          "Failed to toggle notifications for mobile:",
          mobile,
          error,
        );
        alert("Failed to toggle notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      console.log("Required data not provided for notification toggle.");
    }
  };

  return (
    <>
      <div className="sm:hidden">
        <div className=" border-gray-200 pb-3 pt-0.5">
          {mobile ? (
            <div className="flex items-center px-2 pr-4">
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {name}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {mobile}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative ml-auto flex-shrink-0 items-center inline-flex gap-x-1.5 rounded-xl p-1.5 text-gray-400
    hover:text-gray-500 focus:outline-none ring-1 ${
      notifications ? "bg-green-50 ring-green-500" : "bg-red-50 ring-red-500"
    } ring-offset-2`}
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Toggle notifications</span>
                <span className="text-sm font-medium text-gray-500">
                  Notifications {notifications ? "on" : "off"}{" "}
                </span>
                {loading ? (
                  <div className="my-0.5 mx-1">
                    <Spinner />
                  </div>
                ) : notifications ? (
                  <BellIcon
                    className="h-6 w-6 text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <BellSlashIcon
                    className="h-6 w-6 text-red-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          ) : (
            <div className="w-full flex px-5 items-center justify-between">
              <div
                className="ml-2 relative  z-50"
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
              >
                <InformationCircleIcon className="h-6 w-6 mt-1 text-gray-400 cursor-pointer" />
                <Transition
                  show={isTooltipVisible}
                  enter="transition-opacity duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute z-50 top-8 sm:top-1 left-1 sm:left-5 w-52 max-h-24 p-2 bg-gray-100 text-gray-600 text-sm font-light rounded-lg shadow-md">
                    You can join the notification list to recieve updates when the carpark is full. 
                  </div>
                </Transition>
              </div>
              <button
                type="button"
                onClick={() => setOpenBottomSheet(true)}
                className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <BellIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Join Notification List
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
