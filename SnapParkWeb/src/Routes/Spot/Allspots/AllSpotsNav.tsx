import { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  BellSlashIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

import { toggleEmployeeNotification } from "@/Reusable/Functions/notificationFunctions";
import Spinner from "@/Reusable/Spinner";
import QRViewLogo from "../../assets/QRView_Logo_200.png";
import SnapParkLogo from "../../../assets/SnapParkLogo-01.png";
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



export default function AllSpotNav({
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
  setUpdate
}: any) {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // const user = auth.currentUser;

  const handleUpdateDetails = () => {
    setOpenBottomSheet(true)
    setUpdate(true)
  }

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 justify-between">
              <div className="flex">
                <div
                  className="flex flex-shrink-0 items-center"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  <img
                    className="h-6 w-auto "
                    src={SnapParkLogo}
                    alt="Snap Park Logo"
                  />
                  {/* <span
                    className="text-xl font-black ml-2 font-sans
                     leading-6 text-blue-600  hover:text-indigo-600"
                  >
                    {appName}
                  </span> */}
                </div>
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="sm:hidden">
              <div className="border-t border-gray-200 pb-3 pt-3">
                {isCompany ? (
                  <div className="w-full flex px-5 items-center justify-end">
                    <a
                      // type="button"
                      href="/dashboard"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Go to Dashboard
                      <ArrowTopRightOnSquareIcon
                        className="-mr-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                ) : mobile ? (
                    <div className="w-full flex px-5 items-center justify-end">
                    <button
                      type="button"
                      onClick={handleUpdateDetails}
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <WrenchScrewdriverIcon
                        className="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Update contact details
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex px-5 items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenBottomSheet(true)}
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <BellIcon
                        className="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Join Notification List
                    </button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
