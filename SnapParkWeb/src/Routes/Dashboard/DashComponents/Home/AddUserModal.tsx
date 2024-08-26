import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  PlusCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useRecoilValue } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import { addToNotificationList } from "@/Reusable/Functions/notificationFunctions";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "../../../Auth/CompleteAccount/MobileSteps/PhoneNumber.css";
import "react-phone-input-2/lib/style.css";
import "react-phone-number-input/style.css";

import Spinner from "@/Reusable/Spinner";

type Office = {
  id: string; // Assuming id is a string
  data: {
    office: string; // Assuming office is a string within data
  };
};

export default function AddUserModal({ open, setOpen }: any) {
  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue<any>(userState);
  const sOffice = useRecoilValue<any>(selectedOffice);
  const [selectedOfficeName, setSelectedOffice] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);

  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (userData && sOffice) {
      setSelectedOffice(sOffice?.data.office);
    }
  }, [sOffice]);

  const handleAddEmployee = async () => {
    setLoading(true);
    if (!selectedOfficeName || !userName) {
      alert("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const newUser = {
      name: userName,
      mobile, // or any default value you need
      office: selectedOfficeName,
      notifications, // or any default value you need
    };

    try {
      await addToNotificationList(userData.id, sOffice?.data.id, newUser);
      console.log(newUser);
      console.log("User  added successfully");
      setLoading(false);

      setOpen(false); // Close the modal
      // Optionally, reset form fields here
    } catch (error) {
      console.error("Failed to add user:", error);
      setLoading(false);

      // Optionally, handle error (e.g., show error message to the user)
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-400 bg-opacity-75 lg:bg-gray-300 lg:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-lg bg-white min-w-full md:min-w-0
                text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg md:sm:max-w-md"
              >
                <div className="bg-blue px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ">
                  <div className="sm:flex sm:items-start">
                    <div
                      className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full
                     bg-green-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                      <UserPlusIcon
                        className="h-6 w-6 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-8 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 lg:w-4/5  text-gray-900"
                      >
                        Add a new employee to the list
                      </Dialog.Title>
                      <div className="mt-5 lg:mt-2 flex flex-col  items-start">
                        <div className="flex flex-col  w-full lg:w-4/5 items-start mt-2">
                          <label
                            htmlFor="name"
                            className="block text-xs font-medium leading-6 text-gray-600"
                          >
                            Name
                          </label>
                          <div className="mt-0 w-full">
                            <input
                              type="name"
                              name="name"
                              id="name"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              className="block w-full rounded-md border-1 pl-3 py-1.5 text-gray-900 shadow-sm
                               ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2
                                focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder=""
                            />
                          </div>
                        </div>
                        <div className="flex flex-col  w-full lg:w-4/5 items-start mt-2">
                          <label
                            htmlFor="phone-number"
                            className="block text-xs font-medium leading-6 text-gray-600"
                          >
                            Phone Number
                          </label>
                          <div className="relative mt-0 rounded-md shadow-sm w-full">
                            <PhoneInput
                              // country="AU"
                              className="my-phone-input"
                              placeholder="Enter phone number"
                              defaultCountry={
                                userData.data.countryInfo.alpha2 || "AU"
                              }
                              value={mobile}
                              onChange={(value) => {
                                // Call setMobile with the value if it's not undefined, otherwise set it to an empty string or handle it as you see fit
                                setMobile(value || "");
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col  w-full lg:w-4/5 items-start mt-2">
                          <label
                            htmlFor="location"
                            className="block text-xs font-medium leading-6 text-gray-600"
                          >
                            Office
                          </label>
                          <select
                            id="location"
                            name="location"
                            value={selectedOfficeName}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                            className="mt-0 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            defaultValue={sOffice?.data.office}
                          >
                            {userData?.offices.map((office: Office) => (
                              <option
                                key={office.id}
                                value={office.data.office}
                              >
                                {office.data.office}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-row mt-5 justify-between w-full lg:w-4/5 items-start">
                          <span className="block text-xs font-medium leading-6 text-gray-600">
                            Notifications
                          </span>
                          <ToggleSwitch
                            notifications={notifications}
                            setNotifications={setNotifications}
                          />
                        </div>
                        <div className="flex flex-row mt-5 justify-between w-full lg:w-4/5 items-start ">
                        <span className="block text-sm font-medium leading-6 text-gray-600 text-left">
                          We'll send the new employee an SMS to confirm their details. 
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3
                     py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 
                     sm:ml-2 sm:w-auto"
                    onClick={handleAddEmployee}
                  >
                    {loading ? <Spinner /> : "Add"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3
                     py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset
                      ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

function ToggleSwitch({ notifications, setNotifications }: any) {
  const [enabled, setEnabled] = useState(true);

  return (
    <Switch
      checked={notifications}
      onChange={setNotifications}
      className={classNames(
        notifications ? "bg-indigo-600" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          notifications ? "translate-x-5" : "translate-x-0",
          "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        )}
      >
        <span
          className={classNames(
            notifications
              ? "opacity-0 duration-100 ease-out"
              : "opacity-100 duration-200 ease-in",
            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-gray-400"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={classNames(
            notifications
              ? "opacity-100 duration-200 ease-in"
              : "opacity-0 duration-100 ease-out",
            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-indigo-600"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  );
}
